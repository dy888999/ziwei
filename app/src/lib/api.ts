/* ============================================================
   API 层 — 与 Cloudflare Worker 通信
   ============================================================ */

// Worker 域名（前端同域名代理，移动网络兼容）
export const WORKER_URL = '';

// ============================================================
// Worker API 调用
// ============================================================

/** 调用 AI 代理（所有功能免费使用） */
export async function chatWithAI(
  feature: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const resp = await fetch(`${WORKER_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature, messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: '未知错误' }));
    throw new Error(err.error || `请求失败 (${resp.status})`);
  }

  const data = await resp.json();
  return data.reply || '';
}
