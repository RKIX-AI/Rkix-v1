import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Send, Bot, Sparkles, Loader, Play, ShieldAlert, Cpu, Search, 
  Download, Star, Check, RefreshCw, Layers, Terminal, Sliders, 
  ArrowLeft, MessageSquare, ChevronRight, Info, CheckCircle2, Trash2,
  Paperclip, Layout, Globe, Search as SearchIcon, Presentation, Video,
  Code, Eye, User, CreditCard, Settings, LogOut, Copy, Shield, Bookmark,
  ChevronDown, HelpCircle, AlignLeft, ShieldCheck, Database
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export default function RkixAgentChat() {
  // Navigation views & state
  const [activeTab, setActiveTab] = useState<'home' | 'chat'>('home');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('Đại lý');
  const [selectedModel, setSelectedModel] = useState('Mặc định');
  
  // Popover States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Messages flow
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'agent',
      text: `Xin chào! Tôi là **RKix Agent Chat** 🐼 - Người bạn đồng hành thông minh được cấp nguồn bởi hệ thống RKix Kernel.
      
Tôi có thể viết mã, thiết kế cơ sở dữ liệu, soạn thảo tài liệu hoặc giải đáp các thắc mắc chuyên sâu của bạn. Hãy gửi tin nhắn phía dưới để bắt đầu hội thoại!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Handle action click on preset tags
  const handleTagClick = (tagLabel: string) => {
    setUserInput(`Hãy giúp tôi thực hiện: ${tagLabel}`);
    setActiveTab('chat');
    showToast(`Đã chọn tác vụ: "${tagLabel}"`);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('t334602687@gmail.com');
    setCopiedEmail(true);
    showToast('Đã sao chép email vào bộ nhớ tạm!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsg = userInput;
    setUserInput('');
    
    // Switch to active chat stream view instantly
    setActiveTab('chat');
    
    const timestampStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: timestampStr }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Tôi đang trò chuyện với RKix Agent Chat bằng tác nhân [Model: ${selectedModel}, Agent: ${selectedAgent}]. Hãy trả lời cô đọng và hữu ích bằng Tiếng Việt. Câu hỏi: ${userMsg}` 
        })
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
          text: `☢️ **Error API**: ${data.error || 'Yêu cầu không thể hoàn tất'}`, 
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: 'agent', 
        text: `❗ **Lỗi kết nối**: Không thể truyền tin nhắn đến máy chủ. Lỗi: ${err.message}`, 
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset action tags from CodeBuddy screenshots
  const actionTags = [
    { label: 'Phát triển mã', icon: Code, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100' },
    { label: 'Văn phòng hàng ngày', icon: Layout, color: 'text-zinc-700 bg-zinc-50 border-zinc-100 hover:bg-zinc-100' },
    { label: 'Diễn biến hàng ngày', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100' },
    { label: 'Phát triển website', icon: Globe, color: 'text-sky-600 bg-sky-50 border-sky-100 hover:bg-sky-100' },
    { label: 'Các slide', icon: Presentation, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100' },
    { label: 'Tạo video', icon: Video, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
    { label: 'Nghiên cứu khoa học', icon: SearchIcon, color: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' },
  ];

  // Basic markdown-like highlights
  const renderFormattedText = (rawStr: string) => {
    return rawStr.split('\n').map((line, lIdx) => {
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(formattedLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-zinc-900 font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < formattedLine.length) {
        parts.push(formattedLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : formattedLine;

      if (line.trim().startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-5 list-disc text-zinc-650 mt-1 leading-relaxed">
            {line.substring(line.indexOf('- ') + 2)}
          </li>
        );
      }
      return (
        <p key={lIdx} className="text-zinc-650 leading-relaxed min-h-[1.2rem] mt-1">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9fb] text-zinc-800 font-sans overflow-hidden select-none relative">
      
      {/* Toast alert banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-zinc-900 text-white font-sans text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Clean CodeBuddy White Navbar */}
      <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab(activeTab === 'chat' ? 'home' : 'chat')}
            className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 rounded-lg transition-all cursor-pointer"
            title="Chuyển chế độ xem"
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          
          {/* Logo center aligned but responsive style */}
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold leading-none shadow-xs">
              RK
            </div>
            <span className="font-extrabold text-zinc-900 text-sm tracking-tight">
              RKIX AGENT<span className="text-indigo-600 font-mono">&gt;_</span>
            </span>
          </div>
        </div>

        {/* Action list + Dropdown button */}
        <div className="flex items-center gap-2 relative">
          
          <button
            onClick={() => {
              setActiveTab('home');
              setMessages([
                {
                  sender: 'agent',
                  text: 'Đã thiết lập lại trạng thái trò chuyện mới.',
                  timestamp: new Date().toLocaleTimeString()
                }
              ]);
              showToast('Đã khởi tạo lại đoạn trò chuyện mới');
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-250 bg-white hover:bg-zinc-50 text-xs text-zinc-600 hover:text-zinc-800 transition-all cursor-pointer mr-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa hội thoại
          </button>

          {/* User Profile Button representing screenshot 3 */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-all cursor-pointer focus-ring"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-inner">
              🐱
            </div>
            <span className="text-xs text-zinc-650 font-semibold hidden md:inline">nvht2505@gmail.com</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Screenshot 3 - Dropping Profile Popup Panel */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setIsProfileOpen(false)} 
              />
              <div className="absolute right-0 top-11 w-76 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-4.5 space-y-4 animate-fade-in text-zinc-800">
                {/* User profile layout */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-lg shadow-sm">
                      🐱
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 truncate max-w-[140px]">
                        <span>t334602687@gmail.com</span>
                        <button onClick={handleCopyEmail} className="hover:text-indigo-600 ml-0.5 cursor-pointer">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-650 font-mono uppercase">
                          miễn phí
                        </span>
                        <button 
                          onClick={() => showToast('Chức năng nâng cấp gói đang được khởi động...')}
                          className="bg-zinc-950 text-white hover:bg-zinc-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans cursor-pointer transition-all uppercase"
                        >
                          nâng cấp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Local Stats */}
                <div className="pt-3 border-t border-zinc-150 space-y-2.5 text-xs font-medium text-zinc-700">
                  <div className="flex items-center justify-between hover:text-indigo-600 transition-all cursor-pointer">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      Số điểm còn lại
                    </span>
                    <span className="font-mono font-bold text-zinc-500 flex items-center gap-1">
                      0 <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div 
                    onClick={() => {
                      showToast('Hồ sơ nuôi tôm của bạn đang đạt cấp độ 4! 🦐');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center justify-between hover:text-indigo-600 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-zinc-400" />
                      Hồ sơ nuôi tôm
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>

                {/* Sub Options Navigation */}
                <div className="pt-3 border-t border-zinc-150 space-y-2 text-xs text-zinc-600 font-medium">
                  <button 
                    onClick={() => { showToast('Đang chuyển hướng đến quản lý tài khoản...'); setIsProfileOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-indigo-600 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    Quản lý tài khoản
                  </button>
                  <button 
                    onClick={() => { showToast('Đang mở cài đặt hệ thống của bạn...'); setIsProfileOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-indigo-600 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    Cài đặt hệ thống
                  </button>
                  <button 
                    onClick={() => { showToast('Hiển thị các nhiệm vụ tự động hóa đã lưu trữ...'); setIsProfileOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-indigo-600 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      Nhiệm vụ đã lưu trữ
                    </span>
                    <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>

                {/* Log out option */}
                <div className="pt-2 border-t border-zinc-150">
                  <button
                    onClick={() => {
                      showToast('Đang thực hiện đăng xuất an toàn...');
                      setIsProfileOpen(false);
                    }}
                    className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-red-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>

              </div>
            </>
          )}

        </div>
      </header>

      {/* CORE VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
        
        {/* VIEW 1: Landing Home screen matching CodeBuddy screenshots */}
        {activeTab === 'home' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-6 space-y-8 select-none">
            
            {/* Elegant glowing 3D-styled futuristic wireframe Robot SVG */}
            <div className="w-44 h-44 md:w-52 md:h-52 shrink-0 animate-pulse transition-transform hover:scale-105 duration-500 cursor-pointer">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                
                {/* Wireframe Grid concentric background */}
                <circle cx="100" cy="110" r="85" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                <circle cx="100" cy="110" r="65" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Mechanical Antenna */}
                <line x1="100" y1="55" x2="100" y2="35" stroke="url(#robotGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="30" r="5" fill="#4f46e5" />
                <circle cx="100" cy="30" r="9" fill="none" stroke="#6366f1" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />

                {/* Head Pod contours */}
                <rect x="52" y="55" width="96" height="74" rx="28" fill="none" stroke="url(#robotGrad)" strokeWidth="2" />
                <rect x="58" y="61" width="84" height="62" rx="22" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Cute mechanical side ears */}
                <rect x="36" y="75" width="16" height="34" rx="6" fill="#f8fafc" stroke="url(#robotGrad)" strokeWidth="1.5" />
                <line x1="44" y1="80" x2="44" y2="104" stroke="#94a3b8" strokeWidth="1" />
                <rect x="148" y="75" width="16" height="34" rx="6" fill="#f8fafc" stroke="url(#robotGrad)" strokeWidth="1.5" />
                <line x1="156" y1="80" x2="156" y2="104" stroke="#94a3b8" strokeWidth="1" />

                {/* Eye contour screen visor / glass mask */}
                <rect x="68" y="71" width="64" height="38" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                
                {/* Cute glowing eyes with light reflections */}
                <circle cx="86" cy="90" r="7" fill="#22c55e" className="animate-bounce" style={{ animationDuration: '4s' }} />
                <circle cx="88" cy="88" r="2.5" fill="#ffffff" />
                
                <circle cx="114" cy="90" r="7" fill="#22c55e" className="animate-bounce" style={{ animationDuration: '4s' }} />
                <circle cx="116" cy="88" r="2.5" fill="#ffffff" />
                
                {/* Dynamic cheeks indicators */}
                <ellipse cx="76" cy="100" rx="3" ry="1" fill="#ef4444" />
                <ellipse cx="124" cy="100" rx="3" ry="1" fill="#ef4444" />

                {/* Smile line */}
                <path d="M 94,118 Q 100,123 106,118" stroke="url(#robotGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Robotic shoulders & arms wireframe */}
                <path d="M 72,135 Q 40,150 48,175" fill="none" stroke="url(#robotGrad)" strokeWidth="1.8" />
                <path d="M 128,135 Q 160,150 152,175" fill="none" stroke="url(#robotGrad)" strokeWidth="1.8" />
                <circle cx="48" cy="175" r="5" fill="#6366f1" />
                <circle cx="152" cy="175" r="5" fill="#6366f1" />
                
                {/* Chest plate panel details */}
                <path d="M 76,129 C 76,170 124,170 124,129 Z" fill="#ffffff" stroke="url(#robotGrad)" strokeWidth="2" />
                <line x1="86" y1="145" x2="114" y2="145" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="90" y1="151" x2="110" y2="151" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="100" cy="138" r="3" fill="#6366f1" />
              </svg>
            </div>

            {/* Slogan details and brand headers exactly as screenshot */}
            <div className="text-center space-y-2 max-w-xl px-4 select-none">
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 tracking-tight leading-none">
                Biến ý tưởng của bạn thành hiện thực
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 font-sans tracking-wide">
                Được kích hoạt ở bất kỳ đâu, hoàn thành tại chỗ.
              </p>
            </div>

            {/* Action selector tags carousel from screenshots */}
            <div className="w-full max-w-xl px-4">
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10.5px] font-medium">
                {actionTags.map((tag) => {
                  const IconComp = tag.icon;
                  return (
                    <button
                      key={tag.label}
                      onClick={() => handleTagClick(tag.label)}
                      className={`px-3.5 py-2.5 border rounded-full font-semibold cursor-pointer transition-all duration-150 flex items-center gap-1.5 shadow-xs ${tag.color}`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick help card inside main box */}
            <div className="w-full max-w-lg mx-auto bg-zinc-50/70 border border-zinc-200/80 p-4 rounded-xl flex items-start gap-3 text-xs text-zinc-500 md:max-w-xl">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <span className="font-bold text-zinc-800">Bắt đầu trò chuyện với Tác nhân:</span>
                <p className="leading-relaxed">
                  Bạn có thể chọn bất kỳ kỹ năng nào ở thanh menu bên trái, sau đó gõ tin nhắn phía dưới. Trí tuệ nhân tạo sẽ tự động liên kết dữ liệu thực tế để xử lý cho bạn tuyệt mật trên môi trường container.
                </p>
              </div>
            </div>

          </div>
        ) : (
          
          /* VIEW 2: Chat active conversation log stream */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-50/20">
            
            {/* Context Notice info bar */}
            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-xs max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5 text-indigo-600 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Thông tin ngữ cảnh kết nối
              </div>
              <p className="text-[10px] text-zinc-550 leading-relaxed font-sans">
                Táp truyền dữ liệu bảo mật hoạt động ổn định. Tác nhân đã nạp sẵn kiến trúc tệp tin dự án để sẵn sàng tư duy sửa lỗi lập trình cấp tập.
              </p>
            </div>

            {/* Render message elements */}
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in text-xs`}
                >
                  {msg.sender === 'agent' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-[#4f46e5] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs border border-indigo-200">
                      🐼
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-4 border shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-900 border-zinc-800 text-white rounded-tr-none'
                      : 'bg-white border-zinc-200 rounded-tl-none text-zinc-850'
                  }`}>
                    {/* Header name & timestamp info */}
                    <div className="flex items-center gap-2 mb-1 text-[9px] font-mono text-zinc-400">
                      <span className="font-extrabold uppercase tracking-wide">{msg.sender === 'user' ? 'BẠN' : 'RKIX AGENT'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-700 select-text leading-relaxed">
                      {renderFormattedText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Waiting status indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 text-indigo-600 font-bold">
                    🐼
                  </div>
                  <div className="bg-white border border-zinc-200 shadow-xs rounded-2xl p-4 w-72 flex items-center gap-2.5 text-xs text-zinc-550 font-medium">
                    <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                    RKix Agent đang phân tích câu lệnh...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

          </div>
        )}

        {/* BOTTOM FIXED CHAT INPUT WRAPPER matching exact screenshots layout */}
        <div className="p-4 bg-white border-t border-zinc-200 sticky bottom-0 z-10">
          <div className="max-w-2xl mx-auto">
            
            {/* Input Box Card container */}
            <form onSubmit={handleSendMessage} className="bg-white border border-zinc-250 hover:border-zinc-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 rounded-2xl p-3.5 shadow-md transition-all flex flex-col relative">
              
              {/* Top controls: paperclip icon on top left */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => showToast('Chức năng tải file và đính kèm ngữ cảnh đang sẵn sàng...')}
                  className="p-1 text-zinc-400 hover:text-zinc-650 rounded hover:bg-zinc-50 transition-all cursor-pointer"
                  title="Đính kèm tệp tin tài liệu"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                
                {/* Mode status or short text info */}
                {activeTab === 'chat' && (
                  <button 
                    type="button"
                    onClick={() => setActiveTab('home')}
                    className="text-[10px] text-zinc-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại trang chủ Tác nhân
                  </button>
                )}
              </div>

              {/* Central Text Message Area */}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={isLoading}
                placeholder="Nhập yêu cầu tương tác tại đây..."
                rows={2}
                className="w-full bg-transparent resize-none outline-none text-sm text-zinc-900 placeholder-zinc-400 font-sans leading-relaxed"
              />

              {/* Bottom Panel Layout with Dropdown selectors & Send button */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-50 select-none">
                
                <div className="flex items-center gap-2 text-xs relative">
                  
                  {/* Selector 1: Agent Droplist Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAgentDropdownOpen(!isAgentDropdownOpen);
                        setIsModelDropdownOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 text-[11px] font-bold text-zinc-650 flex items-center gap-1 cursor-pointer transition-all select-none"
                    >
                      <Bot className="w-3.5 h-3.5 text-zinc-450" />
                      {selectedAgent}
                      <ChevronDown className="w-3 h-3 text-zinc-400" />
                    </button>

                    {isAgentDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsAgentDropdownOpen(false)} />
                        <div className="absolute left-0 bottom-8 z-50 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg p-1.5 space-y-1 text-[11px]">
                          {['Đại lý', 'Tác nhân lập trình', 'Trợ lý phân tích', 'Kỹ thuật viên dev'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setSelectedAgent(opt);
                                setIsAgentDropdownOpen(false);
                                showToast(`Đã chuyển tác nhân: "${opt}"`);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-all cursor-pointer font-medium"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Selector 2: Model selection picker with purple brackets logo inside button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModelDropdownOpen(!isModelDropdownOpen);
                        setIsAgentDropdownOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 text-[11px] font-bold text-zinc-650 flex items-center gap-1 cursor-pointer transition-all select-none"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      {selectedModel}
                      <ChevronDown className="w-3 h-3 text-zinc-400" />
                    </button>

                    {isModelDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsModelDropdownOpen(false)} />
                        <div className="absolute left-0 bottom-8 z-50 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg p-1.5 space-y-1 text-[11px]">
                          {['Mặc định', 'Gemini 3.5 Flash', 'Gemini 3.5 Pro', 'Deep Research Kernel'].map(model => (
                            <button
                              key={model}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model);
                                setIsModelDropdownOpen(false);
                                showToast(`Đã chuyển mô hình: "${model}"`);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-zinc-100 rounded-lg text-zinc-700 transition-all cursor-pointer font-medium"
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                </div>

                {/* Rightmost Action trigger button */}
                <button
                  type="submit"
                  disabled={!userInput.trim() || isLoading}
                  className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all rounded-xl shadow-xs cursor-pointer focus-ring shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>

              </div>

            </form>

            {/* Bottom disclaimer captions */}
            <p className="text-[10px] text-zinc-400 text-center mt-2 font-sans">
              Nội dung này được tạo ra bởi trí tuệ nhân tạo; vui lòng kiểm tra lại thông tin quan trọng.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}
