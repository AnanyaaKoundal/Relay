import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3, { S3_BUCKET } from "../../lib/s3.js";
import { prisma } from "../../lib/prisma.js";
import queue from "./transcode.queue.js";

const PRESIGN_EXPIRY = 15 * 60; // 15 minutes

async function assertOwnership(instructorId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, chapterId: true },
  });
  if (!lesson) {
    throw Object.assign(new Error("Lesson not found"), { statusCode: 404 });
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: lesson.chapterId },
    select: { id: true, courseId: true },
  });
  if (!chapter) {
    throw Object.assign(new Error("Chapter not found"), { statusCode: 404 });
  }

  const course = await prisma.course.findUnique({
    where: { id: chapter.courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) {
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });
  }
  if (course.instructorId !== instructorId) {
    throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  }

  return { lesson, chapter, course };
}

export async function generatePresignedUrl(
  instructorId: string,
  lessonId: string,
  fileName: string,
  fileType: string,
) {
  await assertOwnership(instructorId, lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, chapterId: true },
  });
  const chapter = await prisma.chapter.findUnique({
    where: { id: lesson!.chapterId },
    select: { courseId: true },
  });

  const ext = fileName.split(".").pop() ?? "mp4";
  const fileKey = `uploads/${chapter!.courseId}/${lessonId}/raw/${randomUUID()}.${ext}`;

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
  await assertOwnership(instructorId, lessonId);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { contentType: true, contentId: true },
  });
  if (!lesson || lesson.contentType !== "VIDEO") {
    throw Object.assign(new Error("Lesson is not a video lesson"), { statusCode: 400 });
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
