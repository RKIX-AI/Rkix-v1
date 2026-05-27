import React, { useState, useEffect, useMemo } from 'react';
import { 
  Newspaper, RefreshCw, Sparkles, TrendingUp, Cpu, Code, Layout, 
  Terminal, Globe, Zap, ArrowRight, BookOpen, Clock, Heart, Share2, Search
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  category: 'model' | 'code' | 'design';
  publishTime: string;
  likes: number;
  readTime: string;
  isNew?: boolean;
}

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Google ra mắt mô hình Gemini 3.5 Flash thế hệ Agentic',
    content: 'Google chính thức trình làng dòng mô hình Gemini 3.5 Flash tối ưu hóa đặc biệt cho các luồng công việc Agentic phức tạp. Tăng 200% tốc độ gọi APIs, tối ưu hóa kích thước tệp phản hồi và giảm độ trễ đầu cuối (latency) xuống dưới 120ms.',
    source: 'Google AI Blog',
    category: 'model',
    publishTime: 'Vừa xong',
    likes: 852,
    readTime: '2 phút đọc',
    isNew: true
  },
  {
    id: 'news-2',
    title: 'Xu hướng thiết kế Bento Grid và tối ưu hóa mật độ hiển thị (Zoom Density)',
    content: 'Các ứng dụng console hiện đại đang chuyển dịch sang thiết kế khối Bento Grid bất đối xứng, kết hợp tính năng tinh chỉnh Zoom Density giúp lấp đầy không gian màn hình laptop di động một cách hoàn hảo mà không sinh scrollbar ngang.',
    source: 'RKix Design Lab',
    category: 'design',
    publishTime: '10 phút trước',
    likes: 312,
    readTime: '4 phút đọc',
    isNew: true
  },
  {
    id: 'news-3',
    title: 'Google DeepMind công bố AlphaCode 3: Độc lập viết phần mềm Fullstack',
    content: ' AlphaCode 3 đột phá khả năng tự lập giải pháp kiến trúc hệ thống đa tập tin, tự động thiết kế cơ sở dữ liệu Spanner và xử lý ghim cổng sandbox bảo mật.',
    source: 'DeepMind Press',
    category: 'code',
    publishTime: '1 giờ trước',
    likes: 1250,
    readTime: '6 phút đọc'
  },
  {
    id: 'news-4',
    title: 'Tích hợp Gemini APIs trực tiếp vào React 19 Server Components',
    content: 'Đúc rút phương án gọi trực diện SDK @google/genai bên trong mô hình render Server Components của React giúp che giấu API keys tuyệt mật khỏi tầm mắt người dùng trình duyệt Chrome.',
    source: 'React Community',
    category: 'code',
    publishTime: '3 giờ trước',
    likes: 642,
    readTime: '3 phút đọc'
  },
  {
    id: 'news-5',
    title: 'Google ra mắt Live API SDK hỗ trợ xử lý giọng nói thời gian thực siêu nhanh',
    content: 'Bộ chuyển đổi âm thanh trực tiếp hai chiều (bi-directional WebSockets) cho phép mô hình Gemini nghe, hiểu và phản hồi giọng nói người dùng với độ trễ tối thiểu, mở ra kỷ nguyên Agent AI tự động gọi điện chăm sóc khách hàng.',
    source: 'Google Workspace Dev',
    category: 'model',
    publishTime: '5 giờ trước',
    likes: 928,
    readTime: '5 phút đọc'
  }
];

// Seed arrays to generate real-time procedural newsletters
const MODEL_UPDATES = [
  'Google LLM Gemini 3.0 Ultra bứt phá điểm số suy luận toán học 98.2%',
  'Gemini 2.5 Pro cập nhật Context Window lên 3 Triệu tokens miễn phí',
  'Ra mắt Imagen 3.5: Sinh ảnh đồ họa vector SVG chuẩn xác không vỡ nét',
  'Google Chrome tích hợp sẵn mô hình Gemini Nano chạy trực tiếp offline trên card màn hình',
  'Gia tăng bảo mật: Google Cloud Shield tự phát hiện mã độc bằng AI'
];

const CODE_UPDATES = [
  'Vite 6.0 ra mắt: Cơ chế xây dựng sandbox cực đại hóa song song',
  'ESLint công bố bộ luật nghiêm cấm hardcode khóa bí mật (Secret Checks)',
  'D3-Graph cập nhật thuật toán định hướng trọng lực vẽ sơ đồ tệp tin',
  'Express 5.0 chính thức ổn định: Quản lý luồng routing an toàn hơn',
  'TypeScript 5.8: Tự động suy luận kiểu dữ liệu sâu khi truyền callback'
];

interface AiNewsPageProps {
  triggerToast?: (msg: string) => void;
}

export default function AiNewsPage({ triggerToast }: AiNewsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'model' | 'code' | 'design'>('all');
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>(INITIAL_NEWS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [realtimeClock, setRealtimeClock] = useState<string>('');

  // Live real-time clock generator Vietnamese ISO
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setRealtimeClock(d.toLocaleTimeString('vi-VN') + ' (UTC+7)');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System dynamically streams new tech news in real-time on click sync!
  const handleSyncUpdates = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const categories: ('model' | 'code' | 'design')[] = ['model', 'code', 'design'];
      const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
      
      let title = '';
      let content = '';
      let source = '';

      if (chosenCategory === 'model') {
        title = MODEL_UPDATES[Math.floor(Math.random() * MODEL_UPDATES.length)];
        content = `Báo cáo đánh giá chất lượng mới nhất của Google cập nhật hôm nay cho thấy hệ thống hoạt động xuất sắc, giảm thiểu triệt để hiện tượng ảo giác thông tin và tăng cao độ bao phủ ngữ nghĩa đa tầng.`;
        source = 'Google Cloud Engineers';
      } else if (chosenCategory === 'code') {
        title = CODE_UPDATES[Math.floor(Math.random() * CODE_UPDATES.length)];
        content = `Phương pháp tối ưu hóa mới cho phép ứng dụng gói tài nguyên nhanh hơn, nén dung lượng biên dịch React SPA xuống chỉ còn 40% so với phương pháp gốc.`;
        source = 'NPM Tech Committee';
      } else {
        title = `Phong cách thiết kế Glassmorphism neon bùng nổ trở lại trên thiết bị Desktop`;
        content = `Sự kết hợp giữa hiệu ứng blur kính mờ cường độ cao phối cùng viền màu rực rỡ neon thiết lập một diện mạo mới mẻ, thu hút mọi tương tác bấm nhấp của người dùng.`;
        source = 'UX Collective';
      }

      const newFeedItem: NewsItem = {
        id: `news-${Date.now()}`,
        title,
        content,
        source,
        category: chosenCategory,
        publishTime: 'Vừa xong',
        likes: Math.floor(10 + Math.random() * 50),
        readTime: `${Math.floor(1 + Math.random() * 5)} phút đọc`,
        isNew: true
      };

      // Reset isNew flag for older items
      setNewsFeed(prev => {
        const cleaned = prev.map(item => ({ ...item, isNew: false }));
        return [newFeedItem, ...cleaned];
      });

      setIsSyncing(false);
      if (triggerToast) {
        triggerToast('Dòng tin tức Google AI & Code mới nhất vừa được đồng bộ về thời gian thực!');
      }
    }, 1000);
  };

  const handleLikeNews = (id: string) => {
    setNewsFeed(prev => 
      prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item)
    );
    if (triggerToast) {
      triggerToast('Đã thả tim và ủng hộ đề tài bản tin nghiên cứu này! ♥');
    }
  };

  const filteredNews = useMemo(() => {
    if (activeTab === 'all') return newsFeed;
    return newsFeed.filter(item => item.category === activeTab);
  }, [newsFeed, activeTab]);

  return (
    <div className="p-4 md:p-8 bg-[#0c0c0e] text-zinc-100 h-full min-h-full overflow-y-auto custom-scrollbar select-none animate-fade-in space-y-6 pb-16">
      
      {/* Upper info center details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#09090b] border border-zinc-850 p-4.5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Thời gian thực</span>
              <span className="text-xs font-bold text-white block mt-0.5 font-mono">{realtimeClock || 'Loading...'}</span>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono font-bold leading-none shrink-0 animate-pulse">Syncing</span>
        </div>

        <div className="bg-[#09090b] border border-zinc-850 p-4.5 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Mô hình Google mới</span>
            <span className="text-xs font-bold text-white block mt-0.5 font-mono">Gemini 3.5 & Live Tools</span>
          </div>
        </div>

        <div className="bg-[#09090b] border border-zinc-850 p-4.5 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Xu hướng đóng đóng</span>
            <span className="text-xs font-bold text-white block mt-0.5 font-mono">Bento Grids & Sandbox Pack</span>
          </div>
        </div>

      </div>

      {/* Main navigation header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-accent shrink-0" />
            Bản tin công nghệ mã nguồn & Trí tuệ nhân tạon Google AI (Live Hub)
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 font-sans leading-relaxed">
            Xem cập nhật về các phiên bản Gemini mới nhất, xu hướng phát triển mã nguồn sạch, tối ưu hóa giao diện đa mật độ và phân tích các bài nghiên cứu về AI Agents.
          </p>
        </div>

        <div>
          <button 
            onClick={handleSyncUpdates}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-zinc-950 bg-accent hover:opacity-90 active:scale-95 transition-all rounded-lg cursor-pointer"
          >
            {isSyncing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent animate-spin rounded-full"></span>
                <span>Cập nhật...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Đồng bộ tin mới
              </>
            )}
          </button>
        </div>
      </div>

      {/* Categories Tab Selector with elegant styling */}
      <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-850 flex items-center gap-1 w-full max-w-xl">
        {[
          { id: 'all', label: '📰 Tất cả bản tin' },
          { id: 'model', label: '🤖 Mô hình AI Google' },
          { id: 'code', label: '💻 Code Sạch & CLI' },
          { id: 'design', label: '🎨 Thiết kế mẫu UI' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-mono font-bold transition-all text-center cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-accent text-zinc-950 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main core split: Left panel for scroll articles, etc. Right panel for hot bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column for News items */}
        <div className="lg:col-span-8 space-y-4">
          {filteredNews.map((item) => {
            return (
              <div 
                key={item.id} 
                className={`p-5 bg-zinc-900/40 border rounded-xl hover:border-zinc-700 hover:bg-zinc-900/60 transition-all space-y-3 relative overflow-hidden ${
                  item.isNew ? 'border-[#3b82f6]/50 bg-[#3b82f6]/5' : 'border-zinc-850'
                }`}
              >
                {item.isNew && (
                  <span className="absolute top-0 right-0 bg-[#3b82f6] text-white text-[8px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-bl">
                    Tin Mới Up ⚡
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {item.category === 'model' && (
                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/25 text-purple-400 px-2 py-0.5 rounded font-mono uppercase font-bold">Mô hình AI</span>
                  )}
                  {item.category === 'code' && (
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-bold">Mã nguồn</span>
                  )}
                  {item.category === 'design' && (
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2 py-0.5 rounded font-mono uppercase font-bold">Thiết kế</span>
                  )}
                  <span className="text-[10px] text-zinc-500 font-mono">• {item.publishTime}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">• {item.source}</span>
                </div>

                <h3 className="text-white text-sm font-extrabold hover:text-accent transition-colors font-sans leading-snug">
                  {item.title}
                </h3>

                <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                  {item.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-850/60 text-[10px] font-mono text-zinc-500 select-none">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>⏱ {item.readTime}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLikeNews(item.id)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-zinc-500 fill-zinc-500/10 hover:fill-red-500 hover:text-red-500 transition-all shrink-0" />
                      <span className="font-extrabold">{item.likes}</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${item.title} - ${item.content}`);
                        if (triggerToast) triggerToast('Đã copy tóm tắt bài báo để chia sẻ!');
                      }}
                      className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title="Chia sẻ nhanh"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right column for hot models directory table listing */}
        <div className="lg:col-span-4 space-y-4 select-none">
          
          <div className="bg-[#09090b] border border-zinc-850 p-4 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-white text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              DANH MỤC GEMINI GOOGLE AI MODELS
            </h3>

            <div className="space-y-3 font-mono text-[10.5px]">
              
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black">Gemini 3.5 Flash</span>
                  <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-black font-mono">NEWEST</span>
                </div>
                <p className="text-zinc-500 text-[9.5px]">Lý tưởng cho Agent tự lập kế hoạch suy luận sâu và gọi APIs hàng loạt.</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200">Gemini 3.0 Pro</span>
                  <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold font-mono">ADVANCED</span>
                </div>
                <p className="text-zinc-500 text-[9.5px]">Hoạt động tinh nhuệ viết tệp mã nguồn phức tạp đa thư mục cấu trúc lớn.</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200">Gemini 2.5 Flash</span>
                  <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold font-mono">STABLE</span>
                </div>
                <p className="text-zinc-500 text-[9.5px]">Độ trễ siêu tốc cực phù hợp cho các tác vụ streaming chatbot real-time.</p>
              </div>

            </div>
          </div>

          <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-850 space-y-3">
            <h4 className="text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-850 pb-2">
              <Zap className="w-3.5 h-3.5 text-[#eab308]" />
              TRẢI NGHIỆM SANDBOX CHẤT LƯỢNG
            </h4>
            <p className="text-[11px] text-zinc-405 leading-relaxed font-sans text-zinc-400">
              Cập nhật tin tức công nghệ sát sườn này giúp bạn lập kế hoạch phát triển dự án đúng hướng, tận dụng các mô hình mã nguồn mở tối ưu lực tải để không lãng phí chi phí vận hành máy chủ Node.js.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
