import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useVenue } from '../context/VenueContext.jsx';
import { getAssistantResponse, SUGGESTED_QUESTIONS } from '../logic/assistantLogic.js';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import styles from './Assistant.module.css';

function formatMessage(text) {
  // Convert **bold** and line breaks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function Assistant() {
  const location = useLocation();
  const { gates, restrooms, foodStalls, sections, venueInfo, geminiApiKey, setApiKey } = useVenue();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `👋 Welcome to **StadiumIQ AI Assistant**!\n\nI'm your smart event companion for **${venueInfo?.event}** at ${venueInfo?.name}.\n\nI can help you find the fastest gates, shortest food queues, nearest restrooms, and navigate the venue. Just ask me anything!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'local',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Handle pre-filled query from navigation state
  useEffect(() => {
    if (location.state?.query) {
      sendMessage(location.state.query);
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const venueData = { gates, restrooms, foodStalls, sections, venueInfo };

  async function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getAssistantResponse(trimmed, venueData, geminiApiKey || null);
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: '⚠️ Something went wrong. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function saveApiKey() {
    setApiKey(apiKeyInput.trim());
    setShowApiKey(false);
  }

  return (
    <div className={styles.assistantPage}>
      {/* Sidebar Info */}
      <div className={styles.infoPanel}>
        <div className={styles.infoPanelHeader}>
          <div className={styles.aiAvatar}>🤖</div>
          <div>
            <div className={styles.aiName}>StadiumIQ AI</div>
            <div className={styles.aiStatus}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              Online
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoLabel}>Powered by</div>
          <div className={styles.infoValue}>
            {geminiApiKey ? '✨ Google Gemini' : '🧠 Local Intelligence'}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoLabel}>Context</div>
          <div className={styles.infoValue}>{venueInfo?.name}</div>
          <div className={styles.infoSub}>{venueInfo?.event}</div>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoLabel} style={{ marginBottom: '0.5rem' }}>Try asking:</div>
        <div className={styles.suggestionList}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button key={i} className={styles.suggestion} onClick={() => sendMessage(q)}>
              {q}
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        <button className={styles.apiKeyBtn} onClick={() => setShowApiKey(!showApiKey)}>
          🔑 {geminiApiKey ? 'Update Gemini Key' : 'Add Gemini API Key'}
        </button>

        {showApiKey && (
          <div className={styles.apiKeyForm}>
            <input
              type="password"
              placeholder="AIza..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              className="input"
              style={{ fontSize: 'var(--text-xs)', padding: '0.5rem 0.75rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '0.4rem' }} onClick={saveApiKey}>Save</button>
              <button className="btn btn-ghost" style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '0.4rem' }} onClick={() => setShowApiKey(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <span className={styles.chatTitle}>AI Assistant</span>
          <span className={styles.chatCount}>{messages.length} messages</span>
        </div>

        <div className={styles.chatMessages} role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              {msg.role === 'assistant' && (
                <div className={styles.msgAvatar}>🤖</div>
              )}
              <div className={styles.msgContent}>
                <div
                  className={styles.msgBubble}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                <div className={styles.msgMeta}>
                  {msg.time}
                  {msg.source === 'gemini' && <span className={styles.sourceBadge}>✨ Gemini</span>}
                  {msg.source === 'local' && <span className={styles.sourceBadge}>🧠 Local AI</span>}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className={styles.msgAvatarUser}>👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.msgAvatar}>🤖</div>
              <div className={styles.typingIndicator}>
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <div className={styles.chipRow}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
              <button key={i} className={styles.quickChip} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.chatInput}
              placeholder="Ask about gates, queues, food, navigation..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              aria-label="Message input"
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              {loading ? <LoadingSpinner size={18} color="white" /> : '➤'}
            </button>
          </div>
          <div className={styles.inputHint}>Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}
