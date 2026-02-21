'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  Settings,
  Send,
  MessageSquare,
  Plus,
  History,
  Trash2,
  MoreVertical,
  Mic,
  MicOff,
  Paperclip,
  X,
  Loader
} from 'lucide-react';
import ChatConversation from './ChatConversation';
import { usePdfUpload } from './utils/pdfUtils';
import { useSpeechToText } from './utils/voiceUtils';
import { generateQuizFromContent } from './utils/quizGenerator';
import QuizModal from './components/QuizModal';


export default function ScholarAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // PDF Upload
  const { pdfText, pdfName, isLoading: pdfLoading, error: pdfError, handleUpload, clearPdf } = usePdfUpload();
  
  // Voice Input
  const { startListening, stopListening, isListening, transcript, resetTranscript } = useSpeechToText();
  
  // Quiz Modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const fullText = "How can I help you study today?";

  // Typewriter animation effect
  useEffect(() => {
    if (messages.length === 0) {
      setIsTyping(true);
      setTypewriterText('');
      let i = 0;
      const timer = setInterval(() => {
        setTypewriterText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 100);
      return () => {
        clearInterval(timer);
      };
    }
  }, [messages.length]);

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Load API key from environment / localStorage
  useEffect(() => {
    const envKey = process.env.REACT_APP_GEMINI_API_KEY;
    const savedKey = localStorage.getItem('gemini_api_key');
    
    if (envKey) {
      setApiKey(envKey);
    } else if (savedKey) {
      setApiKey(savedKey);
    } else {
      // Auto-show settings if no API key found
      setShowSettings(true);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const saveApiKey = () => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();
    setLoading(true);
    setIsTyping(true);

    try {
      const key =
        apiKey ||
        process.env.REACT_APP_GEMINI_API_KEY ||
        localStorage.getItem('gemini_api_key');
      if (!key) {
        throw new Error('API key not found.');
      }

      // Build message content with PDF if available
      let messageContent = input.trim();
      
      if (pdfText && pdfText.length > 0) {
        console.log('Including PDF in prompt:', pdfName, `${pdfText.length} characters`);
        // Include PDF content in the prompt
        messageContent = `Context: The user has uploaded a PDF document titled "${pdfName}". Here is the content:\n\n${pdfText.substring(0, 15000)}\n\n---\n\nUser Question: ${messageContent}`;
      } else {
        console.log('No PDF content available');
      }

      // Decide whether to use casual or detailed response based on content
      const textLower = userMessage.content.toLowerCase();
      const wordCount = userMessage.content.trim().split(/\s+/).length;
      const casualKeywords = ['hi', 'hello', 'how are you', 'hey', 'good morning', 'good evening'];
      const isCasual =
        wordCount <= 6 && casualKeywords.some(kw => textLower.includes(kw));

      let promptInstruction;
      if (isCasual) {
        promptInstruction = `
You are a friendly assistant. Keep your response short, polite, and conversational.
For casual greetings or small talk, just respond briefly and ask "How can I help you today?" or similar.
`;
      } else {
        promptInstruction = `
You are an expert educational tutor operating in ChatGPT's study mode. When a student asks about a concept or subject, provide a thorough, structured explanation with examples, step-by-step reasoning, and clarity. ${pdfText ? 'Use the provided PDF content to give accurate, contextual answers.' : ''} Always end with a question that invites more queries (e.g. "Would you like another example?" or "Shall I go deeper on this part?").
`;
      }

      const combinedPrompt = `
${promptInstruction}

${messageContent}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: combinedPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: text
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Error: ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSuggestionClick = suggestion => {
    setInput(suggestion);
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    setShowSidebar(true);
    clearPdf();
    resetTranscript();
  };

  const loadChat = chatId => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const deleteChat = chatId => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const saveCurrentChat = () => {
    if (messages.length > 0) {
      const chatTitle =
        messages[0]?.content?.substring(0, 50) + '...' || 'New Chat';
      const chatData = {
        id: currentChatId || Date.now().toString(),
        title: chatTitle,
        messages: messages,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => {
        const filtered = prev.filter(c => c.id !== chatData.id);
        return [chatData, ...filtered];
      });

      if (!currentChatId) {
        setCurrentChatId(chatData.id);
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
  }, [messages]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const key = apiKey || process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      if (!key) {
        throw new Error('API key not found');
      }

      // Get content from conversation or PDF
      let content = '';
      if (pdfText) {
        content = pdfText;
      } else if (messages.length > 0) {
        content = messages.map(m => m.content).join('\n\n');
      }

      if (!content || content.length < 50) {
        alert('Please upload a PDF or have a conversation first to generate a quiz!');
        setGeneratingQuiz(false);
        return;
      }

      const questions = await generateQuizFromContent(content, key, 5);
      setQuizQuestions(questions);
      setShowQuizModal(true);
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz: ' + error.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const suggestions = [
    {
      icon: MessageSquare,
      text: 'Explain a complex concept in simple terms',
      category: 'Learning'
    },
    {
      icon: MessageSquare,
      text: 'Help me write and improve my essay',
      category: 'Writing'
    },
    {
      icon: MessageSquare,
      text: 'Generate practice questions for my exam',
      category: 'Practice'
    },
    {
      icon: MessageSquare,
      text: 'Summarize this chapter for better understanding',
      category: 'Summary'
    }
  ];

  return (
    <div className="flex h-screen bg-white font-inter text-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } transition-all duration-500 ease-in-out bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        {/* Sidebar header & controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-200 hover:scale-110 rounded-lg transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={createNewChat}
            className="w-full mt-3 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {generatingQuiz ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>

        {/* Chat history list */}
        <div className="flex-1 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No chat history yet</p>
            </div>
          ) : (
            <div className="p-2">
              {chatHistory.map(chat => (
                <div
                  key={chat.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    currentChatId === chat.id
                      ? 'bg-gray-200 text-gray-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ScholarAI</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {generatingQuiz ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Generate Quiz
                </>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 hover:scale-110 rounded-lg transition-all duration-200"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {showSettings && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                🔑 API Configuration
              </h3>
              {!apiKey && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">👋 Welcome! Get started in 2 steps:</p>
                  <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google AI Studio</a></li>
                    <li>Paste it below and click Save</li>
                  </ol>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API Key here..."
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                />
                <button
                  onClick={saveApiKey}
                  disabled={!apiKey}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                🔒 Your API key is stored locally in your browser and never sent anywhere except Google's Gemini API
              </p>
            </div>
          </div>
        )}
        
        {/* PDF Upload Indicator */}
        {pdfName && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">{pdfName}</span>
              <span className="text-xs text-blue-600">({Math.round(pdfText.length / 1000)}KB)</span>
            </div>
            <button
              onClick={clearPdf}
              className="p-1 hover:bg-blue-100 rounded transition-all"
            >
              <X className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 min-h-[3rem] flex items-center justify-center">
                {typewriterText}
                {isTyping && <span className="animate-pulse ml-1">|</span>}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl animate-fade-in">
                I'm here to help you learn, understand, and excel in your studies.
                Ask me anything!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="group p-6 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 text-left animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center group-hover:bg-gray-300 group-hover:scale-110 transition-all duration-300">
                      <suggestion.icon className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 mb-2 group-hover:text-gray-600 transition-colors duration-300">
                        {suggestion.category}
                      </div>
                      <div className="text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                        {suggestion.text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 overflow-hidden" ref={chatContainerRef}>
            <ChatConversation
              messages={messages}
              isLoading={loading}
              className="h-full"
            />
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <button
                onClick={handleUpload}
                disabled={pdfLoading || loading}
                className="p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="Upload PDF"
              >
                {pdfLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' && !e.shiftKey && handleSend()
                  }
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200 pr-14 resize-none"
                  disabled={loading}
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    ×
                  </button>
                )}
              </div>
              
              <button
                onClick={handleVoiceToggle}
                disabled={loading}
                className={`p-4 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center mt-3">
              <p className="text-xs text-gray-500">
                Press Enter to send • ScholarAI can make mistakes, always verify important information
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          questions={quizQuestions}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}