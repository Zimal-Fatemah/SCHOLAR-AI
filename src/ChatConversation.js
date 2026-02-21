import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import './ChatConversation.css';

const ChatConversation = ({ 
  messages = [], 
  isLoading = false, 
  onCopyMessage = null,
  className = ""
}) => {
  const messagesEndRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = React.useState(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Copy logic
  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      onCopyMessage?.(messageId, content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const formatMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    return content.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match, lang, code) => `\`\`\`${lang || ''}\n${code}\n\`\`\``
    );
  };

  return (
    <div className={`chat-conversation ${className}`}>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={message.id ?? index}
            className={
              `message-container ` +
              (message.role === 'user' ? 'user-message' : 'assistant-message')
            }
          >
            {/* Avatar */}
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User className="avatar-icon" />
              ) : (
                <Bot className="avatar-icon" />
              )}
            </div>

            {/* Content */}
            <div className="message-content">
              <div className="message-bubble">
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="code-block">
                            <div className="code-header">
                              <span className="code-language">{match[1]}</span>
                              <button
                                className="copy-code-btn"
                                onClick={() => handleCopyMessage(`code-${index}`, children)}
                              >
                                {copiedMessageId === `code-${index}` ? (
                                  <Check className="copy-icon" />
                                ) : (
                                  <Copy className="copy-icon" />
                                )}
                              </button>
                            </div>
                            <pre className="code-content">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="inline-code" {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => <p className="paragraph">{children}</p>,
                      h1: ({ children }) => <h1 className="heading-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="heading-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="heading-3">{children}</h3>,
                      ul: ({ children }) => <ul className="list">{children}</ul>,
                      ol: ({ children }) => <ol className="ordered-list">{children}</ol>,
                      li: ({ children }) => <li className="list-item">{children}</li>,
                      blockquote: ({ children }) => <blockquote className="blockquote">{children}</blockquote>,
                      a: ({ children, href }) => (
                        <a href={href} className="link" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      table: ({ children }) => <table className="table">{children}</table>,
                      th: ({ children }) => <th className="table-header">{children}</th>,
                      td: ({ children }) => <td className="table-cell">{children}</td>,
                    }}
                  >
                    {formatMessageContent(message.content)}
                  </ReactMarkdown>
                ) : (
                  <div className="user-text">{message.content}</div>
                )}
              </div>
              <button
                className="copy-message-btn"
                onClick={() => handleCopyMessage(`message-${index}`, message.content)}
                title="Copy message"
              >
                {copiedMessageId === `message-${index}` ? (
                  <Check className="copy-icon" />
                ) : (
                  <Copy className="copy-icon" />
                )}
              </button>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-container assistant-message">
            <div className="message-avatar">
              <Bot className="avatar-icon" />
            </div>
            <div className="message-content">
              <div className="message-bubble loading-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatConversation;
