// 测试 OpenAI API Key 是否有效
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log("=== OpenAI API Key 测试 ===\n");
  
  // 1. 检查 key 是否存在
  if (!apiKey) {
    console.error("❌ OPENAI_API_KEY 未在 .env 文件中设置");
    process.exit(1);
  }
  
  // 2. 清理和检查 key 格式
  const cleanedKey = apiKey.trim().replace(/\s+/g, '');
  const keyPrefix = cleanedKey.substring(0, 12);
  console.log(`✓ API Key 已找到: ${keyPrefix}...`);
  console.log(`  原始长度: ${apiKey.length} 字符`);
  console.log(`  清理后长度: ${cleanedKey.length} 字符`);
  
  if (apiKey !== cleanedKey) {
    console.warn(`⚠️  警告: API Key 包含空格或特殊字符，已自动清理`);
  }
  
  if (!cleanedKey.startsWith("sk-")) {
    console.error("❌ API Key 格式错误：应该以 'sk-' 开头");
    process.exit(1);
  }
  
  if (cleanedKey.length < 40 || cleanedKey.length > 200) {
    console.warn(`⚠️  警告: API Key 长度异常 (${cleanedKey.length} 字符)，正常应该是 40-60 字符`);
  }
  
  // 3. 测试 API 调用
  console.log("\n正在测试 API 调用...");
  
  try {
    const openai = new OpenAI({
      apiKey: cleanedKey,  // 使用清理后的 key
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'Hello, API key is working!' if you can read this.",
        },
      ],
      max_tokens: 20,
    });
    
    const content = response.choices[0]?.message?.content;
    console.log(`\n✅ API Key 有效！`);
    console.log(`响应: ${content}`);
    console.log(`\n使用的模型: ${response.model}`);
    console.log(`Token 使用: ${response.usage?.total_tokens || "N/A"}`);
    
  } catch (error: any) {
    console.error("\n❌ API 调用失败:");
    console.error(`错误类型: ${error.constructor.name}`);
    console.error(`错误消息: ${error.message}`);
    
    if (error.status === 401) {
      console.error("\n🔑 401 错误 - API Key 无效或已过期");
      
      if (cleanedKey.startsWith('sk-proj-')) {
        console.error("\n⚠️  检测到您使用的是项目 Key (sk-proj-)，项目 Key 可能无法直接用于 API 调用。");
        console.error("\n解决方案：");
        console.error("1. 前往 https://platform.openai.com/api-keys");
        console.error("2. 点击 'Create new secret key' 创建一个用户级别的 API Key");
        console.error("3. 用户 Key 应该以 'sk-' 开头（不是 'sk-proj-'），长度约 50-60 字符");
        console.error("4. 将新的用户 Key 更新到 .env 文件中的 OPENAI_API_KEY");
      } else {
        console.error("请检查：");
        console.error("1. API Key 是否正确复制（没有多余空格）");
        console.error("2. API Key 是否已过期或被撤销");
        console.error("3. 账户是否有足够的余额");
        console.error("4. 前往 https://platform.openai.com/api-keys 检查 key 状态");
      }
    } else if (error.status === 429) {
      console.error("\n⏱️  429 错误 - 请求频率超限");
    } else if (error.message?.includes("model")) {
      console.error("\n🤖 模型错误 - 请检查模型名称是否正确");
    } else {
      console.error("\n其他错误，请检查网络连接和 OpenAI 服务状态");
    }
    
    process.exit(1);
  }
}

testOpenAIKey().catch(console.error);

