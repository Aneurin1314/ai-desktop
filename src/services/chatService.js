const API_BASE = 'http://localhost:3001';

export async function getHealthStatus(baseUrl = API_BASE) {
  const response = await fetch(`${baseUrl}/api/health`);
  if (!response.ok) {
    throw new Error('后端健康检查失败');
  }
  return response.json();
}

export async function sendChatMessage({
  message,
  model,
  apiKey,
  baseUrl = API_BASE
}) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      model,
      apiKey
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data.reply;
}
