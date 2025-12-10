// backend/api/src/services/whisperClient.ts

import dotenv from "dotenv";
// 确保在模块加载时先加载 .env 文件
dotenv.config();

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// 延迟初始化 OpenAI 客户端，确保 dotenv 已加载
let openai: OpenAI | null = null;

// 直接从 .env 文件读取 key，避免 dotenv 解析问题
function readApiKeyFromFile(): string | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../../.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^OPENAI_API_KEY=(.+)$/m);
    if (match) {
      return match[1].trim();
    }
  } catch (e) {
    // 如果读取文件失败，回退到环境变量
  }
  return null;
}

function getOpenAIClient(): OpenAI {
  if (!openai) {
    // 优先从文件直接读取，如果失败则使用环境变量
    let apiKey = readApiKeyFromFile() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY 未在 .env 文件中设置");
    }
    
    // 清理 API key：去除空格、换行符等
    apiKey = apiKey.trim().replace(/\s+/g, '');
    
    // 验证 key 格式
    if (!apiKey.startsWith('sk-')) {
      throw new Error(`OpenAI API Key 格式错误：应该以 'sk-' 开头，但当前是 '${apiKey.substring(0, 10)}...'`);
    }
    
    // 项目级 key (sk-proj-) 现在也可以直接用于 API 调用
    if (apiKey.startsWith('sk-proj-')) {
      console.log(`[whisperClient] 使用项目级 API Key (sk-proj-)`);
    } else if (apiKey.startsWith('sk-')) {
      // 传统的用户级 key 长度通常在 40-60 字符之间
      if (apiKey.length < 40 || apiKey.length > 70) {
        console.warn(`⚠️  警告: API Key 长度异常 (${apiKey.length} 字符)，正常应该是 40-60 字符`);
      }
    }
    
    // 调试：确认使用的是 .env 文件中的 key（只显示前12个字符）
    const keyPrefix = apiKey.substring(0, 12);
    console.log(`[whisperClient] 使用 OpenAI API Key: ${keyPrefix}... (长度: ${apiKey.length} 字符)`);
    
    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

/**
 * Transcribe audio from base64 string using OpenAI Whisper API
 */
export async function whisperClient(audioBase64: string): Promise<string> {
  // 检查 API key 是否存在
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 未设置。请在 .env 文件中设置 OPENAI_API_KEY 环境变量。");
  }

  // 获取 OpenAI 客户端（延迟初始化，确保使用 .env 中的 key）
  const client = getOpenAIClient();

  let tempFilePath: string | null = null;
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Create temporary file (OpenAI SDK needs a file path in Node.js)
    tempFilePath = path.join(os.tmpdir(), `whisper-${Date.now()}.m4a`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Use OpenAI Audio API (Whisper)
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    return transcription.text.trim();
  } catch (error: any) {
    console.error("Whisper API 调用失败：", error);
    
    // 提供更友好的错误信息
    if (error.status === 401 || error.message?.includes("401") || error.message?.includes("Invalid API key") || error.message?.includes("Incorrect API key")) {
      let errorMsg = "OpenAI API key 无效或已过期。\n\n";
      errorMsg += "请检查：\n";
      errorMsg += "1. .env 文件中的 OPENAI_API_KEY 是否正确（没有多余空格或换行）\n";
      errorMsg += "2. API Key 是否已过期或被撤销\n";
      errorMsg += "3. 账户是否有足够的余额\n";
      errorMsg += "4. 项目权限是否正确配置\n";
      errorMsg += "5. 前往 https://platform.openai.com/api-keys 检查 key 状态\n";
      
      throw new Error(errorMsg);
    } else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("rate limit")) {
      throw new Error("OpenAI API 请求频率超限。请稍后再试或检查您的 API 配额。");
    }
    throw new Error(`Whisper transcription failed: ${error.message || "未知错误"}`);
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}
