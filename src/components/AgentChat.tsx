/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader, Play, ShieldAlert, Cpu } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'agent',
      text: `Xin chào! Tôi là **RKix 🐼** - Senior AI Product Orchestrator và Autonomous Software Factory Companion nòng cốt của bạn.

Mục tiêu hoạt động của tôi:
- Tự động hóa hoàn toàn luồng phát triển: Phân tích intent, tạo khung kiến trúc, khởi tạo container runtime, và deploy Live URL.
- Bộ máy tự vá lỗi **Self-healing Debug Loop**: Phát hiện runtime crashes, đọc traceback logs và sửa đổi code trực tiếp trên sandbox.

Bạn cần tôi phân tích tính năng, viết mã nguồn Express, nâng cấp bảo mật hay giúp điều hành hệ thống rào cản sandbox? Hãy nhập yêu cầu của bạn ở bên dưới!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsg = userInput;
    setUserInput('');
    
    const timestampStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: timestampStr }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMsg })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { 
          sender: 'agent', 
          text: data.text, 
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'agent', 
          text: `☢️ **Error API Gemini**: ${data.error || 'Yêu cầu thất bại'}`, 
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: 'agent', 
        text: `☣️ **Network Incident**: Không thể thiết lập pipeline tới AI Server. Lỗi: ${err.message}`, 
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe client-side lightweight text formatter (to replace markdown parser with nice custom HTML rendering)
  const renderFormattedText = (rawStr: string) => {
    return rawStr.split('\n').map((line, lIdx) => {
      let formattedLine = line;

      // Bold text handling **bold**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formattedLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < formattedLine.length) {
        parts.push(formattedLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : formattedLine;

      // Unordered list bullet check
      if (line.trim().startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-5 list-disc text-gray-300 mt-1 leading-relaxed">
            {line.substring(line.indexOf('- ') + 2)}
          </li>
        );
      }
      
      // Inline code blocks
      if (line.trim().startsWith('`') || line.includes('```')) {
        return (
          <pre key={lIdx} className="bg-[#111622] p-3 rounded-md border border-[#212739] text-[11px] font-mono text-emerald-400 my-2 overflow-x-auto whitespace-pre-wrap leading-tight">
            {line.replace(/```[a-zA-Z]*/g, '').replace(/`/g, '')}
          </pre>
        );
      }

      // Title/Heading lines
      if (line.trim().startsWith('###')) {
        return <h4 key={lIdx} className="text-white font-semibold text-xs font-mono mt-4 mb-2 tracking-tight flex items-center gap-1.5">{line.replace('###', '')}</h4>;
      }
      if (line.trim().startsWith('##')) {
        return <h3 key={lIdx} className="text-[#a5b4fc] font-bold text-sm font-mono mt-4 mb-2 border-b border-indigo-950 pb-1">{line.replace('##', '')}</h3>;
      }

      return (
        <p key={lIdx} className="text-gray-300 leading-relaxed min-h-[1.2rem] mt-1 text-xs">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      {/* Ask AI Headers */}
      <div className="p-5 border-b border-zinc-800 bg-[#09090b] shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <span>🐼</span>
            ASK (SESSION) - RKIX 🐼 DISPATCHER
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono tracking-tight mt-0.5">
            Phân tích mầm mống lỗi logs, lập sơ đồ bảo mật sandbox & vá tự động. Powered by Gemini.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 animate-pulse" />
          Autonomous Pipeline Mode: Connected
        </div>
      </div>

      {/* Messages Output Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-transparent">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {/* Agent Icon */}
              {msg.sender === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-md text-base">
                  🐼
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-xl p-4 border text-xs shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-accent-mute border-accent/20 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}>
                {/* Meta details */}
                <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-zinc-500">
                  <span className="font-bold uppercase tracking-wider">{msg.sender === 'user' ? 'Product Creator' : 'RKix 🐼'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Formatted body */}
                <div className="space-y-1">
                  {renderFormattedText(msg.text)}
                </div>
              </div>

              {/* User Avatar */}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-90 w border border-zinc-800 flex items-center justify-center shrink-0 font-bold text-zinc-400 text-xs shadow-sm">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Loading Loader indicator */}
          {isLoading && (
            <div className="flex gap-3.5 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-base">
                🐼
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-96 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Play className="w-3.5 h-3.5 text-accent animate-pulse fill-accent" />
                RKix 🐼 đang tự phân tích mã & lập mô hình...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-zinc-800 bg-[#09090b] shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading}
              placeholder="Nhập yêu cầu tại đây... (Ví dụ: 'Lên kế hoạch vá lỗi bảo mật T4', 'Kiểm tra container memory quota')"
              className="w-full bg-zinc-900 hover:bg-zinc-900/85 text-zinc-100 pl-4 pr-12 py-3 rounded-lg border border-zinc-800 tracking-tight text-xs font-mono placeholder:text-zinc-650 focus-ring"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-accent text-black hover:opacity-90 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all cursor-pointer font-semibold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-zinc-550 text-center font-mono mt-2.5">
            Môi trường sandbox có thể tích hợp trực tiếp các biến môi trường cấu hình tại tab "Secrets & Keys".
          </div>
        </div>
      </div>
    </div>
  );
}
