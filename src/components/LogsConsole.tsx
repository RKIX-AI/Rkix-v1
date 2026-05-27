/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Play, RefreshCw, Trash2, Code, Server, Heart, AlertOctagon } from 'lucide-react';
import { ActivityLog } from '../types';

interface LogsConsoleProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  onHealSimulation: (error: string) => void;
  telemetry: {
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
    containerCount: number;
  };
}

export default function LogsConsole({ logs, onClearLogs, onHealSimulation, telemetry }: LogsConsoleProps) {
  const [filter, setFilter] = useState('all');
  const [healingScenario, setHealingScenario] = useState('SyntaxError: Unexpected bracket close in App.tsx');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSimulatingHeal, setIsSimulatingHeal] = useState(false);

  useEffect(() => {
    // Sync activity logs to terminal format
    const formatted = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleTimeString();
      const levelBadge = l.level.toUpperCase().padEnd(7);
      return `[${time}] [${levelBadge}] [${l.module}] ${l.message}`;
    });
    setTerminalOutput(formatted);
  }, [logs]);

  const handleSimulateHealClick = () => {
    if (isSimulatingHeal) return;
    setIsSimulatingHeal(true);
    
    // Fire event to update backend DB state
    onHealSimulation(healingScenario);

    // Dynamic terminal live simulation stream logger
    const steps = [
      `>>> [AGENT MONITOR] RUNNING SYSTEM TELEMETRY INTEGRITY AUDIT...`,
      `[ALERT] SYSTEM CRASH SCENARIO CAPTURED: ${healingScenario}`,
      `>>> [PLANNER] INTERRUPTING CURRENT WORKFLOW & COMPILING DEVIATION STRUCT...`,
      `>>> [SOLVER ENGINES] COMPARING AST TREES FOR SYNTAX VERIFICATION...`,
      `[DETECTED] MISSING OR INCORRECT SYNTAX TOKEN AT SPECIFIC COORDINATE.`,
      `>>> [PATCHER] DRAFTING SELF-HEALING HOT-FIX PAYLOAD...`,
      `[SUCCESS] INJECTED CODE CORRECTION PATCH INTO APP.TSX LIVE RUNTIME.`,
      `>>> [RE-COMPILING] SPINNING VITE DEV RE-RUN... SUCCESS! SANDBOX IS FULLY LIVE.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalOutput(prev => [step, ...prev]);
        if (idx === steps.length - 1) {
          setIsSimulatingHeal(false);
        }
      }, (idx + 1) * 800);
    });
  };

  const getLogClass = (line: string) => {
    if (line.includes('[ERROR') || line.includes('[ALERT')) return 'text-red-400';
    if (line.includes('[SUCCESS') || line.includes('SUCCESS!')) return 'text-emerald-400 font-bold';
    if (line.includes('[WARN')) return 'text-amber-400';
    if (line.includes('>>>')) return 'text-[#818cf8]';
    return 'text-gray-300';
  };

  const filteredLogsList = terminalOutput.filter(line => {
    if (filter === 'all') return true;
    if (filter === 'error') return line.includes('ERROR') || line.includes('ALERT');
    if (filter === 'success') return line.includes('SUCCESS');
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e] text-[#f4f4f5] font-mono p-6 overflow-hidden">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 shrink-0 select-none">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 tracking-tight uppercase">
            <span>🐼</span>
            RKix Telemetry and Console Terminal
          </h2>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Real-time execution streams logs synchronized from the orchestrator workflow pipeline engine.
          </p>
        </div>

        {/* Console headers filter */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer focus-ring ${filter === 'all' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('error')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer focus-ring ${filter === 'error' ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'text-zinc-400 hover:text-white'}`}
          >
            Sự cố / Lỗi
          </button>
          <button 
            onClick={() => setFilter('success')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer focus-ring ${filter === 'success' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' : 'text-zinc-400 hover:text-white'}`}
          >
            Thắng lợi
          </button>
          <button 
            onClick={onClearLogs}
            className="p-1 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors focus-ring"
            title="Clean Terminal logs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Thống kê logs
          </button>
        </div>
      </div>

      {/* Grid of Sandbox Actions & Console Logs Output */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 min-h-0">
        
        {/* LEFT column: Quick sandbox self-healing simulations controllers */}
        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between shrink-0 bg-zinc-900 border border-zinc-850 p-5 rounded-lg max-h-full overflow-y-auto custom-scrollbar select-none text-xs standard-shadow-sm">
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-xs flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Shield className="w-4 h-4 text-accent shrink-0" />
              Self-Healing Orchestrator
            </h3>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Chào mừng tới module **Tự Phục Hồi Sandbox**. Hệ thống tự động bắt lỗi code, khởi thông luồng suy nghĩ và cập nhật bản sửa lỗi (Refactor) tức thì mà không cần bạn can thiệp.
            </p>

            {/* Selector scenarios */}
            <div className="space-y-2">
              <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[9px]">Chọn kịch bản rủi ro để Test:</label>
              <select
                value={healingScenario}
                onChange={(e) => setHealingScenario(e.target.value)}
                disabled={isSimulatingHeal}
                className="w-full bg-[#18181b] text-zinc-350 p-2.5 rounded-lg border border-zinc-800 text-[11px] cursor-pointer focus-ring"
              >
                <option value="SyntaxError: Unexpected bracket close in KanbanBoard.tsx">KanbanBoard syntax break</option>
                <option value="TypeError: Cannot read properties of undefined (reading 'file_url') in TaskModal">Nullpointer on file_url</option>
                <option value="AuthMiddlewareError: Verification token bypass detected in admin console route">Vấn đề Authentication (Port 3000 Security risk)</option>
                <option value="OutOfMemoryError: Container task quota threshold exceeded limits">Quá tải bộ nhớ Sandbox RAM limit</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleSimulateHealClick}
              disabled={isSimulatingHeal}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 text-zinc-900 disabled:text-zinc-500 font-bold font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 focus-ring"
            >
              {isSimulatingHeal ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                  ĐANG SỬA ĐỒNG BỘ...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-accent font-bold fill-accent" />
                  Kích Hoạt Vá Lỗi Tự Động
                </>
              )}
            </button>
          </div>

          {/* Infrastructure specs below */}
          <div className="pt-4 border-t border-zinc-800/85 space-y-2.5 font-mono text-[10px]">
            <h4 className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
              <Server className="w-3 h-3 text-blue-500" /> Eios Machine Spec
            </h4>
            <div className="space-y-1 text-zinc-500">
              <div className="flex justify-between"><span>Container Runtime:</span> <span className="text-zinc-300 font-semibold">Docker Sandbox (Isolate)</span></div>
              <div className="flex justify-between"><span>Local IP Ingress:</span> <span className="text-zinc-300 font-semibold">0.0.0.0</span></div>
              <div className="flex justify-between"><span>Incoming Bind:</span> <span className="text-blue-500 font-semibold">Port 3000 Only</span></div>
              <div className="flex justify-between"><span>Uptime:</span> <span className="text-zinc-300 font-semibold">{telemetry.uptime} giây</span></div>
              <div className="flex justify-between"><span>Orchestrator Agent:</span> <span className="text-blue-400 font-semibold">RKix v4 🐼</span></div>
            </div>
            
            <div className="p-2.5 rounded bg-blue-500/5 border border-zinc-800 text-zinc-400 text-[10px] leading-relaxed font-sans flex gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-blue-500 self-start" />
              <span>Cổng 3000 được bảo vệ bởi rào chắn Ingress. Các API key của Gemini được mã hóa ẩn kín an toàn ở Server.</span>
            </div>
          </div>
        </div>

        {/* RIGHT 2 columns: Immersive black scrolling console log */}
        <div className="lg:col-span-2 flex flex-col bg-black border border-zinc-800 rounded-lg p-5 overflow-hidden h-full">
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-850 shrink-0 text-xs">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase font-mono">
              <span className="w-2.5 h-2.5 rounded bg-blue-500 text-black text-[8px] font-bold flex items-center justify-center animate-pulse">●</span>
              RKix_Orchestrator_Terminal_v4:~ 🐼
            </span>
            <span className="text-[10px] text-zinc-650 font-mono">ENCODING: UTF-8</span>
          </div>

          {/* Logs lines stream output */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 pl-1 custom-scrollbar text-[11px] leading-relaxed font-mono select-text selection:bg-zinc-800">
            {filteredLogsList.length === 0 ? (
              <div className="text-zinc-600 h-full flex items-center justify-center font-mono">
                [SYSTEM IDLE] Chưa có telemetry logs đồng bộ nào được phát ra.
              </div>
            ) : (
              filteredLogsList.map((line, idx) => (
                <div key={idx} className={`${getLogClass(line)} hover:bg-[#0c0f1b]/5 p-1 rounded transition-colors`}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
