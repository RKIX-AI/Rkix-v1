import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Search, DownloadCloud, Check, HelpCircle, 
  Sparkles, Grid, ArrowRight, Bookmark, Filter, ShieldCheck,
  GitBranch, Laptop, Heart, Wifi, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

interface PackItem {
  id: string;
  name: string;
  version: string;
  creator: string;
  downloads: string;
  size: string;
  category: 'ui' | 'charting' | 'sdk' | 'analytics' | 'system' | 'security';
  platform: 'github' | 'windows';
  description: string;
  isInstalled: boolean;
  imageUrl?: string;
  stars?: number;
}

// Predefined core high-quality curated packages
const CURATED_PACKAGES: PackItem[] = [
  {
    id: 'framer-motion',
    name: 'framer-motion',
    version: '^11.3.2',
    creator: 'Framer Consortium',
    downloads: '5.2M / tuần',
    size: '124 KB',
    category: 'ui',
    platform: 'github',
    description: 'Thư viện dựng hình chuyển động mượt mà và trực quan hóa hoạt ảnh cho React.',
    isInstalled: true,
    stars: 18200
  },
  {
    id: 'google-genai',
    name: '@google/genai',
    version: '^0.1.1',
    creator: 'Google Engineering',
    downloads: '920K / tuần',
    size: '210 KB',
    category: 'sdk',
    platform: 'github',
    description: 'SDK chính thức thế hệ mới để tương tác trực diện với các dòng mô hình Gemini.',
    isInstalled: false,
    imageUrl: '/src/assets/images/google_dev_mockup_1779892705787.png',
    stars: 3400
  },
  {
    id: 'win32-api',
    name: 'win32-api',
    version: '^20.4.0',
    creator: 'Node-Win32 Core Team',
    downloads: '180K / tuần',
    size: '340 KB',
    category: 'system',
    platform: 'windows',
    description: 'Bộ giao tiếp hệ thống Win32 API nâng cao cho phép gọi trực tiếp các hàm từ kernel32.dll, user32.dll và gdi32.dll trong môi trường Node.js.',
    isInstalled: false,
    stars: 1250
  },
  {
    id: 'vscode-extension-sync',
    name: 'vscode-extension-sync',
    version: '^2.1.0',
    creator: 'Microsoft DevTools',
    downloads: '410K / tuần',
    size: '180 KB',
    category: 'ui',
    platform: 'github',
    description: 'Ứng dụng đồng bộ trực tiếp cấu hình phím tắt và môi trường Sandbox với trình soạn thảo VSCode của bạn.',
    isInstalled: false,
    imageUrl: '/src/assets/images/vscode_editor_mockup_1779892726243.png',
    stars: 890
  },
  {
    id: 'node-ffi-napi',
    name: 'node-ffi-napi',
    version: '^4.0.3',
    creator: 'Node Native Platform',
    downloads: '320K / tuần',
    size: '412 KB',
    category: 'system',
    platform: 'windows',
    description: 'Bộ kết nối Foreign Function Interface (FFI) nạp động các thư viện liên kết động Windows DLLs mà không cần biên dịch lại mã nguồn C/C++.',
    isInstalled: false,
    stars: 2840
  },
  {
    id: 'github-actions-trigger',
    name: 'github-actions-trigger',
    version: '^1.5.0',
    creator: 'GitHub Community',
    downloads: '1.2M / tuần',
    size: '95 KB',
    category: 'sdk',
    platform: 'github',
    description: 'Nhanh chóng kết nối và kích hoạt các quy trình tích hợp liên tục tự động (GitHub CI Actions Workflow).',
    isInstalled: false,
    imageUrl: '/src/assets/images/github_dev_mockup_1779892747034.png',
    stars: 4200
  },
  {
    id: 'windows-registry',
    name: 'windows-registry-node',
    version: '^1.4.2',
    creator: 'WinOS Developers',
    downloads: '290K / tuần',
    size: '86 KB',
    category: 'system',
    platform: 'windows',
    description: 'Thư viện đọc dữ liệu an toàn, truy vấn registry Windows (HKCU, HKLM) tốc độ cao và thay đổi khóa cấu hình hệ điều hành Windows.',
    isInstalled: false,
    stars: 950
  },
  {
    id: 'npm-security-scanner',
    name: 'npm-security-scanner',
    version: '^1.0.4',
    creator: 'npm Sec Team',
    downloads: '650K / tuần',
    size: '64 KB',
    category: 'security',
    platform: 'github',
    description: 'Rà soát lỗ hổng bảo mật trực tuyến, cảnh báo dependencies lỗi thời trực diện từ npm Registry.',
    isInstalled: false,
    imageUrl: '/src/assets/images/npm_pkg_mockup_1779892781825.png',
    stars: 1530
  },
  {
    id: 'powershell-commander',
    name: 'powershell-commander',
    version: '^3.1.0',
    creator: 'Microsoft Azure Core',
    downloads: '215K / tuần',
    size: '142 KB',
    category: 'system',
    platform: 'windows',
    description: 'Khởi chạy luồng PowerShell cô lập, truyền và điều phối các tham số hệ thống Windows Host một cách bảo mật.',
    isInstalled: false,
    stars: 740
  },
  {
    id: 'recharts',
    name: 'recharts',
    version: '^2.12.7',
    creator: 'Recharts Org',
    downloads: '1.2M / tuần',
    size: '84 KB',
    category: 'charting',
    platform: 'github',
    description: 'Bộ công cụ vẽ biểu đồ phân tích bento, biểu đồ vùng và báo cáo hiệu suất.',
    isInstalled: true,
    stars: 21500
  },
  {
    id: 'win-toast-notifications',
    name: 'win-toast-notifications',
    version: '^2.0.1',
    creator: 'UWP Shell UX',
    downloads: '140K / tuần',
    size: '62 KB',
    category: 'ui',
    platform: 'windows',
    description: 'Hiển thị thông báo Toast chuẩn gốc Windows 10/11 ngay từ tiến trình ngầm của ứng dụng (System Notification Service).',
    isInstalled: false,
    stars: 620
  },
  {
    id: 'lucide-react',
    name: 'lucide-react',
    version: '^0.415.0',
    creator: 'Lucide Core',
    downloads: '10M / tuần',
    size: '95 KB',
    category: 'ui',
    platform: 'github',
    description: 'Kho chứa biểu tượng đồ họa vector tối giản, sắc nét và nhẹ nhàng.',
    isInstalled: true,
    stars: 9400
  }
];

// Procedural word generator seeds to make "thousands of libraries"
const GITHUB_PREFIXES = ['react', 'vue', 'next', 'vite-plugin', 'tailwind', 'postcss', 'awesome', 'fast', 'easy', 'headless', 'zod', 'd3', 'recharts', 'jwt', 'auth', 'db-core', 'api', 'smart', 'eslint-plugin', 'express', 'node'];
const GITHUB_SUFFIXES = ['helper', 'utils', 'core', 'sdk', 'loader', 'validator', 'charts', 'ui', 'styles', 'formatter', 'parser', 'middleware', 'hooks', 'provider', 'context', 'analytics', 'logger', 'compressor', 'router', 'client'];

const WINDOWS_PREFIXES = ['win32', 'win11', 'uwp', 'winui', 'dotnet', 'registry', 'wmi-query', 'powershell', 'com-activex', 'directx', 'kernel32', 'user32', 'gdi32', 'shell32', 'advapi', 'ntdll', 'ole32', 'ws2-socket', 'msvcrt'];
const WINDOWS_SUFFIXES = ['helper', 'bridge', 'connector', 'wrapper', 'kernel-hook', 'dll-loader', 'registry-helper', 'driver-api', 'com-automation', 'hardware-monitor', 'service-host', 'process-injector', 'audio-endpoint', 'storage-mount', 'security-policy'];

const CREATOR_SEEDS = ['Microsoft Core Devs', 'GitHub OSS Collective', 'TC39 Working Group', 'Vercel Team Alliance', 'SysInternals Lab', 'RedHat Enterprise NuGet', 'OpenJS Foundation', 'Community Contributors', 'Oracle JDK Team', 'RKix Labs'];

const CATEGORIES = ['ui', 'charting', 'sdk', 'analytics', 'system', 'security'] as const;

// Deterministic mock package generator
function generateProceduralPackages(
  query: string,
  platform: 'all' | 'github' | 'windows',
  category: 'all' | 'ui' | 'charting' | 'sdk' | 'analytics' | 'system' | 'security',
  count: number = 30
): PackItem[] {
  const list: PackItem[] = [];
  
  // Use a stable loop but variation using string codes
  for (let i = 0; i < count; i++) {
    const isWindows = platform === 'windows' || (platform === 'all' && i % 2 === 1);
    const targetPlatform = isWindows ? 'windows' : 'github';
    
    // Choose prefix & suffix
    const prefixes = isWindows ? WINDOWS_PREFIXES : GITHUB_PREFIXES;
    const suffixes = isWindows ? WINDOWS_SUFFIXES : GITHUB_SUFFIXES;
    
    const pIndex = (i * 3 + query.length) % prefixes.length;
    const sIndex = (i * 7 + 4) % suffixes.length;
    const cIndex = (i * 11 + 2) % CREATOR_SEEDS.length;
    const catIndex = (i * 13 + i) % CATEGORIES.length;
    
    const assignedCategory = CATEGORIES[catIndex];
    
    // Check if category matches filter
    if (category !== 'all' && assignedCategory !== category) {
      continue;
    }
    
    let generatedName = '';
    if (isWindows) {
      generatedName = `${prefixes[pIndex]}-${suffixes[sIndex]}`;
    } else {
      generatedName = `${prefixes[pIndex]}-${suffixes[sIndex]}`;
    }
    
    // If query exists, inject query to make search highly relevant
    if (query) {
      if (i % 2 === 0) {
        generatedName = `${query.toLowerCase().replace(/\s+/g, '-')}-${suffixes[sIndex]}`;
      } else {
        generatedName = `${prefixes[pIndex]}-${query.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }
    
    const stars = Math.floor(750 + (((i * 473) % 45000)));
    const majorVer = (1 + (i % 12));
    const minorVer = (i % 9);
    const patchVer = ((i * 3) % 15);
    const version = `^${majorVer}.${minorVer}.${patchVer}`;
    const downloads = `${((majorVer * 140) + minorVer).toFixed(0)}K / tuần`;
    const size = `${(35 + (i * 14) % 950)} KB`;
    
    let description = '';
    if (isWindows) {
      description = `Thư viện tích hợp hệ điều hành ${prefixes[pIndex].toUpperCase()} hỗ trợ tính năng ${suffixes[sIndex].replace('-', ' ')} ổn định dưới môi trường sandbox windows app.`;
    } else {
      description = `Gói modules npm hiệu năng cao hỗ trợ xử lý luồng ${prefixes[pIndex]} cùng tiện ích tối ưu hóa cơ cấu ${suffixes[sIndex]}. Kết nối trực tiếp GitHub registry.`;
    }
    
    list.push({
      id: `proc-${targetPlatform}-${generatedName}-${i}`,
      name: generatedName,
      version,
      creator: CREATOR_SEEDS[cIndex],
      downloads,
      size,
      category: assignedCategory,
      platform: targetPlatform,
      description,
      isInstalled: false,
      stars
    });
  }
  
  return list;
}

interface LibraryStorePageProps {
  triggerToast?: (msg: string) => void;
}

export default function LibraryStorePage({ triggerToast }: LibraryStorePageProps) {
  const [curatedPacks, setCuratedPacks] = useState<PackItem[]>(CURATED_PACKAGES);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'github' | 'windows'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'ui' | 'charting' | 'sdk' | 'analytics' | 'system' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [databaseRefreshIndex, setDatabaseRefreshIndex] = useState(0);
  
  // Custom display limit for load more
  const [displayCount, setDisplayCount] = useState(16);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Generate dynamic database items based on current search & tab
  const proceduralPackages = useMemo(() => {
    return generateProceduralPackages(searchQuery, platformFilter, categoryFilter, 400);
  }, [searchQuery, platformFilter, categoryFilter, databaseRefreshIndex]);

  // Combine curated & procedural database items dynamically
  const filteredAllPackages = useMemo(() => {
    // 1. Filter curated first
    const curatedFiltered = curatedPacks.filter(p => {
      const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter;
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.creator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesCategory && matchesSearch;
    });

    // 2. Concat procedural items (avoid duplicating name if already in curated)
    const curatedNames = new Set(curatedFiltered.map(p => p.name));
    const uniqueProcedural = proceduralPackages.filter(p => {
      return !curatedNames.has(p.name);
    });

    return [...curatedFiltered, ...uniqueProcedural];
  }, [curatedPacks, proceduralPackages, platformFilter, categoryFilter, searchQuery]);

  // Paginated/limited view list slice
  const visiblePackages = useMemo(() => {
    return filteredAllPackages.slice(0, displayCount);
  }, [filteredAllPackages, displayCount]);

  const handleInstall = (id: string, name: string) => {
    setInstallingId(id);
    
    // Simulate complex build install routine inside our local sandbox environment system
    setTimeout(() => {
      // If it is inside the curated list, update state
      setCuratedPacks(prev => 
        prev.map(p => p.id === id ? { ...p, isInstalled: true } : p)
      );
      
      setInstallingId(null);
      if (triggerToast) {
        triggerToast(`Đã tải xuống gói ${name} từ nguồn bảo mật và ghi nhận thành công thành phần trong package.json!`);
      }
    }, 1200);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 16);
      setIsLoadingMore(false);
    }, 600);
  };

  const forceRefreshRegistry = () => {
    setDatabaseRefreshIndex(prev => prev + 1);
    if (triggerToast) {
      triggerToast('Đã quét cập nhật đồng bộ lại cổng thư viện GitHub API & Catalog Windows SDK.');
    }
  };

  // Safe category counting dictionary helper
  const getCategoryCount = (cat: typeof categoryFilter) => {
    if (cat === 'all') return 83623;
    if (cat === 'ui') return 24209;
    if (cat === 'charting') return 8150;
    if (cat === 'sdk') return 18742;
    if (cat === 'analytics') return 12510;
    if (cat === 'system') return 15204;
    if (cat === 'security') return 4808;
    return 0;
  };

  return (
    <div className="p-4 md:p-8 bg-[#f9f9fb] text-zinc-700 h-full min-h-full overflow-y-auto custom-scrollbar select-none animate-fade-in space-y-6 pb-16">
      
      {/* Dynamic database scale alert banner upper section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-1">
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 select-none">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Thư viện Hub</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">83,623 Packages</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 select-none">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">GitHub Registry</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">68,419 Verified</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-105 flex items-center justify-center text-blue-600 shrink-0 select-none">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Windows Library</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">15,204 Modules</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 select-none">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">Sandbox Security</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">100% Secure Mode</span>
          </div>
        </div>
      </div>

      {/* Main navigation title */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-bold text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 animate-pulse" />
              Thư viện liên kết Windows & GitHub (Trang kiểm duyệt tối tân)
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans leading-relaxed">
            Tra cứu và khai tử các dependencies lạc hậu, cài đặt tích hợp trên thiết bị hàng ngàn thư viện mở rộng từ nguồn **NPM GitHub Packages** và module **Windows DLL System DLL Wrappers**.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto font-mono text-[10px]">
          <button 
            onClick={forceRefreshRegistry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-250 bg-white text-zinc-650 hover:text-zinc-900 hover:border-zinc-400 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-605" />
            Đồng bộ Cổng (Synch Gateway)
          </button>
        </div>
      </div>

      {/* Platform Multi-Tabs Switcher */}
      <div className="bg-zinc-100 p-1 rounded-xl border border-zinc-200 flex items-center gap-1 w-full max-w-lg select-none shadow-xs">
        <button
          onClick={() => { setPlatformFilter('all'); setDisplayCount(16); }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
            platformFilter === 'all' 
              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-150' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          🌐 Tất cả kho ({(83623).toLocaleString()})
        </button>
        <button
          onClick={() => { setPlatformFilter('github'); setDisplayCount(16); }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
            platformFilter === 'github' 
              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-150' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          🐙 GitHub Packages
        </button>
        <button
          onClick={() => { setPlatformFilter('windows'); setDisplayCount(16); }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
            platformFilter === 'windows' 
              ? 'bg-white text-zinc-950 shadow-xs border border-zinc-150' 
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          💻 Windows OS SDKs
        </button>
      </div>

      {/* Grid containing store lists and categories sidebar descriptor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column sidebar for Quick Filters to look neat and clean */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-zinc-900 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-zinc-150">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              CHỦ ĐỀ THƯ VIỆN
            </h3>
            
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              {[
                { id: 'all', label: 'Tất cả chủ đề' },
                { id: 'ui', label: 'Thiết kế Giao diện (UI)' },
                { id: 'charting', label: 'Biểu đồ D3 / Recharts' },
                { id: 'sdk', label: 'SDK Kết nối API' },
                { id: 'analytics', label: 'Phân tích & Tối ưu hóa' },
                { id: 'system', label: 'Nhân hệ thống / Windows Os' },
                { id: 'security', label: 'Bảo mật Sandbox Scan' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryFilter(cat.id as any); setDisplayCount(16); }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                    categoryFilter === cat.id 
                      ? 'bg-indigo-50 border-l-2 border-indigo-600 text-indigo-700 font-extrabold' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <span className="truncate pr-2">{cat.label}</span>
                  <span className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-650 px-1.5 py-0.5 rounded leading-none font-bold shrink-0">
                    {getCategoryCount(cat.id as any).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3 shadow-xs">
            <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#3b82f6]" />
              CHỈ DẪN PLATFORM KIT
            </div>
            <div className="space-y-2 text-[11px] text-zinc-600 font-sans leading-relaxed">
              <p>
                ● <strong className="text-purple-650">Nguồn GitHub Packages</strong> phân phối các thư viện mã nguồn mở NPM gốc, nạp trực tiếp vào dependencies của workspace Node.js.
              </p>
              <p>
                ● <strong className="text-blue-600">Nguồn Windows Library</strong> sử dụng API ảo hóa giúp ứng dụng liên kết sâu với registry, quản lý audio mixer, nạp tệp tin DLL của máy chủ Windows ảo.
              </p>
            </div>
          </div>
        </div>

        {/* Right column for Store products list */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Internal search inside products container with dynamic count label indicator */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Nhập tên gói cần tìm kiểm bất kỳ (ví dụ: lodash, react, kernel32, user32)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(16); }}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 hover:border-zinc-350 focus:border-indigo-500 transition-colors rounded-xl text-xs font-mono text-zinc-800 placeholder-zinc-405 focus:outline-none shadow-xs"
            />
            {filteredAllPackages.length > 0 && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] bg-zinc-50 px-2 py-0.5 border border-zinc-150 text-zinc-550 font-mono rounded">
                Tìm thấy {filteredAllPackages.length.toLocaleString()} kết quả
              </span>
            )}
          </div>

          {/* Library Cards list */}
          {filteredAllPackages.length === 0 ? (
            <div className="p-12 text-center bg-white border border-zinc-200 border-dashed rounded-xl space-y-3 shadow-xs">
              <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-zinc-500 text-xs font-mono">Không tìm thấy thư viện nào khớp với điều kiện lọc trên cổng.</p>
              <button 
                onClick={() => { setSearchQuery(''); setPlatformFilter('all'); setCategoryFilter('all'); }}
                className="text-indigo-600 underline text-xs font-sans cursor-pointer focus-ring"
              >
                Đặt lại bộ lọc tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visiblePackages.map((pkg) => {
                const isInstalling = installingId === pkg.id;
                
                return (
                  <div 
                    key={pkg.id} 
                    className={`bg-white border rounded-xl p-5 space-y-4 hover:border-zinc-300 hover:bg-zinc-50/20 transition-all flex flex-col justify-between shadow-xs ${
                      pkg.isInstalled ? 'border-zinc-250 bg-zinc-50/50' : 'border-zinc-200'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {pkg.platform === 'github' ? (
                            <span className="text-[9px] bg-purple-50 border border-purple-100 text-purple-650 px-1.5 py-0.5 rounded leading-none shrink-0 font-mono font-bold uppercase">🐙 Github</span>
                          ) : (
                            <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-650 px-1.5 py-0.5 rounded leading-none shrink-0 font-mono font-bold uppercase">❖ Windows</span>
                          )}
                          <span className="text-xs font-extrabold text-zinc-900 font-mono truncate">{pkg.name}</span>
                        </div>
                        
                        {pkg.isInstalled ? (
                          <span className="text-[8px] sm:text-[9px] bg-emerald-50 border border-emerald-150 text-emerald-600 font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                            INSTALLED ✔
                          </span>
                        ) : (
                          <span className="text-[8px] sm:text-[9px] bg-zinc-50 border border-zinc-150 text-zinc-500 font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                            ⭐ {pkg.stars?.toLocaleString() || '150'}
                          </span>
                        )}
                      </div>

                      {pkg.imageUrl && (
                        <div className="w-full h-28 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 relative group my-1.5 selection:bg-transparent">
                          <img 
                            src={pkg.imageUrl} 
                            alt={pkg.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80" />
                        </div>
                      )}

                      <p className="text-zinc-500 text-[11px] leading-relaxed font-sans line-clamp-3">
                        {pkg.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-zinc-400 pt-2 border-t border-zinc-150">
                        <div className="truncate">Nguồn: <span className="text-zinc-650 font-semibold">{pkg.creator}</span></div>
                        <div>Tổng tải: <span className="text-purple-600 font-semibold">{pkg.size}</span></div>
                        <div className="col-span-2">Thống kê: <span className="text-zinc-500 font-semibold">{pkg.downloads}</span></div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {pkg.isInstalled ? (
                        <button 
                          disabled 
                          className="w-full py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-400 font-mono font-bold text-[10px] rounded-lg tracking-wider cursor-not-allowed uppercase flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 text-zinc-400" />
                          Đã liên kết hoạt động
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstall(pkg.id, pkg.name)}
                          disabled={isInstalling}
                          className={`w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[10px] rounded-lg tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase`}
                        >
                          {isInstalling ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full inline-block"></span>
                              <span>Đang tải nạp từ server...</span>
                            </>
                          ) : (
                            <>
                              <DownloadCloud className="w-3.5 h-3.5" />
                              Cài Đặt Package
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button for thousands of libraries searching/exploring */}
          {filteredAllPackages.length > displayCount && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-mono font-bold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95 duration-100 inline-flex items-center gap-2 select-none shadow-xs"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent animate-spin rounded-full inline-block"></span>
                    <span>Đang duyệt cơ sở dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <span>Duyệt thêm thư viện khác (+16)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-500 font-mono mt-2 select-none">
                Đang hiển thị {displayCount} trên tổng số {filteredAllPackages.length.toLocaleString()} packages phù hợp khớp điều kiện.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
