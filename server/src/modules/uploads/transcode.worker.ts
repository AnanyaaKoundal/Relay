import { Worker, Job } from "bullmq";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdir, writeFile } from "fs/promises";
import { join, relative as pathRelative } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ffmpegPath: string = require("ffmpeg-static");
import type { TranscodeJobData } from "./transcode.queue.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3, { S3_BUCKET } from "../../lib/s3.js";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";

const execFileAsync = promisify(execFile);
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const QUALITIES = [
  { label: "1080p", scale: "1920:1080", maxrate: "5M", bufsize: "10M" },
  { label: "720p", scale: "1280:720", maxrate: "2500k", bufsize: "5M" },
  { label: "480p", scale: "854:480", maxrate: "1000k", bufsize: "2M" },
];

async function downloadFile(key: string, dest: string): Promise<void> {
  const url = `http://localhost:${process.env.PORT ?? 5000}/s3/${key}`;
  const maxAttempts = 3;
  let lastError: Error | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      const body = new Uint8Array(await response.arrayBuffer());
      await writeFile(dest, body);
      return;
    } catch (err) {
      lastError = err as Error;
      if (i < maxAttempts - 1) {
        logger.warn(`Download attempt ${i + 1} failed, retrying in ${Math.pow(2, i)}s`);
        await delay(Math.pow(2, i) * 1000);
      }
    }
  }
  throw lastError;
}

async function uploadDir(localDir: string, s3Prefix: string): Promise<void> {
  const { readdirSync, statSync } = await import("fs");

  function walkDir(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...walkDir(full));
      } else {
        files.push(full);
      }
    }
    return files;
  }

  const allFiles = walkDir(localDir);
  await Promise.all(
    allFiles.map(async (filePath) => {
      const relative = pathRelative(localDir, filePath).replace(/\\/g, "/");
      const key = `${s3Prefix}${relative}`;
      const body = await readFile(filePath);
      const contentType = filePath.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : filePath.endsWith(".ts")
          ? "video/mp2t"
          : "application/octet-stream";

      logger.info(`Uploading ${key} (${body.length} bytes)`);
      await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
    }),
  );
}

function runFfmpeg(input: string, outputDir: string, quality: (typeof QUALITIES)[number]): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputPath = join(outputDir, "index.m3u8");
    const proc = execFile(
      ffmpegPath,
      [
        "-i", input,
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-vf", `scale=${quality.scale}:force_original_aspect_ratio=decrease,pad=${quality.scale}:(ow-iw)/2:(oh-ih)/2`,
        "-maxrate", quality.maxrate,
        "-bufsize", quality.bufsize,
        "-f", "hls",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", join(outputDir, "segment_%03d.ts"),
        outputPath,
      ],
      { timeout: 30 * 60 * 1000 },
    );

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

function buildMasterPlaylist(qualities: { label: string; dir: string }[]): string {
  let master = "#EXTM3U\n#EXT-X-VERSION:3\n";
  for (const q of qualities) {
    const bw = q.label === "1080p" ? "5000000" : q.label === "720p" ? "2500000" : "1000000";
    const res = q.label === "1080p" ? "1920x1080" : q.label === "720p" ? "1280x720" : "854x480";
    master += `#EXT-X-STREAM-INF:BANDWIDTH=${bw},RESOLUTION=${res}\n`;
    master += `${q.label}/index.m3u8\n`;
  }
  return master;
}

async function transcode(job: Job<TranscodeJobData>) {
  const tmpId = randomUUID();
  const workDir = join(tmpdir(), `relay-transcode-${tmpId}`);
  const inputPath = join(workDir, "input.mp4");
  const hlsDir = join(workDir, "hls");

  try {
    await mkdir(workDir, { recursive: true });
    await mkdir(hlsDir, { recursive: true });

    logger.info(`Downloading ${job.data.fileKey}`);
    await downloadFile(job.data.fileKey, inputPath);

    // Transcode each quality
    const qualityDirs: { label: string; dir: string }[] = [];
    for (const q of QUALITIES) {
      const outDir = join(hlsDir, q.label);
      await mkdir(outDir, { recursive: true });
      logger.info(`Transcoding ${q.label}`);
      await runFfmpeg(inputPath, outDir, q);
      qualityDirs.push({ label: q.label, dir: outDir });
    }

    // Master playlist
    const master = buildMasterPlaylist(qualityDirs);
    await writeFile(join(hlsDir, "master.m3u8"), master);

    // Upload to S3
    const s3Prefix = job.data.fileKey.replace(/\/raw\/[^/]+$/, "/hls/");
    logger.info(`Uploading HLS output to ${s3Prefix}`);
    await uploadDir(hlsDir, s3Prefix);

    // Update DB
    const hlsUrl = `/s3/${s3Prefix}master.m3u8`;
    const existing = await prisma.videoContent.findUnique({
      where: { id: job.data.videoContentId },
      select: { id: true },
    });
    if (existing) {
      await prisma.videoContent.update({
        where: { id: job.data.videoContentId },
        data: { hlsUrl, processingStatus: "READY" },
      });
    }

    logger.info(`Transcoding complete for ${job.data.videoContentId}`);
  } catch (err) {
    logger.error(`Transcoding failed for ${job.data.videoContentId}`, { error: (err as Error).message });
    const existing = await prisma.videoContent.findUnique({
      where: { id: job.data.videoContentId },
      select: { id: true },
    });
    if (existing) {
      if (job.attemptsMade >= (job.opts.attempts ?? 3) - 1) {
        await prisma.videoContent.update({
          where: { id: job.data.videoContentId },
          data: { processingStatus: "FAILED" },
        });
      }
    }
    throw err;
  } finally {
    // Cleanup temp files
    const { rmSync } = await import("fs");
    rmSync(workDir, { recursive: true, force: true });
  }
}

export function startTranscodeWorker() {
  const worker = new Worker(
    "transcode",
    async (job: Job<TranscodeJobData>) => {
      logger.info(`Processing transcode job ${job.id}`);
      await transcode(job);
    },
    {
      connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
      concurrency: 1,
      lockDuration: 1_800_000, // 30 minutes — matches FFmpeg timeout
    },
  );

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed`, { error: err.message });
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on("stalled", (jobId) => {
    logger.warn(`Job ${jobId} stalled — worker may have crashed`);
  });

  logger.info("Transcode worker started");
  return worker;
}
