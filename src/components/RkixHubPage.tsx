import React, { useState, useEffect } from 'react';
import { 
  Globe, Shield, Cpu, Terminal, RefreshCw, Layers, CheckCircle2, 
  Activity, Zap, Network, Cloud, Play, Flame, FileCode, Check, Server
} from 'lucide-react';

interface PipelineLog {
  timestamp: string;
  source: 'ORCHESTRATOR' | 'DOCKER' | 'LINTER' | 'AI_AGENT';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function RkixHubPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'cluster'>('overview');
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [pingMs, setPingMs] = useState<number>(37);
  
  // Real-time console logger
  const [logs, setLogs] = useState<PipelineLog[]>([
    { timestamp: '14:05:12', source: 'ORCHESTRATOR', message: 'RKix 🐼 Hub connection established.', type: 'info' },
    { timestamp: '14:05:15', source: 'AI_AGENT', message: 'Antigravity developer agent model loaded successfully.', type: 'success' },
    { timestamp: '14:05:30', source: 'ORCHESTRATOR', message: 'Proxying traffic safely from active container to localhost:3000.', type: 'info' },
    { timestamp: '14:06:00', source: 'LINTER', message: 'All project dependencies parsed safely without strict flags.', type: 'success' }
  ]);

  // Handle pipeline simulation
  useEffect(() => {
    let interval: any;
    if (pipelineState === 'running') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPipelineState('success');
            setLogs(old => [
              ...old,
              { timestamp: '14:10:02', source: 'DOCKER', message: 'Pipeline build phase succeeded. Compiled dist files.', type: 'success' },
              { timestamp: '14:10:05', source: 'ORCHESTRATOR', message: 'Workspace published to active production gateway.', type: 'success' }
            ]);
            return 100;
          }
          
          // Append continuous log
          if (prev === 20) {
            setLogs(old => [...old, { timestamp: '14:08:10', source: 'LINTER', message: 'Running lint inspections in source code...', type: 'info' }]);
          } else if (prev === 50) {
            setLogs(old => [...old, { timestamp: '14:08:35', source: 'DOCKER', message: 'Bundling server.ts via high performance compiler engine...', type: 'info' }]);
          } else if (prev === 80) {
            setLogs(old => [...old, { timestamp: '14:09:15', source: 'ORCHESTRATOR', message: 'Checking ingress ports status... OK.', type: 'success' }]);
          }

          return prev + 10;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [pipelineState]);

  const handleStartPipeline = () => {
    setProgress(0);
    setPipelineState('running');
    setLogs(old => [
      ...old,
      { timestamp: '14:08:00', source: 'ORCHESTRATOR', message: 'Triggered central pipeline build & test routine.', type: 'info' }
    ]);
  };

  const handleRefreshStats = () => {
    setIsRefreshingStats(true);
    setTimeout(() => {
      setIsRefreshingStats(false);
      setPingMs(Math.floor(Math.random() * 30) + 20);
      setLogs(old => [
        ...old,
        { timestamp: '14:12:00', source: 'ORCHESTRATOR', message: 'Diagnostics refreshed: connection is optimal.', type: 'success' }
      ]);
    }, 600);
  };

  return (
    <div className="p-6 md:p-8 bg-[#f9f9fb] text-zinc-800 h-full min-h-full overflow-y-auto custom-scrollbar select-none animate-fade-in space-y-6 pb-16">
      
      {/* Visual Header Banner */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <span>🐼</span>
            RKix Central Software Hub
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans leading-relaxed">
            Trung tâm kiểm soát luồng hoạt động, cấu hình máy lẻ, quản lý pipelines và cơ cấu mạng nội bộ liên doanh nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefreshStats}
            className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-650 hover:text-zinc-900 hover:border-zinc-300 font-mono text-[10px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingStats ? 'animate-spin' : ''}`} />
            REFRESH CONNECT SUMMARY
          </button>
        </div>
      </div>

      {/* Grid status overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Hub Access Connection</span>
            <Activity className="w-4 h-4 text-indigo-650" />
          </div>
          <p className="text-xl font-black text-indigo-600 font-mono">ONLINE</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-150">
            <span>Server Ping:</span>
            <span className="text-emerald-600 font-bold">{pingMs} ms</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Deployed Projects</span>
            <Layers className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-xl font-black text-zinc-900 font-mono">1 Active</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-150">
            <span>Branch:</span>
            <span className="text-pink-600 font-bold">origin/main</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Pipelines state</span>
            <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <p className="text-xl font-black text-zinc-900 font-mono">
            {pipelineState === 'running' ? 'COMPILING' : pipelineState === 'success' ? 'FINISHED' : 'IDLE'}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-150">
            <span>Lint & Check:</span>
            <span className="text-emerald-650 font-bold">100% Passed</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Ingress Gateway</span>
            <Network className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-zinc-900 font-mono">PORT 3000</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-150">
            <span>Tunnel state:</span>
            <span className="text-indigo-600 font-bold">Secure SSL Proxy</span>
          </div>
        </div>

      </div>

      {/* Main layout splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Controls & Interactive Build workflow */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs header */}
          <div className="flex border-b border-zinc-200 text-xs font-mono">
            {[
              { id: 'overview', label: 'WORKFLOW & CONTROL' },
              { id: 'pipelines', label: 'PIPELINES DOCKER' },
              { id: 'cluster', label: 'CONNECTED CLUSTERS & NODES' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 font-bold transition-all relative cursor-pointer ${
                  activeTab === tab.id ? 'text-indigo-650 border-b-2 border-indigo-600' : 'text-zinc-450 hover:text-zinc-805'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content 1: Overview and Deployment Launcher */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-zinc-900 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-indigo-600" />
                      Trình tạo lập container tích hợp
                    </h3>
                    <p className="text-zinc-500 text-[11px] font-sans">
                      Biên dịch gói mã nguồn JavaScript/TypeScript và đóng gói file Docker an toàn để phân phối dọn dẹp bộ nhớ đệm.
                    </p>
                  </div>
                  
                  <button
                    disabled={pipelineState === 'running'}
                    onClick={handleStartPipeline}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-sans font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1 focus-ring"
                  >
                    <Play className="w-3.5 h-3.5" />
                    KÍCH HOẠT BUILD
                  </button>
                </div>

                {/* Progress bar info */}
                {pipelineState === 'running' && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Đang đóng gói bundle server.ts và assets tối ưu...</span>
                      <span className="text-accent font-black">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                      <div 
                        className="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {pipelineState === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] rounded-lg font-mono flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span><b>Biên dịch thành công!</b> Bạn có thể xem kiểm thử kiến trúc trong cột <b>Source Map (D3)</b> thuộc bảng Repositories.</span>
                  </div>
                )}
              </div>

              {/* Server Nodes health summary */}
              <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4 shadow-xs">
                <h3 className="text-zinc-900 font-bold text-xs font-mono uppercase tracking-wider">Hạ tầng phân phối RKiX Active Node</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10.5px]">
                  
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-150 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-zinc-805 font-bold">Node-A (Primary)</p>
                        <p className="text-[9px] text-zinc-400">IP: 104.18.23.111</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[8.5px]">LIVE</span>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-150 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-pink-600" />
                      <div>
                        <p className="text-zinc-850 font-bold">Node-B (Replica)</p>
                        <p className="text-[9px] text-zinc-400">IP: 104.18.23.112</p>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[8.5px]">LIVE</span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Tab content 2: Direct Pipelines Details */}
          {activeTab === 'pipelines' && (
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden font-mono text-[11px] shadow-xs">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                Quy Trình Pipeline Chi Tiết
              </div>
              <div className="p-4 space-y-4">
                {[
                  { phase: '1. SOUCE_RESOLVER', desc: 'Trích xuất mã nguồn và phân giải các files từ Repository cục bộ.', state: 'SUCCESS' },
                  { phase: '2. DEPS_AUDIT', desc: 'Kiểm toán các gói npm liên thông, dọn dẹp các thư viện lỗi thời.', state: 'SUCCESS' },
                  { phase: '3. ENGINE_COMPILER', desc: 'Dùng esbuild siêu cấp đóng gói máy chủ server.ts thành dist/server.cjs.', state: pipelineState === 'success' ? 'SUCCESS' : pipelineState === 'running' ? 'PENDING' : 'READY' },
                  { phase: '4. INGRESS_DEPLOYMENT', desc: 'Khởi động máy chủ Node.js cục bộ lắng nghe trên cổng 3000.', state: pipelineState === 'success' ? 'SUCCESS' : 'READY' },
                ].map((p, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="space-y-1">
                      <p className="text-zinc-800 font-bold">{p.phase}</p>
                      <p className="text-zinc-500 text-[10px]">{p.desc}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      p.state === 'SUCCESS' ? 'bg-emerald-50 text-emerald-705' :
                      p.state === 'PENDING' ? 'bg-amber-50 text-amber-650 animate-pulse' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {p.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab content 3: Clusters and AI Nodes */}
          {activeTab === 'cluster' && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-xs">
              <h3 className="text-zinc-900 font-bold text-xs font-mono uppercase tracking-wider">
                Mạng Hệ Thống Mở Rộng RKix 🐼 AI Nodes
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-sans">
                Các Agents độc lập liên tục rà soát mã nguồn lỗi cú pháp, tự tìm lỗi bảo mật trên GitHub và đề xuất kéo bản vá thông minh (Self-healing).
              </p>

              <div className="space-y-3 font-mono text-[10.5px]">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-purple-650 font-bold block">● Model Runner agent-linter-01</span>
                    <span className="text-[9.5px] text-zinc-500">Chức năng: Kiểm soát TypeScript strict-mode</span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px]">Uptime: 4d 8h</span>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-pink-650 font-bold block">● Model Runner self-healer-02</span>
                    <span className="text-[9.5px] text-zinc-500">Chức năng: Tự viết mã nguồn vá lỗi compile bảo mật</span>
                  </div>
                  <span className="text-zinc-500 text-[9.5px]">Uptime: 14d 1h</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right column: Active Orchestrator Terminal */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between font-mono">
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                ORCHESTRATOR TELEMETRY STREAM
              </span>
              <span className="text-[8.5px] text-zinc-400">Live</span>
            </div>

            <pre className="p-4 bg-zinc-950 font-mono text-[9.5px] text-zinc-350 leading-relaxed overflow-y-auto max-h-[340px] custom-scrollbar space-y-2">
              {logs.map((l, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[8px] text-zinc-500">
                    <span>{l.timestamp}</span>
                    <span>[{l.source}]</span>
                  </div>
                  <div className={`pl-2 border-l ${
                    l.type === 'success' ? 'text-emerald-400 border-emerald-500' :
                    l.type === 'warning' ? 'text-amber-400 border-amber-500' :
                    l.type === 'error' ? 'text-rose-400 border-rose-500' :
                    'text-zinc-300 border-zinc-700'
                  }`}>
                    {l.message}
                  </div>
                </div>
              ))}
            </pre>
          </div>

          <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-[10px] text-zinc-500 flex justify-between items-center font-mono">
            <span>Log events buffered: <b>{logs.length}</b></span>
            <button 
              onClick={() => setLogs([])}
              className="text-[9px] px-2 py-1 bg-white border border-zinc-200 hover:text-red-600 hover:border-zinc-300 shadow-xs text-zinc-600 transition-all rounded cursor-pointer font-bold"
            >
              CLEAR LOGS
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
