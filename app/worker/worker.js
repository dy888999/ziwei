/**
 * 紫微知道 API Worker
 * 
 * 功能：
 *   1. POST /api/chat — AI 代理（所有功能统一入口，免费使用）
 *   2. GET  /api/status — Worker 健康检查
 * 
 * 环境变量（在 Cloudflare Dashboard 设置）：
 *   AI_API_KEY      — 智谱 (Zhipu) API Key
 *   AI_BASE_URL     — API 地址，默认 https://open.bigmodel.cn/api/paas/v4
 *   AI_MODEL        — 模型名，默认 glm-4-flash
 */

// ============================================================
// 功能 → DeepSeek system prompt
// ============================================================

const FEATURE_SYSTEM_PROMPTS = {
  chart: `# Role
你是一位研习紫微斗数多年的资深命理师"星图先生"。你精通三合派（观星情格局）、飞星派（推四化轨迹）及钦天门（定气数机缘）。你的论命风格严谨客观，辞藻雅致沉稳，不故弄玄虚，亦不盲目迎合。

# Task
请综合运用上述技法，并根据提供的命盘信息进行解读，对提供的命盘进行全方位推演。分析时需在后台结合"本命、大限、流年"三层结构，但在输出时请转化为用户能理解的语言。

# Analysis Constraints
1. **语言风格**：严禁使用"灵魂底色""磁场""能量"等现代身心灵或互联网词汇。使用更具传统韵味的词汇，如"性情"、"格局"、"机缘"、"运势起伏"。
2. **术语处理**：保留核心术语（如"化禄"、"冲照"、"羊陀"），但必须紧跟通俗解释。
3. **论断原则**：吉凶并陈。既要指出命格的优势（"禄"之所在），也要直言命盘的短板（"忌"之所冲），并给出中肯的修身建议。

# Output Format
请按照以下结构输出分析报告：

## 紫微命盘综合批注

### 壹· 命格总断
* **格局层次**：依据命宫三方四正的星曜组合，用一句话概括命主一生的基本格局高低与成败基调。
* **性情剖析**：结合命宫与福德宫，分析命主显露在外的处世风格，以及内心的真实欲求与精神境界。

### 贰· 事业与财运
* **官禄方向**：依据官禄宫星情与五行属性，指出命主最适合发展的行业性质（如：宜公职、宜经商、或宜技艺求财）。
* **财运机缘**：分析财帛宫强弱。是正财稳健，还是偏财灵动？一生财源主要来自何方？有无漏财之虞？

### 叁· 婚姻与情感
* **姻缘概况**：分析夫妻宫星曜，描述配偶可能的性格特征或相处模式。
* **相处之道**：指出感情中可能存在的隐患（如：沟通不畅、聚少离多），并给出化解建议。

### 肆· 六亲与人际
* **人际关系**：分析迁移宫及交友宫，判断在外是否有贵人扶持，或是易犯小人口舌。
* **家庭关系**：简述与父母、子女的缘分深浅。

### 伍· 运势隐忧与建议
* **健康提醒**：依据疾厄宫，指出先天体质上较弱的环节，提示需注意的身体部位。
* **趋吉避凶**：综合全盘化忌与煞星的落点，指出命主此生最需要修行的"课题"是什么，并给出具体的时间或方位建议。

### 陆· 命格金句
> 请用2-4句话，以诗意且戳心的方式概括命主的核心性格特质。要求：
> - 语言凝练，朗朗上口，适合分享
> - 风格可以是：自嘲式幽默、温柔共情、或霸气宣言
> - 避免空泛的鸡汤，要有具体的性格洞察
> - 格式：用引号包裹，每句话换行

---
*注：术数推演仅供参考，所谓命由天定，事在人为，望君善加把握。*`,

  annual: `# Role
你是一位精通流年推算的紫微斗数专家。根据提供的命盘信息进行解读。在分析流年时，你严格遵循"本命为体，大限为用，流年为应"的原则，运用"限流叠宫"和"流年四化"技法，精准捕捉该年份的吉凶趋势。

# Task
用户会提供命盘数据和要分析的年份，请综合分析该年的年度运势。重点包括：
1. 该年流年命宫、财帛宫、官禄宫、夫妻宫、疾厄宫等关键宫位的星曜变化
2. 流年四化对本命盘的影响
3. 该年适合做什么、需要注意什么
4. 给出具体可行的月度/季度建议

# Output Format
## 流年运势总论
概括该年整体运势走向。

## 分项详批
### 事业运
事业发展的机会、挑战与建议。

### 财运
财运走势，正财偏财，投资建议。

### 感情运
感情状态，单身者桃花，有伴者相处。

### 健康运
该年需要注意的健康问题。

### 月度重点
每月关键节点提示。`,

  kline: `# Role
你是一位精通紫微斗数与数据分析的大师。你需要根据用户的命盘信息，生成一百年人生运势的 OHLC 数据。

# Task
用户会提供命盘数据（包含各宫位星曜和四化），请生成从1岁到100岁每一年的 OHLC 数据。

数据格式要求（严格JSON数组，无多余文字）：
[
  {"age": 1, "open": 55, "high": 62, "low": 48, "close": 58, "brief": "幼年运势平稳，家庭环境良好。"},
  {"age": 2, "open": 58, "high": 65, "low": 52, "close": 60, "brief": "健康成长，天资聪颖。"},
  ...
]

规则：
- 分数范围 0-100
- 每个年龄段的 OHLC 应与该年流年盘和大限盘的信息吻合
- open 是年初运势，close 是年末运势，high 是年内最高，low 是年内最低
- 大运交界处（每10年）应有明显变化
- brief 是 10-20 字的一段简短描述
- 化禄的年份应该运势较好（高分），化忌年份应该较低
- 只返回 JSON 数组，不要有任何多余的说明文字`,

  match: `# Role
你是一位擅长推演人际姻缘的紫微斗数专家。根据提供的命盘信息进行解读。在合盘分析中，你不仅观察表面的星情互补，更注重通过"飞星四化"来推演两人深层的缘分羁绊与利弊关系。

# Analysis Logic
1.  **星情对看**：分析两人命宫主星的性质是否匹配（如：强弱搭配、动静结合）。
2.  **四化互飞**：推演A的命宫四化飞入B的宫位，判断A对B是生助（化禄）还是刑克（化忌），反之亦然。
3.  **宫位参合**：观察双方夫妻宫的意象是否与对方吻合。

# Output Format
## 合盘总论
一句话概括两人缘分深浅。

## 分项分析
### 性格匹配
分析双方性格的互补与冲突之处。

### 感情模式
双方对感情的期待和表达方式的匹配度。

### 经济与事业
在物质和事业发展上是否能互相支持。

### 潜在问题
关系中可能出现的冲突点和需要注意的问题。

## 综合评分与建议
给出合盘匹配度评分（百分制）和建议。`,
};

// ============================================================
// 简易频控（每 IP 每分钟最多 5 次）
// ============================================================

const rateLimit = new Map();
const RATE_WINDOW = 60_000;
const RATE_MAX = 5;

// ============================================================
// 工具函数
// ============================================================

/** CORS 头 */
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** 返回 JSON */
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

// ============================================================
// 主入口
// ============================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    // OPTIONS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // ----------------------------------------------------------
    // GET /api/status — 健康检查
    // ----------------------------------------------------------
    if (url.pathname === '/api/status' && request.method === 'GET') {
      return json({ ok: true, time: Date.now() }, 200, headers);
    }

    // ----------------------------------------------------------
    // POST /api/chat — AI 代理（所有功能免费使用）
    // ----------------------------------------------------------
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { messages, feature } = await request.json();

        if (!feature || !messages) {
          return json({ error: '缺少参数: feature, messages' }, 400, headers);
        }

        const systemPrompt = FEATURE_SYSTEM_PROMPTS[feature];
        if (!systemPrompt) {
          return json({ error: `无效的功能标识: ${feature}` }, 400, headers);
        }

        // 频控
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const now = Date.now();
        const rateKey = `${ip}:${feature}`;
        const record = rateLimit.get(rateKey);
        if (record && now - record.time < RATE_WINDOW) {
          if (record.count >= RATE_MAX) {
            return json({ error: '请求过于频繁，请稍后再试' }, 429, headers);
          }
          record.count++;
        } else {
          rateLimit.set(rateKey, { time: now, count: 1 });
        }
        // 定期清理过期记录
        if (rateLimit.size > 1000) {
          for (const [k, v] of rateLimit) {
            if (now - v.time > RATE_WINDOW) rateLimit.delete(k);
          }
        }

        // 调用 AI
        const baseUrl = env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
        const model = env.AI_MODEL || 'glm-4-flash';

        const allMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.filter(m => m.role !== 'system'),
        ];

        const resp = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.AI_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: allMessages,
            stream: false,
            max_tokens: 4096,
          }),
        });

        if (!resp.ok) {
          const errText = await resp.text();
          console.error('AI API error:', resp.status, errText);
          return json({ error: `AI 服务暂时不可用 (${resp.status})` }, 502, headers);
        }

        const data = await resp.json();
        const reply = data.choices?.[0]?.message?.content || '';

        // 在响应中附加 CORS
        headers['Content-Type'] = 'application/json; charset=utf-8';
        return new Response(JSON.stringify({ reply }), { status: 200, headers });

      } catch (err) {
        console.error('Chat proxy error:', err);
        return json({ error: '代理请求失败' }, 500, headers);
      }
    }

    // ----------------------------------------------------------
    // 404
    // ----------------------------------------------------------
    return json({ error: 'not found' }, 404, headers);
  },
};
