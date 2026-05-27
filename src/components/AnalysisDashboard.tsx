/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart, Shield, Zap, RefreshCcw, Cpu, CheckCircle } from 'lucide-react';
import { Task, Project } from '../types';

interface AnalysisDashboardProps {
  tasks: Task[];
  projects: Project[];
}

export default function AnalysisDashboard({ tasks, projects }: AnalysisDashboardProps) {
  // Compute key stats metrics
  const totalTasksCount = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  const totalProgressPercentage = totalTasksCount > 0 
    ? Math.round((doneTasks / totalTasksCount) * 100) 
    : 0;

  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, curr) => acc + curr.progress, 0) / projects.length)
    : 0;

  // Render SVG simple bar graphs for tasks priority tracking
  const priorities = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  const maxVal = Math.max(priorities.critical, priorities.high, priorities.medium, priorities.low, 1);

  return (
    <div className="p-6 md:p-8 bg-[#f9f9fb] text-zinc-700 min-h-full overflow-y-auto custom-scrollbar select-none text-xs animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 mb-6">
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <span>🐼</span>
          RKix Analytics & Metric Panel
        </h2>
        <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
          Báo cáo thống kê sâu rộng về hiệu năng, mã nguồn, tiến triển Sandbox Container và bộ máy tự sửa lỗi.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* KPI 1 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all focus-ring">
          <div>
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-500">TỔNG KHỐI LƯỢNG TASK</span>
            <div className="text-2xl font-bold text-zinc-900 mt-1.5">{totalTasksCount}</div>
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">Đã kết thúc: {doneTasks} ({totalProgressPercentage}%)</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-indigo-600 flex items-center justify-center border border-zinc-150 shadow-xs">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all focus-ring">
          <div>
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-500">TIẾN ĐỘ DỰ ÁN TRUNG BÌNH</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1.5">{avgProjectProgress}%</div>
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">Gồm {projects.length} module lõi</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-indigo-600 flex items-center justify-center border border-zinc-150 shadow-xs">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all focus-ring">
          <div>
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-500">SUY LUẬN AI (SELF-HEAL)</span>
            <div className="text-2xl font-bold text-zinc-900 mt-1.5">99.8%</div>
            <span className="text-[10px] text-emerald-600 font-mono block mt-1 font-bold">Khắc phục crash &lt; 3s</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-indigo-600 flex items-center justify-center border border-zinc-150 shadow-xs">
            <RefreshCcw className="w-5 h-5 animate-spin duration-1000" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all focus-ring">
          <div>
            <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-zinc-500">AN TOÀN SANDBOX</span>
            <div className="text-2xl font-bold text-zinc-900 mt-1.5">Đã cô lập</div>
            <span className="text-[10px] text-emerald-600 font-mono block mt-1 font-bold">Môi trường cát sandbox bọc kín</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-50 text-indigo-600 flex items-center justify-center border border-zinc-150 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SVG charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Priority Distribution bar graph */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs">
          <h3 className="text-zinc-900 font-bold text-xs uppercase font-mono mb-6 pb-2 border-b border-zinc-150">
            Biêu đồ phân loại độ ưu tiên (Priority Distribution)
          </h3>
          
          <div className="space-y-4">
            {/* Critical */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-red-655 font-bold uppercase">Critical Risk</span>
                <span className="text-zinc-600">{priorities.critical} tệp</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(priorities.critical / maxVal) * 100}%` }} 
                />
              </div>
            </div>

            {/* High */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-amber-705 font-bold uppercase">High Priority</span>
                <span className="text-zinc-600">{priorities.high} tệp</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(priorities.high / maxVal) * 100}%` }} 
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-indigo-650 font-bold uppercase">Medium Priority</span>
                <span className="text-zinc-600">{priorities.medium} tệp</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(priorities.medium / maxVal) * 100}%` }} 
                />
              </div>
            </div>

            {/* Low */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-zinc-500 font-bold uppercase">Low Priority</span>
                <span className="text-zinc-600">{priorities.low} tệp</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2">
                <div 
                  className="bg-zinc-400 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(priorities.low / maxVal) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 mt-6 pt-3 border-t border-zinc-150 font-mono">
            Rủi ro Critical luôn được hệ thống ưu tiên tối đa thông báo về webhook Telegram.
          </div>
        </div>

        {/* Chart 2: Module completeness details via custom progress visualizer */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-zinc-900 font-bold text-xs uppercase font-mono mb-4 pb-2 border-b border-zinc-150">
              Tiến trình đồng bộ dự án (Project Status Sync)
            </h3>
            
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between hover:bg-zinc-100 transition-colors shadow-xs">
                  <div>
                    <h4 className="text-zinc-900 font-semibold tracking-tight text-xs">{p.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">{p.category} • Thao tác kéo thả Kanban tự đồng bộ</p>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-zinc-900 block">{p.progress}%</span>
                      <span className="text-[9px] text-indigo-600 uppercase font-bold">Complete</span>
                    </div>
                    
                    {/* Tiny gauge */}
                    <div className="w-12 h-12 flex items-center justify-center relative">
                      <svg className="w-11 h-11 transform -rotate-90">
                        <circle cx="22" cy="22" r="16" className="stroke-zinc-200 fill-none" strokeWidth="2.5" />
                        <circle 
                          cx="22" cy="22" r="16" 
                          className="stroke-indigo-650 fill-none transition-all duration-500" 
                          strokeWidth="3" 
                          strokeDasharray="100"
                          strokeDashoffset={100 - p.progress}
                        />
                      </svg>
                      <span className="absolute text-[8px] text-zinc-500 font-bold">{p.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-zinc-500 leading-relaxed font-mono mt-4">
            * Tiến độ hoàn thành (progress) tự động cộng hưởng tăng lên khi bạn chuyển một thẻ công việc trực thuộc dự án sang trạng thái Done ở bảng kéo thả.
          </p>
        </div>

      </div>
    </div>
  );
}
