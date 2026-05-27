/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Attachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  assignee: string;
  file_url?: string;
  attachments: Attachment[];
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // 0 to 100
  category: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: string;
  message: string;
  details?: string;
}

export interface SecretItem {
  key: string;
  value: string;
  description: string;
  lastUpdated: string;
  isSystem?: boolean;
}
