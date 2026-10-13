export async function getHealthStatus(baseUrl = 'http://localhost:3001') {
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
  baseUrl = 'http://localhost:3001'
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

export async function analyzeFileContent({
  fileName,
  content,
  model,
  apiKey,
  baseUrl = 'http://localhost:3001'
}) {
  const response = await fetch(`${baseUrl}/api/files/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName,
      content,
      model,
      apiKey
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || '文件分析失败');
  }

  return data.summary;
}
