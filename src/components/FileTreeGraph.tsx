import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  Search, RefreshCw, ZoomIn, ZoomOut, Maximize2, 
  FolderOpen, FileCode, GitBranch, Terminal, Shield, Info, LayoutTemplate
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  size?: number;
}

interface FileTreeGraphProps {
  files?: FileItem[];
  repoName?: string;
  onSelectNode?: (path: string) => void;
}

interface TreeNode {
  name: string;
  path?: string;
  size?: number;
  type: 'file' | 'directory' | 'root';
  children?: TreeNode[];
}

// Default workspace structure matching our sandbox for beautiful demo view
const DEFAULT_SANDBOX_FILES: FileItem[] = [
  { name: "App.tsx", path: "src/App.tsx", size: 32100 },
  { name: "types.ts", path: "src/types.ts", size: 3400 },
  { name: "main.tsx", path: "src/main.tsx", size: 1200 },
  { name: "index.css", path: "src/index.css", size: 2100 },
  { name: "Sidebar.tsx", path: "src/components/Sidebar.tsx", size: 18400 },
  { name: "AgentChat.tsx", path: "src/components/AgentChat.tsx", size: 14200 },
  { name: "AnalysisDashboard.tsx", path: "src/components/AnalysisDashboard.tsx", size: 21300 },
  { name: "KanbanBoard.tsx", path: "src/components/KanbanBoard.tsx", size: 25400 },
  { name: "LogsConsole.tsx", path: "src/components/LogsConsole.tsx", size: 15400 },
  { name: "RepositoriesPanel.tsx", path: "src/components/RepositoriesPanel.tsx", size: 65120 },
  { name: "SettingsPanel.tsx", path: "src/components/SettingsPanel.tsx", size: 26100 },
  { name: "TaskModal.tsx", path: "src/components/TaskModal.tsx", size: 12100 },
  { name: "package.json", path: "package.json", size: 945 },
  { name: "server.ts", path: "server.ts", size: 46899 },
  { name: "vite.config.ts", path: "vite.config.ts", size: 850 },
  { name: "tsconfig.json", path: "tsconfig.json", size: 420 },
  { name: "metadata.json", path: "metadata.json", size: 250 }
];

export default function FileTreeGraph({ 
  files = [], 
  repoName = "Local Sandbox Workspace",
  onSelectNode
}: FileTreeGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<{ name: string; path: string; size?: number; type: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const zoomBehaviorRef = useRef<any>(null);

  // Fallback to demo files if none are provided
  const activeFiles = files && files.length > 0 ? files : DEFAULT_SANDBOX_FILES;
  const isUsingDefault = !(files && files.length > 0);

  // Helper to convert flat file paths into hierarchical TreeNode
  const buildTreeHierarchy = (fileList: FileItem[]): TreeNode => {
    const root: TreeNode = {
      name: repoName,
      type: 'root',
      children: []
    };

    fileList.forEach(file => {
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        if (!current.children) {
          current.children = [];
        }

        let child = current.children.find(c => c.name === part);
        if (!child) {
          const isFile = index === parts.length - 1;
          child = {
            name: part,
            type: isFile ? 'file' : 'directory',
            ...(isFile ? { size: file.size, path: file.path } : { children: [] })
          };
          current.children.push(child);
        }
        current = child;
      });
    });

    return root;
  };

  const formattedSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Render tree using D3.js
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = 440;

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const dataTree = buildTreeHierarchy(activeFiles);

    // Create D3 hierarchy and layout
    const root = d3.hierarchy<TreeNode>(dataTree);
    
    // Custom node positioning layout
    const treeLayout = d3.tree<TreeNode>()
      .size([height, width])
      .nodeSize([34, 150]); // Spacing between nodes

    treeLayout(root);

    // Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', containerHeight)
      .style('background-color', '#070709');

    // Filter/Marker Definitions (for nice glows and paths)
    const defs = svg.append('defs');
    
    // Glow effect
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    glowFilter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Create a container group for zooming
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${containerHeight / 2})`);

    // Zooming capabilities
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);
    zoomBehaviorRef.current = { zoom, svg };

    // Initial positioning to center the root
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(80, containerHeight / 2).scale(0.85));

    // Links (connector curves)
    const curveLink = d3.linkHorizontal<any, d3.HierarchyPointNode<TreeNode>>()
      .x(d => d.y)
      .y(d => d.x);

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', curveLink as any)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        // Highlight link if target matches search query
        if (searchQuery && d.target.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 'var(--color-primary-accent, #a855f7)';
        }
        return 'rgba(63, 63, 70, 0.45)'; // zinc-700 / opacity
      })
      .attr('stroke-width', (d) => {
        if (searchQuery && d.target.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return 2;
        }
        return 1.25;
      })
      .attr('stroke-dasharray', (d) => d.target.data.type === 'directory' ? 'none' : '2,2')
      .style('transition', 'stroke 0.3s, stroke-width 0.3s');

    // Nodes container
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode({
          name: d.data.name,
          path: d.data.path || d.ancestors().reverse().map(a => a.data.name).slice(1).join('/'),
          size: d.data.size,
          type: d.data.type
        });
        if (onSelectNode && d.data.path) {
          onSelectNode(d.data.path);
        }
      });

    // Node Circle Styling
    node.append('circle')
      .attr('r', d => {
        if (d.data.type === 'root') return 7;
        if (d.data.type === 'directory') return 5.5;
        return 4.5;
      })
      .attr('fill', d => {
        if (d.data.type === 'root') return '#a855f7'; // Purple-accent
        if (d.data.type === 'directory') return '#ec4899'; // Pink directory
        // File node
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return '#10b981'; // Green active match
        }
        return '#3b82f6'; // Blue file
      })
      .attr('stroke', d => {
        if (searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return '#34d399';
        }
        if (d.data.type === 'root') return 'rgba(168, 85, 247, 0.3)';
        return '#1b1b1f';
      })
      .attr('stroke-width', 2)
      .style('filter', d => {
        // Glow effect for matching or root nodes
        const isMatched = searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase());
        return (isMatched || d.data.type === 'root') ? 'url(#glow)' : 'none';
      })
      .style('transition', 'all 0.3s');

    // Adding interactive hover scaling
    node.selectAll('circle')
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', (d: any) => {
            if (d.data.type === 'root') return 9;
            if (d.data.type === 'directory') return 7.5;
            return 6.5;
          });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', (d: any) => {
            if (d.data.type === 'root') return 7;
            if (d.data.type === 'directory') return 5.5;
            return 4.5;
          });
      });

    // Text Labels
    node.append('text')
      .attr('dy', '.31em')
      .attr('x', d => {
        // Place text left for root, right for others
        if (d.data.type === 'root') return -14;
        return d.children ? -11 : 11;
      })
      .attr('text-anchor', d => {
        if (d.data.type === 'root') return 'end';
        return d.children ? 'end' : 'start';
      })
      .text(d => d.data.name)
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-size', d => d.data.type === 'root' ? '10px' : '9px')
      .attr('font-weight', d => (d.data.type === 'root' || d.data.type === 'directory') ? '700' : '500')
      .attr('fill', d => {
        const isMatched = searchQuery && d.data.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (isMatched) return '#22c55e'; // Green for highlighted matches
        if (d.data.type === 'root') return '#f4f4f5';
        if (d.data.type === 'directory') return '#e4e4e7';
        return '#a1a1aa'; // General files
      })
      .style('pointer-events', 'none')
      .style('transition', 'fill 0.3s');

  }, [activeFiles, searchQuery, repoName]);

  // Zoom controls
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!zoomBehaviorRef.current) return;
    const { zoom, svg } = zoomBehaviorRef.current;
    
    if (direction === 'reset') {
      svg.transition().duration(500).call(
        zoom.transform, 
        d3.zoomIdentity.translate(80, 220).scale(0.85)
      );
    } else {
      const scaleFactor = direction === 'in' ? 1.3 : 1 / 1.3;
      svg.transition().duration(250).call(zoom.scaleBy, scaleFactor);
    }
  };

  return (
    <div id="file-tree-visualization" className="bg-zinc-900/90 border border-zinc-850 rounded-xl overflow-hidden standard-shadow-sm flex flex-col h-full min-h-[500px]">
      
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0a0a0d] border-b border-zinc-850">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
            <LayoutTemplate className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-[11.5px] font-extrabold uppercase tracking-wider font-mono text-zinc-100 flex items-center gap-1.5">
              Source Architecture Map (D3.js)
              {isUsingDefault && (
                <span className="text-[8.5px] px-1.5 py-0.5 bg-zinc-850 border border-zinc-800 rounded-md text-zinc-400 font-semibold normal-case">
                  Workspace Demo view
                </span>
              )}
            </h3>
            <p className="text-[9px] text-[#a1a1aa] font-mono mt-0.5">
              Active Project: <span className="text-accent font-semibold">{repoName}</span>
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2">
          {/* Node details panel summary in header to save space */}
          {selectedNode && (
            <div className="hidden sm:flex items-center gap-2 bg-[#121217] border border-zinc-800 px-3 py-1 rounded-md text-[9.5px] font-mono">
              <span className="text-zinc-500 uppercase text-[8px] font-bold">Involved:</span>
              <span className={selectedNode.type === 'directory' ? 'text-pink-400' : 'text-blue-400'}>
                {selectedNode.type === 'directory' ? '📂' : '📄'} {selectedNode.name}
              </span>
              {selectedNode.size && (
                <span className="text-zinc-500">({formattedSize(selectedNode.size)})</span>
              )}
            </div>
          )}

          {/* Search bar inside tree view */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-[#0e0e12] border border-zinc-800 hover:border-zinc-700 focus:border-accent transition-colors rounded-lg text-[10px] text-zinc-200 placeholder-zinc-500 font-mono w-[140px] sm:w-[180px] focus:outline-hidden"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-[#0e0e12] border border-zinc-800 rounded-lg p-0.5 font-mono">
            <button 
              onClick={() => handleZoom('in')}
              title="Phóng to"
              className="p-1 text-zinc-400 hover:text-accent hover:bg-zinc-850 rounded-md transition-all cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleZoom('out')}
              title="Thu nhỏ"
              className="p-1 text-zinc-400 hover:text-accent hover:bg-zinc-850 rounded-md transition-all cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleZoom('reset')}
              title="Đặt lại góc nhìn"
              className="p-1 text-zinc-400 hover:text-accent hover:bg-zinc-850 rounded-md transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* D3 Canvas container */}
      <div 
        ref={containerRef} 
        className="relative flex-1 bg-[#070709] overflow-hidden min-h-[360px] cursor-grab active:cursor-grabbing"
      >
        <svg ref={svgRef} className="w-full h-full block" />

        {/* Minimal Interactive Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-[#0a0a0df2] border border-zinc-850/80 px-3 py-2 rounded-lg text-[9px] font-mono space-y-1.5 shadow-md select-none pointer-events-none">
          <div className="text-zinc-500 uppercase text-[8px] font-black tracking-wider pb-0.5 border-b border-zinc-850">Legend indicator</div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
            <span>Root Entry</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
            <span>Directory (Folder)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Source Code File</span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-t border-zinc-850 pt-1 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>Matched Pattern</span>
            </div>
          )}
        </div>

        {/* Tip floating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0a0a0d/40] hover:bg-[#0a0a0df2] transition-colors border border-zinc-850/30 px-3 py-2 rounded-lg text-[9px] font-mono text-zinc-400">
          <Info className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Click on node or drag canvas to explore folder topology</span>
        </div>
      </div>

      {/* Footer statistics overlay / Active Selected File details */}
      <div className="px-4 py-3 bg-[#0a0a0d] border-t border-zinc-850 text-[10px] font-mono text-zinc-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FolderOpen className="w-3 h-3 text-pink-500" />
            Total files indexed: <b className="text-zinc-300">{activeFiles.length}</b>
          </span>
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-accent" />
            Total size: <b className="text-zinc-300">{formattedSize(activeFiles.reduce((acc, f) => acc + (f.size || 0), 0))}</b>
          </span>
        </div>

        {selectedNode && (
          <div className="text-[10px] text-zinc-400 bg-zinc-950 px-3 py-1.5 border border-zinc-850 rounded-lg flex items-center gap-2">
            <span className="text-zinc-600 font-bold">INFO:</span>
            <span>Path: <b className="text-blue-400 font-bold">{selectedNode.path}</b></span>
            {selectedNode.size && <span>| Size: <b className="text-[#eab308]">{formattedSize(selectedNode.size)}</b></span>}
            <button 
              onClick={() => setSelectedNode(null)} 
              className="text-[8px] px-1 bg-zinc-850 border border-zinc-800 hover:text-red-400 rounded-sm cursor-pointer ml-1 font-bold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
