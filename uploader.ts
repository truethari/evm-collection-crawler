import { join } from "path";
import config from "./config.json";
import { readFile } from "fs/promises";
import { S3Client, type S3File } from "bun";

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const bucket = process.env.S3_BUCKET_NAME;
const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "auto";
if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
  console.error("❌ Missing required environment variables for S3 configuration.");
  process.exit(1);
}

const client = new S3Client({
  accessKeyId,
  secretAccessKey,
  bucket,
  endpoint,
  region,
});

const uploadBuffer = async (filename: string, buffer: Buffer, type: string) => {
  const s3file: S3File = client.file(`${config.S3_UPLOAD_PATH}/${filename}`);
  await s3file.write(buffer, { type });
};

const processToken = async (tokenId: number): Promise<void> => {
  let jsonPath = join(config.OUTPUT_DIR, `${tokenId}.json`);
  let imagePath = join(config.OUTPUT_DIR, `${tokenId}.png`);

  const jsonBuffer = await readFile(jsonPath);
  const jsonFileName = `${tokenId}.json`;
  await uploadBuffer(jsonFileName, jsonBuffer, "application/json");

  if (!config.IGNORE_IMAGES) {
    const imageBuffer = await readFile(imagePath);
    const imageFileName = `${tokenId}.png`;
    await uploadBuffer(imageFileName, imageBuffer, "image/png");
  }

  console.log(`✅ Token ${tokenId} uploaded`);
};

const run = async (): Promise<void> => {
  for (let i = config.MIN_TOKEN_ID; i <= config.MAX_TOKEN_ID; i += config.BATCH_SIZE) {
    const batch = Array.from({ length: config.BATCH_SIZE }, (_, j) => i + j).filter(
      (id) => id <= config.MAX_TOKEN_ID
    );
    await Promise.all(batch.map(processToken));
  }

  console.log("🎉 All batches completed.");
};

run()
  .then(() => {
    console.log("✅ All tasks completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ An error occurred:", err);
    process.exit(1);
  });
