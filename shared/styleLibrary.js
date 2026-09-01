export const styleTemplates = [
  {
    id: 'ui-screenshot-system',
    name: 'UI 截图系统',
    category: 'UI 与界面',
    cases: 'case 17、2、4',
    keywords: ['ui', 'app', '应用', '界面', '网页', '网站', '仪表盘', 'dashboard', '截图', '直播'],
    summary: '适合 App、网页、仪表盘和社媒界面。',
    layout: '锁定平台与画幅，建立清晰的信息层级，明确状态栏、导航、标签页、内容区和操作区。',
    style: '真实可落地的产品界面，统一组件规范、间距、圆角、图标和交互状态。',
    text: '只显示需求中明确给出的界面文字；文字必须清晰、拼写准确并符合平台习惯。',
    negative: '避免通用模板感、平台特征含糊、不可读小字、重复控件和错误状态栏。'
  },
  {
    id: 'infographic-engine',
    name: '信息图引擎',
    category: '图表与信息可视化',
    cases: 'case 334、1、8',
    keywords: ['信息图', '图解', '流程', '知识', '科普', '时间线', '数据', '技术', '教育', 'infographic', 'diagram'],
    summary: '适合解释图、流程图、时间线和知识卡片。',
    layout: '将内容组织为 3–5 个模块，用清楚的阅读顺序、箭头、色块、图标和留白表达信息流。',
    style: '结构化信息图语言，层级鲜明，配色分组明确，视觉元素服务于理解。',
    text: '标题和标签使用短句，关键数据醒目，避免在画面内放置长段正文。',
    negative: '避免模块过多、信息拥挤、箭头交叉、装饰压过内容和密集小字。'
  },
  {
    id: 'scientific-scale-diagram',
    name: '科学尺度缩放图',
    category: '图表与信息可视化',
    cases: 'case 341',
    keywords: ['尺度', '微观', '宏观', '倍率', '显微', '科学', '生物', '宇宙', 'scale'],
    summary: '适合从微观到宏观的尺度比较。',
    layout: '使用 6–8 个尺度框，按尺度递进排列，每个窗口展示有明显差异的细节。',
    style: '严谨的科学可视化，单位、倍率和缩放关系明确，细节可信。',
    text: '每个尺度只放短标签、单位和倍率，保持中文清晰可读。',
    negative: '避免所有尺度框视觉雷同、通用放大镜布局、单位错误和无意义装饰。'
  },
  {
    id: 'poster-layout-system',
    name: '海报排版系统',
    category: '海报与排版',
    cases: 'case 345、5、10',
    keywords: ['海报', '封面', '活动', '宣传', '促销', '节日', '电影', '社媒', 'poster', 'cover'],
    summary: '适合活动、宣传、封面和社媒海报。',
    layout: '建立明确的主视觉、主标题、副标题和行动信息层级，锁定版式、留白与画幅。',
    style: '完成度高的商业海报，统一色彩、字体气质和视觉节奏，主视觉突出。',
    text: '只显示明确指定的标题、副标题和必要信息，文字准确、清晰且层级分明。',
    negative: '避免设计过程稿、情绪板、方案拼贴、随机英文、乱码、重复建筑和多余装饰符号。'
  },
  {
    id: 'sports-campaign-poster',
    name: '运动商业 Campaign',
    category: '海报与排版',
    cases: 'case 350、3',
    keywords: ['运动', '体育', '球员', '跑步', '健身', '球鞋', 'campaign', 'athlete'],
    summary: '适合运动品牌、运动员和产品主导视觉。',
    layout: '让运动员姿态和核心产品成为画面中心，数据或标题沿运动方向建立动势。',
    style: '戏剧性光影、强对比品牌色、真实动作张力和干净商业构图。',
    text: '标题简短有力，数据层清晰，品牌文字准确。',
    negative: '避免错误器材、肢体异常、杂乱拼贴、静态摆拍感和产品被遮挡。'
  },
  {
    id: 'conceptual-typography-poster',
    name: '概念字体海报',
    category: '海报与排版',
    cases: 'case 355',
    keywords: ['字体', '文字主视觉', '排版', '字形', 'typography', '概念海报'],
    summary: '适合让准确标题本身成为主视觉。',
    layout: '以指定标题的字形作为画面骨架，让人物、物件或景观与文字含义发生关系。',
    style: '克制配色、强识别字体结构和具有概念性的空间结合。',
    text: '标题必须逐字准确，除必要副标题外不增加其他文字。',
    negative: '避免默认 WordArt、标题错字、无关图标、颜色过多和普通居中排版。'
  },
  {
    id: 'ink-double-exposure-poster',
    name: '水墨双重曝光海报',
    category: '海报与排版',
    cases: 'case 359',
    keywords: ['水墨', '双重曝光', '诗意', '人像海报', '东方', 'ink'],
    summary: '适合诗意人像和文化主题视觉。',
    layout: '融合人物剪影、水墨景物与大面积留白，建立安静而明确的视觉焦点。',
    style: '细腻水墨肌理、半透明层次、克制东方色彩和高级纸张质感。',
    text: '非必要不添加文字；需要时只保留少量准确标题。',
    negative: '避免廉价奇幻拼贴、景物堆叠、浓重特效、随机书法字和画面过满。'
  },
  {
    id: 'nature-science-poster',
    name: '自然科普海报',
    category: '海报与排版',
    cases: 'case 339',
    keywords: ['自然', '动物', '植物', '生态', '地理', '科普海报', 'nature'],
    summary: '适合自然主题的高级科普海报。',
    layout: '单一清晰主体配合少量科学标注，使用柔和阴影和充足留白。',
    style: '高级、干净、可信的自然科学视觉，细节真实但不拥挤。',
    text: '科学标签短而清楚，名称和数据准确。',
    negative: '避免重广告语言、密集百科正文、错误物种特征和夸张背景。'
  },
  {
    id: 'product-commerce-visual',
    name: '商品商业视觉',
    category: '商品与电商',
    cases: 'case 373、358',
    keywords: ['商品', '产品', '电商', '主图', '详情页', '包装', '卖点', '食品', '饮料', 'product', 'packaging'],
    summary: '适合商品主图、包装和销售卖点视觉。',
    layout: '主商品占据视觉中心，卖点标签与辅助道具分区清楚，构图适合电商展示。',
    style: '真实商业摄影质感，材质、表面反射、光线和品牌色准确统一。',
    text: '包装文字和卖点必须准确、简短、可读，不添加未经要求的宣传承诺。',
    negative: '避免无关道具、商品形变、包装错字、随机品牌、过度反光和主体被遮挡。'
  },
  {
    id: 'personalized-beauty-report',
    name: '个性化美妆报告',
    category: '商品与电商',
    cases: 'case 353',
    keywords: ['美妆', '护肤', '肤质', '化妆品', '美容', '推荐报告', 'beauty'],
    summary: '适合美妆推荐、肤质报告和商品卡片。',
    layout: '按分析、建议、商品卡片建立报告式层级，统一对齐图片、标签和评分。',
    style: '清洁精致的美妆编辑设计，柔和肤色、品牌级产品渲染和轻量 UI。',
    text: '结论简短明确，产品名和标签可读，避免医学化承诺。',
    negative: '避免医疗诊断、密集小字、推荐逻辑混乱、产品比例错误和塑料皮肤。'
  },
  {
    id: 'brand-identity-package',
    name: '品牌身份包',
    category: '品牌与标志',
    cases: 'case 354',
    keywords: ['品牌', 'logo', '标志', 'vi', '视觉识别', '品牌手册', 'identity'],
    summary: '适合 Logo 系统、品牌板和 VI 套件。',
    layout: '在统一网格中展示标志、配色、字体和关键应用触点，应用之间保持一致。',
    style: '清晰连贯的品牌系统，定位、色彩和字体气质一致。',
    text: '品牌名必须准确，说明文字短而可读。',
    negative: '避免无关 Logo 变体、配色冲突、品牌名错字和不一致的应用样机。'
  },
  {
    id: 'brand-touchpoint-board',
    name: '品牌触点视觉板',
    category: '品牌与标志',
    cases: 'case 362',
    keywords: ['触点', 'campaign', '品牌落地', '样机', '物料', '社媒套图'],
    summary: '适合多触点 Campaign 和品牌落地预览。',
    layout: '按重要性排列指定触点，所有面板共享同一网格、配色和字体逻辑。',
    style: '一致的 Campaign 视觉语言和真实应用样机质感。',
    text: '各触点沿用准确品牌文字，减少长文案。',
    negative: '避免混入无关风格、触点过多、比例失衡和每块面板各自为政。'
  },
  {
    id: 'architecture-space',
    name: '建筑与空间',
    category: '建筑与空间',
    cases: 'case 331、11',
    keywords: ['建筑', '室内', '空间', '地产', '酒店', '城市', '地图', '景观', 'architecture', 'interior'],
    summary: '适合建筑表现、室内、地图和空间概念。',
    layout: '明确视点、尺度、空间功能和动线，地图任务锁定地标与相对位置。',
    style: '可信透视、明确材质、环境光线和空间氛围，兼顾设计感与可实现性。',
    text: '只保留必要空间或地图标签，语言统一、位置准确。',
    negative: '避免不合理透视、悬浮结构、材质混乱、地图错位和随机标签。'
  },
  {
    id: 'realistic-photography',
    name: '写实摄影',
    category: '摄影与写实',
    cases: 'case 377',
    keywords: ['摄影', '写实', '照片', '人像', '街拍', '镜头', '电影感', 'photo', 'realistic', 'camera'],
    summary: '适合人像、街拍、商业摄影和电影感写实。',
    layout: '明确机位距离、镜头焦段、主体动作、背景关系和画面重心。',
    style: '可信光源、自然纹理、真实景深和适度生活化瑕疵，避免过度修饰。',
    text: '非必要不生成文字；出现标牌时保持简短清晰。',
    negative: '避免塑料皮肤、畸形手部、错误肢体、过度 HDR、棚拍假光和随机文字。'
  },
  {
    id: 'street-accident-moment',
    name: '街头意外瞬间摄影',
    category: '摄影与写实',
    cases: 'case 376',
    keywords: ['抓拍', '街头瞬间', '意外', '泼洒', '手机纪实', '运动模糊', 'candid'],
    summary: '适合可信的街头抓拍和快速动作。',
    layout: '描述事件发生的精确瞬间、手机机位高度、动作方向和街景上下文。',
    style: '纪实手机摄影、自然运动模糊、环境光和略带偶然性的构图。',
    text: '街景文字保持少量且自然，不作为画面重点。',
    negative: '避免过度干净、刻意摆拍、广告棚拍光、事件不合逻辑和人物动作僵硬。'
  },
  {
    id: 'illustration-art-style',
    name: '插画与艺术风格',
    category: '插画与艺术',
    cases: 'case 346、6',
    keywords: ['插画', '水彩', '绘画', '动漫', '艺术', '装饰画', '手绘', 'illustration', 'painting'],
    summary: '适合动漫、水彩、水墨和装饰艺术。',
    layout: '先锁定主体、构图和空间层次，再定义色彩、笔触、材质和情绪。',
    style: '统一且有辨识度的绘画语言，明确媒介质感和渲染完成度。',
    text: '除非任务需要，画面不出现文字。',
    negative: '避免只有风格没有构图、媒介混杂、主体身份漂移和随机签名水印。'
  },
  {
    id: 'character-design-sheet',
    name: '角色设定表',
    category: '人物与角色',
    cases: 'case 347',
    keywords: ['角色', '人物设定', '动作', '姿势', '设定表', '服装', 'character', 'pose'],
    summary: '适合角色设定、动作网格和一致性参考。',
    layout: '在清晰网格中安排有限数量的正侧背视图或动作，标明身份锚点和比例。',
    style: '角色脸型、发型、服装、配色和材质在所有视图中保持一致。',
    text: '只使用短标签标注角色、动作和关键细节。',
    negative: '避免不同动作更换服装、面部漂移、动作过多导致拥挤和肢体结构错误。'
  },
  {
    id: '3d-collectible-toy',
    name: '3D 收藏玩具',
    category: '人物与角色',
    cases: 'case 378',
    keywords: ['3d', '公仔', '玩具', '潮玩', '盲盒', '手办', '收藏', 'toy'],
    summary: '适合潮玩、公仔、盲盒和 3D 展示。',
    layout: '突出完整公仔、底座与包装关系，明确收藏比例和展示角度。',
    style: '高级树脂或乙烯基材质、精细涂装、柔和棚拍光和真实包装质感。',
    text: '包装仅保留少量准确品牌或角色文字。',
    negative: '避免通用玩具身体、身份细节缺失、包装错字、廉价塑料感和肢体畸形。'
  },
  {
    id: 'scene-storytelling',
    name: '场景叙事',
    category: '场景与叙事',
    cases: 'case 330',
    keywords: ['故事', '场景', '分镜', '世界观', '情绪', '叙事', '直播场景', 'story', 'scene'],
    summary: '适合分镜、世界观和情绪叙事画面。',
    layout: '明确人物、地点、时间、冲突、情绪和镜头景别，让关键线索进入画面。',
    style: '场景细节服务叙事，光线、色彩和环境共同推动情绪。',
    text: '非必要不出现文字；需要时只显示与故事直接相关的短文本。',
    negative: '避免通用幻想背景、装饰堆砌、叙事焦点模糊和关键人物缺席。'
  },
  {
    id: 'history-classical-themes',
    name: '历史与古风题材',
    category: '历史与古风',
    cases: 'case 375、338',
    keywords: ['历史', '古风', '古代', '朝代', '诗词', '长卷', '传统', 'history', 'dynasty'],
    summary: '适合古风、长卷、诗词和历史场景。',
    layout: '明确朝代、版式形式、人物身份、服饰制度和关键器物的位置关系。',
    style: '符合时代的材质与色彩，使用长卷、册页或古典海报语言。',
    text: '诗句、题签或标题必须准确，字体气质与时代一致。',
    negative: '避免朝代混搭、现代物件、错误服饰器物、随机伪书法和历史人物失真。'
  },
  {
    id: 'document-publishing',
    name: '文档与出版物',
    category: '文档与出版物',
    cases: 'case 360',
    keywords: ['文档', '手册', '白皮书', '报告', '出版', '百科', '页面', 'document', 'manual'],
    summary: '适合白皮书、手册、百科图鉴和报告页。',
    layout: '定义页面尺寸、分栏、目录、图表系统和稳定的页面节奏，所有元素对齐网格。',
    style: '专业出版设计，标题、正文、图表和说明形成清晰字体层级。',
    text: '标题、表格、标签和图注保持可读；正文使用短段落或占位结构。',
    negative: '避免密集小字、图表错位、网格不齐、过多字体和页面边缘裁切。'
  },
  {
    id: 'concept-product-breakdown',
    name: '概念产品研发拆解',
    category: '特殊应用',
    cases: 'case 370、361',
    keywords: ['拆解', '爆炸图', '研发', '概念产品', '组件', '工业设计', '结构', 'exploded', 'r&d'],
    summary: '适合研发板、产品拆解和特殊视觉系统。',
    layout: '定义产品整体与组件关系，使用清晰引线、短标签和受控的技术展示顺序。',
    style: '精确的工业设计渲染、统一材质逻辑和干净技术图语言。',
    text: '组件标签简短、准确，保持关系可见。',
    negative: '避免任务边界混杂、组件漂浮无逻辑、标签过长、结构不可实现和透视错误。'
  }
];

const fallbackIds = [
  'poster-layout-system',
  'realistic-photography',
  'illustration-art-style'
];

export function findStyleTemplate(templateId) {
  return styleTemplates.find((template) => template.id === templateId) || styleTemplates[0];
}

export function recommendStyleTemplates(brief, limit = 3) {
  const normalized = String(brief || '').toLowerCase();
  if (!normalized.trim()) {
    return fallbackIds.slice(0, limit).map(findStyleTemplate);
  }

  const ranked = styleTemplates
    .map((template, index) => ({
      template,
      index,
      score: template.keywords.reduce((total, keyword) => (
        normalized.includes(keyword.toLowerCase()) ? total + keyword.length + 2 : total
      ), 0)
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  const matched = ranked.filter(({ score }) => score > 0).map(({ template }) => template);
  const fallback = fallbackIds.map(findStyleTemplate);
  return [...matched, ...fallback]
    .filter((template, index, templates) => (
      templates.findIndex((candidate) => candidate.id === template.id) === index
    ))
    .slice(0, limit);
}
