// backend/api/test_score.ts

import fs from "fs";
import path from "path";
import axios from "axios";

async function main() {
  const filePath = path.resolve(__dirname, "test_audio.m4a");

  if (!fs.existsSync(filePath)) {
    console.error("❌ test_audio.m4a 不存在！");
    return;
  }

  const fileData = fs.readFileSync(filePath);
  const base64 = fileData.toString("base64");

  console.log("🎧 Loaded test_audio.m4a (base64 length:", base64.length, ")");

  // 🚀 只改这段就可以了！！
  const resp = await axios.post("http://localhost:4000/api/score/score", {
    audioBase64: base64,
    examType: "toefl",
    targetScore: 27,
    timeLimitSec: 45,
  });

  console.log("\n🔥 FINAL RESULT:\n", JSON.stringify(resp.data, null, 2));
}

main().catch((err) => {
  console.error("❌ Test failed:", err.response?.data || err.message);
});
