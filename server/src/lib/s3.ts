import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "relay-dev-access-key",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "relay-dev-secret-key",
  },
  forcePathStyle: true,
});

export const S3_BUCKET = process.env.S3_BUCKET ?? "relay-videos";

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
  }
}

export default s3;
