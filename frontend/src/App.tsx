import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, fetchHistory } from './api';
import type { Message } from './api';
import './App.css';

const SESSION_KEY = 'driftwood_session_id';

interface DisplayMessage extends Message {
  isError?: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return;
    fetchHistory(stored)
      .then(({ sessionId: sid, messages: msgs }) => {
        if (msgs.length > 0) {
          setSessionId(sid);
          setMessages(msgs);
        }
      })
      .catch(() => {
        // silently ignore — stale session or network issue
      });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // Optimistically add user message
    const userMsg: DisplayMessage = {
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { reply, sessionId: sid } = await sendMessage(text, sessionId);
      setSessionId(sid);
      localStorage.setItem(SESSION_KEY, sid);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, createdAt: new Date().toISOString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "Something went wrong — please try again.",
          createdAt: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div className="chat-shell">
      <header className="chat-header">
        <span className="chat-logo">🪵</span>
        <div>
          <div className="chat-title">Driftwood Home</div>
          <div className="chat-subtitle">Customer Support</div>
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            Hi! Ask me about shipping, returns, or anything else. I'm here to help.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bubble-row ${msg.sender === 'user' ? 'bubble-row--user' : 'bubble-row--ai'}`}
          >
            <div className={`bubble ${msg.sender === 'user' ? 'bubble--user' : msg.isError ? 'bubble--error' : 'bubble--ai'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="bubble-row bubble-row--ai">
            <div className="bubble bubble--ai bubble--typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          rows={1}
          placeholder="Type a message… (Enter to send)"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send"
          onClick={() => void submit()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
