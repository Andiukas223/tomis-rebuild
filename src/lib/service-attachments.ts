import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_SERVICE_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function getAttachmentRoot() {
  const configured = process.env.SERVICE_ATTACHMENTS_DIR;

  if (!configured) {
    return path.join(process.cwd(), "storage", "service-attachments");
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

function sanitizeFileName(fileName: string) {
  return (
    path.basename(fileName).replace(/[^\w.\- ()]+/g, "_").slice(0, 120) ||
    "attachment"
  );
}

export function getAttachmentSizeLabel(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function saveServiceAttachment(file: File) {
  const fileName = sanitizeFileName(file.name);
  const extension = path.extname(fileName).slice(0, 20);
  const storageKey = `${Date.now()}-${randomUUID()}${extension}`;
  const root = getAttachmentRoot();
  const filePath = path.join(root, storageKey);
  const contentType = file.type || "application/octet-stream";
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(root, { recursive: true });
  await writeFile(filePath, buffer);

  return {
    fileName,
    storageKey,
    contentType,
    sizeBytes: buffer.byteLength,
  };
}

export async function readServiceAttachment(storageKey: string) {
  return readFile(path.join(getAttachmentRoot(), storageKey));
}

export async function deleteServiceAttachment(storageKey: string) {
  await rm(path.join(getAttachmentRoot(), storageKey), {
    force: true,
  });
}
