import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3, { S3_BUCKET } from "../../lib/s3.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/app-error.js";
import { assertLessonOwnership } from "../../lib/ownership.js";
import queue from "./transcode.queue.js";

const PRESIGN_EXPIRY = 15 * 60;

export async function generatePresignedUrl(
  instructorId: string,
  lessonId: string,
  fileName: string,
  fileType: string,
) {
  const lesson = await assertLessonOwnership(instructorId, lessonId);

  const ext = fileName.split(".").pop() ?? "mp4";

  const chapter = await prisma.chapter.findUnique({
    where: { id: lesson.chapterId },
    select: { courseId: true },
  });
  if (!chapter) throw new AppError("Chapter not found", 404);

  const fileKey = `uploads/${chapter.courseId}/${lessonId}/raw/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: PRESIGN_EXPIRY,
  });

  return { uploadUrl, fileKey };
}

export async function completeUpload(
  instructorId: string,
  lessonId: string,
  fileKey: string,
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { contentType: true, contentId: true, chapterId: true },
  });
  if (!lesson) throw new AppError("Lesson not found", 404);

  await assertLessonOwnership(instructorId, lessonId);

  if (lesson.contentType !== "VIDEO") {
    throw new AppError("Lesson is not a video lesson", 400);
  }

  const videoUrl = `/s3/${fileKey}`;

  await prisma.videoContent.update({
    where: { id: lesson.contentId },
    data: { s3Key: fileKey, videoUrl, processingStatus: "PROCESSING" },
  });

  await queue.add("transcode", {
    videoContentId: lesson.contentId,
    fileKey,
    lessonId,
  });

  return { message: "Upload complete, transcoding started" };
}

export async function retryTranscode(instructorId: string, lessonId: string) {
  const lesson = await assertLessonOwnership(instructorId, lessonId);

  const lessonData = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { contentType: true, contentId: true },
  });
  if (!lessonData) throw new AppError("Lesson not found", 404);
  if (lessonData.contentType !== "VIDEO") throw new AppError("Lesson is not a video lesson", 400);

  const videoContent = await prisma.videoContent.findUnique({
    where: { id: lessonData.contentId },
    select: { s3Key: true },
  });
  if (!videoContent?.s3Key) throw new AppError("No video file found for this lesson", 400);

  await prisma.videoContent.update({
    where: { id: lessonData.contentId },
    data: { processingStatus: "PROCESSING" },
  });

  await queue.add("transcode", {
    videoContentId: lessonData.contentId,
    fileKey: videoContent.s3Key,
    lessonId,
  });

  return { message: "Transcode re-queued" };
}