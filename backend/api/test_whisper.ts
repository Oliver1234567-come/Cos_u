// backend/api/test_whisper.ts

import fs from "fs";
import path from "path";
import { whisperClient } from "./src/services/whisperClient";

(async () => {
  try {
    // Read audio file and convert to base64
    const filePath = path.resolve(__dirname, "test_audio.m4a");
    if (!fs.existsSync(filePath)) {
      console.error("❌ test_audio.m4a 不存在！");
      return;
    }

    const fileData = fs.readFileSync(filePath);
    const base64 = fileData.toString("base64");

    const text = await whisperClient(base64);
    console.log("✅ 转写结果：", text);
  } catch (err) {
    console.error("❌ 测试失败：", err);
  }
})();
