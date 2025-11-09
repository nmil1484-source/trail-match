// Cloudflare R2 storage implementation with local fallback
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

const USE_LOCAL_STORAGE = !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME;

// Determine uploads directory - use /tmp in production for Railway compatibility
const UPLOADS_DIR = process.env.NODE_ENV === "production" 
  ? "/tmp/uploads" 
  : path.join(process.cwd(), "uploads");

if (USE_LOCAL_STORAGE) {
  console.warn("[Storage] R2 credentials not configured. Using local file storage.");
  console.log(`[Storage] Uploads directory: ${UPLOADS_DIR}`);
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  let body: Buffer;
  if (typeof data === "string") {
    body = Buffer.from(data);
  } else if (data instanceof Uint8Array) {
    body = Buffer.from(data);
  } else {
    body = data;
  }

  if (USE_LOCAL_STORAGE) {
    // Store locally
    const filePath = path.join(UPLOADS_DIR, key);
    const dir = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(filePath, body);
    
    // Return URL relative to server
    const url = `/uploads/${key}`;
    return { key, url };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Construct public URL (you'll need to enable public access or use a custom domain)
  const url = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
  
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  if (USE_LOCAL_STORAGE) {
    const url = `/uploads/${key}`;
    return { key, url };
  }
  
  const url = `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
  return { key, url };
}

