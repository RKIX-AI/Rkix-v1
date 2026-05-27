/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, Paperclip, Upload, FileText, Trash2, Eye, ShieldAlert, Check, Loader2 
} from 'lucide-react';
import { Task, Project, Priority, TaskStatus, Attachment } from '../types';

interface TaskModalProps {
  task?: Task;
  projects: Project[];
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskModal({ task, projects, onClose, onSave, onDelete }: TaskModalProps) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [projectId, setProjectId] = useState(task?.projectId || (projects[0]?.id || ''));
  const [assignee, setAssignee] = useState(task?.assignee || 'RKix 🐼');
  const [fileUrl, setFileUrl] = useState(task?.file_url || '');
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || []);
  
  // Frontend State for uploaders
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read file as Base64 helper
  const uploadFileToServer = async (file: File) => {
    setIsUploading(true);
    setErrorMessage('');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result as string;
        
        // POST Base64 content to Express backend upload service
        const response = await fetch('/api/tasks/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            content: base64Content,
            mimeType: file.type
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          const newAttachByUpload: Attachment = {
            name: data.name,
            url: data.file_url,
            size: data.size,
            type: data.type
          };
          setAttachments(prev => [...prev, newAttachByUpload]);
          setFileUrl(data.file_url); // Populate task's file_url directly
        } else {
          setErrorMessage(data.error || 'Tải tệp đính kèm thất bại.');
        }
        setIsUploading(false);
      };
      
      reader.onerror = (err) => {
        setErrorMessage('FileReader error: Không thể đọc tập tin này.');
        setIsUploading(false);
      };

    } catch (err: any) {
      setErrorMessage('Lỗi hệ thống khi tải tệp: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileToServer(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToServer(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = (idxToRemove: number) => {
    const updated = attachments.filter((_, idx) => idx !== idxToRemove);
    setAttachments(updated);
    if (updated.length > 0) {
      setFileUrl(updated[updated.length - 1].url);
    } else {
      setFileUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề công việc!');
      return;
    }
    onSave({
      id: task?.id,
      title,
      description,
      status,
      priority,
      projectId,
      assignee,
      file_url: fileUrl,
      attachments
    });
    onClose();
  };

  const getReadableSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up standard-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <h3 className="text-sm font-semibold text-white tracking-tight font-mono">
            {isEdit ? `CHỈNH SỬA CÔNG VIỆC #${task.id}` : 'TẢI LÊN TIẾN TRÌNH & TẠO TASK MỚI'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Error messages */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/40 border border-red-800/30 rounded-lg text-red-400 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Tiêu Đề Công Việc *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Xây dựng Middleware lọc và giải mã JWT payload..."
              className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs placeholder:text-zinc-600 focus-ring"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Trạng Thái (Kanban List)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs cursor-pointer focus-ring"
              >
                <option value="todo">Todo (Cần làm)</option>
                <option value="in_progress">In Progress (Đang làm)</option>
                <option value="review">Review (Đánh giá)</option>
                <option value="done">Done (Hoàn thành)</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Độ Ưu Tiên (Priority Risk)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs cursor-pointer focus-ring"
              >
                <option value="critical">CRITICAL (Khẩn trương)</option>
                <option value="high">HIGH (Cao)</option>
                <option value="medium">MEDIUM (Trung bình)</option>
                <option value="low">LOW (Thấp)</option>
              </select>
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Thuộc Dự Án (Project Linked)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs cursor-pointer focus-ring"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Thành Viên Biên Chế (Assignee)</label>
              <input 
                type="text" 
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Tên thành viên..."
                className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs placeholder:text-zinc-650 focus-ring"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-zinc-450 font-mono text-[10px] uppercase font-bold tracking-wider">Chi Tiết Công Việc (Description)</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú chi tiết yêu cầu, thiết kế kiến trúc hoặc cách triển khai sản phẩm..."
              className="w-full bg-zinc-900 text-zinc-100 px-3.5 py-2.5 rounded-lg border border-zinc-800 font-mono text-xs placeholder:text-zinc-650 leading-relaxed focus-ring"
            />
          </div>

          {/* INTEGRATED UPLOAD ZIP/CODE DESIGN DROPZONE */}
          <div className="space-y-2.5">
            <label className="block text-accent font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              Upload Sandbox File Attachment (file_url)
            </label>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                dragActive 
                  ? 'border-accent bg-accent/5' 
                  : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                className="hidden" 
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  <span className="text-[11px] font-mono text-zinc-450">Đang mã hóa & đồng bộ tệp lên container...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-accent/80 mb-1.5 shrink-0 animate-pulse" />
                  <p className="text-[11px] font-medium text-zinc-200">Kéo tệp mã nguồn / log vào đây hoặc bấm để chọn tệp</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Hỗ trợ .txt, .json, .yaml, .js, .pdf, v.v (Tối đa 10MB)</p>
                </div>
              )}
            </div>

            {/* Render direct list of attachments inside dialog */}
            {attachments.length > 0 && (
              <div className="mt-3.5 space-y-2">
                <span className="text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider block">Danh sách tập tin đã đồng bộ:</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {attachments.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="truncate text-zinc-300 font-medium" title={file.name}>{file.name}</span>
                        {file.size && (
                          <span className="text-[9px] text-zinc-500 font-semibold">{getReadableSize(file.size)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-accent hover:bg-zinc-800 rounded-md transition-colors"
                          title="Xem tệp / Download"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-850 rounded-md transition-colors cursor-pointer"
                          title="Loại bỏ khỏi Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Directly show current file_url if available */}
            {fileUrl && (
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Trường <code className="text-accent px-1.5 rounded bg-zinc-850">file_url</code>:</span>
                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline truncate max-w-[300px] font-bold">
                  {fileUrl}
                </a>
              </div>
            )}
          </div>
        </form>

        {/* Footer controls */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-3 shrink-0">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa công việc này? Thao tác không thể khôi phục.')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-950/60 border border-red-900/30 text-red-400 hover:bg-red-900/55 hover:text-red-300 font-semibold uppercase text-[10px] font-mono tracking-wider flex items-center gap-1 cursor-pointer transition-all focus-ring"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa Task
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-[11px] font-mono uppercase cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-950 font-bold tracking-wider text-[11px] font-mono uppercase transition-all flex items-center gap-1.5 standard-shadow-sm cursor-pointer focus-ring"
            >
              <Check className="w-3.5 h-3.5 text-zinc-950" />
              {isEdit ? 'Lưu thay đổi' : 'Khởi tạo Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
