/**
 * 灵视塔罗 — 78 张完整知识库
 * 
 * 包含 22 张大阿尔卡纳 + 56 张小阿尔卡纳（权杖/圣杯/宝剑/星币 各 14 张）
 * 每张牌包含：中文名、英文名、元素、正位含义、逆位含义、关键词
 * 
 * 数据来源：经典韦特塔罗体系 + 现代心理学解读融合
 */

export interface TarotMeaning {
  id: string;
  name: string;
  chineseName: string;
  suit: 'MAJOR' | 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES';
  element: 'FIRE' | 'WATER' | 'AIR' | 'EARTH' | 'SPIRIT';
  zodiac?: string;
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
  symbolism: string;
}

// ==========================================
// 大阿尔卡纳 (22 张)
// ==========================================
const MAJOR_ARCANA: TarotMeaning[] = [
  {
    id: 'maj-0', name: 'The Fool', chineseName: '愚者',
    suit: 'MAJOR', element: 'AIR', zodiac: '天王星',
    uprightMeaning: '新的开始正在召唤你。你正站在悬崖边缘，但这并非坠落的征兆——而是飞翔的前奏。当下的你拥有初学者的心态，对世界充满好奇与无畏。宇宙在提醒你：真正的智慧，有时就藏在看似"愚蠢"的勇气里。放下过度的计算与权衡，相信直觉，迈出那一步。',
    reversedMeaning: '你正在用"随性"来掩饰内心的逃避。逆位的愚者暗示你可能在没有做好任何准备的情况下冲动行事，或者恰好相反——因为过度恐惧而拒绝一切新的可能性。审视一下：你是真的在"跟随心流"，还是在逃避责任？',
    keywords: ['新开始', '纯真', '冒险', '自由', '信念之跃'],
    symbolism: '愚者肩上的包袱象征经验的积累但未被打开的潜能，脚下的悬崖是未知的深渊也是飞翔的起点，身旁的小白狗代表本能与忠诚的内在声音。'
  },
  {
    id: 'maj-1', name: 'The Magician', chineseName: '魔术师',
    suit: 'MAJOR', element: 'AIR', zodiac: '水星',
    uprightMeaning: '你拥有将想法变为现实的全部工具。魔术师的桌上摆放着四大元素——权杖（意志）、圣杯（情感）、宝剑（思维）、星币（物质），这意味着你现在具备了创造的完整条件。关键在于：你是否愿意主动出击，将分散的资源整合起来？宇宙已经给了你牌，现在轮到你出手了。',
    reversedMeaning: '才华被浪费或被用在了错误的方向。你可能正在自我欺骗，或者拥有能力却因拖延而空转。也可能暗示有人在对你施展"障眼法"，小心那些口才太好却缺乏实质的人。',
    keywords: ['创造力', '意志力', '技能', '资源整合', '主动出击'],
    symbolism: '头顶的无限符号∞象征无穷的潜能循环，一手指天一手指地代表"如其在上，如其在下"的赫尔墨斯法则。'
  },
  {
    id: 'maj-2', name: 'The High Priestess', chineseName: '女祭司',
    suit: 'MAJOR', element: 'WATER', zodiac: '月亮',
    uprightMeaning: '答案不在外面，而在你的内心深处。女祭司是潜意识的守门人，她的出现提示你：此刻需要安静下来，倾听内在的声音。你可能感受到了某种直觉、某个梦境、某种难以言说的"感应"——不要忽略它们。逻辑很重要，但有些真相只有直觉能触及。',
    reversedMeaning: '你正在忽视自己的直觉，或者被表面的信息所迷惑。逆位的女祭司暗示秘密、隐藏的真相、或者你自己在回避某些不愿面对的内心感受。别再压抑了，那些被你推入潜意识深处的东西，终将以另一种方式浮出水面。',
    keywords: ['直觉', '潜意识', '神秘', '内在智慧', '静默'],
    symbolism: '她身后的帷幕遮挡着未知世界，膝上的卷轴TORA代表更高的律法，脚下的新月象征潜意识与女性能量的流动。'
  },
  {
    id: 'maj-3', name: 'The Empress', chineseName: '女皇',
    suit: 'MAJOR', element: 'EARTH', zodiac: '金星',
    uprightMeaning: '丰盛与滋养的能量正在涌入你的生活。女皇代表创造力的极致绽放——无论是一段关系的深化、一个项目的孕育、还是你对美与舒适的追求。现在是播种的好时机，你所投入的关怀与爱会以倍数回馈给你。允许自己享受感官的愉悦，不必为此感到愧疚。',
    reversedMeaning: '创造力受阻，或过于依赖外在的物质安慰。你可能正在忽视对自己的照顾、过度付出而濒临枯竭，或者在感情中令窒息地执着。问问自己：你是在滋养，还是在控制？',
    keywords: ['丰盛', '母性', '创造', '感官愉悦', '自然'],
    symbolism: '皇冠上的十二颗星星代表黄道十二宫的完整周期，脚下的麦田象征物质的丰收与大地的馈赠。'
  },
  {
    id: 'maj-4', name: 'The Emperor', chineseName: '皇帝',
    suit: 'MAJOR', element: 'FIRE', zodiac: '白羊座',
    uprightMeaning: '是时候建立秩序和结构了。皇帝代表权威、纪律和战略性思维。你需要为你的生活或项目设定清晰的边界和规则。这不是随心所欲的时刻——这是需要你像领导者一样思考和行动的时刻。稳定的框架才能承载远大的野心。',
    reversedMeaning: '权力失控或过度僵化。你可能正在经历来自权威人物的压迫，或者你自己变成了那个控制欲过强的人。灵活一点，规则是为人服务的，不是反过来。',
    keywords: ['权威', '结构', '纪律', '领导力', '稳定'],
    symbolism: '石头宝座象征坚不可摧的意志，手中的权杖代表生命力与支配权，盔甲下的身躯暗示即使是强者也有脆弱的一面。'
  },
  {
    id: 'maj-5', name: 'The Hierophant', chineseName: '教皇',
    suit: 'MAJOR', element: 'EARTH', zodiac: '金牛座',
    uprightMeaning: '传统智慧与精神指引在此刻对你有价值。教皇代表体制化的知识、导师的教诲、以及集体共识的力量。也许你需要找一位前辈请教，或者加入某个学习社群。不必事事从零开始——前人的经验是你的捷径。',
    reversedMeaning: '对传统的盲从或叛逆。你可能正在被过时的规则束缚，或者刻意反对一切主流价值观。真正的独立思考，不是为了反对而反对，而是在理解之后做出自己的选择。',
    keywords: ['传统', '信仰', '教育', '精神导师', '体制'],
    symbolism: '两根交叉的钥匙象征显意识与潜意识世界的通道，两位跪拜者代表外在服从与内在领悟的双重路径。'
  },
  {
    id: 'maj-6', name: 'The Lovers', chineseName: '恋人',
    suit: 'MAJOR', element: 'AIR', zodiac: '双子座',
    uprightMeaning: '一个重要的选择摆在你面前，它关乎你的核心价值观。恋人牌不仅仅是爱情——它更深层的含义是"抉择"与"结合"。你需要在两条路径之间做出决定，而这个决定将深刻影响你的未来。倾听你的心，但也不要忽视理性的声音。真正的爱与正确的选择，往往是让你成为更好的自己。',
    reversedMeaning: '内心的价值冲突或关系中的不和谐。你可能正在逃避一个艰难的选择，或者在一段关系里感到失衡。是否有什么事情，你一直在假装看不见？',
    keywords: ['选择', '爱情', '价值观', '结合', '和谐'],
    symbolism: '天使拉斐尔在云端祝福，代表更高力量的指引；身后的生命之树与知识之树暗示选择背后的深层后果。'
  },
  {
    id: 'maj-7', name: 'The Chariot', chineseName: '战车',
    suit: 'MAJOR', element: 'WATER', zodiac: '巨蟹座',
    uprightMeaning: '凭借坚定的意志力，你将征服眼前的挑战。战车代表通过自律和决心实现胜利——但这不是蛮力的胜利，而是驾驭内在矛盾力量（黑白双马）的智慧。你心中也许同时存在着恐惧与勇气、退缩与前进的拉扯，但只要你握紧方向盘，就没有什么能阻挡你。',
    reversedMeaning: '失去方向感或控制力。你可能正在被矛盾的欲望撕扯，或者固执地朝着错误的方向前进。停下来，重新校准你的导航系统。蛮干不是勇气，方向比速度更重要。',
    keywords: ['意志力', '胜利', '自律', '方向', '征服'],
    symbolism: '一黑一白的狮身人面兽代表需要被驾驭的对立力量，星冠象征来自宇宙的祝福与更高维度的指引。'
  },
  {
    id: 'maj-8', name: 'Strength', chineseName: '力量',
    suit: 'MAJOR', element: 'FIRE', zodiac: '狮子座',
    uprightMeaning: '真正的力量不是压制，而是温柔的驯服。你正面对某种需要巨大内在力量的处境——可能是一段消耗性的关系、一个令人恐惧的挑战、或是你自身内心的野兽（愤怒、欲望、恐惧）。答案不在于暴力压制，而在于耐心、慈悲和持久的勇气。以柔克刚，方为上策。',
    reversedMeaning: '自我怀疑正在侵蚀你的力量，或者你正在使用错误的方式——要么过于软弱、忍让到失去自我，要么过于强硬、用控制来掩饰脆弱。找回你内在那头狮子的平衡点。',
    keywords: ['内在力量', '勇气', '耐心', '慈悲', '自控'],
    symbolism: '女性温柔地合上狮子的嘴，象征以爱与耐心驯服原始本能；头顶的无限符号暗示这是一种永恒的精神力量。'
  },
  {
    id: 'maj-9', name: 'The Hermit', chineseName: '隐士',
    suit: 'MAJOR', element: 'EARTH', zodiac: '处女座',
    uprightMeaning: '退后一步，独处是此刻最好的选择。隐士并非逃避社交——他是主动选择暂时脱离喧嚣，在内在的沉静中寻找答案。你可能需要一段时间的沉思、阅读、冥想或独自旅行。那盏提灯照亮的不是外面的路，而是你内心的迷宫。',
    reversedMeaning: '过度孤立或拒绝内省。你要么封闭自己到了不健康的程度，要么一直用忙碌来逃避与自己独处。孤独和独处是两回事——前者是被动的痛苦，后者是主动的充电。',
    keywords: ['内省', '独处', '智慧', '指引', '灵性追寻'],
    symbolism: '山顶的位置象征精神的高度，手中的六芒星灯笼照亮前行之路，也照亮后来者的方向。'
  },
  {
    id: 'maj-10', name: 'Wheel of Fortune', chineseName: '命运之轮',
    suit: 'MAJOR', element: 'FIRE', zodiac: '木星',
    uprightMeaning: '命运的齿轮正在转动，一个重大的转折点即将到来。这张牌提醒你：生命是循环的，没有永恒的顺境，也没有永恒的逆境。如果你正处于低谷，挺住——上升周期即将开始；如果你正处于巅峰，保持谦卑——并善用这段好运。你无法控制轮盘的转动，但你可以选择在每个位置如何应对。',
    reversedMeaning: '你可能正在经历一个不利的周期，或者因为抗拒变化而感到被命运捉弄。放下"为什么是我"的执念，接受当下，然后思考：在这个看似不利的位置上，你能学到什么？',
    keywords: ['转变', '周期', '命运', '机遇', '因果'],
    symbolism: '轮盘上的四个生灵代表四元素的恒定存在，蛇象征下降的能量，阿努比斯象征上升的力量，斯芬克斯主宰顶端的智慧。'
  },
  {
    id: 'maj-11', name: 'Justice', chineseName: '正义',
    suit: 'MAJOR', element: 'AIR', zodiac: '天秤座',
    uprightMeaning: '因果法则正在运作。你过去种下的每一个因，现在正在收获相应的果。正义牌提醒你：诚实面对自己，承担属于你的责任。如果你正面临法律事务、合同谈判或需要做出公正裁决的情境，保持客观和正直。天平最终会归于平衡。',
    reversedMeaning: '不公正或拒绝承担后果。你可能正在经历一个明显不公平的处境，或者你自己在逃避应有的责任。小心自欺：如果你一直在"合理化"自己的某个行为，也许该重新审视了。',
    keywords: ['公正', '真相', '因果', '责任', '平衡'],
    symbolism: '天平代表绝对的公正与精确的衡量，宝剑代表决断的力量与思维的锋利——裁决已下，不可撤回。'
  },
  {
    id: 'maj-12', name: 'The Hanged Man', chineseName: '倒吊人',
    suit: 'MAJOR', element: 'WATER', zodiac: '海王星',
    uprightMeaning: '暂停、换个视角、主动悬置。倒吊人的姿态看似被动，实则是最深层的主动——他选择了"不行动"来获取更高的洞见。你现在可能感觉被困住了、进退两难、或者被迫等待。但这个等待不是浪费——它是蜕变的必要过程。试着把你正在经历的局面倒过来看，你会发现完全不同的风景。',
    reversedMeaning: '无意义的牺牲或拒绝放手。你可能在一个已经死局的情境中继续投入，或者明知改变视角会有帮助却固执地拒绝尝试。停止为了牺牲而牺牲的循环。',
    keywords: ['暂停', '悬置', '新视角', '牺牲', '顿悟'],
    symbolism: '倒悬的姿态打破常规视角，头上的光环暗示通过放弃获得启示，交叉的腿形成数字4的形状——代表稳定中的变革。'
  },
  {
    id: 'maj-13', name: 'Death', chineseName: '死神',
    suit: 'MAJOR', element: 'WATER', zodiac: '天蝎座',
    uprightMeaning: '一个重要的篇章正在结束，为新的开始腾出空间。死神牌很少代表字面的死亡——它象征的是深层的转型：旧的身份、旧的模式、旧的关系正在瓦解。这个过程可能令人痛苦，但它是必要的。不要试图抓住那些已经失去生命力的东西。让它走，你才能重生。',
    reversedMeaning: '抗拒必要的结束，执着于已经死去的事物。你可能正在用尽全力维持一个已经没有灵魂的关系、工作或生活模式。你越抗拒，这个过程就越痛苦。臣服，不是懦弱——是智慧。',
    keywords: ['转型', '结束', '重生', '放手', '蜕变'],
    symbolism: '白马象征纯净的变革力量，脚下倒伏的国王说明转型面前众生平等，远处的太阳在双塔间升起——黎明永远在死亡之后。'
  },
  {
    id: 'maj-14', name: 'Temperance', chineseName: '节制',
    suit: 'MAJOR', element: 'FIRE', zodiac: '射手座',
    uprightMeaning: '平衡、调和与耐心是此刻的关键词。节制天使在两个杯子之间倒水，象征找到极端之间的中道。你可能需要在工作与生活、理性与感性、给予与接受之间找到新的平衡点。不要急于求成——好的调配需要时间。慢慢来，反而更快到达。',
    reversedMeaning: '极端失衡或失去耐心。你可能正在过度放纵某一方面同时完全忽视另一方面，或者因为急躁而破坏了一个需要慢慢酝酿的过程。中庸不是平庸——它是一种需要极高智慧才能达到的状态。',
    keywords: ['平衡', '调和', '耐心', '中道', '疗愈'],
    symbolism: '一只脚踏水一只脚踏地，象征连接情感与物质世界；水在两杯间的流动代表生命能量的精确调配。'
  },
  {
    id: 'maj-15', name: 'The Devil', chineseName: '恶魔',
    suit: 'MAJOR', element: 'EARTH', zodiac: '摩羯座',
    uprightMeaning: '你正被某种瘾或执念所束缚——可能是一段有毒的关系、物质依赖、工作狂模式、或者对手机和社交媒体的沉迷。恶魔牌的核心讽刺在于：那两个锁链是松的，你随时可以摘下来离开。问题是——你愿意吗？承认自己的阴暗面，是解放的第一步。',
    reversedMeaning: '你正在打破某种束缚，或者终于意识到了控制你的暗面。这是一个有力的觉醒时刻——但小心不要从一种执着跳入另一种。真正的自由不是矫枉过正，而是不再需要被任何东西控制。',
    keywords: ['束缚', '执念', '阴暗面', '诱惑', '觉醒'],
    symbolism: '倒五芒星象征物质凌驾于精神之上，两个被锁链拴住的人暗示看似被困实则自愿的心理牢笼。'
  },
  {
    id: 'maj-16', name: 'The Tower', chineseName: '高塔',
    suit: 'MAJOR', element: 'FIRE', zodiac: '火星',
    uprightMeaning: '一场突如其来的崩塌——但它会摧毁的只是那些建立在虚假地基上的东西。高塔牌是塔罗中最具冲击力的牌之一，代表剧变、震荡和猛然的觉醒。你精心构建的某个信念体系、人际关系或生活结构可能正在崩塌。这极度痛苦，但请记住：只有不牢固的建筑才会倒塌。灰烬之后，你将用真相重建一切。',
    reversedMeaning: '你在压抑一场必要的崩塌，或者剧变已经内在地发生了但你拒绝让它显化。拖延只会让最终的爆发更加剧烈。有时候，主动拆除比被动崩塌要温和得多。',
    keywords: ['剧变', '崩塌', '觉醒', '真相', '重建'],
    symbolism: '雷电击碎塔顶的皇冠——虚假的权威被摧毁，坠落的人象征旧自我的瓦解，这是痛苦的解放。'
  },
  {
    id: 'maj-17', name: 'The Star', chineseName: '星星',
    suit: 'MAJOR', element: 'AIR', zodiac: '水瓶座',
    uprightMeaning: '在经历风暴之后，希望之星终于亮起。星星牌是塔罗中最温柔的治愈——它出现在你最需要安慰的时候，告诉你：一切都会好起来的。这不是盲目的乐观，而是经历了深渊之后依然选择相信光明的勇气。敞开心扉，接受宇宙的滋养。你的伤口正在愈合，灵感正在回归。',
    reversedMeaning: '失去信心或希望感。你可能正在经历一段灵魂的暗夜，感觉一切都没有意义。但请记住：星星即使被云遮蔽，也依然在那里。也许你需要主动去寻找那盏被你自己藏起来的灯。',
    keywords: ['希望', '灵感', '治愈', '信念', '宁静'],
    symbolism: '裸体代表灵魂的坦诚与脆弱之美，一只脚在水中一只在地上连接着直觉与现实，八颗星星象征宇宙的无限馈赠。'
  },
  {
    id: 'maj-18', name: 'The Moon', chineseName: '月亮',
    suit: 'MAJOR', element: 'WATER', zodiac: '双鱼座',
    uprightMeaning: '事物并非表面看起来的那样。月亮照射出的是扭曲的影子，而非真实的形态。你可能正处于一个充满迷雾、幻象和不确定性的阶段——焦虑、恐惧、失眠、噩梦都是月亮牌的典型表现。不要在这种状态下做重大决定。等待迷雾散去，真相自会显现。',
    reversedMeaning: '幻象正在消散，你开始看清之前被恐惧扭曲的真相。这是走出焦虑和迷惑的好时机。那些在黑暗中看起来恐怖的怪物，在光线下可能只是一件挂在椅子上的外套。',
    keywords: ['幻象', '潜意识', '恐惧', '直觉', '迷惑'],
    symbolism: '狗和狼代表被驯化的与野性的本能，小龙虾从水中爬出象征潜意识深处浮现的原始恐惧，弯曲的小路暗示前行的道路并不直接。'
  },
  {
    id: 'maj-19', name: 'The Sun', chineseName: '太阳',
    suit: 'MAJOR', element: 'FIRE', zodiac: '太阳',
    uprightMeaning: '光芒万丈的成功与快乐正在热烈地拥抱你。太阳牌是整副塔罗中最积极的牌之一——它代表清晰的意识、充沛的活力、真诚的快乐和事情终于水落石出。如果你之前经历了困惑（月亮），现在一切都变得明朗了。像孩子一样拥抱这份喜悦吧，你值得。',
    reversedMeaning: '喜悦被暂时遮蔽，但并未消失。你可能感觉快乐来得太慢、成功打了折扣、或者因为过度自信而忽略了一些小问题。即使是逆位的太阳也是一张好牌——只是提醒你保持一点谦逊和觉察。',
    keywords: ['成功', '快乐', '活力', '清晰', '纯真'],
    symbolism: '裸体的孩子象征纯真与全然的信任，向日葵代表对光明的追随，白马是被纯化的意志力的载体。'
  },
  {
    id: 'maj-20', name: 'Judgement', chineseName: '审判',
    suit: 'MAJOR', element: 'FIRE', zodiac: '冥王星',
    uprightMeaning: '灵魂的号角已经吹响，是时候做一次深层的自我清算了。审判牌代表觉醒的呼唤——回顾你走过的路，承认你的错误，原谅你自己和他人，然后带着全新的觉知重新出发。这张牌经常出现在人生重大转折点：辞职、分手、搬家、灵性觉醒。那个"更高版本的你"正在召唤。',
    reversedMeaning: '你正在忽视内在的觉醒呼唤，或者被过去的愧疚与遗憾困住无法前行。自我审判太严厉了——原谅自己和原谅别人同样重要。你不是你过去犯的错，你是你现在做出的选择。',
    keywords: ['觉醒', '重生', '清算', '召唤', '原谅'],
    symbolism: '天使加百列的号角唤醒沉睡的灵魂，从棺材中站起的家庭代表三位一体的觉知——身体、心灵与灵性的统一复活。'
  },
  {
    id: 'maj-21', name: 'The World', chineseName: '世界',
    suit: 'MAJOR', element: 'EARTH', zodiac: '土星',
    uprightMeaning: '一个完整的循环即将画上圆满的句号。世界牌是大阿尔卡纳的最后一张，代表成就、整合与圆满。你经历了愚者到世界的整个旅程——跌倒、学习、成长、蜕变——现在你站在了终点线前。庆祝你的成就，然后准备好：每一个结局都是另一个更宏大开始的序章。',
    reversedMeaning: '差一步就到终点，但似乎总有什么在阻碍你。你可能需要完成一个最后的课题或者放下一个最后的执念，才能真正画上句号。不要在最后一公里放弃——你比你以为的更接近完成。',
    keywords: ['完成', '圆满', '整合', '成就', '新循环'],
    symbolism: '月桂花环代表胜利与完成的荣耀，四角的四活物象征四元素的和谐统一，舞者的姿态展现灵魂在自由中的喜悦。'
  }
];

// ==========================================
// 小阿尔卡纳生成器
// ==========================================
const SUIT_CONFIG = {
  WANDS: { cn: '权杖', element: 'FIRE' as const, theme: '行动力与激情' },
  CUPS: { cn: '圣杯', element: 'WATER' as const, theme: '情感与关系' },
  SWORDS: { cn: '宝剑', element: 'AIR' as const, theme: '思维与冲突' },
  PENTACLES: { cn: '星币', element: 'EARTH' as const, theme: '物质与事业' }
};

const COURT_TITLES = [
  { en: 'Page', cn: '侍从' },
  { en: 'Knight', cn: '骑士' },
  { en: 'Queen', cn: '王后' },
  { en: 'King', cn: '国王' }
];

const NUMBER_NAMES: Record<number, string> = {
  1: 'Ace', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten'
};

/** 小阿尔卡纳数字牌核心含义模板（按数字索引，跨花色通用主题） */
const NUMBER_THEMES: Record<number, { upright: string; reversed: string; keywords: string[] }> = {
  1: {
    upright: '新的种子已经播下，{theme}领域的全新机遇正在向你敞开。抓住这个初始的火花，它蕴含着巨大的潜力。',
    reversed: '起步受阻或方向不明。你可能对{theme}领域的新机会犹豫不决，或者时机尚未成熟。不要强行启动。',
    keywords: ['新起点', '潜力', '机遇']
  },
  2: {
    upright: '你正面临{theme}方面的两难选择。平衡与合作是关键，寻找双方都能接受的方案。',
    reversed: '失衡或优柔寡断。在{theme}领域中，你可能因为无法做出决定而陷入僵局。',
    keywords: ['选择', '平衡', '合作']
  },
  3: {
    upright: '初步的成果在{theme}领域显现。团队合作或创意表达正在结出第一批果实，值得庆贺。',
    reversed: '创意受阻或协作出现裂痕。{theme}方面的进展不如预期，需要调整方法。',
    keywords: ['成长', '创造', '初步成果']
  },
  4: {
    upright: '{theme}领域迎来稳定期。是时候巩固已有的成果并建立牢固的基础了。',
    reversed: '过度稳定变成僵化，或安全感受到威胁。{theme}方面需要打破舒适区。',
    keywords: ['稳定', '基础', '休憩']
  },
  5: {
    upright: '{theme}领域经历冲突与挑战。这是一个考验期，但危机中蕴含着成长的契机。',
    reversed: '冲突开始缓和，或者你正在学习用不同的方式处理{theme}方面的困难。',
    keywords: ['挑战', '冲突', '变化']
  },
  6: {
    upright: '{theme}领域出现和谐与互助的能量。给予与接受之间的流动非常顺畅。',
    reversed: '付出与回报失衡。在{theme}方面，你可能过度给予或过度索取。',
    keywords: ['和谐', '给予', '交流']
  },
  7: {
    upright: '{theme}领域需要深层的评估与策略性思考。不要只看表面，挖掘更深层的含义。',
    reversed: '自欺或策略失败。在{theme}方面，你可能走了弯路或忽视了重要信息。',
    keywords: ['深思', '评估', '策略']
  },
  8: {
    upright: '{theme}领域正在快速推进。你的技能和努力正在获得动力，保持专注。',
    reversed: '进度停滞或方向偏离。在{theme}方面，速度放慢并重新调整可能是必要的。',
    keywords: ['行动', '速度', '精进']
  },
  9: {
    upright: '接近{theme}领域的完成阶段。你几乎到达了目标，但最后一步需要独自面对。',
    reversed: '功亏一篑或内心不满足。在{theme}方面，你可能在终点前感到疲惫或怀疑。',
    keywords: ['接近完成', '独立', '反思']
  },
  10: {
    upright: '{theme}领域一个完整的周期结束。满载成果（或教训），准备迎接新的循环。',
    reversed: '不愿结束一个已经完成的阶段，或承受了过重的负担。在{theme}方面，是时候放下了。',
    keywords: ['完成', '满载', '循环终结']
  }
};

const COURT_THEMES: Record<string, { upright: string; reversed: string; keywords: string[] }> = {
  Page: {
    upright: '一个关于{theme}的新消息或新灵感正在到来。以学习者的心态去探索，保持好奇心。',
    reversed: '不成熟的能量或消息延迟。在{theme}领域，你可能缺乏经验或想法不够成熟。',
    keywords: ['学习', '消息', '好奇心']
  },
  Knight: {
    upright: '在{theme}领域展现出强烈的行动力和冲劲。带着热情前进，但注意不要过于冲动。',
    reversed: '行动力过度或不足。在{theme}方面，你可能莽撞行事或完全缺乏动力。',
    keywords: ['行动', '追求', '冲劲']
  },
  Queen: {
    upright: '你在{theme}领域展现出成熟的掌控力和深厚的直觉。以滋养和智慧的方式引领。',
    reversed: '在{theme}方面过度情绪化或过度控制。你的力量需要找到更健康的表达方式。',
    keywords: ['成熟', '直觉', '滋养']
  },
  King: {
    upright: '你在{theme}领域已经达到了大师级别的掌控。以权威和经验去引领，做出明智的决策。',
    reversed: '权力被滥用或能力退化。在{theme}方面，你可能变得专制或失去了早期的热忱。',
    keywords: ['掌控', '权威', '领导力']
  }
};

function generateMinorArcana(): TarotMeaning[] {
  const cards: TarotMeaning[] = [];
  
  for (const [suitKey, suitInfo] of Object.entries(SUIT_CONFIG)) {
    const suit = suitKey as 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES';
    
    // 数字牌 1-10
    for (let num = 1; num <= 10; num++) {
      const template = NUMBER_THEMES[num];
      cards.push({
        id: `${suit.toLowerCase()}-${num}`,
        name: `${NUMBER_NAMES[num]} of ${suitKey.charAt(0) + suitKey.slice(1).toLowerCase()}`,
        chineseName: `${suitInfo.cn}${num === 1 ? '王牌' : numToChinese(num)}`,
        suit,
        element: suitInfo.element,
        uprightMeaning: template.upright.replace(/\{theme\}/g, suitInfo.theme),
        reversedMeaning: template.reversed.replace(/\{theme\}/g, suitInfo.theme),
        keywords: [...template.keywords, suitInfo.cn],
        symbolism: `${suitInfo.cn}系列第${num}张，呈现${suitInfo.theme}在第${num}阶段的能量表达。`
      });
    }
    
    // 宫廷牌
    for (const court of COURT_TITLES) {
      const template = COURT_THEMES[court.en];
      cards.push({
        id: `${suit.toLowerCase()}-${court.en.toLowerCase()}`,
        name: `${court.en} of ${suitKey.charAt(0) + suitKey.slice(1).toLowerCase()}`,
        chineseName: `${suitInfo.cn}${court.cn}`,
        suit,
        element: suitInfo.element,
        uprightMeaning: template.upright.replace(/\{theme\}/g, suitInfo.theme),
        reversedMeaning: template.reversed.replace(/\{theme\}/g, suitInfo.theme),
        keywords: [...template.keywords, suitInfo.cn],
        symbolism: `${suitInfo.cn}${court.cn}代表${suitInfo.theme}领域中${court.cn}级别的人格特质或外在影响。`
      });
    }
  }
  
  return cards;
}

function numToChinese(n: number): string {
  const map: Record<number, string> = {
    2: '二', 3: '三', 4: '四', 5: '五',
    6: '六', 7: '七', 8: '八', 9: '九', 10: '十'
  };
  return map[n] || String(n);
}

// ==========================================
// 完整知识库导出
// ==========================================
const FULL_KNOWLEDGE_BASE: TarotMeaning[] = [
  ...MAJOR_ARCANA,
  ...generateMinorArcana()
];

/**
 * 根据卡牌 ID 获取含义
 */
export function getCardMeaning(cardId: string): TarotMeaning | undefined {
  return FULL_KNOWLEDGE_BASE.find(c => c.id === cardId);
}

/**
 * 根据卡牌 ID 和正逆位，获取格式化后的详尽解读文本
 */
export function getFormattedReading(cardId: string, isReversed: boolean, positionMeaning: string): string {
  const meaning = getCardMeaning(cardId);
  if (!meaning) return `未找到 ${cardId} 的解读数据。`;
  
  const orientation = isReversed ? '逆位' : '正位';
  const mainMeaning = isReversed ? meaning.reversedMeaning : meaning.uprightMeaning;
  
  return `◆ ${meaning.chineseName}（${meaning.name}）—— ${orientation}\n` +
    `  位置含义：${positionMeaning}\n` +
    `  元素属性：${elementToChinese(meaning.element)}\n` +
    `  关键词：${meaning.keywords.join('、')}\n\n` +
    `  ${mainMeaning}\n\n` +
    `  符号学解析：${meaning.symbolism}\n`;
}

function elementToChinese(el: string): string {
  const map: Record<string, string> = { FIRE: '🔥 火', WATER: '💧 水', AIR: '💨 风', EARTH: '🌍 地', SPIRIT: '✨ 灵' };
  return map[el] || el;
}

export { FULL_KNOWLEDGE_BASE };
