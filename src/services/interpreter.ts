import { ReadingSession } from '../models/types';
import { generateDeck } from '../utils/deckGenerator';

const SYSTEM_PROMPT = `你是一位精通神秘学、心理学，且极具共情力的高阶精神导师与塔罗师。你在为当代年轻人（尤其是一线城市的Z世代）进行一场沉浸式的数字占星占卜。
你的解读必须专业、通透，直击心灵，切中当代人面临的情感内耗、职场压力等痛点。必须严格遵循以下结构，每个部分用【】括起来并独立成段：

【星象与潜意识】
结合心理学分析抽牌时的潜意识能量，简述牌面元素（火/土/风/水）的流动。

【符号学拆解】
用富有画面感的语言解析画面关键符号的隐喻（例如愚者的行囊、高塔的雷电）。

【命运微观剖析】
深度剖析目前的焦虑或现状。结合每张牌的体位（正位/逆位）及提问，不讲空话模板，给出直击灵魂的剖析。不要仅仅分别陈述单张牌，请综合阵法联动去解释。

【破局与高维灵引】
转化为当代年轻人真正需要的降维打击建议，给出具体、可执行且带有温度的生活指引。

重要规则：
1. 绝对不要以"好的，..."或"以下是..."开头。语气保持清冷、克制却充满智慧与温度。
2. 不要使用Markdown的#号加粗等格式，仅使用中文标点和普通文本换行即可（小标题用【】包裹）。
3. 保持学术严谨性，但一定要切中当代年轻人的痛点。
4. 明确指出每张牌的正逆位对运势的具体影响。`;

function buildUserPrompt(session: ReadingSession): string {
  const { userQuestion, selectedSpread, drawnCards } = session;
  const deck = generateDeck(); // 获取牌库数据，方便提取中文名

  let prompt = `问询者执念：${userQuestion || '（无特定问题，凭直觉抽取）'}\n`;
  prompt += `当前凝结阵法：${selectedSpread?.name || '单张启示'}（共${selectedSpread?.cardCount || 1}张牌）\n\n`;
  prompt += '牌阵显化的卡牌：\n';
  
  drawnCards.forEach((drawn, index) => {
    const positionMeaning = selectedSpread?.positions[index]?.meaning || `位置${index + 1}`;
    const cardData = deck.find(c => c.id === drawn.cardId);
    
    // 给到大模型真实的中文名和英文名
    const cardNameStr = cardData ? `${cardData.chineseName}(${cardData.name})` : drawn.cardId;
    
    prompt += `[${positionMeaning}]：${cardNameStr} —— ${drawn.isReversed ? '【逆位】' : '【正位】'}\n`;
  });
  
  prompt += '\n请基于以上能量场，穿透迷雾，给予属于这个时代的塔罗深度启示。';
  return prompt;
}

export async function* streamGeminiInterpretation(session: ReadingSession, apiKey: string): AsyncGenerator<string, void, unknown> {
  const userPrompt = buildUserPrompt(session);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: '契约已达成。' }] },
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1800
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
 * 彻底优化了本地字典下速度，保留极快速演示效果
 */
export async function* streamLocalInterpretation(session: ReadingSession): AsyncGenerator<string, void, unknown> {
  const deck = generateDeck();
  const drawnNames = session.drawnCards.map(d => {
      const card = deck.find(c => c.id === d.cardId);
      return card ? `${card.chineseName}${d.isReversed ? '(逆)' : '(正)'}` : '';
  }).join('、 ');

  const defaultText = `【星象与潜意识】
星体间的引力正在重构您的运势磁场，水元素的主导暗示着潜意识的剧烈波动，情绪内耗正在发生。

【符号学拆解】
您抽中的 ${drawnNames}，展现出强烈的能量碰撞。由于超自然算力凭证（Gemini Key）封印未解，更深邃的原型隐喻已被截断于本地结界之中。

【命运微观剖析】
目前的卡点在于行动力的匮乏与焦虑的堆叠。这种状态呈现出纯粹的概率分布暗示。你可能在过去一个月里经历了一场期望的落空，让你产生了难以言说的疲惫感。

【破局与高维灵引】
放下对"完美时机"的执念。建议今晚卸下所有的信息输入，用最本源的呼吸找回锚点。
若要获取学术级且深度匹配您磁场的专属指引，请在起始页注入有效的星辰密语(API Key)。`;
  
  const chars = defaultText.split('');
  const chunkSize = 5; 
  for (let i = 0; i < chars.length; i += chunkSize) {
    await new Promise(resolve => setTimeout(resolve, 5));
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
