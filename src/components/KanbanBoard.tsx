/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Paperclip, MoreHorizontal, CheckCircle2, Circle, AlertTriangle, ArrowUp, User, Search, Filter, GitBranch, ExternalLink, Sliders 
} from 'lucide-react';
import { Task, TaskStatus, Project, Priority } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onTaskUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenTaskModal: (task?: Task) => void;
  onBulkUpdateStatus?: (taskIds: string[], updates: { status?: TaskStatus; assignee?: string }) => void;
  onBulkDelete?: (taskIds: string[]) => void;
}

export default function KanbanBoard({ 
  tasks, 
  projects, 
  onTaskUpdateStatus, 
  onOpenTaskModal,
  onBulkUpdateStatus,
  onBulkDelete
}: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortCriteria, setSortCriteria] = useState<'default' | 'priority' | 'updatedDate'>('default');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TaskStatus>('todo');

  // Repository Build and Deployment Status Cache Map
  const [projectStatuses, setProjectStatuses] = useState<Record<string, {
    build: string;
    deploy: string;
    sha: string;
    liveUrl: string;
  }>>({});

  useEffect(() => {
    // Fetch live build and deployment status for linked GitHub repositories
    const fetchStatuses = async () => {
      const statuses: Record<string, any> = {};
      await Promise.all(
        projects.map(async (p) => {
          try {
            const res = await fetch(`/api/github/build-status?projectId=${encodeURIComponent(p.id)}`);
            if (res.ok) {
              const data = await res.json();
              statuses[p.id] = data;
            }
          } catch (e) {
            console.error('Error fetching build status for project metadata', p.id, e);
          }
        })
      );
      setProjectStatuses(statuses);
    };

    if (projects.length > 0) {
      fetchStatuses();
    }
  }, [projects]);

  const columns: { id: TaskStatus; label: string; color: string; border: string; bg: string }[] = [
    { id: 'todo', label: 'Cần làm (Todo)', color: 'text-zinc-400', border: 'border-zinc-800', bg: 'bg-transparent' },
    { id: 'in_progress', label: 'Đang làm (In Progress)', color: 'text-blue-400', border: 'border-zinc-800', bg: 'bg-transparent' },
    { id: 'review', label: 'Đánh giá (Review)', color: 'text-amber-400', border: 'border-zinc-800', bg: 'bg-transparent' },
    { id: 'done', label: 'Hoàn thành (Done)', color: 'text-emerald-400', border: 'border-zinc-800', bg: 'bg-transparent' },
  ];

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setActiveDragId(taskId);
  };

  const handleDragEnd = () => {
    setActiveDragId(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedOverColumn !== status) {
      setDraggedOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskUpdateStatus(taskId, status);
    }
    setActiveDragId(null);
    setDraggedOverColumn(null);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-red-500/10 text-red-500 uppercase flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Critical</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-blue-500/10 text-blue-400 uppercase flex items-center gap-1"><ArrowUp className="w-2.5 h-2.5 shrink-0" /> High</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-zinc-800 text-zinc-300 uppercase flex items-center gap-1">Medium</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider bg-zinc-850/40 text-zinc-500 uppercase flex items-center gap-1">Low</span>;
    }
  };

  // Filter computation
  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(searchLower) || 
                          (task.description || '').toLowerCase().includes(searchLower) ||
                          (task.assignee || '').toLowerCase().includes(searchLower);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full bg-[#f9f9fb] text-zinc-800">
      {/* Kanban Header with Search & Controls */}
      <div className="p-4 md:p-6 border-b border-zinc-200 bg-white shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-xl font-bold md:font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            Task Management <span className="text-zinc-500 font-normal text-xs md:text-sm ml-1">{filteredTasks.length} Total</span>
          </h2>
          <p className="text-[11px] md:text-xs text-zinc-500 mt-1">
            Kéo thả thẻ nhiệm vụ để chuyển đổi trạng thái và tự động cập nhật tiến độ dòng đời dự án.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2.5 text-xs w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white text-zinc-800 pl-8 pr-3 py-1.5 rounded-lg border border-zinc-250 w-full sm:w-48 md:w-56 tracking-tight text-xs focus-ring"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Priority select */}
            <div className="relative flex items-center flex-1 sm:flex-none">
              <Filter className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white text-zinc-800 pl-8 pr-3 py-1.5 rounded-lg border border-zinc-250 text-xs appearance-none cursor-pointer pr-8 focus-ring w-full"
              >
                <option value="all">Mọi độ ưu tiên</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sắp xếp (Sort) */}
            <div className="relative flex items-center flex-1 sm:flex-none">
              <Sliders className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value as any)}
                className="bg-white text-zinc-800 pl-8 pr-3 py-1.5 rounded-lg border border-zinc-250 text-xs appearance-none cursor-pointer pr-8 focus-ring w-full"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="priority">Sắp xếp: Độ ưu tiên</option>
                <option value="updatedDate">Sắp xếp: Ngày cập nhật</option>
              </select>
            </div>
          </div>

          {/* New task button */}
          <button
            onClick={() => onOpenTaskModal()}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold sm:font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-100 focus-ring hover:shadow shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Task
          </button>
        </div>
      </div>

      {/* Mobile Column Segmented Switcher Header */}
      <div className="md:hidden px-2.5 py-2 border-b border-zinc-200 bg-white flex gap-1 select-none shrink-0 w-full animate-fade-in">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          const isActive = mobileActiveColumn === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setMobileActiveColumn(col.id)}
              className={`flex-1 min-w-0 py-1.5 px-0.5 rounded-lg text-[9px] xs:text-[10px] font-sans font-bold transition-all flex flex-col items-center justify-center gap-1.5 border overflow-hidden ${
                isActive 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-xs' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }`}
            >
              <span className="truncate w-full text-center">{col.label.split(' ')[0]}</span>
              <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full leading-none font-bold ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-200 text-zinc-500'}`}>
                {colTasks.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 flex gap-4 custom-scrollbar">
        {columns.map((col) => {
          let colTasks = filteredTasks.filter(t => t.status === col.id);
          
          if (sortCriteria === 'priority') {
            const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
            colTasks = [...colTasks].sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
          } else if (sortCriteria === 'updatedDate') {
            colTasks = [...colTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          }

          const isOver = draggedOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-col md:w-80 shrink-0 rounded-xl border transition-all duration-150 p-4 h-full bg-zinc-100/50 ${
                isOver ? 'border-indigo-500/50 shadow-md shadow-indigo-650/10 scale-[1.01]' : 'border-zinc-200/70'
              } ${mobileActiveColumn === col.id ? 'flex w-full md:w-80' : 'hidden md:flex'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'todo' ? 'bg-zinc-400' :
                    col.id === 'in_progress' ? 'bg-indigo-505 animate-pulse' :
                    col.id === 'review' ? 'bg-amber-450' : 'bg-emerald-550'
                  }`} />
                  <span className="font-extrabold text-zinc-500 text-[11px] uppercase tracking-wider">{col.label}</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-zinc-200 text-zinc-600 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {colTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allColTaskIds = colTasks.map(t => t.id);
                      const allSelectedInCol = allColTaskIds.every(id => selectedTaskIds.includes(id));
                      if (allSelectedInCol) {
                        setSelectedTaskIds(prev => prev.filter(id => !allColTaskIds.includes(id)));
                      } else {
                        setSelectedTaskIds(prev => {
                          const otherIds = prev.filter(id => !allColTaskIds.includes(id));
                          return [...otherIds, ...allColTaskIds];
                        });
                      }
                    }}
                    className="text-[10px] text-zinc-500 hover:text-indigo-600 border border-zinc-200 rounded px-1.5 py-0.5 hover:bg-zinc-200/70 transition-all cursor-pointer font-medium"
                  >
                    {colTasks.every(t => selectedTaskIds.includes(t.id)) ? 'Hủy chọn' : 'Chọn hết'}
                  </button>
                )}
              </div>

              {/* Cards Container */}
              <div 
                className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[300px]"
                onDragLeave={() => draggedOverColumn === col.id && setDraggedOverColumn(null)}
              >
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-center text-zinc-400 p-4 font-mono text-[11px]">
                    Kéo thả Task vào đây
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const linkedProj = projects.find(p => p.id === task.projectId);
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onOpenTaskModal(task)}
                        className={`group relative border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md interactive-card hover:-translate-y-0.5 select-none transition-all ${
                          activeDragId === task.id ? 'opacity-30 border-dashed border-zinc-300' : ''
                        } ${isSelected ? 'border-indigo-600 bg-indigo-50/45 shadow-sm' : 'border-zinc-200 bg-white'}`}
                      >
                        {/* Selection check indicator */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskIds(prev => 
                              prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id]
                            );
                          }}
                          className={`absolute -left-1.5 -top-1.5 z-20 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white scale-105'
                              : 'bg-white border-zinc-300 hover:border-indigo-550 hover:scale-110 text-transparent'
                          }`}
                        >
                          <svg className="w-2.5 h-2.5 stroke-[4.5px]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>

                        {/* Tags and project */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded truncate max-w-[120px]" title={linkedProj?.name || 'Unknown'}>
                            {linkedProj?.name || 'Chưa phân loại'}
                          </span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* GitHub Build and Deployment Status Badges */}
                        {linkedProj && projectStatuses[linkedProj.id] && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 bg-zinc-50 border border-zinc-200 p-2 rounded-lg font-mono text-[9px] text-zinc-500 select-none">
                            <div className="flex items-center gap-1 shrink-0">
                              <GitBranch className="w-3 h-3 text-zinc-500" />
                              <span className="text-zinc-500">commit</span>
                              <code className="text-amber-500 font-bold">#{projectStatuses[linkedProj.id].sha}</code>
                            </div>
                            <span className="text-zinc-300">|</span>
                            
                            {/* Build status */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-zinc-500">build</span>
                              {projectStatuses[linkedProj.id].build === 'passing' ? (
                                <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-bold uppercase tracking-wider">PASSING</span>
                              ) : (
                                <span className="px-1 py-0.2 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                  BUILDING
                                </span>
                              )}
                            </div>
                            <span className="text-zinc-300">|</span>

                            {/* Deploy status */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-zinc-500">deploy</span>
                              {projectStatuses[linkedProj.id].deploy === 'live' ? (
                                <a 
                                  href={projectStatuses[linkedProj.id].liveUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-1 py-0.2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-705 hover:text-indigo-800 border border-indigo-100 text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-colors underline cursor-pointer"
                                >
                                  LIVE
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ) : (
                                <span className="px-1 py-0.2 rounded bg-zinc-100 text-zinc-400 border border-zinc-200 text-[8px] font-bold uppercase tracking-wider">PENDING</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="font-bold text-zinc-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors duration-150 leading-snug">
                          {task.title}
                        </h4>

                        {/* Task description snip */}
                        {task.description && (
                          <p className="text-[11px] text-zinc-550 mt-1.5 transition-all line-clamp-2 leading-relaxed font-sans">
                            {task.description}
                          </p>
                        )}

                        {/* Attachments Section list indicator */}
                        {((task.attachments && task.attachments.length > 0) || task.file_url) && (
                          <div className="mt-3 pt-2.5 border-t border-zinc-150 flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-450 flex items-center gap-1 font-bold">
                              <Paperclip className="w-3 h-3 text-indigo-600" /> 
                              Tệp đính kèm ({task.attachments.length + (task.file_url && !task.attachments.some(a => a.url === task.file_url) ? 1 : 0)}):
                            </span>
                            <div className="flex flex-col gap-1">
                              {task.file_url && !task.attachments.some(a => a.url === task.file_url) && (
                                <a 
                                  href={task.file_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-indigo-600 hover:underline truncate max-w-full font-mono flex items-center gap-1"
                                >
                                  📎 main_ref_url ({task.file_url.split('/').pop()})
                                </a>
                              )}
                              {task.attachments.map((file, fIdx) => (
                                <a
                                  key={fIdx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-zinc-500 hover:underline truncate max-w-full font-mono flex items-center gap-1"
                                >
                                  📄 {file.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer (Assignee & date) */}
                        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-zinc-150 text-[10px] text-zinc-450 font-mono">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-650 flex items-center justify-center text-[8px] font-bold border border-zinc-200">
                              <User className="w-2.5 h-2.5 shrink-0 text-zinc-500" />
                            </div>
                            <span className="truncate max-w-[90px]">{task.assignee}</span>
                          </div>
                          
                          <span className="text-[9px]">
                            {new Date(task.updatedAt).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING ACTION MENU FOR BULK OPERATIONS */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 border border-zinc-200 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl flex flex-col md:flex-row items-center gap-4 animate-slide-up text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="font-mono text-zinc-500">Đang chọn: <strong className="text-zinc-900">{selectedTaskIds.length}</strong> công việc</span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-200 hidden md:block" />

          <div className="flex items-center gap-3">
            {/* Move to Review */}
            <button
              onClick={() => {
                if (onBulkUpdateStatus) {
                  onBulkUpdateStatus(selectedTaskIds, { status: 'review' });
                } else {
                  selectedTaskIds.forEach(id => onTaskUpdateStatus(id, 'review'));
                }
                setSelectedTaskIds([]);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-medium border border-zinc-200/80 cursor-pointer transition-all active:scale-95 duration-100"
            >
              Move to Review
            </button>

            {/* Bulk Assignee Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    if (onBulkUpdateStatus) {
                      onBulkUpdateStatus(selectedTaskIds, { assignee: val });
                    }
                    setSelectedTaskIds([]);
                    e.target.value = ''; // reset select value
                  }
                }}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 px-3.5 py-1.5 rounded-lg border border-zinc-200/80 text-xs appearance-none cursor-pointer pr-8 font-mono focus-ring font-medium"
              >
                <option value="">Assign To...</option>
                <option value="RKix 🐼">RKix 🐼</option>
                <option value="RKix Core Agent font-bold">RKix Core Agent</option>
                <option value="OpenClaw System">OpenClaw System</option>
                <option value="An Nguyễn">An Nguyễn</option>
                <option value="Bình Trần">Bình Trần</option>
                <option value="Chi Lê">Chi Lê</option>
              </select>
              <span className="absolute right-3 top-2.5 pointer-events-none text-[8px] text-zinc-400 font-sans">▼</span>
            </div>

            {/* Bulk Delete */}
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc chắn muốn xóa ${selectedTaskIds.length} công việc này khỏi hệ thống?`)) {
                  if (onBulkDelete) {
                    onBulkDelete(selectedTaskIds);
                  }
                  setSelectedTaskIds([]);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 hover:text-red-700 font-medium cursor-pointer transition-all active:scale-95 duration-100"
            >
              Bulk Delete
            </button>

            <div className="h-4 w-[1px] bg-zinc-200 hidden md:block" />

            {/* Cancel Selection */}
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-zinc-450 hover:text-zinc-700 font-medium font-mono px-2 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
