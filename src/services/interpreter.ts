import { ReadingSession } from '../models/types';

const SYSTEM_PROMPT = `你是一位精通赫尔墨斯主义、卡巴拉生命树和荣格心理学的学术派塔罗师。
你的解读必须严格遵循以下结构，每个部分用标题标记：

【元素与星象对应】
分析牌面元素（火/土/风/水）与行星/星座的对应关系。

【符号学解析】
解析牌面关键符号的隐喻与原型意义。

【深层意涵】
结合用户问题，分析牌阵位置关系，揭示深层心理与命运模式。

【启示建议】
转化为具体、可操作的生活指引。

重要规则：
1. 绝对不要以"好的，..."或"以下是..."开头
2. 不要使用Markdown格式，仅使用中文标点
3. 保持学术严谨性，避免神秘主义套话
4. 正位与逆位有本质区别，需分别分析`;

function buildUserPrompt(session: ReadingSession): string {
  const { userQuestion, selectedSpread, drawnCards } = session;
  let prompt = `用户问题：${userQuestion || '（无特定问题，请求全方位启示）'}\n`;
  prompt += `使用牌阵：${selectedSpread?.name || '单张启示'}（共${selectedSpread?.cardCount || 1}张牌）\n\n`;
  prompt += '抽取的卡牌：\n';
  drawnCards.forEach((drawn, index) => {
    const positionMeaning = selectedSpread?.positions[index]?.meaning || `位置${index + 1}`;
    prompt += `${positionMeaning}：【牌标识符: ${drawn.cardId}】 ${drawn.isReversed ? '（逆位）' : '（正位）'}\n`;
  });
  prompt += '\n请基于以上信息，严格按规则提供学术派的塔罗深度解读。';
  return prompt;
}

export async function* streamGeminiInterpretation(session: ReadingSession, apiKey: string): AsyncGenerator<string, void, unknown> {
  const userPrompt = buildUserPrompt(session);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: '确认指令。' }] },
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      })
    }
  );

  if (!response.ok || !response.body) {
    throw new Error('Gemini API 调用失败。');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.candidates && parsed.candidates.length > 0) {
                const textPart = parsed.candidates[0].content?.parts?.[0]?.text;
                if (textPart) {
                    yield textPart;
                }
            }
          } catch (e) {
             // 忽略残缺的数据块异常
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 【优化提速点】
 * 彻底优化了本地字典（无API Key）下的降级体验速度，
 * 每个字从 30ms 等待锐减到只保留 2ms 微秒级延迟（相当于极速整段输出，仅保留轻微动画感）
 */
export async function* streamLocalInterpretation(session: ReadingSession): AsyncGenerator<string, void, unknown> {
  const defaultText = `【元素与星象对应】
星体间的引力正在重构您的运势磁场，水元素的主导暗示着潜意识的苏醒。

【符号学解析】
此处牌面特征表明由于您的超自然算力凭证（Gemini Key）封印未解，解读未能全息展开，宏大的符号学意境已被截断于本地。

【深层意涵】
目前呈现出纯粹的概率分布暗示。这表示一切尚在未定之天。卡牌 ${session.drawnCards.length > 0 ? session.drawnCards[0].cardId : ''} 呈现出强烈的波动。

【启示建议】
一切答案已然跃动于您的直觉之中。若要获取学术级的深刻指引，请在起始页注入有效的星辰密语(API Key)。`;
  
  const chars = defaultText.split('');
  // 按照 chunk 直接批量抛出加快速度
  const chunkSize = 5; 
  for (let i = 0; i < chars.length; i += chunkSize) {
    await new Promise(resolve => setTimeout(resolve, 5)); // 5ms 等待 5个词汇，速度拉满
    yield chars.slice(i, i + chunkSize).join('');
  }
}

export async function* interpretReading(session: ReadingSession, apiKey?: string): AsyncGenerator<string, void, unknown> {
  if (apiKey && apiKey.length > 15) {
    try {
      yield* streamGeminiInterpretation(session, apiKey);
      return;
    } catch (e) {
      console.warn("大模型解析失败，采用本地预置解析", e);
      yield* streamLocalInterpretation(session);
    }
  } else {
    yield* streamLocalInterpretation(session);
  }
}
