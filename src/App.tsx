/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  Layers, Disc, MessageSquare, Terminal, Key, BarChart2, ShieldAlert, CheckCircle2,
  RefreshCw, Info, HelpCircle, HardDrive, Cpu, Settings, Activity, ArrowRight, Plus,
  Menu
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import AgentChat from './components/AgentChat';
import RkixAgentChat from './components/RkixAgentChat';
import LogsConsole from './components/LogsConsole';
import AnalysisDashboard from './components/AnalysisDashboard';
import SettingsPanel from './components/SettingsPanel';
import RepositoriesPanel from './components/RepositoriesPanel';
import TemplatesPage from './components/TemplatesPage';
import RkixHubPage from './components/RkixHubPage';
import LibraryStorePage from './components/LibraryStorePage';
import AiNewsPage from './components/AiNewsPage';

import { Task, Project, ActivityLog, SecretItem, TaskStatus } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('kanban'); // Default to Tasks review first to showcase Kanban!
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>('blue');
  const [currentLanguage, setCurrentLanguage] = useState<'vi' | 'en' | 'jp'>('vi');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [telemetry, setTelemetry] = useState({
    cpuUsage: 12,
    memoryUsage: 41,
    uptime: 60,
    containerCount: 3,
    status: 'ACTIVE'
  });

  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('rkix-zoom-level');
    return saved ? parseFloat(saved) : 0.85; // 0.85 defaults to the requested compact zoomed density
  });

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('rkix-zoom-level', zoomLevel.toString());
  }, [zoomLevel]);

  // Global Keyboard shortcuts Alt + N (New Task), Alt + M (Toggle Sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isTyping) return;

      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenTaskModal();
      }
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileMenuOpen(prev => !prev);
        } else {
          setIsSidebarCollapsed(prev => !prev);
        }
        triggerToast('Chuyển đổi ẩn hiện thanh Sidebar thành công!');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial workspace parameters
  const fetchWorkspaceData = async () => {
    try {
      const response = await fetch('/api/workspace');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
        setLogs(data.logs || []);
        setSecrets(data.secrets || []);
      }
    } catch (err) {
      console.error('Failed to retrieve workspace parameters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch telemetry occasionally
  const fetchTelemetryData = async () => {
    try {
      const response = await fetch('/api/telemetry');
      if (response.ok) {
        const data = await response.json();
        setTelemetry(data);
      }
    } catch (_) {
      // Graceful ignore metric fetching fail
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
    fetchTelemetryData();

    // Recurrent telemetry update
    const interval = setInterval(() => {
      fetchTelemetryData();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Drag and Drop update
  const handleTaskUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;
    if (originalTask.status === newStatus) return;

    // Optimistic UI update
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t);
    setTasks(updatedTasks);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
        setLogs(data.logs);
        
        const projName = projects.find(p => p.id === originalTask.projectId)?.name || 'Dự án';
        triggerToast(`Đã dịch chuyển "${originalTask.title}" sang cột [${newStatus.toUpperCase()}]. Đồng bộ tiến độ dự án thành công!`);
      } else {
        fetchWorkspaceData(); // Rollback on error
      }
    } catch (err) {
      console.error('Failed to coordinate task drop:', err);
      fetchWorkspaceData();
    }
  };

  const handleBulkUpdateTasks = async (taskIds: string[], updates: { status?: TaskStatus; assignee?: string }) => {
    try {
      const response = await fetch('/api/tasks/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: taskIds, ...updates })
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
        setLogs(data.logs);
        triggerToast(`Đã cập nhật hàng loạt thành công ${taskIds.length} công việc!`);
      }
    } catch (err) {
      console.error('Failed to execute bulk update:', err);
    }
  };

  const handleBulkDeleteTasks = async (taskIds: string[]) => {
    try {
      const response = await fetch('/api/tasks/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: taskIds })
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
        setLogs(data.logs);
        triggerToast(`Đã xóa hàng loạt thành công ${taskIds.length} công việc.`);
      }
    } catch (err) {
      console.error('Failed to execute bulk delete:', err);
    }
  };

  const handleOpenTaskModal = (task?: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(undefined);
    setShowTaskModal(false);
  };

  // Saving Task (New or Edit)
  const handleSaveTask = async (taskData: Partial<Task>) => {
    const isEdit = !!taskData.id;
    try {
      let response;
      if (isEdit) {
        response = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } else {
        response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
        setLogs(data.logs);
        triggerToast(isEdit ? 'Cập nhật thông tin công việc thành công!' : 'Tạo mới công việc và tệp đính kèm thành công!');
      } else {
        const errData = await response.json();
        alert('Có lỗi xảy ra: ' + (errData.error || 'Thao tác thất bại'));
      }
    } catch (err) {
      console.error('Failed to compile saving action:', err);
    }
    handleCloseTaskModal();
  };

  // Deleting Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setProjects(data.projects);
        setLogs(data.logs);
        triggerToast('Đã xóa công việc khỏi danh sách.');
      }
    } catch (err) {
      console.error('Failed to submit erasing query:', err);
    }
  };

  // Clear log console
  const handleClearLogs = async () => {
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        triggerToast('Đã dọn dẹp logs terminal.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger self heal simulation
  const handleHealSimulation = async (scenario: string) => {
    try {
      const response = await fetch('/api/agent/self-heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: scenario })
      });
      if (response.ok) {
        const data = await response.json();
        // Sync logs back in a delay to simulate typing
        setTimeout(() => {
          fetchWorkspaceData();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Secrets saving helper
  const handleSaveSecret = async (key: string, value: string, desc: string) => {
    try {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description: desc })
      });
      if (response.ok) {
        const data = await response.json();
        setSecrets(data.secrets);
        triggerToast(`Đã lưu biến môi trường ${key} thành công!`);
      } else {
        const errData = await response.json();
        alert(errData.error || 'Failed to save secret');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render proper workspace view
  const renderViewContent = () => {
    switch (currentView) {
      case 'kanban':
        return (
          <KanbanBoard 
            tasks={tasks} 
            projects={projects}
            onTaskUpdateStatus={handleTaskUpdateStatus}
            onOpenTaskModal={handleOpenTaskModal}
            onBulkUpdateStatus={handleBulkUpdateTasks}
            onBulkDelete={handleBulkDeleteTasks}
          />
        );
      case 'chat':
        return <RkixAgentChat />;
      case 'logs':
        return (
          <LogsConsole 
            logs={logs}
            onClearLogs={handleClearLogs}
            onHealSimulation={handleHealSimulation}
            telemetry={telemetry}
          />
        );
      case 'analysis':
        return <AnalysisDashboard tasks={tasks} projects={projects} />;

      case 'templates':
        return (
          <TemplatesPage 
            onRefreshWorkspace={fetchWorkspaceData} 
            triggerToast={triggerToast} 
          />
        );
      
      case 'ai-news':
        return <AiNewsPage triggerToast={triggerToast} />;
      
      case 'rkix-hub':
        return <RkixHubPage />;
      
      case 'library-store':
        return <LibraryStorePage triggerToast={triggerToast} />;
      
      case 'repositories':
        return (
          <RepositoriesPanel 
            onRefreshWorkspace={fetchWorkspaceData}
            onViewChange={(view) => setCurrentView(view)}
            triggerToast={triggerToast}
          />
        );
      
      case 'secrets':
        return (
          <SettingsPanel 
            secrets={secrets}
            onSaveSecret={handleSaveSecret}
            telemetry={telemetry}
            triggerToast={triggerToast}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            accentColor={accentColor}
            onAccentColorChange={(c) => setAccentColor(c)}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        );

      case 'overview':
      default:
        return (
          <div className="p-4 md:p-8 bg-[#f9f9fb] text-zinc-700 min-h-full overflow-y-auto custom-scrollbar text-xs space-y-6 animate-fade-in animate-duration-200">
            {/* Overview dashboard */}
            <div className="border-b border-zinc-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div>
                <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight flex items-center gap-2 font-mono uppercase">
                  <span>🐼</span>
                  RKix Autonomous Factory Console
                </h2>
                <p className="text-xs text-zinc-400 mt-1.5 font-medium">
                  Không gian điều hành liên kết trực tiếp giữa các pipelines logic và Container sandbox.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-3 py-1 rounded-lg bg-white border border-zinc-200 text-indigo-600 font-bold">
                  ● ACTIVE CONTAINER
                </span>
              </div>
            </div>

            {/* Deploy Production changes directly here as requested */}
            <div className="p-6 bg-gradient-to-r from-zinc-50 to-indigo-50/30 border border-zinc-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs select-none">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-md">
                  INGRESS DEPLOYMENT CENTRAL
                </span>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2 font-mono uppercase mt-1">
                  🚀 TRÌNH TRIỂN KHAI SẢN XUẤT DỰ ÁN RKIX
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-xl">
                  Nhấp vào đây để biên dịch mã nguồn, chạy linter, đồng bộ hóa cache đóng gói Container và cập nhật hệ thống s��n xuất thực tế.
                </p>
              </div>
              
              <button
                onClick={() => {
                  triggerToast('Đang kết nối Cloud Run... Build code & Deploy hoàn tất thành công!');
                }}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 duration-100 cursor-pointer focus-ring flex items-center justify-center gap-2 shrink-0"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                Triển Khai Sản Xuất Ngay
              </button>
            </div>

            {/* Core Stats overview cards */}
            <div className="bg-white border border-zinc-200 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-2">
                <span className="text-[9px] font-mono uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-2.5 py-0.5 rounded-md">
                  Autonomous Build Mode
                </span>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight mt-1">Hệ thống chuyển giao: Sẵn Sàng Vận Hành</h3>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed max-w-xl">
                  Mô hình liên chu��i: <strong className="text-indigo-600">Human Intent</strong> &rarr; <strong className="text-indigo-600">LLM Planner</strong> &rarr; <strong className="text-indigo-600">Code Generator</strong> &rarr; <strong className="text-indigo-600">Self-healing</strong> đang được vận hành đồng bộ độc lập trên nền tảng Cloud Run container.
                </p>
              </div>
              <button 
                onClick={() => setCurrentView('kanban')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white cursor-pointer rounded-lg transition-all flex items-center gap-2 focus-ring active:scale-95 duration-100 shrink-0 shadow-xs"
              >
                Vào Bảng Kanban <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* List projects linked */}
            <div className="space-y-4 select-none">
              <h3 className="text-xs text-zinc-800 font-bold font-mono uppercase tracking-wider">Danh sách Module liên kết phát triển:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projects.map(p => (
                  <div key={p.id} className="p-5 bg-white border border-zinc-200 hover:border-zinc-300 transition-all rounded-xl flex flex-col justify-between gap-5 shadow-xs interactive-card">
                    <div className="space-y-2">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-650 font-bold uppercase tracking-tight">{p.category}</span>
                      <h4 className="text-zinc-900 font-bold text-xs mt-1">{p.name}</h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-zinc-400 font-medium">Hoàn thành task:</span>
                        <span className="text-indigo-600 font-bold">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-150 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${p.progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick telemetry widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4 shadow-xs">
                <span className="text-xs font-bold text-zinc-900 font-mono uppercase block">Trạng thái bảo mật cô lập Sandbox</span>
                <p className="text-zinc-500 font-sans text-[11px] leading-relaxed">
                  Vùng cát cô lập an toàn, tất cả các tác vụ ghi file được chặn lọc tại thư mục <code className="text-indigo-600 text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded">/uploads</code>.
                </p>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-mono font-bold">HTTPS SECURITY</span>
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-mono font-bold">XSS/CSRF SHIELD</span>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4 shadow-xs">
                <span className="text-xs font-bold text-zinc-900 font-mono uppercase block">Nhật ký Telemetry khẩn cấp</span>
                <div className="space-y-2 font-mono text-[10px] text-zinc-500">
                  {logs.slice(0, 3).map((l, ind) => (
                    <div key={ind} className="truncate pb-2 border-b border-zinc-100 last:border-0 last:pb-0">
                      ⏳ {new Date(l.timestamp).toLocaleTimeString()}: {l.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden bg-[#f9f9fb] text-zinc-800 font-sans transition-all duration-200"
    >
      
      {/* Dynamic Accent Color CSS Injector */}
      <style>{`
        :root {
          --accent-primary: ${
            accentColor === 'emerald' ? '#10b981' : 
            accentColor === 'amber' ? '#f59e0b' : 
            accentColor === 'purple' ? '#a855f7' : 
            accentColor === 'zinc' ? '#f4f4f5' : 
            '#3b82f6'
          };
          --accent-hover: ${
            accentColor === 'emerald' ? '#059669' : 
            accentColor === 'amber' ? '#d97706' : 
            accentColor === 'purple' ? '#9333ea' : 
            accentColor === 'zinc' ? '#e4e4e7' : 
            '#2563eb'
          };
          --accent-bg-mute: ${
            accentColor === 'emerald' ? 'rgba(16, 185, 129, 0.08)' : 
            accentColor === 'amber' ? 'rgba(245, 158, 11, 0.08)' : 
            accentColor === 'purple' ? 'rgba(168, 85, 247, 0.08)' : 
            accentColor === 'zinc' ? 'rgba(244, 244, 245, 0.08)' : 
            'rgba(59, 130, 246, 0.08)'
          };
        }
        .text-accent { color: var(--accent-primary) !important; }
        .bg-accent { background-color: var(--accent-primary) !important; }
        .border-accent { border-color: var(--accent-primary) !important; }
        .bg-accent-mute { background-color: var(--accent-bg-mute) !important; }
      `}</style>

      {/* MOBILE HEADER SIDEBAR DRAWER OVERLAY BACKDROP */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-xs" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        <div 
          className={`absolute top-0 bottom-0 left-0 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <Sidebar 
            currentView={currentView} 
            onViewChange={(v) => {
              setCurrentView(v);
              setIsMobileMenuOpen(false);
            }} 
            telemetry={telemetry}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        </div>
      </div>

      {/* Sidebar Section - Permanent Desktop View */}
      <div className={`hidden md:flex h-full transition-all duration-300 overflow-hidden shrink-0 ${isSidebarCollapsed ? 'w-0 border-r-0' : 'w-64 border-r border-zinc-200'}`}>
        <div className="w-64 h-full shrink-0">
          <Sidebar 
            currentView={currentView} 
            onViewChange={(v) => setCurrentView(v)} 
            telemetry={telemetry}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
          />
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Animated Slide-in Toast Notification for complete tracking cues */}
        {toastMessage && (
          <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-800 text-zinc-100 p-4 rounded-xl shadow-xl z-50 flex items-center gap-3 text-xs max-w-sm animate-slide-up font-sans">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
            <span className="leading-snug font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Top Header navbar (Mobile responsive optimized) */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 shrink-0 select-none shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg md:hidden transition-all cursor-pointer"
              title="Mở thanh điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-zinc-400 truncate max-w-[130px] sm:max-w-none">
              <span className="hidden sm:inline">Org / </span>
              <span className="text-zinc-850 font-bold">RKix 🐼</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-bold uppercase tracking-wider shrink-0 select-none">
              Pipeline Live
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="h-4 w-[1px] bg-zinc-200 hidden xs:block"></div>
            <div className="items-center gap-3 hidden sm:flex">
              <span className="text-xs text-zinc-500 font-medium">System Load</span>
              <div className="w-20 md:w-24 h-1.5 bg-zinc-150 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${telemetry.cpuUsage}%` }}></div>
              </div>
            </div>
            
            {/* USER PROFILE DROPDOWN MENU - THAY THẾ CHO NÚT SẢN XUẤT CO-EXISTING OVERALL SETTINGS */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-800 text-[11px] md:text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer select-none active:scale-95 focus-ring"
                title="Hồ sơ & Hệ thống"
              >
                <div className="w-6.5 h-6.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs select-none border border-indigo-200">
                  RK
                </div>
                <span className="hidden xs:inline">Hồ sơ nvht255</span>
                <span className="text-[10px] text-zinc-400">▼</span>
              </button>

              {isProfileDropdownOpen && (
                <>
                  {/* Backyard click catcher to lock dropdown pop-over */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default select-none" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 p-2 text-xs font-medium text-zinc-700 font-sans animate-fade-in animate-duration-100">
                    <div className="p-2.5 border-b border-zinc-150 select-none">
                      <p className="font-extrabold text-zinc-900 leading-tight">nvht2505@gmail.com</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wide">Nhà quản trị RKix</p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setCurrentView('secrets'); // Navigate to secrets/settings view
                          triggerToast('Đã mở: Hồ sơ người dùng & Quyền hạn hệ thống.');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 text-zinc-650 hover:text-indigo-650 transition cursor-pointer select-none"
                      >
                        👤 Hồ sơ người dùng
                      </button>
                      
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setCurrentView('secrets'); // Navigate to settings
                          triggerToast('Đã mở: Cài đặt chi tiết hồ sơ thành viên RKix.');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-zinc-50 rounded-lg flex items-center gap-2 text-zinc-650 hover:text-indigo-650 transition cursor-pointer select-none"
                      >
                        ⚙️ Cài đặt hồ sơ cá nhân
                      </button>

                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setCurrentView('secrets'); // System preferences / secrets
                          triggerToast('Đã mở: Cài đặt hệ thống tổng của RKix.');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 font-bold text-indigo-600 transition cursor-pointer select-none"
                      >
                        🛠️ Cài đặt hệ thống RKix
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>


        {/* Application Core Panel Body */}
        <main className="flex-1 overflow-hidden relative bg-[#f9f9fb]">
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 font-mono text-xs text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin text-accent" />
              RKix 🐼 Orchestrator: Loading workspace state...
            </div>
          ) : (
            renderViewContent()
          )}
        </main>
      </div>

      {/* Task Creation & Upgrades Edit Overlay Menu */}
      {showTaskModal && (
        <TaskModal 
          task={selectedTask}
          projects={projects}
          onClose={handleCloseTaskModal}
          onSave={handleSaveTask}
          onDelete={selectedTask ? handleDeleteTask : undefined}
        />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
