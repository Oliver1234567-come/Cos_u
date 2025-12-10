// src/services/llmClient.ts
// Unified LLM client for OpenAI + Gemini

import dotenv from "dotenv";
// 确保在模块加载时先加载 .env 文件
dotenv.config();

import OpenAI from "openai";

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
    // 项目级 key 通常较长（100+ 字符），这是正常的
    if (apiKey.startsWith('sk-proj-')) {
      console.log(`[llmClient] 使用项目级 API Key (sk-proj-)`);
    } else if (apiKey.startsWith('sk-')) {
      // 传统的用户级 key 长度通常在 40-60 字符之间
      if (apiKey.length < 40 || apiKey.length > 70) {
        console.warn(`⚠️  警告: API Key 长度异常 (${apiKey.length} 字符)，正常应该是 40-60 字符`);
      }
    }
    
    // 调试：确认使用的是 .env 文件中的 key（只显示前12个字符）
    const keyPrefix = apiKey.substring(0, 12);
    console.log(`[llmClient] 使用 OpenAI API Key: ${keyPrefix}... (长度: ${apiKey.length} 字符)`);
    
    openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openai;
}

// Optional Gemini support (only if package is installed)
// Use dynamic require to avoid TypeScript compilation errors
let genAI: any = null;
function initGemini() {
  if (genAI !== null) return genAI; // Already initialized or attempted
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      genAI = false;
      return genAI;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    // Gemini package not installed, skip
    genAI = false; // Mark as attempted but failed
  }
  return genAI;
}

/**
 * Call OpenAI (GPT family) with a single user prompt.
 */
export async function callOpenAI(prompt: string): Promise<string> {
  // 检查 API key 是否存在
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 未设置。请在 .env 文件中设置 OPENAI_API_KEY 环境变量。");
  }

  // 获取 OpenAI 客户端（延迟初始化，确保使用 .env 中的 key）
  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // 使用正确的模型名称：gpt-4o-mini (最新), gpt-4-turbo, 或 gpt-3.5-turbo
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    return typeof content === "string" ? content : (content ?? "");
  } catch (error: any) {
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
    } else if (error.message?.includes("model")) {
      throw new Error(`OpenAI 模型错误：${error.message}。请检查模型名称是否正确。`);
    }
    throw new Error(`OpenAI API 调用失败：${error.message || "未知错误"}`);
  }
}

/**
 * Call Gemini (Google Generative AI) with a single user prompt.
 */
export async function callGemini(prompt: string): Promise<string> {
  const gemini = initGemini();
  if (!gemini) {
    throw new Error("Gemini package not installed or API key not configured. Please install @google/generative-ai and set GEMINI_API_KEY");
  }
  
  // Use available Gemini models (updated 2024)
  // Try models in order of preference: flash (faster) -> pro (better quality)
  const modelNames = [
    "gemini-1.5-flash",      // Latest fast model
    "gemini-1.5-pro",        // Latest high-quality model
    "gemini-pro",            // Fallback model
  ];
  
  let lastError: any = null;
  
  for (const modelName of modelNames) {
    try {
      const model = gemini.getGenerativeModel({
        model: modelName,
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || "";
    } catch (error: any) {
      lastError = error;
      // If it's not a 404/not found error, it might be a different issue, try next model
      if (!error.message?.includes("404") && !error.message?.includes("not found")) {
        continue;
      }
    }
  }
  
  throw new Error(`Gemini API error: ${lastError?.message || "Failed to generate content. Please check your GEMINI_API_KEY and model availability."}`);
}

/**
 * Unified LLM call function (defaults to OpenAI)
 * To use Gemini instead, change this to: return callGemini(prompt);
 */
export async function callLLM(prompt: string): Promise<string> {
  // 默认使用 OpenAI，如果需要使用 Gemini，可以改为: return callGemini(prompt);
  return callOpenAI(prompt);
}
