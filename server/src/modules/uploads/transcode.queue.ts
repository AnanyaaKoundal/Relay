import { Queue } from "bullmq";

const queue = new Queue("transcode", {
  connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export interface TranscodeJobData {
  videoContentId: string;
  fileKey: string;
  lessonId: string;
}

export default queue;
