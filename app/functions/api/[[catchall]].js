/**
 * Pages Function — API 代理
 * 在 Pages 同域名下代理所有 /api/* 请求到 Worker
 * 避免移动网络下 workers.dev 被墙的问题
 */

const WORKER_URL = 'https://ziwei-api.wudy888999.workers.dev';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 构造 Worker 目标 URL
  const targetUrl = `${WORKER_URL}${url.pathname}${url.search}`;

  // 转发请求（保留 method 和 body）
  const proxyResp = await fetch(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : await request.text(),
  });

  // 原样返回 Worker 的响应（含 CORS 头）
  return new Response(proxyResp.body, {
    status: proxyResp.status,
    headers: proxyResp.headers,
  });
}
