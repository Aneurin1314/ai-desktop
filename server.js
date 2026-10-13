const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

const getMockReply = (message, model) => {
  const readableMessage = String(message || '').trim();
  return [
    `已选择模型：${model}`,
    '',
    `你输入的是：${readableMessage || '空消息'}`,
    '',
    '这是一条本地 mock 响应，说明 AI Desktop 已经连接到本地聊天服务。',
    '下一步可以接入：OpenAI / Azure / Anthropic / llama.cpp。',
    '也可以在这里扩展：文件问答、代码分析、语音处理和插件能力。'
  ].join('\n');
};

const createOpenAIReply = async (message, apiKey) => {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('缺少 OpenAI API Key，请在设置中填写 apiKey，或在 .env 中配置 OPENAI_API_KEY');
  }

  const client = new OpenAI({ apiKey: key });
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: message
  });

  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const firstOutput = Array.isArray(response.output) ? response.output[0] : null;
  const textBlock = firstOutput?.content?.find((item) => item.type === 'output_text');
  return textBlock?.text || 'OpenAI 返回成功，但未解析到有效内容。';
};

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    models: [' Mock Demo Model', 'OpenAI GPT-4o', 'Claude 3.5 Sonnet', 'Local LLM (llama.cpp)']
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message = '', model = 'Mock Demo Model', apiKey = '' } = req.body || {};
    const trimmed = String(message).trim();

    if (!trimmed) {
      return res.status(400).json({ error: '请输入消息内容' });
    }

    if (String(model).includes('OpenAI')) {
      const reply = await createOpenAIReply(trimmed, apiKey);
      return res.json({ reply });
    }

    return res.json({ reply: getMockReply(trimmed, model) });
  } catch (error) {
    console.error('chat error:', error);
    return res.status(500).json({
      error: error?.message || 'AI 请求失败'
    });
  }
});

app.listen(port, () => {
  console.log(`AI Desktop backend is running at http://localhost:${port}`);
});
