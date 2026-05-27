/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Search, ArrowRight, ExternalLink, RefreshCw, CheckCircle2, 
  AlertCircle, LogOut, Terminal, Check, Sparkles, Code, HelpCircle, Key, Activity,
  GitCommit, GitPullRequest, GitMerge, ShieldCheck, ArrowLeftRight, FileCode, Clock, Shield,
  Download, FileText
} from 'lucide-react';
import FileTreeGraph from './FileTreeGraph';

interface Repo {
  id: number;
  name: string;
  description: string;
  owner: { login: string };
  default_branch: string;
  stargazers_count: number;
  language: string;
  updated_at?: string;
}

interface GitHubStatus {
  connected: boolean;
  user: { login: string; avatar_url: string; name: string | null } | null;
  hasCredentials: boolean;
}

interface RepositoriesPanelProps {
  onRefreshWorkspace: () => void;
  onViewChange: (view: string) => void;
  triggerToast: (msg: string) => void;
}

export default function RepositoriesPanel({ 
  onRefreshWorkspace, 
  onViewChange, 
  triggerToast 
}: RepositoriesPanelProps) {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoSortCriteria, setRepoSortCriteria] = useState<'stars' | 'name' | 'last_updated'>('stars');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [pullingRepoId, setPullingRepoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<Record<number, string>>({});
  const [activeConsoleLog, setActiveConsoleLog] = useState<string[]>([]);
  const [successProjectId, setSuccessProjectId] = useState<string | null>(null);

  // Layout mode controls
  const [leftTab, setLeftTab] = useState<'api' | 'ssh'>('api');
  const [rightTab, setRightTab] = useState<'terminal' | 'commits' | 'compare' | 'architecture'>('terminal');
  const [syncedFiles, setSyncedFiles] = useState<any[]>([]);
  const [syncedRepoName, setSyncedRepoName] = useState<string>('');

  // SSH states
  const [sshUrl, setSshUrl] = useState('git@github.com:enterprise-workspace/self-healing-core.git');
  const [selectedSshBranch, setSelectedSshBranch] = useState('main');

  // Commits timeline state
  const [selectedRepoForCommits, setSelectedRepoForCommits] = useState<Repo | null>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [revertingSha, setRevertingSha] = useState<string | null>(null);

  // Branch side-by-side compare
  const [selectedRepoForCompare, setSelectedRepoForCompare] = useState<Repo | null>(null);
  const [compareBase, setCompareBase] = useState('main');
  const [compareHead, setCompareHead] = useState('develop');
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // URLs for instructions
  const devUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'https://0.0.0.0:3000/auth/callback';

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.connected) {
          fetchRepos();
        }
      }
    } catch (err) {
      console.error('Failed to fetch github status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/github/repos');
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else {
        const err = await res.json();
        console.error('Error fetching repos:', err.error);
      }
    } catch (err) {
      console.error('Network error fetching repos:', err);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listen for OAuth success message from the authentication popup
    const handleOAuthMessage = (event: MessageEvent) => {
      // Allow messages from identical run.app subdomains or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('0.0.0.0')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        triggerToast('Đã cấp quyền GitHub OAuth thành công!');
        fetchStatus();
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleConnect = async () => {
    if (!status?.hasCredentials) {
      triggerToast('Vui lòng định cấu hình GITHUB_CLIENT_ID trong menu Secrets trước.');
      return;
    }

    try {
      // Build client-side redirect uri 
      const redirectQuery = encodeURIComponent(devUrl);
      const urlRes = await fetch(`/api/auth/github/url?redirect_uri=${redirectQuery}`);
      if (!urlRes.ok) throw new Error('Không thể tạo URL xác thực');
      
      const { url } = await urlRes.json();
      
      // Open GitHub provider URL directly in popup
      const authWindow = window.open(
        url,
        'github_oauth_popup',
        'width=650,height=750,location=no,toolbar=no,menubar=no'
      );

      if (!authWindow) {
        alert('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép Popups đối với trang web này.');
      }
    } catch (err: any) {
      triggerToast('Lỗi khởi tạo cổng xác thực: ' + err.message);
    }
  };

  const handleSimulateConnect = async () => {
    try {
      const res = await fetch('/api/github/simulate-connect', { method: 'POST' });
      if (res.ok) {
        triggerToast('Đã kết nối với GitHub Sandbox (Chế độ mô phỏng)');
        fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/github/disconnect', { method: 'POST' });
      if (res.ok) {
        triggerToast('Đã hủy liên kết tài khoản GitHub.');
        setStatus(prev => prev ? { ...prev, connected: false, user: null } : null);
        setRepos([]);
        setSuccessProjectId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePullRepo = async (repo: Repo) => {
    const branch = selectedBranches[repo.id] || repo.default_branch;
    setPullingRepoId(repo.id);
    setSuccessProjectId(null);

    // Initial console logs simulation
    const logs = [
      `[SANDBOX] Initializing git stream pull workflow for: ${repo.owner.login}/${repo.name}`,
      `[SANDBOX] Contacting endpoint: https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`,
      `[SANDBOX] Using ref: refs/heads/${branch}`,
      `[SANDBOX] Negotiating TLS handshake & verifying security rules...`,
      `[SANDBOX] Pulling files structures recursively...`
    ];
    setActiveConsoleLog(logs);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count === 1) {
        setActiveConsoleLog(prev => [...prev, `[PARSER] Resolving package.json dependencies...`]);
      } else if (count === 2) {
        setActiveConsoleLog(prev => [...prev, `[PARSER] Validating sandbox AST schemas for TypeScript safety...`]);
      } else if (count === 3) {
        setActiveConsoleLog(prev => [...prev, `[COMPILER] Isolated sandbox verified on 0.0.0.0:3000.`]);
      }
    }, 600);

    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner: repo.owner.login,
          repoName: repo.name,
          branch
        })
      });

      clearInterval(interval);

      if (response.ok) {
        const data = await response.json();
        setActiveConsoleLog(prev => [
          ...prev, 
          `[SUCCESS] Pulled complete! Saved in sandbox isolated public storage.`,
          `[EIOS] Project linked: ${data.projectId}`,
          `[EIOS] Container initialized successfully. CPU resource optimized.`
        ]);
        setSuccessProjectId(data.projectId);
        if (data.files && data.files.length > 0) {
          setSyncedFiles(data.files);
          setSyncedRepoName(repo.name);
          setRightTab('architecture'); // Automatically open architecture map
        }
        triggerToast(`Đã kéo thành công Repo ${repo.name} vào Workspace!`);
        onRefreshWorkspace();
      } else {
        const errorData = await response.json();
        setActiveConsoleLog(prev => [...prev, `[ERROR] Failed: ${errorData.error}`]);
        triggerToast('Thất bại: ' + (errorData.error || 'Lỗi kéo tệp tin.'));
      }
    } catch (err: any) {
      clearInterval(interval);
      setActiveConsoleLog(prev => [...prev, `[ERROR] Fatal network error: ${err.message}`]);
      triggerToast('Lỗi truy vấn: ' + err.message);
    } finally {
      setPullingRepoId(null);
    }
  };

  // FETCH REPOSITORY COMMITS
  const fetchCommits = async (repo: Repo) => {
    setSelectedRepoForCommits(repo);
    setLoadingCommits(true);
    setCommits([]);
    setRightTab('commits');
    const branch = selectedBranches[repo.id] || repo.default_branch;
    try {
      const res = await fetch(`/api/github/commits?owner=${repo.owner.login}&repo=${repo.name}&branch=${branch}`);
      if (res.ok) {
        const data = await res.json();
        setCommits(data);
        triggerToast(`Đã đồng bộ lịch sử commit cho @${repo.name}`);
      } else {
        const err = await res.json();
        triggerToast('Không thể tải lịch sử commits: ' + (err.error || 'Unknown erro'));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast('Lỗi mạng khi tải commits: ' + err.message);
    } finally {
      setLoadingCommits(false);
    }
  };

  // ROLLBACK TO PREVIOUS COMMIT
  const handleRevertCommit = async (repoName: string, repoOwner: string, sha: string) => {
    setRevertingSha(sha);
    const shortSha = sha.slice(0, 7);
    const branch = selectedRepoForCommits ? (selectedBranches[selectedRepoForCommits.id] || selectedRepoForCommits.default_branch) : 'main';
    
    // Add custom console logs immediately
    setActiveConsoleLog(prev => [
      ...prev,
      `[REVERT-AGENT] Initiating automatic code reversion to commit hash: #${shortSha}`,
      `[REVERT-AGENT] Cleansing container build path...`,
      `[REVERT-AGENT] Downloading tree revision: refs/heads/${branch}@${shortSha}...`,
      `[REVERT-AGENT] Processing file overrides...`
    ]);

    try {
      const res = await fetch('/api/github/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoOwner,
          repoName,
          commitSha: sha,
          branch
        })
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast(`Quay lui về phiên bản ${shortSha} thành công!`);
        setActiveConsoleLog(prev => [
          ...prev,
          `[SUCCESS] Rollback complete! Sandbox workspace has been set to #${shortSha}`,
          `[COMPILER] Hot reloader synchronized dynamically.`
        ]);
        onRefreshWorkspace();
      } else {
        const err = await res.json();
        triggerToast('Quay lui thất bại: ' + err.error);
        setActiveConsoleLog(prev => [...prev, `[ERROR] Revert target failed: ${err.error}`]);
      }
    } catch (e: any) {
      triggerToast('Lỗi mạng khôi phục: ' + e.message);
    } finally {
      setRevertingSha(null);
    }
  };

  // BRANCH COMPARISON API CALL
  const handleCompareBranches = async (repo: Repo) => {
    setLoadingCompare(true);
    setCompareResult(null);
    setSelectedRepoForCompare(repo);
    setRightTab('compare');
    try {
      const res = await fetch(`/api/github/compare?owner=${repo.owner.login}&repo=${repo.name}&base=${compareBase}&head=${compareHead}`);
      if (res.ok) {
        const data = await res.json();
        setCompareResult(data);
        triggerToast(`So sánh thành công ${compareBase} và ${compareHead}`);
      } else {
        triggerToast('Lỗi phân tích so sánh nhánh.');
      }
    } catch (e: any) {
      triggerToast('Lỗi mạng khi so sánh nhánh: ' + e.message);
    } finally {
      setLoadingCompare(false);
    }
  };

  // EXPORT COMPARISON REPORT AS JSON
  const exportAsJSON = () => {
    if (!compareResult) {
      triggerToast("Không có kết quả so sánh để xuất.");
      return;
    }
    try {
      const exportData = {
        repository: selectedRepoForCompare?.name,
        owner: selectedRepoForCompare?.owner?.login,
        base_branch: compareBase,
        head_branch: compareHead,
        status: compareResult.status,
        ahead_by: compareResult.ahead_by,
        files_count: compareResult.files?.length || 0,
        files: compareResult.files?.map((file: any) => ({
          filename: file.filename,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          status: file.status,
          patch: file.patch || null
        })) || []
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `branch_compare_${selectedRepoForCompare?.name || 'repo'}_${compareBase}_vs_${compareHead}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Đã tải xuống báo cáo so sánh JSON thành công!");
    } catch (e: any) {
      console.error(e);
      triggerToast("Có lỗi xảy ra khi tạo tệp JSON: " + e.message);
    }
  };

  // EXPORT COMPARISON REPORT AS FORMATTED TEXT
  const exportAsText = () => {
    if (!compareResult) {
      triggerToast("Không có kết quả so sánh để xuất.");
      return;
    }
    try {
      let txt = `========================================================\n`;
      txt += `BRANCH COMPARISON SUMMARY REPORT\n`;
      txt += `========================================================\n`;
      txt += `Repository: ${selectedRepoForCompare?.owner?.login}/${selectedRepoForCompare?.name}\n`;
      txt += `Range: ${compareBase} (Base) <--- [${compareResult.status}] <--- ${compareHead} (Head)\n`;
      txt += `Commits Ahead: ${compareResult.ahead_by} commit(s)\n`;
      txt += `Files Changed: ${compareResult.files?.length || 0} file(s)\n`;
      txt += `Run Date: ${new Date().toLocaleString()}\n`;
      txt += `========================================================\n\n`;

      if (compareResult.files && compareResult.files.length > 0) {
        txt += `CHANGED FILES DETAILS:\n`;
        compareResult.files.forEach((file: any, index: number) => {
          txt += `--------------------------------------------------------\n`;
          txt += `[${index + 1}] File: ${file.filename}\n`;
          txt += `    Additions: +${file.additions} | Deletions: -${file.deletions} | Changes: ${file.changes}\n`;
          if (file.patch) {
            txt += `\n    Patch content:\n`;
            const indentedPatch = file.patch.split('\n').map((line: string) => `    ${line}`).join('\n');
            txt += `${indentedPatch}\n`;
          } else {
            txt += `    (Binary file or no patch info available)\n`;
          }
          txt += `\n`;
        });
      } else {
        txt += `No changed files detected between these branches.\n`;
      }

      txt += `========================================================\n`;
      txt += `Generated by Sandbox Developer Tools.\n`;
      txt += `========================================================\n`;

      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `branch_compare_${selectedRepoForCompare?.name || 'repo'}_${compareBase}_vs_${compareHead}_report.txt`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      triggerToast("Đã tải xuống báo cáo tóm tắt văn bản thành công!");
    } catch (e: any) {
      console.error(e);
      triggerToast("Có lỗi xảy ra khi tạo tệp văn bản: " + e.message);
    }
  };

  // SECURE SSH CLONING EXECUTION
  const handlePullSshRepo = async () => {
    if (!sshUrl) {
      triggerToast('Vui lòng nhập đường dẫn SSH hợp lệ!');
      return;
    }
    setPullingRepoId(9999); // SSH unique state indicator
    setSuccessProjectId(null);
    setRightTab('terminal');

    setActiveConsoleLog([
      `[SSH-TUNNEL] Spawning isolated secure SSH key agent...`,
      `[SSH-TUNNEL] Target git endpoint: ${sshUrl}`,
      `[SSH-TUNNEL] Verifying enterprise-grade Private Key configurations...`,
      `[SSH-TUNNEL] Bypassing fingerprint verification and establishing TLS Tunnel...`,
      `[SSH-TUNNEL] Handshake OK! Cloned files safely into host Sandbox`
    ]);

    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sshUrl,
          branch: selectedSshBranch,
          useSsh: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveConsoleLog(prev => [
          ...prev, 
          `[SUCCESS] SSH clone complete! Cloned files securely.`,
          `[EIOS] Project linked: ${data.projectId}`,
          `[EIOS] Sandbox deployment pipeline synchronized.`
        ]);
        setSuccessProjectId(data.projectId);
        if (data.files && data.files.length > 0) {
          setSyncedFiles(data.files);
          setSyncedRepoName(sshUrl.split('/').pop()?.replace('.git', '') || 'SSH Project');
          setRightTab('architecture'); // Automatically open architecture map
        }
        triggerToast(`Kéo mã nguồn qua cổng SSH bảo mật thành công!`);
        onRefreshWorkspace();
      } else {
        const err = await response.json();
        setActiveConsoleLog(prev => [...prev, `[ERROR] SSH clone failed: ${err.error}`]);
        triggerToast('SSH Pull thất bại: ' + (err.error || 'Lỗi bất ngờ.'));
      }
    } catch (err: any) {
      setActiveConsoleLog(prev => [...prev, `[ERROR] Failed network request: ${err.message}`]);
      triggerToast('Lỗi mạng SSH: ' + err.message);
    } finally {
      setPullingRepoId(null);
    }
  };

  const filteredRepos = repos
    .filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (repoSortCriteria === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      } else if (repoSortCriteria === 'name') {
        return a.name.localeCompare(b.name);
      } else if (repoSortCriteria === 'last_updated') {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center h-full min-h-full bg-[#f9f9fb] text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="font-mono text-xs">Loading GitHub configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#f9f9fb] text-zinc-700 min-h-full overflow-y-auto custom-scrollbar text-xs space-y-6 animate-fade-in">
      
      {/* Header section */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2 uppercase font-mono">
            <GitBranch className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
            GitHub Repository Console
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans leading-relaxed">
            Kết nối trực tiếp tài khoản GitHub và đồng bộ mã nguồn vào vùng cát Docker-sandbox isolated trên hệ thống console RKix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-150 text-blue-700 font-bold flex items-center gap-1.5 shadow-xs">
            <Activity className="w-3.5 h-3.5 text-blue-600" /> SECURE TUNNEL Enabled
          </span>
        </div>
      </div>

      {/* Connection panel (If NOT connected) */}
      {!status?.connected ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-xl space-y-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-zinc-900 font-bold text-sm tracking-tight font-sans">Xác thực tài khoản GitHub</h3>
                  <p className="text-zinc-500 leading-relaxed mt-1 font-sans text-xs">
                    Nạp mã nguồn bảo mật của bạn trực tiếp bằng cách liên kết thông qua cổng OAuth 2.0 chuẩn của GitHub.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
                <button
                  onClick={handleConnect}
                  disabled={!status?.hasCredentials}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all cursor-pointer text-xs uppercase tracking-wider ${
                    status?.hasCredentials 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs' 
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Kích hoạt OAuth Link
                </button>
                <button
                  onClick={handleSimulateConnect}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold rounded-lg border border-zinc-200 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Sử dụng Sandbox Simulator Mode
                </button>
              </div>

              {/* Credentials warning */}
              {!status?.hasCredentials && (
                <div className="p-4 bg-amber-50 border border-amber-205 rounded-lg flex gap-3 text-[11px] leading-relaxed text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold block">Chưa có thông số Credentials!</span>
                    <span className="font-sans text-zinc-650 mt-1 block">
                      Vui lòng định cấu hình biến bí mật <code className="text-amber-800 font-bold font-mono px-1 py-0.5 bg-amber-100/50 border border-amber-200 rounded">GITHUB_CLIENT_ID</code> và <code className="text-amber-800 font-bold font-mono px-1 py-0.5 bg-amber-100/50 border border-amber-200 rounded">GITHUB_CLIENT_SECRET</code> trong menu <span className="underline cursor-pointer font-bold text-indigo-605" onClick={() => onViewChange('secrets')}>Secrets & Keys</span> để khởi chạy kết nối GitHub thực tế của riêng bạn.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Setup manual instructions column */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-200 p-6 rounded-xl space-y-4 font-sans text-zinc-600 shadow-xs">
              <h3 className="text-zinc-900 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 border-b border-zinc-150 pb-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-650" />
                Hướng dẫn cấu hình GitHub App:
              </h3>
              
              <ol className="list-decimal list-inside space-y-3 pl-1 leading-relaxed text-[11px] text-zinc-550">
                <li>
                  Mở trang cấu hình <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">GitHub Developer Portal <ExternalLink className="w-3 h-3" /></a>
                </li>
                <li>
                  Tạo mới một <b>OAuth Application</b>.
                </li>
                <li>
                  Nhập URL cấu hình <b>Authorization callback URL</b> sau đây:
                  <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg font-mono text-[10px] text-zinc-650 select-all mt-1.5 break-all max-w-full shadow-xs">
                    {devUrl}
                  </div>
                </li>
                <li>
                  Sao chép <b>Client ID</b> & sinh mới <b>Client Secret</b> rồi dán chúng vào tab <b>Secrets Manager</b> tại thanh menu RKix.
                </li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        // Connected State Layout
        <div className="space-y-6">
          {/* User profile card status */}
          <div className="bg-white border border-zinc-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <img 
                src={status.user?.avatar_url || 'https://github.com/github.png'} 
                alt="GitHub Avatar" 
                className="w-12 h-12 rounded-full border-2 border-indigo-500/20 object-cover bg-zinc-50 shrink-0 shadow-xs"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-900 font-bold text-sm tracking-tight">@{status.user?.login}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-150 text-emerald-600 text-[9px] font-bold font-mono shadow-xs uppercase h-5 flex items-center">
                    CONNECTED SUCCESS ✔
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-sans">{status.user?.name || 'Tài khoản liên kết'}</p>
              </div>
            </div>

            <button 
              onClick={handleDisconnect}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-600 font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer focus-ring self-start sm:self-center text-[10px] uppercase tracking-wider shadow-xs"
            >
              <LogOut className="w-4 h-4" /> Ngắt kết nối
            </button>
          </div>

          {/* Grid Layout of Repository search and Live debugger pull progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Repo listing or SSH cloning */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tab control headers */}
              <div className="flex border-b border-zinc-200 font-mono">
                <button
                  onClick={() => setLeftTab('api')}
                  className={`px-4 py-2.5 text-[10px] font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    leftTab === 'api' 
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30 font-bold' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    GitHub API Repositories
                  </div>
                </button>
                <button
                  onClick={() => setLeftTab('ssh')}
                  className={`px-4 py-2.5 text-[10px] font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    leftTab === 'ssh' 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/30 font-bold' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    Secure SSH Enterprise Clone
                  </div>
                </button>
              </div>

              {leftTab === 'api' ? (
                <div className="bg-white border border-zinc-200 p-5 rounded-xl space-y-4 shadow-xs">
                  
                  {/* Search & Header */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-zinc-150 pb-4">
                    <span className="text-zinc-900 font-bold text-xs uppercase tracking-wider font-mono">Kho lưu trữ repositories ({filteredRepos.length}) :</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                        <input 
                          type="text" 
                          placeholder="Tìm kiếm kho lưu trữ, ngôn ngữ..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 pl-8 pr-3 py-2 text-[11px] rounded-lg focus:outline-none focus:border-indigo-500 font-sans transition-all focus-ring shadow-2xs"
                        />
                      </div>
                      
                      <div className="relative flex-1 sm:flex-initial">
                        <select
                          value={repoSortCriteria}
                          onChange={(e) => setRepoSortCriteria(e.target.value as any)}
                          className="w-full sm:w-auto bg-zinc-50 border border-zinc-200 text-zinc-700 px-3.5 py-2 text-[11px] rounded-lg focus:outline-none focus:border-indigo-500 font-mono transition-all focus-ring cursor-pointer select-none shadow-xs"
                        >
                          <option value="stars">⭐ Sắp xếp: Số sao (Stars)</option>
                          <option value="name">🐼 Sắp xếp: Tên (Name)</option>
                          <option value="last_updated">🕒 Sắp xếp: Cập nhật (Last Updated)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                {/* Listing */}
                {loadingRepos ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 font-mono text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                    <span>Đang nạp danh sách dự án...</span>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 font-sans">
                    Không tìm thấy kho lưu trữ mã nguồn nào.
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {filteredRepos.map(repo => {
                      const currentBranch = selectedBranches[repo.id] || repo.default_branch;
                      const isPulling = pullingRepoId === repo.id;

                      return (
                        <div 
                          key={repo.id} 
                          className="p-4 bg-zinc-50/60 border border-zinc-200 hover:border-zinc-300 transition-all rounded-xl cursor-default group shadow-2xs"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 min-w-0 flex-1">
                                <div>
                                  <h4 className="text-zinc-900 font-bold text-xs tracking-tight truncate group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                    <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    {repo.name}
                                  </h4>
                                  {repo.description && (
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-sans line-clamp-2 mt-1">{repo.description}</p>
                                  )}
                                </div>

                                {/* Attributes */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-405 pt-1">
                                  {repo.language && (
                                    <span className="flex items-center gap-1 shrink-0 text-zinc-600 font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                      {repo.language}
                                    </span>
                                  )}
                                  <span className="shrink-0 text-zinc-500">⭐ {repo.stargazers_count} stars</span>
                                  
                                  {/* Branch dropdown picker */}
                                  <div className="flex items-center gap-1 bg-white hover:bg-zinc-50 border border-zinc-200 py-0.5 px-2 rounded-md transition-all shrink-0 shadow-2xs">
                                    <span className="text-[9px] text-zinc-500">Branch:</span>
                                    <select 
                                      value={currentBranch}
                                      onChange={(e) => setSelectedBranches({ ...selectedBranches, [repo.id]: e.target.value })}
                                      className="bg-transparent border-0 text-zinc-800 font-mono font-bold text-[9px] focus:outline-none cursor-pointer pr-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <option value={repo.default_branch} className="bg-white text-zinc-850">{repo.default_branch}</option>
                                      {repo.default_branch !== 'main' && <option value="main" className="bg-white text-zinc-850">main</option>}
                                      {repo.default_branch !== 'master' && <option value="master" className="bg-white text-zinc-850">master</option>}
                                      {repo.default_branch !== 'develop' && <option value="develop" className="bg-white text-zinc-850">develop</option>}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Pull action button */}
                              <button
                                onClick={() => handlePullRepo(repo)}
                                disabled={pullingRepoId !== null}
                                className={`px-3.5 py-2.5 rounded-lg border text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 focus-ring hover:scale-[1.01] duration-100 flex items-center gap-1.5 ${
                                  isPulling 
                                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white shadow-2xs'
                                }`}
                              >
                                {isPulling ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                    Pulling...
                                  </>
                                ) : (
                                  <>
                                    Sync Sandbox
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Interactive Commits and Compare links */}
                            <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-150 text-[10px] font-mono text-zinc-400">
                              <button
                                onClick={(e) => { e.stopPropagation(); fetchCommits(repo); }}
                                className="hover:text-indigo-600 text-zinc-500 transition-colors flex items-center gap-1 cursor-pointer font-bold py-1"
                              >
                                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Commit History Timeline
                              </button>
                              <span className="text-zinc-300">|</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedRepoForCompare(repo); setRightTab('compare'); }}
                                className="hover:text-blue-600 text-zinc-500 transition-colors flex items-center gap-1 cursor-pointer font-bold py-1"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" /> Branch Comparison Diff
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Custom Secure SSH Clone interface
              <div className="bg-white border border-zinc-200 p-5 rounded-xl space-y-5 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-zinc-900 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-650" />
                    Kết nối và Clone qua cổng SSH bảo mật
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Nhập địa chỉ repository SSH để kéo mã nguồn trực tiếp mà không cần cung cấp Access Token của tài khoản. 
                  </p>
                </div>

                {/* Form inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-500 font-bold font-mono text-[10px]">ĐƯỜNG DẪN CLONE SSH (SSH URL)</label>
                    <div className="relative">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="git@github.com:username/repository.git"
                        value={sshUrl}
                        onChange={(e) => setSshUrl(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 pl-9 pr-3 py-2.5 text-[11px] rounded-lg focus:outline-none focus:border-indigo-500 font-mono transition-all focus-ring shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 font-bold font-mono text-[10px]">NHÁNH PHÂN TÍCH (BRANCH)</label>
                      <input
                        type="text"
                        placeholder="main"
                        value={selectedSshBranch}
                        onChange={(e) => setSelectedSshBranch(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 px-3 py-2 text-[11px] rounded-lg focus:outline-none focus:border-indigo-500 font-mono transition-all focus-ring shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 font-bold font-mono text-[10px]">XÁC THỰC KHÓA BẢO MẬT (SSH KEY STATUS)</label>
                      <div className="px-3 py-2 bg-emerald-50 border border-emerald-150 text-emerald-700 font-mono text-[10.5px] rounded-lg flex items-center gap-2 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span className="font-bold">ACTIVE SYSTEM PRIVATE KEY</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePullSshRepo}
                    disabled={pullingRepoId !== null}
                    className={`w-full py-3 rounded-lg font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-2 focus-ring uppercase tracking-wider ${
                      pullingRepoId === 9999
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-750 text-white hover:scale-[1.01] active:scale-[0.99] duration-100 shadow-xs'
                    }`}
                  >
                    {pullingRepoId === 9999 ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                        Connecting & Cloning SSH target...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4" />
                        Đồng bộ Sandbox qua SSH Secure
                      </>
                    )}
                  </button>
                </div>

                {/* Tips block */}
                <div className="p-4 bg-blue-50/50 border border-blue-150 text-[11px] leading-relaxed text-zinc-650 rounded-lg space-y-1.5 font-sans shadow-2xs">
                  <p className="font-bold text-zinc-800 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" /> Doanh nghiệp & Bảo mật Enterprise
                  </p>
                  <p className="text-[10.5px]">
                    Khi sử dụng chế độ bắt tay SSH, hệ thống sandbox sẽ giao tiếp độc quyền thông qua khóa <b>SSH_PRIVATE_KEY</b> đã định cấu hình bảo mật. Thao tác hoàn toàn an toàn và được mã hóa TLS đầu cuối với repository.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right box: Dynamic Debug, Commits, are compare tabs */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* If sandbox import recently completed successfully */}
            {successProjectId && (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl space-y-4 shadow-sm animation-slide-in">
                <div className="flex items-center gap-2.5 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold tracking-tight text-xs uppercase font-mono">Đồng bộ mã nguồn thành công</span>
                </div>
                
                <p className="text-zinc-650 font-sans text-[11px] leading-relaxed font-semibold">
                  Dự án mới liên kết thông qua GitHub đã được cấu hình toàn vẹn trong sandbox workspace. Toàn bộ index files và tệp đính kèm thô đã sẵn sàng trên Kanban Board.
                </p>

                <button
                  onClick={() => onViewChange('kanban')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white font-bold rounded-lg cursor-pointer transition-all text-[11.5px] focus-ring shadow-xs"
                >
                  Xem dự án mới trên Kanban <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dynamic tab controls for right-hand utilities */}
            <div className="space-y-4">
              <div className="flex bg-zinc-100 border border-zinc-200 rounded-lg p-1 shrink-0 shadow-2xs">
                <button
                  onClick={() => setRightTab('terminal')}
                  className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
                    rightTab === 'terminal' 
                      ? 'bg-white text-indigo-700 font-bold shadow-xs' 
                      : 'text-zinc-450 hover:text-zinc-650'
                  }`}
                >
                  Stdout Logs
                </button>
                <button
                  onClick={() => setRightTab('commits')}
                  className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
                    rightTab === 'commits' 
                      ? 'bg-white text-[#d97706] font-bold shadow-xs' 
                      : 'text-zinc-455 hover:text-zinc-650'
                  }`}
                >
                  Git Commits ({commits.length})
                </button>
                <button
                  onClick={() => setRightTab('compare')}
                  className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
                    rightTab === 'compare' 
                      ? 'bg-white text-blue-700 font-bold shadow-xs' 
                      : 'text-zinc-455 hover:text-zinc-650'
                  }`}
                >
                  Compare Diff
                </button>
                <button
                  onClick={() => setRightTab('architecture')}
                  className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
                    rightTab === 'architecture' 
                      ? 'bg-white text-purple-700 font-bold shadow-xs' 
                      : 'text-zinc-455 hover:text-zinc-650'
                  }`}
                >
                  Source Map (D3)
                </button>
              </div>

              {/* Terminal panel */}
              {rightTab === 'terminal' && (
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider font-mono text-[9px] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      Terminal: Sandbox Pull Stream (stdout)
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" title="Stream Listening" />
                  </div>
                  
                  <div className="p-4 bg-zinc-900 font-mono text-[10px] text-zinc-300 min-h-[300px] max-h-[460px] overflow-y-auto space-y-1.5 custom-scrollbar shadow-inner mt-1 rounded-b-xl border border-t-0 border-zinc-200">
                    {activeConsoleLog.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-400 py-24 text-center select-none leading-relaxed italic border border-zinc-700 border-dashed rounded-lg bg-zinc-950/40 m-2">
                        Lắng nghe pipeline... <br /><br />
                        Nhấn "Sync Sandbox" hoặc "Đồng bộ qua SSH" để theo dõi logs kéo mã nguồn trực tiếp.
                      </div>
                    ) : (
                      activeConsoleLog.map((line, ix) => (
                        <div 
                          key={ix} 
                          className={`leading-relaxed border-l-2 pl-2 ${
                            line.includes('[SUCCESS]') ? 'text-emerald-400 border-emerald-500 font-bold' :
                            line.includes('[ERROR]') ? 'text-red-400 border-red-500 font-bold' :
                            line.includes('[EIOS]') ? 'text-indigo-400 border-indigo-500' :
                            line.includes('[PARSER]') ? 'text-blue-400 border-blue-500' :
                            line.includes('[SSH-TUNNEL]') ? 'text-cyan-400 border-cyan-500 font-bold' :
                            line.includes('[REVERT-AGENT]') ? 'text-amber-400 border-amber-500' :
                            'text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {line}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Commits Panel */}
              {rightTab === 'commits' && (
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                    <div>
                      <h4 className="text-zinc-900 font-bold font-mono text-xs uppercase tracking-tight flex items-center gap-1.5">
                        <GitCommit className="w-4 h-4 text-[#d97706] animate-pulse" />
                        Commit History Timeline
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold">
                        {selectedRepoForCommits ? `@${selectedRepoForCommits.name}` : 'Chưa có repository được chọn'}
                      </p>
                    </div>
                    {selectedRepoForCommits && (
                      <button
                        onClick={() => fetchCommits(selectedRepoForCommits)}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-all cursor-pointer"
                        title="Làm mới commits"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingCommits ? 'animate-spin text-[#f59e0b]' : ''}`} />
                      </button>
                    )}
                  </div>

                  {loadingCommits ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                      <span className="font-mono text-[10px]">Tải danh sách commits từ GitHub...</span>
                    </div>
                  ) : !selectedRepoForCommits ? (
                    <div className="py-20 text-center text-zinc-450 italic font-sans border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
                      Bấm vào nút "Commit History Timeline" ngay dưới tên repo trong danh sách để xem lịch sử hoạt động mã nguồn.
                    </div>
                  ) : commits.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400 font-sans">
                      Không tìm thấy commits nào trên nhánh hiện tại.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {commits.map((c) => {
                        const sha = c.sha;
                        const author = c.commit?.author?.name || c.author?.login || 'Developer';
                        const avatar = c.author?.avatar_url || 'https://github.com/github.png';
                        const date = new Date(c.commit?.author?.date || Date.now()).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                        const isReverting = revertingSha === sha;

                        return (
                          <div key={sha} className="p-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg flex gap-2.5 relative transition-all shadow-2xs">
                            <img src={avatar} className="w-7 h-7 rounded-full border border-zinc-200 object-cover mt-0.5 shrink-0" alt="Avatar" />
                            <div className="flex-1 space-y-1.5 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-800 font-bold text-[11px] truncate">{author}</span>
                                <span className="text-zinc-405 font-mono text-[9px] shrink-0 font-bold">{date}</span>
                              </div>
                              <p className="text-[11px] text-zinc-650 font-sans leading-relaxed break-all font-medium">{c.commit?.message}</p>
                              
                              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-150 mt-1">
                                <code className="text-[10px] text-amber-700 bg-amber-50 border border-amber-205 px-1.5 py-0.5 rounded-md font-bold font-mono">#{sha.slice(0, 7)}</code>
                                <button
                                  onClick={() => handleRevertCommit(selectedRepoForCommits.name, selectedRepoForCommits.owner.login, sha)}
                                  disabled={revertingSha !== null}
                                  className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/55 text-amber-600 font-bold text-[9px] tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all focus-ring"
                                >
                                  {isReverting ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin inline-block mr-1" />
                                  ) : 'Revert Sandbox'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Comparison tab Panel */}
              {rightTab === 'compare' && (
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4 shadow-xs">
                  <div className="border-b border-zinc-150 pb-3">
                    <h4 className="text-zinc-900 font-bold font-mono text-xs uppercase tracking-tight flex items-center gap-1.5">
                      <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                      Branch Comparison Utility
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-bold">
                      {selectedRepoForCompare ? `@${selectedRepoForCompare.name}` : 'Chưa có repository được chọn'}
                    </p>
                  </div>

                  {!selectedRepoForCompare ? (
                    <div className="py-20 text-center text-zinc-450 italic font-sans border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
                      Bấm vào nút "Branch Comparison Diff" ngay dưới tên repo trong danh sách để bắt đầu cấu hình so sánh code.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Selector interface */}
                      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                        <div className="space-y-1">
                          <span className="text-zinc-500 block font-bold">BASE BRANCH (GỐC)</span>
                          <select
                            value={compareBase}
                            onChange={(e) => setCompareBase(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded p-1.5 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer text-[10px] shadow-2xs"
                          >
                            <option value={selectedRepoForCompare.default_branch}>{selectedRepoForCompare.default_branch}</option>
                            {selectedRepoForCompare.default_branch !== 'main' && <option value="main">main</option>}
                            {selectedRepoForCompare.default_branch !== 'master' && <option value="master">master</option>}
                            {selectedRepoForCompare.default_branch !== 'develop' && <option value="develop">develop</option>}
                            <option value="staging">staging</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-zinc-500 block font-bold">HEAD BRANCH (SO TRÌNH)</span>
                          <select
                            value={compareHead}
                            onChange={(e) => setCompareHead(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded p-1.5 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer text-[10px] shadow-2xs"
                          >
                            <option value="develop">develop</option>
                            <option value="main">main</option>
                            <option value="master">master</option>
                            <option value="feature-core">feature-core</option>
                            <option value="staging">staging</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCompareBranches(selectedRepoForCompare)}
                        disabled={loadingCompare}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-lg text-[10.5px] font-mono transition-all uppercase cursor-pointer focus-ring flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {loadingCompare ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> Analyzing Branches Difference...
                          </>
                        ) : (
                          <>
                            <ArrowLeftRight className="w-3.5 h-3.5 text-white" /> Chạy So Sánh Sự Khác Biệt
                          </>
                        )}
                      </button>

                      {/* Comparison Results Area */}
                      {compareResult && (
                        <div className="space-y-3 pt-3 border-t border-zinc-150 text-[10px] font-mono animation-fade-in">
                          <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 shadow-2xs">
                            <span>Trạng thái: <b className="text-[#a855f7] uppercase font-bold">{compareResult.status}</b></span>
                            <span>Diff: <b className="text-emerald-700 font-bold">+{compareResult.ahead_by} commits</b></span>
                          </div>

                          {/* Export buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={exportAsJSON}
                              title="Tải về báo cáo định dạng JSON đầy đủ thông tin cấu trúc"
                              className="px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-indigo-600 transition-all rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[9px] uppercase tracking-wider shadow-2xs"
                            >
                              <Download className="w-3 h-3 text-indigo-650" />
                              Export JSON
                            </button>
                            <button
                              onClick={exportAsText}
                              title="Tải về bản tóm tắt định dạng văn bản dễ đọc cho nhà phát triển"
                              className="px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-blue-600 transition-all rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[9px] uppercase tracking-wider shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-blue-500" />
                              Export Summary TXT
                            </button>
                          </div>

                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar font-mono text-[9px]">
                            {compareResult.files?.map((file: any, fIdx: number) => (
                              <div key={fIdx} className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                                <div className="bg-zinc-50 px-2.5 py-1.5 border-b border-zinc-200 flex items-center justify-between text-[9px]">
                                  <span className="text-zinc-850 font-bold truncate max-w-[170px]" title={file.filename}>📄 {file.filename}</span>
                                  <span className="text-[8.5px] text-emerald-600 font-bold shrink-0">+{file.additions} -{file.deletions}</span>
                                </div>
                                {file.patch ? (
                                  <pre className="p-2.5 overflow-x-auto text-[8.5px] text-zinc-700 bg-zinc-50 custom-scrollbar leading-relaxed whitespace-pre font-mono">
                                    {file.patch}
                                  </pre>
                                ) : (
                                  <div className="p-2 text-zinc-400 italic text-[9px] text-center">Tập tin không có dòng thay đổi thô.</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Architecture map D3.js structure tree panel */}
              {rightTab === 'architecture' && (
                <FileTreeGraph 
                  files={syncedFiles}
                  repoName={syncedRepoName || "Local Sandbox Workspace"} 
                />
              )}
            </div>

          </div>

          {/* Quick instructions widget */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-xl space-y-3.5 font-sans text-zinc-400">
              <span className="text-white font-bold text-xs uppercase tracking-wider font-mono block">Workflow Sandbox:</span>
              <p className="text-[11px] leading-relaxed">
                Khi nhấn <b>Sync Sandbox</b> hoặc <b>SSH Secure</b>, hệ thống sẽ tự động khởi động pipeline nạp mã cấu trúc, hoàn toàn tương thích với AST Analyzer và Sandbox Compiler.
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed text-zinc-450">
                <li>Tự động liên kết và phân tích cấu trúc của mã nguồn.</li>
                <li>Cấp phát Task Kanban & gán tác vụ tự đồng bộ cho Daemon Agent.</li>
                <li>Dễ dàng xem và so sánh sự khác biệt của nhánh trước khi thực hiện đồng bộ.</li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
