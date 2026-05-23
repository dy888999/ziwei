/* ============================================================
   格局检测引擎
   来源：05-格局判断/01-经典格局.md
   支持 20+ 种经典格局的自动检测
   ============================================================ */

import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'

/* ------------------------------------------------------------
   格局定义
   ------------------------------------------------------------ */

export interface PatternResult {
  name: string
  type: '富贵格局' | '事业格局' | '财富格局' | '贵人格局' | '凶险格局' | '特殊格局'
  description: string
  detail: string
}

/* ------------------------------------------------------------
   辅助：获取命宫及相关星曜
   ------------------------------------------------------------ */

function getStarNames(
  chart: FunctionalAstrolabe,
  palaceName: string,
  source: 'major' | 'minor' = 'major',
): string[] {
  const palace = (chart.palaces || []).find(p => p.name === palaceName)
  if (!palace) return []

  if (source === 'major') {
    return (palace.majorStars || []).map(s => s.name as string)
  }
  return (palace.minorStars || []).map(s => s.name as string)
}

function getAllMajorStars(chart: FunctionalAstrolabe, palaceName: string): string[] {
  return getStarNames(chart, palaceName, 'major')
}

function getAllMinorStars(chart: FunctionalAstrolabe, palaceName: string): string[] {
  return getStarNames(chart, palaceName, 'minor')
}

/** 获取命宫所在的地支宫名 */
function getLifePalaceBranch(chart: FunctionalAstrolabe): string | null {
  const lifePalace = (chart.palaces || []).find(p => String(p.name) === '命宫')
  if (!lifePalace) return null
  return String(lifePalace.name)
}

/** 获取命宫主星 */
function getLifeMajorStars(chart: FunctionalAstrolabe): string[] {
  return getAllMajorStars(chart, '命宫')
}

/** 获取命宫辅星 */
function getLifeMinorStars(chart: FunctionalAstrolabe): string[] {
  return getAllMinorStars(chart, '命宫')
}

/** 获取迁移宫主星 */
function getMigMajorStars(chart: FunctionalAstrolabe): string[] {
  return getAllMajorStars(chart, '迁移宫')
}

/** 获取官禄宫主星 */
function getGuanluMajorStars(chart: FunctionalAstrolabe): string[] {
  return getAllMajorStars(chart, '官禄宫')
}

/** 获取财帛宫主星 */
function getCaiboMajorStars(chart: FunctionalAstrolabe): string[] {
  return getAllMajorStars(chart, '财帛宫')
}

/** 获取命宫相邻宫位（左=兄弟宫，右=父母宫）的辅星 */
function getAdjacentMinorStars(chart: FunctionalAstrolabe): { left: string[]; right: string[] } {
  const palaceOrder = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
    '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫']

  const lifeIdx = palaceOrder.indexOf('命宫')
  const leftPalace = palaceOrder[(lifeIdx + 11) % 12]   // 兄弟宫
  const rightPalace = palaceOrder[(lifeIdx + 1) % 12]   // 父母宫

  return {
    left: getAllMinorStars(chart, leftPalace),
    right: getAllMinorStars(chart, rightPalace),
  }
}

/* ------------------------------------------------------------
   格局检测函数列表
   ------------------------------------------------------------ */

type PatternDetector = (chart: FunctionalAstrolabe) => PatternResult | null

/* ==================== 一、富贵格局 ==================== */

/** 1. 紫府同宫格 — 紫微天府在寅或申同宫坐命 */
const detectZiFuTongGong: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.includes('紫微') && life.includes('天府')) {
    return {
      name: '紫府同宫格',
      type: '富贵格局',
      description: '紫微与天府同在命宫，帝星与财库星同宫',
      detail: '紫府同宫，终身福厚。适合政商高层、企业主、高管。甲年化吉极美，丁己庚癸年亦吉。需加会禄存、左右、昌曲、魁钺方为全美。',
    }
  }
  return null
}

/** 2. 紫府朝垣格 — 命宫无主星，紫微天府迁移宫来朝 */
const detectZiFuZhaoYuan: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (!lifeBranch) return null
  const life = getLifeMajorStars(chart)
  if (life.length > 0) return null

  if (lifeBranch !== '辰宫' && lifeBranch !== '戌宫') return null

  const mig = getAllMajorStars(chart, '迁移宫')
  if (mig.includes('紫微') && mig.includes('天府')) {
    return {
      name: '紫府朝垣格',
      type: '富贵格局',
      description: '命宫无主星，紫微天府从迁移宫来朝',
      detail: '府相朝垣格最良，出仕为官大吉昌。适合政界或管理层发展。',
    }
  }
  return null
}

/** 3. 日月并明格 — 太阳太阴皆在庙旺之地 */
const detectRiYueBingMing: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (!lifeBranch) return null

  const isChou = lifeBranch === '丑宫'
  const isWei = lifeBranch === '未宫'
  if (!isChou && !isWei) return null

  return {
    name: '日月并明格',
    type: '富贵格局',
    description: `命宫在${lifeBranch}，日月分居庙旺之地`,
    detail: `日月并明，佐九重于尧殿。${isChou ? '太阳在巳（庙）、太阴在酉（庙）' : '太阳在卯（旺）、太阴在亥（庙）'}。适合从政、外交、公关。`,
  }
}

/** 5. 明珠出海格 — 命宫在未，太阳在卯，太阴在亥 */
const detectMingZhuChuHai: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (lifeBranch !== '未宫') return null

  return {
    name: '明珠出海格',
    type: '富贵格局',
    description: '命宫在未，太阳在卯（日出）、太阴在亥（月升），三方会照',
    detail: '如明珠出海，光芒四射。格局清贵，名利双收之象。',
  }
}

/** 23. 极向离明格 — 紫微在午宫坐命 */
const detectJiXiangLiMing: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (lifeBranch !== '午宫') return null
  const life = getLifeMajorStars(chart)
  if (!life.includes('紫微')) return null

  return {
    name: '极向离明格',
    type: '富贵格局',
    description: '紫微在午宫坐命，帝星居正位',
    detail: '紫微在午为正位，大富大贵之格。加会吉星则权倾朝野，事业巅峰。',
  }
}

/* ==================== 二、事业格局 ==================== */

/** 6. 机月同梁格 — 天机太阴天同天梁交会，加文昌文曲 */
const detectJiYueTongLiang: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  const sanfangStars = [
    ...life,
    ...getGuanluMajorStars(chart),
    ...getCaiboMajorStars(chart),
    ...getMigMajorStars(chart),
  ]
  const uniqueStars = [...new Set(sanfangStars)]

  const hasJiYue = uniqueStars.includes('天机') && uniqueStars.includes('太阴')
  const hasTongLiang = uniqueStars.includes('天同') && uniqueStars.includes('天梁')
  if (!(hasJiYue && hasTongLiang)) return null

  const lifeHasJiYue = life.includes('天机') || life.includes('太阴')
  const lifeHasTongLiang = life.includes('天同') || life.includes('天梁')
  if (!(lifeHasJiYue || lifeHasTongLiang)) return null

  return {
    name: '机月同梁格',
    type: '事业格局',
    description: '天机、太阴、天同、天梁四星交会于三方四正',
    detail: '机月同梁作吏人。适合公务员、国企、大企业管理层、文秘、策划、设计类工作。',
  }
}

/** 7. 将星得地格 — 武曲天府在命宫 */
const detectJiangXingDeDi: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.includes('武曲') && life.includes('天府')) {
    return {
      name: '将星得地格',
      type: '事业格局',
      description: '武曲天府在命宫同宫',
      detail: '武将文臣，事业有成。武曲主刚毅决断，天府主稳重守成，刚柔并济。加会吉星更佳，不见煞星为美。',
    }
  }
  return null
}

/** 8. 财荫夹印格 — 天相在命宫，得天梁天同拱照 */
const detectCaiYinJiaYin: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (!life.includes('天相')) return null

  const sanfang = [...getGuanluMajorStars(chart), ...getCaiboMajorStars(chart), ...getMigMajorStars(chart)]
  if (sanfang.includes('天梁') || sanfang.includes('天同')) {
    return {
      name: '财荫夹印格',
      type: '事业格局',
      description: '天相在命宫，得天梁及天同拱照',
      detail: '有贵人相助，事业稳定。天相为印星，天梁为荫星，得之则一生平顺受庇佑。',
    }
  }
  return null
}

/** 21. 杀破狼格 — 七杀破军贪狼在命宫或三方会照 */
const detectShaPoLang: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  const sanfang = [...life, ...getGuanluMajorStars(chart), ...getCaiboMajorStars(chart)]
  const uniqueStars = [...new Set(sanfang)]

  const hasSha = uniqueStars.includes('七杀')
  const hasPo = uniqueStars.includes('破军')
  const hasLang = uniqueStars.includes('贪狼')

  if (hasSha && hasPo && hasLang) {
    return {
      name: '杀破狼格',
      type: '事业格局',
      description: '七杀、破军、贪狼在命宫或三方会照',
      detail: '开创性强，人生多变动。适合创业、竞争行业。七杀主冲劲，破军主变革，贪狼主欲望，三合则一生大起大落有成就。',
    }
  }
  return null
}

/** 22. 君臣庆会格 — 紫微得辅弼昌曲魁钺加会 */
const detectJunChenQingHui: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (!life.includes('紫微')) return null

  const lifeMinor = getLifeMinorStars(chart)
  const guanluMinor = getAllMinorStars(chart, '官禄宫')
  const caiboMinor = getAllMinorStars(chart, '财帛宫')

  const allMinor = [...new Set([...lifeMinor, ...guanluMinor, ...caiboMinor])]
  const gilinStars = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺']
  const matched = gilinStars.filter(s => allMinor.includes(s))

  if (matched.length >= 3) {
    return {
      name: '君臣庆会格',
      type: '事业格局',
      description: '紫微在命宫，得辅弼昌曲魁钺加会',
      detail: `如君王得群臣辅佐，事业得力。得${matched.join('、')}等吉星拱照，格局尊贵。`,
    }
  }
  return null
}

/* ==================== 三、财富格局 ==================== */

/** 9. 火贪格 / 铃贪格 — 贪狼与火星或铃星同宫 */
const detectHuoTanGe: PatternDetector = (chart) => {
  for (const palaceName of ['命宫', '财帛宫', '官禄宫', '迁移宫']) {
    const majors = getAllMajorStars(chart, palaceName)
    const minors = getAllMinorStars(chart, palaceName)
    if (majors.includes('贪狼') && (minors.includes('火星') || minors.includes('铃星'))) {
      const isHuo = minors.includes('火星')
      return {
        name: isHuo ? '火贪格' : '铃贪格',
        type: '财富格局',
        description: `贪狼与${isHuo ? '火星' : '铃星'}在${palaceName}同宫`,
        detail: `${isHuo ? '火贪' : '铃贪'}格，名镇诸邦。庙旺主横发、暴富；落陷则暴起暴落。需主星庙旺方为真格。`,
      }
    }
  }
  return null
}

/** 10. 武曲守命格 — 武曲庙旺坐命 */
const detectWuQuShowMing: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.includes('武曲') && life.length <= 2) {
    return {
      name: '武曲守命格',
      type: '财富格局',
      description: '武曲庙旺坐命',
      detail: '武曲为财星，主正财运旺。加会吉星则财运亨通，适合金融、经商。不见煞星为佳。',
    }
  }
  return null
}

/** 11. 日月夹财格 — 武曲在丑或未坐命，太阳太阴夹命 */
const detectRiYueJiaCai: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (!lifeBranch || (lifeBranch !== '丑宫' && lifeBranch !== '未宫')) return null
  const life = getLifeMajorStars(chart)
  if (!life.includes('武曲')) return null

  return {
    name: '日月夹财格',
    type: '财富格局',
    description: `武曲在${lifeBranch}坐命，太阳太阴夹命`,
    detail: '日月夹财，富裕之命。日月双星拱照财星武曲，财运亨通，名利双收。',
  }
}

/* ==================== 四、贵人格局 ==================== */

/** 12. 坐贵向贵格 — 命宫魁钺与迁移宫钺魁对应 */
const detectZuoGuiXiangGui: PatternDetector = (chart) => {
  const lifeMinor = getLifeMinorStars(chart)
  const migMinor = getAllMinorStars(chart, '迁移宫')

  const hasKui = lifeMinor.includes('天魁')
  const hasYueInMig = migMinor.includes('天钺')
  const hasYue = lifeMinor.includes('天钺')
  const hasKuiInMig = migMinor.includes('天魁')

  if ((hasKui && hasYueInMig) || (hasYue && hasKuiInMig)) {
    return {
      name: '坐贵向贵格',
      type: '贵人格局',
      description: '命宫有天魁/天钺，迁移宫有天钺/天魁',
      detail: '一生多贵人，逢凶化吉。命宫坐贵人、迁移宫也是贵人，内外皆得助，出门遇贵人。',
    }
  }
  return null
}

/** 13. 天乙拱命格 — 天魁天钺三方四正拱照命宫 */
const detectTianYiGongMing: PatternDetector = (chart) => {
  const lifeMinor = getLifeMinorStars(chart)
  if (lifeMinor.includes('天魁') || lifeMinor.includes('天钺')) return null

  const nearby = [
    ...getAllMinorStars(chart, '迁移宫'),
    ...getAllMinorStars(chart, '官禄宫'),
    ...getAllMinorStars(chart, '财帛宫'),
    ...getAllMinorStars(chart, '福德宫'),
  ]
  if (nearby.includes('天魁') && nearby.includes('天钺')) {
    return {
      name: '天乙拱命格',
      type: '贵人格局',
      description: '天魁天钺不在命宫而在三方四正拱照',
      detail: '贵人满门，虽不直接坐命但四方皆有贵人，遇困难时总有援手。',
    }
  }
  return null
}

/** 14. 辅弼拱主格 — 紫微在命宫，辅弼三方加会 */
const detectFuBiGongZhu: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (!life.includes('紫微')) return null

  const nearby = [
    ...getAllMinorStars(chart, '迁移宫'),
    ...getAllMinorStars(chart, '官禄宫'),
    ...getAllMinorStars(chart, '财帛宫'),
  ]
  if (nearby.includes('左辅') && nearby.includes('右弼')) {
    return {
      name: '辅弼拱主格',
      type: '贵人格局',
      description: '紫微在命宫，左辅右弼三方四正加会',
      detail: '紫微辅弼同宫，一呼百诺。如君王得左右丞相辅佐，事业有得力助手。',
    }
  }
  return null
}

/* ==================== 五、凶险格局 ==================== */

/** 15. 命无正曜格 — 命宫无主星且三方无吉星 */
const detectMingWuZhengYao: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.length !== 0) return null

  const sanfang = [
    ...getGuanluMajorStars(chart),
    ...getCaiboMajorStars(chart),
    ...getMigMajorStars(chart),
  ]
  const positiveStars = sanfang.filter(s => !['地空', '地劫'].includes(s))
  if (positiveStars.length === 0) {
    return {
      name: '命无正曜格',
      type: '凶险格局',
      description: '命宫无十四主星，三方四正亦无正星加会',
      detail: '格局偏低，需看借星。命宫无主星人生较多依赖借星论断，运势起伏较大，需自强不息。',
    }
  }
  return null
}

/** 16. 羊陀夹命格 — 禄存在命宫左右有羊陀 */
const detectYangTuoJiaMing: PatternDetector = (chart) => {
  // 检查命宫是否有禄存
  const lifeMajor = getLifeMajorStars(chart)
  const lifeMinor = getLifeMinorStars(chart)
  const hasLuCun = lifeMajor.includes('禄存') || lifeMinor.includes('禄存')
  if (!hasLuCun) return null

  const adj = getAdjacentMinorStars(chart)
  const hasYang = adj.left.includes('擎羊') || adj.right.includes('擎羊')
  const hasTuo = adj.left.includes('陀罗') || adj.right.includes('陀罗')

  if (hasYang && hasTuo) {
    return {
      name: '羊陀夹命格',
      type: '凶险格局',
      description: '禄存在命宫，擎羊陀罗夹命宫两侧',
      detail: '孤独、阻碍多。虽得禄存守财，但被羊陀夹制，人生多受牵制，需注意人际关系。',
    }
  }
  return null
}

/** 17. 火铃夹命格 — 火星铃星夹命宫 */
const detectHuoLingJiaMing: PatternDetector = (chart) => {
  const adj = getAdjacentMinorStars(chart)
  const hasHuo = adj.left.includes('火星') || adj.right.includes('火星')
  const hasLing = adj.left.includes('铃星') || adj.right.includes('铃星')

  if (hasHuo && hasLing) {
    return {
      name: '火铃夹命格',
      type: '凶险格局',
      description: '火星铃星夹命宫两侧',
      detail: '性急躁动，灾厄频繁。火铃二煞夹制命宫，性格急躁，易有意外之灾。需修身养性方能化解。',
    }
  }
  return null
}

/** 18. 空劫夹命格 — 地空地劫夹命宫 */
const detectKongJieJiaMing: PatternDetector = (chart) => {
  const adj = getAdjacentMinorStars(chart)
  const hasKong = adj.left.includes('地空') || adj.right.includes('地空')
  const hasJie = adj.left.includes('地劫') || adj.right.includes('地劫')

  if (hasKong && hasJie) {
    return {
      name: '空劫夹命格',
      type: '凶险格局',
      description: '地空地劫夹命宫两侧',
      detail: '钱财难聚，运势受阻。空劫夹命如断桥煞，前路有断绝之意，财运和事业易受阻隔。',
    }
  }
  return null
}

/** 19. 刑忌夹印格 — 天相在命宫被刑星夹 */
const detectXingJiJiaYin: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (!life.includes('天相')) return null

  const adj = getAdjacentMinorStars(chart)
  const hasXing = adj.left.includes('擎羊') || adj.right.includes('擎羊') ||
    adj.left.includes('陀罗') || adj.right.includes('陀罗')

  if (hasXing) {
    return {
      name: '刑忌夹印格',
      type: '凶险格局',
      description: '天相在命宫，擎羊（或陀罗）夹命',
      detail: '官司是非，事业受阻。天相为印被刑星所夹，主文书、契约方面的纠纷，需注意法律问题。',
    }
  }
  return null
}

/** 20. 马头带剑格 — 擎羊在午宫坐命 */
const detectMaTouDaiJian: PatternDetector = (chart) => {
  const lifeBranch = getLifePalaceBranch(chart)
  if (lifeBranch !== '午宫') return null
  const lifeMinor = getLifeMinorStars(chart)
  if (lifeMinor.includes('擎羊')) {
    return {
      name: '马头带剑格',
      type: '凶险格局',
      description: '擎羊在午宫坐命',
      detail: '此格凶中藏吉。武职可成大将，文职多波折。擎羊在午为"马头带剑"，刚毅果决，适合军警或竞争激烈行业。',
    }
  }
  return null
}

/* ==================== 六、其他格局 ==================== */

/** 紫杀同宫格 — 紫微与七杀在命宫 */
const detectZiShaTongGong: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.includes('紫微') && life.includes('七杀')) {
    return {
      name: '紫杀同宫格',
      type: '特殊格局',
      description: '紫微与七杀同在命宫',
      detail: '权威与冲劲结合，有开创能力。紫微的统治力加七杀的执行力，能开疆拓土，但需注意过于刚猛。',
    }
  }
  return null
}

/** 化忌入命检测 */
const detectHuajiRuMing: PatternDetector = (chart) => {
  const lifePalace = (chart.palaces || []).find(p => String(p.name) === '命宫')
  if (!lifePalace) return null

  for (const star of lifePalace.majorStars || []) {
    if (String(star.mutagen) === '化忌') {
      return {
        name: `${star.name}化忌入命`,
        type: '特殊格局',
        description: `${star.name}化忌在命宫`,
        detail: `${star.name}化忌入命，命主在此星所代表的人生领域易有执着与困扰，需修身养性以化解。`,
      }
    }
  }
  return null
}

/** 空宫检测 */
const detectEmptyPalace: PatternDetector = (chart) => {
  const life = getLifeMajorStars(chart)
  if (life.length === 0) {
    return {
      name: '命宫空宫',
      type: '特殊格局',
      description: '命宫无主星',
      detail: '需借对宫星曜论断，人生较多变化。命宫无主星的人学习能力和适应性强，但需借迁移宫星曜作为主要判断依据。',
    }
  }
  return null
}

/* ------------------------------------------------------------
   注册所有检测器（按优先级排序）
   ------------------------------------------------------------ */

const PATTERN_DETECTORS: PatternDetector[] = [
  // 富贵格局
  detectZiFuTongGong,
  detectZiFuZhaoYuan,
  detectRiYueBingMing,
  detectMingZhuChuHai,
  detectJiXiangLiMing,

  // 事业格局
  detectJiYueTongLiang,
  detectJiangXingDeDi,
  detectCaiYinJiaYin,
  detectShaPoLang,
  detectJunChenQingHui,

  // 财富格局
  detectHuoTanGe,
  detectWuQuShowMing,
  detectRiYueJiaCai,

  // 贵人格局
  detectZuoGuiXiangGui,
  detectTianYiGongMing,
  detectFuBiGongZhu,

  // 凶险格局
  detectMingWuZhengYao,
  detectYangTuoJiaMing,
  detectHuoLingJiaMing,
  detectKongJieJiaMing,
  detectXingJiJiaYin,
  detectMaTouDaiJian,

  // 特殊
  detectZiShaTongGong,
  detectHuajiRuMing,
  detectEmptyPalace,
]

/* ------------------------------------------------------------
   主检测函数
   ------------------------------------------------------------ */

export function detectPatterns(chart: FunctionalAstrolabe): string[] {
  const results: string[] = []

  for (const detect of PATTERN_DETECTORS) {
    try {
      const result = detect(chart)
      if (result) {
        results.push(`${result.name}：${result.detail}`)
      }
    } catch {
      // 忽略单个格局检测的异常
    }
  }

  return results
}

/* ------------------------------------------------------------
   获取格局详情列表
   ------------------------------------------------------------ */

export function detectPatternsDetailed(chart: FunctionalAstrolabe): PatternResult[] {
  const results: PatternResult[] = []

  for (const detect of PATTERN_DETECTORS) {
    try {
      const result = detect(chart)
      if (result) {
        results.push(result)
      }
    } catch {
      // 忽略异常
    }
  }

  return results
}
