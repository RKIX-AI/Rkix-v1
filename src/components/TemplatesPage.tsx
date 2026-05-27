import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, Search, Copy, Check, Eye, Code, Sparkles, 
  Compass, Layout, Server, Database, ShoppingCart, Globe, Heart, Share2, HelpCircle, Plus, Send
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'fullstack' | 'api' | 'utility';
  difficulty: 'Beginner' | 'Intermediate' | 'Enterprise';
  stars: number;
  components: number;
  tags: string[];
  htmlSnippet: string;
  imageUrl?: string;
  heartCount?: number;
  useCount?: number;
}

interface TemplatesPageProps {
  onRefreshWorkspace?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function TemplatesPage({ onRefreshWorkspace, triggerToast }: TemplatesPageProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'frontend' | 'fullstack' | 'api' | 'utility'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>('google-integration');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importedTemplates, setImportedTemplates] = useState<string[]>([]);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // New project creation state
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCat, setNewProjCat] = useState<'frontend' | 'fullstack' | 'api' | 'utility'>('fullstack');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error('Error fetching templates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/templates/${id}/heart`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
        }
        if (triggerToast) {
          triggerToast('Thắt chặt liên kết! Đã gửi tim yêu thích mẫu lên cộng đồng 🐼');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportWorkspace = async (id: string, name: string) => {
    if (importedTemplates.includes(id)) return;
    setImportedTemplates(prev => [...prev, id]);
    
    try {
      const res = await fetch(`/api/templates/${id}/use`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (triggerToast) {
      triggerToast(`Đã nạp thành công mã nguồn "${name}" và tăng lượt nhân bản của cộng đồng!`);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      if (triggerToast) triggerToast('Vui lòng nhập tên dự án!');
      return;
    }
    setIsCreating(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjName,
          description: newProjDesc,
          category: newProjCat
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.templates) {
          setTemplates(data.templates);
        }
        if (onRefreshWorkspace) {
          onRefreshWorkspace();
        }
        
        setNewProjName('');
        setNewProjDesc('');
        if (triggerToast) {
          triggerToast(`Dự án "${newProjName}" khởi tạo thành công & Bản sao lưu đã đồng bộ up Trang Mẫu!`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Filtering and sorting templates (prioritizing cloned count + hearts)
  // "dự án nào đc cộng đồng sử dụng nhiều và tim nhiều sẽ được ưu tiên vị trí đầu tiên"
  const filteredTemplates = useMemo(() => {
    const list = templates.filter(t => {
      const matchesCat = activeCategory === 'all' || t.category === activeCategory;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });

    // Sort: (useCount + heartCount) DESC
    return list.sort((a, b) => {
      const scoreA = (a.useCount || 0) + (a.heartCount || 0);
      const scoreB = (b.useCount || 0) + (b.heartCount || 0);
      return scoreB - scoreA;
    });
  }, [templates, activeCategory, searchQuery]);

  const handleCopyCode = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'Intermediate': return 'text-amber-705 bg-amber-50 border border-amber-100';
      case 'Enterprise': return 'text-indigo-700 bg-indigo-50 border border-indigo-100';
      default: return 'text-zinc-650 bg-zinc-50 border border-zinc-200';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f9f9fb] text-zinc-700 h-full min-h-full overflow-y-auto custom-scrollbar select-none animate-fade-in space-y-6 pb-16">
      
      {/* Banner Header with Premium Light style */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm md:text-base font-bold text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-650 animate-spin-slow shrink-0" />
            Trang mẫu dự án cộng đồng (Yêu thích & Ưu tiên sắp xếp)
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans leading-relaxed">
            Hệ thống tự động sao chép một bản thiết kế mẫu lên cổng đóng góp của cộng đồng cho bất kỳ dự án mới nào được tạo lập. Các dự án có lượt Tim nhiều và clone nhiều được sắp lên vị trí đầu tiên **thời gian thực**.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-1 bg-purple-50 border border-purple-150 text-purple-700 font-semibold rounded-lg shadow-xs">
            ⚡ {templates.length} TEMPLATES TIỂU CHUẨN
          </span>
        </div>
      </div>

      {/* Main Grid layout containing Project creator form, filter sidebar & lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Create project & Filters */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Quick interactive project creator */}
          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center gap-1.5 border-b border-zinc-150 pb-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shrink-0"></span>
              <h3 className="text-zinc-900 text-[11px] font-mono font-bold uppercase tracking-wider">
                TẠO DỰ ÁN MỚI NHANH
              </h3>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight block">Tên dự án *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: RKix Web Sandbox..."
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-lg focus:outline-none focus:border-indigo-500 text-[11px] placeholder-zinc-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight block">Mô tả tóm tắt</label>
                <textarea 
                  placeholder="Mô tả các tính năng cốt lõi..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-lg focus:outline-none focus:border-indigo-500 text-[11px] placeholder-zinc-404 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight block">Chuyên mục mẫu</label>
                <select
                  value={newProjCat}
                  onChange={(e) => setNewProjCat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-805 rounded-lg focus:outline-none focus:border-indigo-500 text-[11px] font-mono"
                >
                  <option value="fullstack">💻 Fullstack Core</option>
                  <option value="frontend">🎨 Frontend UI</option>
                  <option value="api">🔌 API Proxy Web</option>
                  <option value="utility">🔧 Tiện ích Tool</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 font-mono font-bold text-white rounded-lg tracking-wider transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer shadow-xs uppercase text-[10px]"
              >
                {isCreating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full inline-block"></span>
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Tạo & Đồng bộ mẫu
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3.5 shadow-xs">
            <h4 className="text-zinc-900 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              QUY CHẾ ƯU TIÊN SẮP XẾP
            </h4>
            <div className="text-[11px] text-zinc-650 leading-relaxed space-y-2">
              <p>
                🧡 Bất kỳ thành viên nào tạo lập mô-đun phát triển sẽ tự nhân bản sang trang mẫu này.
              </p>
              <p>
                🔥 Hệ thống sắp xếp dựa trên tổng điểm: <code className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded font-bold font-mono">Lượt sử dụng + Lượt Tim</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Filters, Search, list and Interactive Preview details */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Quick Search and Tabs Panel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white border border-zinc-200 p-3 rounded-lg shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-450 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm mẫu dự án, thẻ tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 focus:border-indigo-500 transition-colors rounded-lg text-xs font-mono text-zinc-800 placeholder-zinc-405 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1 bg-zinc-100 p-0.5 border border-zinc-200 rounded-lg text-[10px] font-mono">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'frontend', label: 'BẢNG UI' },
                { id: 'fullstack', label: 'FULLSTACK' },
                { id: 'api', label: 'APIs PROXY' },
                { id: 'utility', label: 'TIỆN ÍCH' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                    activeCategory === tab.id 
                      ? 'bg-white text-zinc-950 font-black shadow-xs border border-zinc-150' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Layout containing Templates list & side preview */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            
            <div className="xl:col-span-8 space-y-4">
              {loading ? (
                <div className="p-12 text-center text-zinc-400 font-mono text-xs">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                  Đang tải danh sách mẫu dự án thực tế...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-12 text-center bg-white border border-dashed border-zinc-200 rounded-xl space-y-3 font-mono text-xs shadow-xs">
                  <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-zinc-500">Không tìm thấy mã nguồn mẫu phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((tpl, idx) => {
                    const isImported = importedTemplates.includes(tpl.id);
                    const isPreviewActive = previewTemplateId === tpl.id;
                    const combinedScore = (tpl.useCount || 0) + (tpl.heartCount || 0);

                    return (
                      <div 
                        key={tpl.id} 
                        onClick={() => setPreviewTemplateId(tpl.id)}
                        className={`bg-white border rounded-xl p-4.5 space-y-3.5 hover:border-zinc-300 transition-all flex flex-col justify-between cursor-pointer shadow-xs ${
                          isPreviewActive ? 'ring-1 ring-indigo-505/30 border-indigo-505 bg-indigo-50/10' : 'border-zinc-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {idx === 0 && combinedScore > 2 && (
                                <span className="text-[8px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide animate-pulse h-4 flex items-center">
                                  🔥 Xu hướng đầu trùm
                                </span>
                              )}
                              <span className={`text-[8.5px] px-1.5 py-0.5 font-mono font-bold border rounded-sm h-4 flex items-center`}>
                                <span className={getDifficultyColor(tpl.difficulty).split(' ')[0]}>
                                  {tpl.difficulty}
                                </span>
                              </span>
                            </div>

                            <button 
                              onClick={(e) => handleLike(tpl.id, e)}
                              className="flex items-center gap-1 group text-[9.5px] font-mono text-zinc-450 hover:text-red-550 transition-colors"
                              title="Yêu thích (Thả tim)"
                            >
                              <Heart className="w-3.5 h-3.5 text-zinc-405 group-hover:text-red-500 group-hover:fill-red-500 transition-colors shrink-0" />
                              <span className="font-extrabold text-zinc-550">{tpl.heartCount || 0}</span>
                            </button>
                          </div>

                          {tpl.imageUrl && (
                            <div className="w-full h-28 rounded-lg overflow-hidden border border-zinc-200 bg-white relative my-1">
                              <img 
                                src={tpl.imageUrl} 
                                alt={tpl.title} 
                                className="w-full h-full object-cover pointer-events-none"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80" />
                            </div>
                          )}

                          <h3 className="text-zinc-900 font-bold text-xs font-mono flex items-center gap-1 truncate" title={tpl.title}>
                            {tpl.title}
                            {tpl.id.includes('google') && <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />}
                          </h3>

                          <p className="text-zinc-505 text-[10.5px] leading-relaxed font-sans line-clamp-2">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-1.5">
                          {/* Tags & Community usage bar counters */}
                          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 bg-zinc-50 p-1.5 rounded border border-zinc-150">
                            <div>Đã nhân bản: <span className="text-indigo-600 font-bold">{(tpl.useCount || 0).toLocaleString()}</span></div>
                            <div>Xếp điểm: <span className="text-purple-650 font-bold">{combinedScore}</span></div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-150 text-[9.5px] font-mono">
                            <button
                              type="button"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(tpl.id, tpl.htmlSnippet);
                              }}
                              className="py-1 px-2 text-center bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-all rounded flex items-center justify-center gap-1 cursor-pointer font-bold"
                            >
                              {copiedId === tpl.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-650">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Sao chép mã
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isImported}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImportWorkspace(tpl.id, tpl.title);
                              }}
                              className={`py-1 px-2 text-center transition-all rounded flex items-center justify-center gap-1 cursor-pointer font-extrabold ${
                                isImported 
                                  ? 'bg-emerald-50 border border-emerald-150 text-emerald-600 cursor-not-allowed' 
                                  : 'bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                              }`}
                            >
                              {isImported ? 'Đã Nhập ✔' : 'Sử dụng mẫu'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side live layout simulator component */}
            <div className="xl:col-span-4 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                <div className="px-4 py-3 border-b border-zinc-150 bg-zinc-50 flex items-center justify-between select-none">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    MÔ PHỎNG LAYOUT CHUẨN
                  </span>
                  <span className="text-[9px] text-zinc-450 font-mono uppercase">Preview Mode</span>
                </div>

                <div className="p-4 space-y-4">
                  {previewTemplateId ? (
                    <>
                      {(() => {
                        const activeTpl = templates.find(t => t.id === previewTemplateId);
                        if (!activeTpl) return null;
                        return (
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs text-zinc-900 font-bold font-mono uppercase tracking-tight">{activeTpl.title}</h4>
                              <p className="text-[10px] text-zinc-455 font-sans mt-0.5">Màn hình xem thử trực tuyến giao diện:</p>
                            </div>

                            {/* Render Container */}
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl min-h-[150px] flex items-center justify-center relative overflow-hidden">
                              <div className="w-full text-zinc-800" dangerouslySetInnerHTML={{ __html: activeTpl.htmlSnippet }} />
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white border border-zinc-200 text-zinc-500 font-mono text-[8px] font-bold uppercase tracking-widest leading-none pointer-events-none rounded select-none shadow-xs">
                                Sandboxed Sandbox View
                              </div>
                            </div>

                            {/* Code snippet text inspector */}
                            <div className="space-y-1.5">
                              <label className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center gap-1 leading-none">
                                <Code className="w-3 h-3 text-indigo-600" />
                                CÔNG CỤ XEM MÃ:
                              </label>
                              <div className="relative">
                                <pre className="p-2.5 bg-zinc-50 text-zinc-650 font-mono text-[9px] leading-relaxed rounded-lg overflow-x-auto max-h-[140px] custom-scrollbar border border-zinc-200 shadow-xs">
                                  {activeTpl.htmlSnippet}
                                </pre>
                                <button
                                  onClick={() => handleCopyCode(activeTpl.id, activeTpl.htmlSnippet)}
                                  className="absolute top-1 right-1 p-1 bg-white border border-zinc-205 hover:bg-zinc-50 rounded text-zinc-450 hover:text-zinc-700 cursor-pointer shadow-xs"
                                  title="Copy"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="py-12 text-center text-zinc-400 font-mono text-[10px] space-y-2">
                      <Layout className="w-8 h-8 text-zinc-300 mx-auto animate-pulse" />
                      <p>Hãy click chọn một mẫu dự án để thực hiện xem thử.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-150 space-y-3">
                <div className="text-[10px] font-mono text-zinc-500 leading-relaxed select-none">
                  💡 Nhấn nút bên dưới để tiến hành nạp sao chép bộ khung mẫu này trực tiếp vào tiến trình làm việc.
                </div>

                <button 
                  onClick={() => {
                    if (previewTemplateId) {
                      const activeTpl = templates.find(t => t.id === previewTemplateId);
                      if (activeTpl) {
                        handleImportWorkspace(activeTpl.id, activeTpl.title);
                      }
                    }
                  }}
                  className="w-full py-2 bg-indigo-600 font-bold hover:bg-indigo-700 text-white font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider text-[11px]"
                >
                  Sử dụng mẫu dự án này <Check className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
