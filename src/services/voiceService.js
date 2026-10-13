export const startVoiceCapture = ({ onResult, onError, onEnd }) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('当前浏览器不支持语音识别');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ')
      .trim();

    if (transcript) {
      onResult?.(transcript);
    }
  };

  recognition.onerror = (event) => {
    onError?.(event.error || '语音识别出错');
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return recognition;
};
