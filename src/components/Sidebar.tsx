/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Terminal, BarChart2, ShieldAlert, Cpu, Layers, Disc, Globe, Settings,
  MessageSquare, Radio, Cloud, BookOpen, Key, Users, Sliders, Calendar,
  CreditCard, GitBranch, Inbox, FileCode, Layout, Compass, ShoppingCart, Newspaper
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  telemetry: {
    status: string;
    cpuUsage: number;
    memoryUsage: number;
  };
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  telemetry,
  zoomLevel,
  onZoomChange
}: SidebarProps) {
  const sections = [
    {
      title: 'HỆ THỐNG PHÁT HÀNH',
      items: [
        { id: 'overview', label: 'Triển Khai Dự Án & Tổng Quan', icon: Layers },
        { id: 'logs', label: 'Nhật Ký Hệ Thống (Logs)', icon: Terminal },
        { id: 'analysis', label: 'Phân Tích & Thống Kê', icon: BarChart2 },
        { id: 'domain', label: 'Cổng Kết Nối Domain Ingress', icon: Globe },
        { id: 'resources', label: 'Cấu Hình Tài Nguyên', icon: Cpu },
      ]
    },
    {
      title: 'HỆ SINH THÁI RKIX HUB',
      items: [
        { id: 'rkix-hub', label: 'Trung Tâm RKix Hub Core', icon: Compass, badge: 'Hub' },
        { id: 'ai-news', label: 'Bản Tin AI (News)', icon: Newspaper, badge: 'Live' },
        { id: 'templates', label: 'Thư Viện Mẫu (Templates)', icon: Layout },
        { id: 'library-store', label: 'Cửa Hàng Thư Viện', icon: ShoppingCart, badge: 'Pack' },
      ]
    },
    {
      title: 'PHIÊN LÀM VIỆC & LUỒNG',
      items: [
        { id: 'kanban', label: 'Bảng Việc Tác Vụ (Kanban)', icon: Disc, badge: 'D&D' },
        { id: 'chat', label: 'Trò Chuyện Với Agent Chat', icon: MessageSquare, badge: 'Claw' },
        { id: 'automations', label: 'Tự Động Hóa (Automations)', icon: Radio },
        { id: 'wiki', label: 'Thư Viện DeepWiki', icon: BookOpen },
        { id: 'schedules', label: 'Lịch Trình Hệ Thống', icon: Calendar },
      ]
    },
    {
      title: 'MÔI TRƯỜNG PHÁT TRIỂN',
      items: [
        { id: 'repositories', label: 'Kho Mã Nguồn Repositories', icon: GitBranch },
        { id: 'knowledge', label: 'Cơ Sở Tri Thức (Knowledge)', icon: Inbox },
        { id: 'playbooks', label: 'Cẩm Nang Playbooks', icon: FileCode },
        { id: 'secrets', label: 'Biến Bảo Mật Secrets & Keys', icon: Key },
      ]
    },
    {
      title: 'CÁ NHÂN HÓA',
      items: [
        { id: 'preferences', label: 'Tùy Chọn Hiển Thị (Prefs)', icon: Sliders },
        { id: 'organization', label: 'Tổ Chức Quản Trị (RKix 🐼)', icon: Users },
      ]
    },
    {
      title: 'GÓI CƯỚC & TÀI KHOẢN',
      items: [
        { id: 'plans', label: 'Kế Hoạch & Thanh Toán', icon: CreditCard },
        { id: 'usage', label: 'Giới Hạn & Sử Dụng', icon: Cpu },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-full text-zinc-700 select-none">
      {/* Header Profile / Space Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-zinc-150 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold select-none shadow-sm">
            RK
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-zinc-900 text-sm tracking-tight block">RKIX AGENT<span className="text-indigo-600 font-mono font-bold">&gt;_</span></span>
            <span className="text-[9px] font-mono text-zinc-400 block tracking-widest uppercase">RKIX HUB</span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 px-3 custom-scrollbar text-xs">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="px-3 text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-sans">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left focus-ring cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-50/75 text-indigo-700 font-bold border-l-2 border-indigo-600' 
                        : 'text-zinc-650 hover:bg-zinc-100/70 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[8px] font-mono tracking-tighter px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-500'
                      } font-bold uppercase`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Telemetry Status Footer */}
      <div className="p-4 border-t border-zinc-150 bg-zinc-50/50 space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 flex items-center justify-center text-sm border border-emerald-200 select-none">🐼</div>
          <div className="text-xs">
            <p className="font-bold text-zinc-800 leading-tight">RKix 🐼</p>
            <p className="text-[10px] text-zinc-400 font-medium">Personal Workspace</p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200/50 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">Sandbox:</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {telemetry.status}
            </span>
          </div>
          <div className="space-y-1.5 text-[10px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>CPU Core:</span>
              <span className="text-zinc-650 font-bold">{telemetry.cpuUsage}%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1 transition-all duration-500" 
                style={{ width: `${telemetry.cpuUsage}%` }} 
              />
            </div>
            <div className="flex justify-between pt-1">
              <span>Memory:</span>
              <span className="text-zinc-650 font-bold">{telemetry.memoryUsage}%</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1 transition-all duration-500" 
                style={{ width: `${telemetry.memoryUsage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
