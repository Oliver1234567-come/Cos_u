import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export function saveTempFile(buffer: Buffer, ext: string): string {
  const dir = path.join(__dirname, "../../temp");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = randomUUID() + ext;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, buffer);
  return filepath;
}

export function deleteTempFile(filepath: string) {
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (e) {
    console.warn("Failed to delete temp file:", filepath);
  }
}
