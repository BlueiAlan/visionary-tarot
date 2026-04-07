import { ReadingSession } from '../models/types';
import { generateDeck } from '../utils/deckGenerator';
import { getCardMeaning, getFormattedReading } from '../utils/tarotKnowledge';

/**
 * 解牌引擎
 * 
 * 双轨路由设计：
 * 1. 有 API Key → 知识库 + Gemini AI 联合解读（将知识库内容注入 prompt 作为上下文）
 * 2. 无 API Key → 纯知识库专业解读（完整呈现，无任何 API Key 提示）
 */

const SYSTEM_PROMPT = `你是一位精通神秘学、心理学，且极具共情力的高阶精神导师与塔罗师。你在为当代年轻人进行一场沉浸式的数字占星占卜。
你的解读必须专业、通透，直击心灵。必须严格遵循以下结构，每个部分用【】括起来并独立成段：

【星象与潜意识】
结合心理学分析抽牌时的潜意识能量，简述牌面元素的流动。

【符号学拆解】
用富有画面感的语言解析画面关键符号的隐喻。

【命运微观剖析】
深度剖析当前焦虑或现状。综合阵法联动去解释，不要仅仅分别陈述单张牌。

【破局与高维灵引】
给出具体、可执行且带有温度的生活指引。

重要规则：
1. 绝对不要以"好的，..."或"以下是..."开头。语气保持清冷、克制却充满智慧与温度。
2. 不要使用Markdown格式，仅使用中文标点和普通文本换行（小标题用【】包裹）。
3. 明确指出每张牌的正逆位对运势的具体影响。
4. 内容要丰富详尽，至少800字。`;

function buildUserPrompt(session: ReadingSession): string {
  const { userQuestion, selectedSpread, drawnCards } = session;
  const deck = generateDeck();

  let prompt = `问询者执念：${userQuestion || '（无特定问题，凭直觉抽取）'}\n`;
  prompt += `当前凝结阵法：${selectedSpread?.name || '单张启示'}（共${selectedSpread?.cardCount || 1}张牌）\n\n`;
  prompt += '牌阵显化的卡牌：\n';
  
  drawnCards.forEach((drawn, index) => {
    const positionMeaning = selectedSpread?.positions[index]?.meaning || `位置${index + 1}`;
    const cardData = deck.find(c => c.id === drawn.cardId);
    const meaning = getCardMeaning(drawn.cardId);
    const cardNameStr = cardData ? `${cardData.chineseName}(${cardData.name})` : drawn.cardId;
    
    prompt += `\n[${positionMeaning}]：${cardNameStr} —— ${drawn.isReversed ? '【逆位】' : '【正位】'}\n`;
    
    // 将知识库的核心含义注入 prompt，让 AI 在此基础上做更深层的创造性解读
    if (meaning) {
      const mainMeaning = drawn.isReversed ? meaning.reversedMeaning : meaning.uprightMeaning;
      prompt += `  参考含义：${mainMeaning.substring(0, 120)}...\n`;
      prompt += `  符号：${meaning.symbolism.substring(0, 80)}...\n`;
    }
  });
  
  prompt += '\n请基于以上能量场和参考含义，进行更深层次的创造性融合解读。综合分析牌阵间的联动关系，给出详尽丰富的解读。';
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
          maxOutputTokens: 2500
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
              if (textPart) yield textPart;
            }
          } catch (e) {
            // 忽略残缺的 SSE chunk
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 基于本地知识库的专业解读（无 API Key 时使用）
 * 
 * 不再提示用户需要 API Key，而是直接呈现完整的专业解读
 * 输出速度优化：以段落为单位快速输出，避免逐字卡顿
 */
export async function* streamLocalInterpretation(session: ReadingSession): AsyncGenerator<string, void, unknown> {
  const { drawnCards, selectedSpread, userQuestion } = session;

  // 构建每张牌的详尽解读
  const cardReadings: string[] = [];
  drawnCards.forEach((drawn, i) => {
    const positionMeaning = selectedSpread?.positions[i]?.meaning || `位置${i + 1}`;
    const reading = getFormattedReading(drawn.cardId, drawn.isReversed, positionMeaning);
    cardReadings.push(reading);
  });

  // 构建综合分析
  const meanings = drawnCards.map(d => getCardMeaning(d.cardId)).filter(Boolean);
  const elements = meanings.map(m => m!.element);
  const elementCount: Record<string, number> = {};
  elements.forEach(e => { elementCount[e] = (elementCount[e] || 0) + 1; });
  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'SPIRIT';
  
  const elementNames: Record<string, string> = { FIRE: '火', WATER: '水', AIR: '风', EARTH: '地', SPIRIT: '灵' };

  const fullText = `【星象与潜意识】

为「${userQuestion || '全方位运势'}」凝神展开的这次占卜中，${drawnCards.length}张牌呈现出以${elementNames[dominantElement]}元素为主导的能量格局。${dominantElement === 'FIRE' ? '火焰的灼热暗示着强烈的行动欲望与内在激情正在燃烧，你的潜意识在推动你打破现状。' : dominantElement === 'WATER' ? '水的波动揭示了你当下情感世界的深层涟漪，潜意识中有未被处理的情感正在等待释放。' : dominantElement === 'AIR' ? '风的流动表明你的思维正处于高度活跃的状态，大量的信息和想法在脑中交织——但要小心过度分析带来的精神内耗。' : '大地的厚重说明你的关注点正聚焦在现实层面——事业、财务、健康等物质基础的构建与巩固。'}

这种元素配置意味着你目前的生命主题正围绕着${elementNames[dominantElement]}元素所代表的领域展开。抽牌时的能量频率与你的潜意识已经形成了共振。


【符号学拆解】

${cardReadings.join('\n')}

【命运微观剖析】

综合${drawnCards.length}张牌的联动关系来看，你目前正处于一个${drawnCards.some(d => d.isReversed) ? '内在矛盾与外在挑战并存' : '能量相对顺畅但仍需提升觉知'}的阶段。

${drawnCards.length >= 2 ? `第一张牌「${meanings[0]?.chineseName}」设定了这次解读的基调——它揭示了问题的核心能量场；而「${meanings[meanings.length - 1]?.chineseName}」作为收束之牌，则暗示了事态发展的最终走向与你需要学习的课题。` : ''}

${drawnCards.filter(d => d.isReversed).length > 0 ? `值得特别关注的是，有${drawnCards.filter(d => d.isReversed).length}张牌出现了逆位，这说明对应领域的能量存在阻塞或需要被重新审视。逆位并非"坏牌"，它更像是宇宙在用一种更强烈的方式提醒你：某些旧模式需要被打破。` : '所有牌均呈正位，能量流动顺畅，是一个整体积极向上的格局。但也要警惕"一切太顺"带来的麻痹——保持觉知。'}


【破局与高维灵引】

基于上述牌阵的综合能量，以下是给你的具体行动建议：

一、当下（未来24小时内）：暂停你正在纠结的那件事。给自己创造30分钟的绝对静默时间——关掉手机，闭上眼睛，让那些一直在脑中盘旋的念头自然流经你而不去抓住它们。

二、本周重点：${dominantElement === 'FIRE' ? '将你的热情聚焦在一个具体的目标上。你的能量不缺，但散落的火花无法点燃任何东西。选择一件事，全力以赴。' : dominantElement === 'WATER' ? '允许自己表达真实的感受。找一个你信任的人，说出那些你一直在独自消化的情绪。脆弱不是软弱，它是连接的桥梁。' : dominantElement === 'AIR' ? '把你脑中那些混乱的想法写下来。用纸笔，不是手机。视觉化的思维整理会帮助你看到之前忽略的关键连接。' : '处理一件你一直拖延的务实事项——无论是整理房间、处理账单还是更新简历。地元素告诉你：地基不稳，高楼必倾。'}

三、长期觉知：${drawnCards.some(d => d.isReversed) ? '那些逆位的牌正在提醒你，某些旧的模式需要被有意识地打破。改变不会在舒适区里发生——但它也不需要是剧烈的。每天做一个微小的不同选择，积累起来就是质变。' : '正位的能量格局给了你一个良好的起点。在接下来的两周内，将这份积极的势能转化为具体的行动。宇宙已经给你开了绿灯，现在轮到你踩油门了。'}

${meanings.map(m => `「${m?.chineseName}」`).join('与')}的组合告诉你：答案从来不在外面，它一直藏在你选择忽视的那个直觉里。`;

  // 以段落为单位输出，流畅且不卡顿
  const paragraphs = fullText.split('\n');
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      yield '\n';
      await new Promise(r => setTimeout(r, 30));
    } else {
      // 每次输出一整行，速度快且不卡顿
      yield paragraph + '\n';
      await new Promise(r => setTimeout(r, 60));
    }
  }
}

export async function* interpretReading(session: ReadingSession, apiKey?: string): AsyncGenerator<string, void, unknown> {
  if (apiKey && apiKey.length > 15) {
    try {
      yield* streamGeminiInterpretation(session, apiKey);
      return;
    } catch (e) {
      console.warn("大模型解析失败，采用本地知识库解析", e);
      yield* streamLocalInterpretation(session);
    }
  } else {
    yield* streamLocalInterpretation(session);
  }
}
