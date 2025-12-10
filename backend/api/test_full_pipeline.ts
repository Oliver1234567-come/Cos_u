// backend/api/test_full_pipeline.ts
// Complete end-to-end test of the scoring pipeline

import fs from "fs";
import path from "path";
import axios from "axios";

const API_BASE = "http://localhost:4000";

async function testFullPipeline() {
  console.log("🚀 Starting Full Pipeline Test\n");
  console.log("=" .repeat(60));

  // 1. Load test audio
  const audioPath = path.resolve(__dirname, "test_audio.m4a");
  if (!fs.existsSync(audioPath)) {
    console.error("❌ test_audio.m4a not found!");
    return;
  }

  const fileData = fs.readFileSync(audioPath);
  const audioBase64 = fileData.toString("base64");
  console.log(`✅ Loaded audio file: ${(fileData.length / 1024).toFixed(2)} KB\n`);

  // 2. Test /api/score/score - Full pipeline
  console.log("📊 Test 1: Full Scoring Pipeline (/api/score/score)");
  console.log("-".repeat(60));
  try {
    const startTime = Date.now();
    const response = await axios.post(`${API_BASE}/api/score/score`, {
      audioBase64,
      examType: "toefl",
      targetScore: 25,
      timeLimitSec: 45,
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Success! (${duration}s)`);
    console.log("\n📋 Results:");
    console.log(`  Transcript: ${response.data.transcript?.substring(0, 100)}...`);
    console.log(`  Acoustic Score:`, response.data.acoustic_score);
    console.log(`  Text Score:`, response.data.text_score);
    console.log(`  Final Score:`, response.data.final_score);
    console.log(`  UI Score:`, response.data.exam_ui_score);
    console.log(`  Improvements: ${response.data.improvements?.length || 0} items\n`);
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }

  // 3. Test /api/score/analyze - Text analysis only
  console.log("📝 Test 2: Text Analysis (/api/score/analyze)");
  console.log("-".repeat(60));
  try {
    const response = await axios.post(`${API_BASE}/api/score/analyze`, {
      transcript: "I think technology is very important for our daily life because it helps us communicate and work more efficiently.",
      examType: "toefl",
      taskType: "task1",
      score: { delivery: 22, language_use: 23, topic_dev: 22, overall: 22 },
    });
    console.log("✅ Success!");
    console.log("  Analysis Result:", response.data);
    console.log("");
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }

  // 4. Test /api/score/draft - Improvement tips
  console.log("💡 Test 3: Improvement Tips (/api/score/draft)");
  console.log("-".repeat(60));
  try {
    const response = await axios.post(`${API_BASE}/api/score/draft`, {
      transcript: "I think technology is very important for our daily life.",
      examType: "toefl",
      taskType: "task1",
      score: { delivery: 20, language_use: 18, topic_dev: 19, overall: 19 },
    });
    console.log("✅ Success!");
    if (response.data.tips) {
      console.log(`  Tips: ${response.data.tips.length} items`);
      response.data.tips.forEach((tip: any, i: number) => {
        console.log(`    ${i + 1}. ${tip.title || tip.dimension}`);
      });
    }
    console.log("");
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }

  // 5. Test /api/score/sample - Generate sample answer
  console.log("✨ Test 4: Generate Sample Answer (/api/score/sample)");
  console.log("-".repeat(60));
  try {
    const response = await axios.post(`${API_BASE}/api/score/sample`, {
      transcript: "I like reading books.",
      targetScore: 25,
      examType: "toefl",
      taskType: "task1",
      timeLimitSec: 45,
    });
    console.log("✅ Success!");
    console.log(`  Sample Answer: ${response.data.sample?.substring(0, 150)}...`);
    console.log("");
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
  }

  // 6. Test different exam types
  console.log("🌍 Test 5: Different Exam Types");
  console.log("-".repeat(60));
  const examTypes = ["toefl", "ielts", "pte", "duolingo"];
  for (const examType of examTypes) {
    try {
      const response = await axios.post(`${API_BASE}/api/score/analyze`, {
        transcript: "I think technology is important.",
        examType,
        taskType: examType === "toefl" ? "task1" : "part1",
      });
      console.log(`✅ ${examType.toUpperCase()}:`, response.data.overall || "N/A");
    } catch (error: any) {
      console.log(`❌ ${examType.toUpperCase()}:`, error.response?.data?.error || "Error");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Full Pipeline Test Complete!");
}

// Run tests
testFullPipeline().catch((err) => {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
});



