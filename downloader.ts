import config from "./config.json";
import { join, extname } from "path";
import { writeFile, mkdir } from "fs/promises";

interface Metadata {
  image: string;
  [key: string]: any;
}

const downloadFile = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
};

const downloadIpfsImage = async (
  ipfsUri: string
): Promise<{ buffer: Buffer; extension: string }> => {
  const cidPath = ipfsUri.replace("ipfs://", "");
  const url = `${config.IPFS_GATEWAY}/${cidPath}`;
  const buffer = await downloadFile(url);
  const extension = extname(cidPath.split("?")[0]) || ".png";
  return { buffer, extension };
};

const processToken = async (tokenId: number): Promise<void> => {
  const jsonUrl = `${config.BASE_URL}/${tokenId}.json`;
  try {
    const metadataRes = await fetch(jsonUrl);
    if (!metadataRes.ok) throw new Error(`Metadata fetch failed for token ${tokenId}`);

    const metadata: Metadata = await metadataRes.json();

    const jsonPath = join(config.OUTPUT_DIR, `${tokenId}.json`);
    await writeFile(jsonPath, JSON.stringify(metadata, null, 2));

    if (!config.IGNORE_IMAGES) {
      const imageUrl = metadata.image;
      const imageExt = extname(new URL(imageUrl).pathname) || ".png";

      let imagePath = join(config.OUTPUT_DIR, `${tokenId}${imageExt}`);
      let imgBuffer: Buffer | null = null;

      if (imageUrl.startsWith("ipfs://")) {
        const { buffer, extension } = await downloadIpfsImage(imageUrl);
        imgBuffer = buffer;
        imagePath = join(config.OUTPUT_DIR, `${tokenId}${extension}`);
      } else {
        const imageData = await downloadFile(imageUrl);
        imgBuffer = imageData;
      }
      if (imgBuffer) await writeFile(imagePath, imgBuffer);
    }

    console.log(`✅ Token ${tokenId} downloaded`);
  } catch (err) {
    console.error(`❌ Error for token ${tokenId}:`, err);
  }
};

const run = async (): Promise<void> => {
  await mkdir(config.OUTPUT_DIR, { recursive: true });

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
