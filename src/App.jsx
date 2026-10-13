import { useEffect, useMemo, useRef, useState } from 'react';
import { getHealthStatus, sendChatMessage } from './services/chatService';
import { analyzeFileContent } from './services/fileService';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: '欢迎使用 AI Desktop。你可以开始提问，或接入本地/云模型。'
  }
];

const modelOptions = [
  'OpenAI GPT-4o',
  'Claude 3.5 Sonnet',
  'Local LLM (llama.cpp)',
  'Mock Demo Model'
];

function App() {
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem('ai-desktop-model') || modelOptions[3]
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('ai-desktop-api-key') || ''
  );
  const [baseUrl, setBaseUrl] = useState(
    () => localStorage.getItem('ai-desktop-base-url') || 'http://localhost:3001'
  );
  const [backendStatus, setBackendStatus] = useState('检查中...');
  const [isSending, setIsSending] = useState(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileStatus, setFileStatus] = useState('未选择文件');

  useEffect(() => {
    localStorage.setItem('ai-desktop-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('ai-desktop-api-key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('ai-desktop-base-url', baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    let cancelled = false;

    const checkBackend = async () => {
      try {
        const status = await getHealthStatus(baseUrl);
        if (!cancelled) {
          setBackendStatus(`已连接：${status.status}`);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendStatus('后端未连接，请先启动：npm run dev');
        }
      }
    };

    checkBackend();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  const quickActions = useMemo(
    () => ['总结当前内容', '提炼要点', '写代码', '翻译'],
    []
  );

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const replyText = await sendChatMessage({
        message: trimmed,
        model: selectedModel,
        apiKey,
        baseUrl
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: replyText
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: `请求失败：${error.message}`
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isTextLike =
      file.type.startsWith('text/') ||
      /\.(txt|md|csv|json|log|yaml|yml)$/i.test(file.name);

    if (!isTextLike) {
      setFileStatus('当前版本支持文本类文件，例如 .txt, .md, .json, .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setSelectedFile({
        name: file.name,
        size: file.size,
        content
      });
      setFileStatus(`已加载：${file.name} (${Math.max(1, Math.ceil(content.length / 1024))} KB)`);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeSelectedFile = async () => {
    if (!selectedFile || isAnalyzingFile) return;

    setIsAnalyzingFile(true);
    try {
      const summary = await analyzeFileContent({
        fileName: selectedFile.name,
        content: selectedFile.content,
        model: selectedModel,
        apiKey,
        baseUrl
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          role: 'assistant',
          content: `文件分析：${selectedFile.name}\n\n${summary}`
        }
      ]);
      setFileStatus(`已分析：${selectedFile.name}`);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 4,
          role: 'assistant',
          content: `文件分析失败：${error.message}`
        }
      ]);
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">AI</div>
          <div>
            <h1>AI Desktop</h1>
            <p>全能桌面助手</p>
          </div>
        </div>

        <nav className="nav-section">
          <button className="nav-item active">聊天</button>
          <button className="nav-item">文件</button>
          <button className="nav-item">语音</button>
          <button className="nav-item">插件</button>
          <button className="nav-item">设置</button>
        </nav>

        <div className="sidebar-card">
          <p className="label">当前模型</p>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
          >
            {modelOptions.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="sidebar-card">
          <p className="label">API Key</p>
          <input
            type="password"
            className="text-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="可选：OpenAI API Key"
          />
        </div>

        <div className="sidebar-card">
          <p className="label">后端地址</p>
          <input
            className="text-input"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="status-text">{backendStatus}</p>
        </div>

        <div className="sidebar-card">
          <p className="label">快捷操作</p>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <button key={action} className="chip" onClick={() => setInput(action)}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">工作区</p>
            <h2>AI 工作台</h2>
          </div>
          <button className="ghost-button">新会话</button>
        </header>

        <section className="chat-area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="avatar">{message.role === 'user' ? 'U' : 'AI'}</div>
              <div className="bubble">
                {message.content.split('\n').map((line, index) => (
                  <p key={`${message.id}-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="message-row assistant">
              <div className="avatar">AI</div>
              <div className="bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </section>

        <div className="file-panel">
          <div className="file-meta-row">
            <span className="file-pill">{fileStatus}</span>
            <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              选择文件
            </button>
            <button
              className="primary-button small"
              onClick={handleAnalyzeSelectedFile}
              disabled={!selectedFile || isAnalyzingFile}
            >
              {isAnalyzingFile ? '分析中...' : '分析文件'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.md,.csv,.json,.log,.yaml,.yml,text/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="composer">
          <textarea
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题，或让 AI 帮你总结、写代码、翻译..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="composer-actions">
            <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              附件
            </button>
            <button className="primary-button" onClick={handleSend} disabled={isSending}>
              {isSending ? '处理中...' : '发送'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
