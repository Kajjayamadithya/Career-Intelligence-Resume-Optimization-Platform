import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, Sparkles, User, HelpCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MentorChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  const presets = [
    'What are some good certifications for a Node.js developer?',
    'Can you explain the Event Loop in simple terms?',
    'What skills should I add to my resume to transition to DevOps?',
    'What is the typical salary range for a Junior ML Engineer?'
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/chat/history');
      if (res.data && res.data.success && res.data.data) {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load chat history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputMessage('');
    }

    try {
      setSending(true);
      // Optimistic user update
      setMessages((prev) => [...prev, { sender: 'user', text, createdAt: new Date() }]);
      
      const res = await api.post('/chat/message', { message: text });
      if (res.data && res.data.success && res.data.data) {
        // Replace or reset message list with the complete list from the backend
        setMessages(res.data.data.messages);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const selectPreset = (p) => {
    handleSendMessage(p);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto h-[calc(100vh-140px)]">
      {/* Sidebar: Mentor Presets */}
      <div className="lg:col-span-1 glass p-6 rounded-2xl border border-white/5 flex flex-col gap-6 h-fit">
        <div>
          <h3 className="text-md font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <span>AI Career Mentor</span>
          </h3>
          <p className="text-gray-400 text-xs mt-2 font-light leading-relaxed">
            I am here to guide your career path, recommend certifications, review skills alignment, or answer technical questions.
          </p>
        </div>

        <div className="space-y-3">
          <span className="block text-[10px] font-semibold text-gray-500 uppercase">Suggested Topics</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => selectPreset(p)}
              disabled={sending || loadingHistory}
              className="w-full text-left p-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-xl text-[11px] text-gray-300 transition-all font-light leading-relaxed cursor-pointer flex justify-between items-center group"
            >
              <span className="pr-2">{p}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 glass rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-gray-950/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="text-violet-400 w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-none">Career Intel Assistant</h4>
            <span className="text-[10px] text-emerald-400 mt-1 inline-flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Ready
            </span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    isUser
                      ? 'bg-violet-600/20 border-violet-500/20 text-violet-400'
                      : 'bg-white/5 border-white/5 text-gray-400'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`p-4 rounded-2xl border text-xs font-light leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border-violet-500/25 text-white rounded-tr-none'
                      : 'bg-white/3 border-white/5 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <MessageSquare className="w-12 h-12 text-gray-600 animate-bounce" />
              <div>
                <h3 className="text-md font-bold text-white">Ask Career Intel Mentor</h3>
                <p className="text-gray-500 text-xs mt-1 max-w-sm leading-relaxed font-light">
                  Ask me anything about resume strategies, skill sets, mock interview preparation, or target developer positions.
                </p>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {sending && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-gray-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-150"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce delay-300"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-white/5 bg-gray-950/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question..."
              disabled={sending || loadingHistory}
              className="flex-1 bg-white/5 border border-white/5 focus:border-violet-500/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all font-light"
            />
            <button
              type="submit"
              disabled={sending || loadingHistory || !inputMessage.trim()}
              className="px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorChat;
