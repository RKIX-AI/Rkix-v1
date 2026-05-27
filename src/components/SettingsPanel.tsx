/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Key, Info, RefreshCw, Layers, Cpu, Radio, Shield, Server, Activity, 
  Settings, Sliders, ToggleLeft, ToggleRight, Check, AlertCircle, 
  Trash2, Play, Globe, Eye, EyeOff, Bell, Gauge, Palette, Zap
} from 'lucide-react';

interface SecretItem {
  key: string;
  value: string;
  description: string;
  isSystem?: boolean;
}

interface SettingsPanelProps {
  secrets: SecretItem[];
  onSaveSecret: (key: string, value: string, desc: string) => void;
  telemetry: {
    status: string;
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
  };
  triggerToast: (msg: string) => void;
  currentLanguage: 'vi' | 'en' | 'jp';
  onLanguageChange: (lang: 'vi' | 'en' | 'jp') => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export default function SettingsPanel({
  secrets,
  onSaveSecret,
  telemetry,
  triggerToast,
  currentLanguage,
  onLanguageChange,
  accentColor,
  onAccentColorChange,
  zoomLevel,
  onZoomChange
}: SettingsPanelProps) {
  // Local state for secret visibility toggles
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [editingSecretKey, setEditingSecretKey] = useState<string | null>(null);
  const [tempSecretValue, setTempSecretValue] = useState('');

  const colors = [
    { name: 'blue', text: 'Classic Blue', class: 'bg-[#3b82f6]' },
    { name: 'emerald', text: 'Green Emerald', class: 'bg-[#10b981]' },
    { name: 'amber', text: 'Orange Amber', class: 'bg-[#f59e0b]' },
    { name: 'purple', text: 'Royal Purple', class: 'bg-[#a855f7]' },
    { name: 'zinc', text: 'Monochrome Slate', class: 'bg-[#f4f4f5]' }
  ];

  // Diagnostic states
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [isCleaningCache, setIsCleaningCache] = useState(false);

  // Webhook states
  const [discordNotify, setDiscordNotify] = useState(true);
  const [slackNotify, setSlackNotify] = useState(false);
  const [watchdogEnabled, setWatchdogEnabled] = useState(true);

  // Simulation parameters
  const [mockLatency, setMockLatency] = useState(250);
  const [logsInterval, setLogsInterval] = useState(3);

  // Localization strings
  const t = {
    vi: {
      title: 'RKIX WORKSPACE CONSOLE & TIỆN ÍCH',
      desc: 'Quản lý biến môi trường, bảo mật cô lập và tùy chỉnh hành vi lập trình của sandbox container.',
      apiTitle: 'QUẢN LÝ BIẾN MÔI TRƯỜNG SECRETS',
      apiDesc: 'Biến mật mã server-side bảo mật. GEMINI_API_KEY được giữ ẩn kín tại máy chủ để tránh bị lộ ở Client.',
      cacheTitle: 'DỌN DẸP HỘP CÁT & CACHE',
      cacheDesc: 'Đồng bộ hóa lại, dọn dẹp các artifact rác trong thư mục build tạm thời.',
      cacheBtn: 'Dọn Dẹp Build Cache',
      cacheSuccess: 'Dọn dẹp cache của sandbox thành công! Giải phóng 124MB bộ nhớ đệm.',
      pingTitle: 'DIAGNOSTIC BINDING PORT 3000',
      pingBtn: 'Kiểm Tra Kết Nối Ingress',
      pinging: 'Đang ping...',
      pingSuccess: 'Kết nối an toàn! Ingress phản hồi sau',
      webhooksTitle: 'ĐỒNG BỘ THÔNG BÁO WEBHOOK (SIMULATOR)',
      discordLabel: 'Đồng bộ debug qua Discord Webhook',
      slackLabel: 'Đồng bộ telemetry logs qua Slack',
      watchdogLabel: 'Watchdog tự động vá lỗi (Self-healing AI)',
      latencyTitle: 'MÔ PHỎNG LATENCY API (MOCK CONTROLLER)',
      latencyDesc: 'Điều chỉnh thời gian chờ giả lập của Sandbox API.',
      themeTitle: 'TÙY BIẾN MÀU SẮC CHỦ ĐỀ ACCENT',
      langTitle: 'NGÔN NGỮ HỆ THỐNG GIAO DIỆN',
      saveBtn: 'Lưu',
      editBtn: 'Sửa',
      systemBadge: 'HỆ THỐNG',
      systemLabel: 'Yêu cầu API Key hợp lệ cho các kịch bản AI.'
    },
    en: {
      title: 'RKIX WORKSPACE CONSOLE & UTILITIES',
      desc: 'Manage environment variables, sandbox security, and customize build runtime behavior.',
      apiTitle: 'WORKSPACE ENVIRONMENT SECRETS',
      apiDesc: 'Secure server-side credentials. GEMINI_API_KEY is held securely inside host config to prevent browser leakage.',
      cacheTitle: 'SANDBOX CACHE & DECOY RUNS',
      cacheDesc: 'Synchronize builds, clean auxiliary artifacts in temporary directories.',
      cacheBtn: 'Clean Build Cache',
      cacheSuccess: 'Sandbox cache cleared successfully! Reclaimed 124MB buffers.',
      pingTitle: 'PORT 3000 INGRESS DIAGNOSTIC',
      pingBtn: 'Test Ingress Ping',
      pinging: 'Pinging ingress...',
      pingSuccess: 'Secure handshake! Ingress returned in',
      webhooksTitle: 'SIMULATED TELEMETRY WEBHOOKS',
      discordLabel: 'Pipe debug logs to Discord channel',
      slackLabel: 'Pipe telemetry trends to Slack workflow',
      watchdogLabel: 'Auto-Watchdog self-healing worker',
      latencyTitle: 'MOCK API LATENCY STRETCH',
      latencyDesc: 'Tune mock network simulation response latency.',
      themeTitle: 'THEME COLOR ACCENT SPECIFICATION',
      langTitle: 'WORKSPACE CONSOLE LANGUAGE',
      saveBtn: 'Save',
      editBtn: 'Edit',
      systemBadge: 'SYSTEM',
      systemLabel: 'API Key requirements for autonomous AI modules.'
    },
    jp: {
      title: 'RKIX ワークスペース コンソール & ユーティリティ',
      desc: '環境変数の管理、サンドボックスセキュリティの設定、およびランタイム動作のカスタマイズ。',
      apiTitle: 'セキュリティ環境変数シークレット',
      apiDesc: '安全なサーバー側認証情報。GEMINI_API_KEY は、クライアント側への漏出を防ぐためホストに保護されています。',
      cacheTitle: 'キャッシュクリーン & ビルド再構築',
      cacheDesc: '一時ビルドフォルダ内の不要な成果物のクリーンアップおよび完全同期。',
      cacheBtn: 'ビルドキャッシュのクリア',
      cacheSuccess: 'サンドボックスキャッシュを正常にクリアしました！ 124MBの空き。',
      pingTitle: 'ポート 3000 イングレス・診断',
      pingBtn: '接続テストを実行',
      pinging: '実行中...',
      pingSuccess: 'セキュアハンドシェイクを検出！ イングレス応答：',
      webhooksTitle: 'シミュレートされたウェブフック制御',
      discordLabel: 'デバッグログをDiscordに直接パイプする',
      slackLabel: '統計テレメトリログをSlackに同期する',
      watchdogLabel: 'AI自動修復ウォッチドッグ（Self-healing）',
      latencyTitle: '応答遅延の仮想シミュレーター',
      latencyDesc: '仮想オーケストレータAPIの応答時間の調整。',
      themeTitle: 'システムハイライトテーマカラー',
      langTitle: 'コンソールロケール言語設定',
      saveBtn: '保存',
      editBtn: '編集',
      systemBadge: 'システム',
      systemLabel: 'AIオペレーションに関連する主要なアクセスキー。'
    }
  }[currentLanguage];

  const handleTestIngress = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 45) + 5;
      setPingResult(ms);
      setIsPinging(false);
      triggerToast(`${t.pingSuccess} ${ms}ms.`);
    }, 800);
  };

  const handleCleanCache = () => {
    setIsCleaningCache(true);
    setTimeout(() => {
      setIsCleaningCache(false);
      triggerToast(t.cacheSuccess);
    }, 1500);
  };

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startEditSecret = (key: string, currentVal: string) => {
    setEditingSecretKey(key);
    setTempSecretValue(currentVal);
  };

  const saveEditedSecret = (key: string, desc: string) => {
    onSaveSecret(key, tempSecretValue, desc);
    setEditingSecretKey(null);
  };

  return (
    <div className="p-6 md:p-8 bg-[#f9f9fb] text-zinc-700 min-h-full overflow-y-auto custom-scrollbar text-xs space-y-6 animate-fade-in">
      
      {/* Upper header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2 uppercase">
            <Settings className="w-5 h-5 text-indigo-600 shrink-0" />
            {t.title}
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans leading-relaxed">
            {t.desc}
          </p>
        </div>

        {/* Floating sandbox badge specs */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-3 py-1 rounded-lg bg-white border border-zinc-200 text-indigo-600 font-bold flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> LATENCY: {mockLatency}ms
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-zinc-200 text-emerald-600 font-bold shadow-sm">
            ● CONTAINER ONLINE
          </span>
        </div>
      </div>

      {/* Grid of Widgets (Two columns on desktop, single column on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Deep developer configurations, diagnostics, switches (Lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* RKIX PIPELINE SYSTEM STATUS BAR (TRANG TIỆN ÍCH INTEGRATION) */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-bold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              HỆ THỐNG ĐƯỜNG TRUYỀN PIPELINES PHÁT TRIỂN RKix
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Trạng thái của các luồng xử lý AI & biên dịch mã nguồn tự động của RKix.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">Phân Tích Ý Định (Intent Analysis)</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Đã Xác Thực (Verified)
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">Bản Đồ Kế Hoạch (LLM Planner)</span>
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Lên Lịch Công Việc (Scheduling Tasks)
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">Trình Tạo Code AI (Code Gen)</span>
                <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Đang Xử Lý (Processing)
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">Môi Trường Thực Tế (Prod Live)</span>
                <div className="flex items-center gap-1.5 text-zinc-650 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                  Hoạt Động Ổn Định (Live Stable)
                </div>
              </div>
            </div>
          </div>

          {/* Accent customization & language switcher box widget */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              {t.themeTitle}
            </h3>

            {/* Accent theme circles */}
            <div className="flex flex-wrap gap-2 pt-1">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    onAccentColorChange(c.name);
                    triggerToast(`Chủ đề Accent đã chuyển sang: ${c.text}`);
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 border text-[11px] font-medium transition-all cursor-pointer focus-ring hover:scale-[1.01] ${
                    accentColor === c.name 
                      ? 'bg-zinc-105 border-zinc-300 text-zinc-900 shadow-sm font-bold' 
                      : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-850'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.class}`} />
                  {c.text}
                </button>
              ))}
            </div>

            {/* Language switcher dropdown component */}
            <div className="pt-4 border-t border-zinc-150 space-y-3">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5 select-none">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> {t.langTitle}
              </label>
              <div className="flex gap-3">
                {(['vi', 'en', 'jp'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      triggerToast(`Đã thay đổi ngôn ngữ sang: ${lang.toUpperCase()}`);
                    }}
                    className={`flex-1 py-2 rounded-lg border text-[11px] font-mono tracking-wide font-bold transition-all cursor-pointer uppercase focus-ring ${
                      currentLanguage === lang
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-650'
                        : 'border-zinc-200 text-zinc-500 hover:border-zinc-350 hover:text-zinc-800'
                    }`}
                  >
                    {lang === 'vi' ? 'Tiếng Việt🇻🇳' : lang === 'en' ? 'English🇺🇸' : '日本の🇯🇵'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COMPACT LAYOUT ZIP ZOOM STYLING SETTINGS (HIDDEN BY USER REQUEST) */}
          {/* 
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-xl space-y-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                ĐIỀU CHỈNH MẬT ĐỘ BỐ CỤC ZOOM
              </h3>
              <p className="text-[10.5px] text-zinc-500 font-sans leading-relaxed">
                Giảm tỷ lệ thu phóng (Zoom out) để có giao diện siêu gọn (Compact) phù hợp phân giải màn hình laptop 12 inch thon nhỏ.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-zinc-400 font-bold">Workspace Scale:</span>
                <span className="text-accent font-extrabold px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-md">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>

              <input 
                type="range"
                min="0.70"
                max="1.20"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => {
                  onZoomChange(parseFloat(e.target.value));
                }}
                className="w-full accent-accent cursor-pointer h-1.5 bg-zinc-850 rounded-lg appearance-none"
              />

              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-semibold">
                {[0.75, 0.85, 1.0, 1.15].map((level) => {
                  const isActive = Math.abs(zoomLevel - level) < 0.02;
                  const labels: Record<number, string> = {
                    0.75: '75% Tiny',
                    0.85: '85% Compact',
                    1.0: '100% Standard',
                    1.15: '115% Zoomed'
                  };

                  return (
                    <button
                      key={level}
                      onClick={() => {
                        onZoomChange(level);
                        triggerToast(`Giao diện đã chuyển sang mật độ zoom ${level * 100}%`);
                      }}
                      className={`py-1.5 rounded-md text          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              {t.pingTitle}
            </h3>

            <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl font-mono text-[11px] space-y-2 text-zinc-500 shadow-inner">
              <div className="flex justify-between">
                <span>Ingress Endpoint:</span>
                <span className="text-zinc-600">https://0.0.0.0:3000/*</span>
              </div>
              <div className="flex justify-between">
                <span>Sandbox Network Protocols:</span>
                <span className="text-emerald-600 font-bold">Encrypted WebRTC</span>
              </div>
              {pingResult !== null && (
                <div className="flex justify-between border-t border-zinc-150 pt-2 mt-2 font-sans text-xs text-emerald-600">
                  <span>Trạng thái ping:</span>
                  <span className="font-mono text-[10px] font-bold">OK (handshake {pingResult}ms)</span>
                </div>
              )}
            </div>

            <button
              onClick={handleTestIngress}
              disabled={isPinging}
              className="w-full py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 border border-zinc-300 text-zinc-800 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs"
            >
              {isPinging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-500" />
                  {t.pinging}
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 text-indigo-600 shrink-0" />
                  {t.pingBtn}
                </>
              )}
            </button>
          </div>

          {/* Clean Sandbox temporary caching and Rebuild simulations widget */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              {t.cacheTitle}
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mt-1">
              {t.cacheDesc}
            </p>

            <button
              onClick={handleCleanCache}
              disabled={isCleaningCache}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-50 disabled:bg-zinc-100 border border-zinc-250 text-zinc-700 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer focus-ring shadow-xs"
            >
              <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
              {isCleaningCache ? 'Cleaning Sandbox node_modules cache...' : t.cacheBtn}
            </button>
          </div>

          {/* Webhook Notifications Switchboard Simulator Widget */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              {t.webhooksTitle}
            </h3>

            <div className="space-y-4 pt-1">
              {/* Discord Webhook notification sync */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-bold text-zinc-805 block">{t.discordLabel}</span>
                  <span className="text-[10px] text-zinc-500">Mô phỏng hook bot ghi logs sự cố về server Discord</span>
                </div>
                <button 
                  onClick={() => {
                    setDiscordNotify(!discordNotify);
                    triggerToast(`Discord sync: ${!discordNotify ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer select-none transition focus-ring rounded"
                >
                  {discordNotify ? (
                    <ToggleRight className="w-9 h-6 text-indigo-600 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-9 h-6 text-zinc-300 shrink-0" />
                  )}
                </button>
              </div>

              {/* Slack notification sync slider */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="space-y-0.5">
                  <span className="font-bold text-zinc-805 block">{t.slackLabel}</span>
                  <span className="text-[10px] text-zinc-500">Đồng bộ tự động các analytics của RKix lên kênh Slack</span>
                </div>
                <button 
                  onClick={() => {
                    setSlackNotify(!slackNotify);
                    triggerToast(`Slack sync: ${!slackNotify ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer select-none transition focus-ring rounded"
                >
                  {slackNotify ? (
                    <ToggleRight className="w-9 h-6 text-indigo-600 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-9 h-6 text-zinc-300 shrink-0" />
                  )}
                </button>
              </div>

              {/* Self-healing Watchdog daemon active sync */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="space-y-0.5">
                  <span className="font-bold text-zinc-805 block">{t.watchdogLabel}</span>
                  <span className="text-[10px] text-zinc-500 font-sans">AI Watchdog liên thục theo dõi lỗi và sửa mã nguồn ngầm</span>
                </div>
                <button 
                  onClick={() => {
                    setWatchdogEnabled(!watchdogEnabled);
                    triggerToast(`AI Auto-Healer: ${!watchdogEnabled ? 'WATCHING' : 'SUSPENDED'}`);
                  }}
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer select-none transition focus-ring rounded"
                >
                  {watchdogEnabled ? (
                    <ToggleRight className="w-9 h-6 text-indigo-600 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-9 h-6 text-zinc-300 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mock Latency slider adjustment simulation widgets */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              {t.latencyTitle}
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              {t.latencyDesc}
            </p>

            <div className="space-y-3 pt-2 font-mono text-[11px]">
              <div className="flex justify-between font-bold">
                <span>API Network Latency:</span>
                <span className="text-indigo-600 font-bold">{mockLatency} ms</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="2500" 
                step="10"
                value={mockLatency}
                onChange={(e) => setMockLatency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-450">
                <span>Fast (30ms)</span>
                <span>Optimized (250ms)</span>
                <span>Throttled (2.5s)</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Secrets Variables Manager & Secure Inputs (Lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-xl space-y-6 shadow-xs">
            
            <div className="border-b border-zinc-200 pb-4">
              <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                {t.apiTitle}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1.5 font-sans leading-relaxed">
                {t.apiDesc}
              </p>
            </div>

            {/* Warn Info notice widget */}
            <div className="bg-indigo-50/70 border border-indigo-150 p-5 rounded-xl flex gap-3 text-[11px] leading-relaxed">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-indigo-950 font-bold">{t.systemBadge}: {t.systemLabel}</p>
                <p className="text-zinc-650 font-sans leading-relaxed">
                  Sử dụng các biến này làm cấu hình môi trường khép kín. Các logic API route của máy chủ sẽ tự động nạp môi trường này để gọi các endpoint của Gemini, Strava, Twilio Proxy,...
                </p>
              </div>
            </div>

            {/* List secrets */}
            <div className="space-y-4">
              {secrets.map((sec) => {
                const isEditing = editingSecretKey === sec.key;
                const isVisible = visibleSecrets[sec.key];

                return (
                  <div 
                    key={sec.key} 
                    className="p-5 bg-zinc-50 border border-zinc-200/95 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono transition-all hover:bg-zinc-100 shadow-xs"
                  >
                    <div className="space-y-1.5 md:max-w-[60%]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-900 font-bold tracking-tight text-xs">{sec.key}</span>
                        {sec.isSystem && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-600 border border-zinc-300">
                            {t.systemBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                        {sec.description}
                      </p>
                    </div>

                    {/* Inputs panel */}
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                      
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <input 
                            type="text" 
                            value={tempSecretValue}
                            onChange={(e) => setTempSecretValue(e.target.value)}
                            placeholder="Nhập giá trị..."
                            className="bg-white border border-indigo-400 text-zinc-900 px-3 py-2 text-[11px] font-mono rounded-lg w-full md:w-44 focus:outline-none focus:border-indigo-500 cursor-pointer focus-ring"
                          />
                          <button
                            onClick={() => saveEditedSecret(sec.key, sec.description)}
                            className="px-3 py-2 bg-indigo-600 hover:opacity-90 text-white font-bold text-[10px] rounded-lg shrink-0 transition cursor-pointer focus-ring"
                          >
                            {t.saveBtn}
                          </button>
                          <button
                            onClick={() => setEditingSecretKey(null)}
                            className="px-3 py-2 bg-zinc-200 hover:bg-zinc-250 text-zinc-700 text-[10px] rounded-lg shrink-0 transition cursor-pointer focus-ring"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                          <div className="relative flex items-center md:w-48">
                            <input 
                              type={isVisible ? 'text' : 'password'}
                              readOnly
                              value={sec.value || '••••••••••••••••'} 
                              className="bg-white text-zinc-650 px-3 py-2 pr-8 text-[11px] select-all font-mono rounded-lg border border-zinc-205 w-full cursor-default focus-ring"
                            />
                            <button
                              onClick={() => toggleSecretVisibility(sec.key)}
                              className="absolute right-2 px-1 text-zinc-405 hover:text-zinc-700 transition cursor-pointer"
                              title="Toggle Visibility"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {!sec.isSystem && (
                            <button
                              onClick={() => startEditSecret(sec.key, sec.value)}
                              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-semibold text-[10px] rounded-lg transition cursor-pointer focus-ring"
                            >
                              {t.editBtn}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Sub environmental storage diagnostics specs bottom */}
          <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-5 shadow-xs">
            <h3 className="text-zinc-900 font-semibold text-xs tracking-wider uppercase font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              SANITY & INTEGRATION CREDENTIAL CHECK
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11.5px] font-mono select-none">
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 shadow-xs">
                <span className="text-zinc-400 font-semibold block uppercase text-[10px]">Security Auditing Status</span>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Safe Sandbox (Passed)
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 shadow-xs">
                <span className="text-zinc-400 font-semibold block uppercase text-[10px]">Cloud Run Ingress Verification</span>
                <div className="flex items-center gap-2 text-indigo-650 font-bold">
                  <span className="w-2 h-2 rounded-full bg-indigo-655 animate-pulse"></span>
                  Listening on 0.0.0.0:3000
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
