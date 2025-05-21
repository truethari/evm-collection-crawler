# NFT Metadata & Image Downloader (Bun)

This Bun script downloads NFT metadata and associated images (supporting both IPFS and HTTP(S) URLs). It processes token IDs in batches and stores the downloaded metadata and images locally.

## 🚀 Features

- Fetches metadata .json files from a base URL.
- Downloads images referenced in metadata (supports ipfs:// and https://).
- Saves all files to a local directory.
- Processes NFTs in concurrent batches using native async support.

## 🧱 Requirements

- Bun (v1.0 or later)

## 📦 Setup

Clone this repo or save the script locally.

## Install Bun (if you haven't yet):

```bash
curl -fsSL https://bun.sh/install | bash
```

Run the script:

```bash
bun index.ts
```

Replace index.ts with the actual filename if different.

## ⚙️ Configuration

Edit these constants at the top of the script:

```ts
const BASE_URL = "https://example/metadata";
const MIN_TOKEN_ID = 1;
const MAX_TOKEN_ID = 1000;
const BATCH_SIZE = 50;
const OUTPUT_DIR = "./downloads";
const IPFS_GATEWAY = "https://ipfs.io/ipfs";
```

`BASE_URL`: Where metadata JSON files are hosted.

`MIN_TOKEN_ID` / `MAX_TOKEN_ID`: Range of token IDs to process.

`BATCH_SIZE`: How many tokens to process in parallel.

`OUTPUT_DIR`: Where to save the downloaded files.

`IPFS_GATEWAY`: Gateway used to resolve IPFS URIs.

## 📂 Output

For each token, the following files are saved:

```
downloads/
├── 1.json
├── 1.png
├── 2.json
├── 2.jpg
...
```

## 🧪 Example Flow

For token ID 1:

Fetch metadata from https://example/metadata/1.json.

Parse image URL (e.g., ipfs://... or https://...).

Download and save image using resolved URL.

Save metadata JSON locally.

### ✅ Output Logs

```
✅ Token 1 downloaded
✅ Token 2 downloaded
...
🎉 All batches completed.
✅ All tasks completed successfully.
```
