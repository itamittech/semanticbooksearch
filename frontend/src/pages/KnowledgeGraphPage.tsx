import React, { useEffect, useRef, useState } from 'react';
import { Loader2, X, ZoomIn, ZoomOut, Expand, MousePointer2 } from 'lucide-react';

interface GraphNode {
    id: string;
    label: string;
    group: string;
    val: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
}

interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    value: number;
}

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export const KnowledgeGraphPage: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // Physics & Interaction state
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphLink[]>([]);
    const [draggingNode, setDraggingNode] = useState<GraphNode | null>(null);
    const requestRef = useRef<number>(0);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/graph/data');
                if (response.ok) {
                    const jsonData: GraphData = await response.json();

                    // Initialize spread out
                    const width = 800;
                    const height = 600;
                    const initializedNodes = jsonData.nodes.map(n => ({
                        ...n,
                        x: width / 2 + (Math.random() - 0.5) * 400, // Start widely spread
                        y: height / 2 + (Math.random() - 0.5) * 400,
                        vx: 0,
                        vy: 0
                    }));

                    setData(jsonData);
                    setNodes(initializedNodes);
                    setLinks(jsonData.links);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load graph", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Physics Engine
    const updatePhysics = () => {
        setNodes(prevNodes => {
            const newNodes = prevNodes.map(n => ({ ...n })); // Shallow copy
            const width = 800;
            const height = 600;

            // 1. Repulsion (Stronger to prevent hairball)
            for (let i = 0; i < newNodes.length; i++) {
                for (let j = i + 1; j < newNodes.length; j++) {
                    const dx = (newNodes[i].x || 0) - (newNodes[j].x || 0);
                    const dy = (newNodes[i].y || 0) - (newNodes[j].y || 0);
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 1) distance = 1;

                    // Repulsion Force: 3000 (Stronger)
                    const force = 3000 / (distance * distance);

                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    if (draggingNode?.id !== newNodes[i].id) {
                        newNodes[i].vx = (newNodes[i].vx || 0) + fx;
                        newNodes[i].vy = (newNodes[i].vy || 0) + fy;
                    }
                    if (draggingNode?.id !== newNodes[j].id) {
                        newNodes[j].vx = (newNodes[j].vx || 0) - fx;
                        newNodes[j].vy = (newNodes[j].vy || 0) - fy;
                    }
                }
            }

            // 2. Spring Links
            links.forEach(link => {
                const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                const targetId = typeof link.target === 'string' ? link.target : link.target.id;

                const sourceIdx = newNodes.findIndex(n => n.id === sourceId);
                const targetIdx = newNodes.findIndex(n => n.id === targetId);

                if (sourceIdx !== -1 && targetIdx !== -1) {
                    const source = newNodes[sourceIdx];
                    const target = newNodes[targetIdx];

                    const dx = (source.x || 0) - (target.x || 0);
                    const dy = (source.y || 0) - (target.y || 0);
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                    const targetDist = 120; // Longer links
                    const force = (distance - targetDist) * 0.03; // Gentler springs

                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    if (draggingNode?.id !== source.id) {
                        source.vx = (source.vx || 0) - fx;
                        source.vy = (source.vy || 0) - fy;
                    }
                    if (draggingNode?.id !== target.id) {
                        target.vx = (target.vx || 0) + fx;
                        target.vy = (target.vy || 0) + fy;
                    }
                }
            });

            // 3. Center Gravity (Weaker)
            newNodes.forEach(node => {
                if (draggingNode?.id === node.id) return; // Don't apply physics to dragged node

                const dx = (node.x || 0) - width / 2;
                const dy = (node.y || 0) - height / 2;
                node.vx = (node.vx || 0) - dx * 0.005; // Very weak gravity
                node.vy = (node.vy || 0) - dy * 0.005;

                // Damping
                node.vx = (node.vx || 0) * 0.85;
                node.vy = (node.vy || 0) * 0.85;

                // Update Position
                node.x = (node.x || 0) + (node.vx || 0);
                node.y = (node.y || 0) + (node.vy || 0);
            });

            return newNodes;
        });

        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(requestRef.current);
    }, [links, draggingNode]); // Restart loop if these change

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent, node: GraphNode) => {
        e.stopPropagation();
        setDraggingNode(node);
        setSelectedNode(node);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingNode && svgRef.current) {
            const CTM = svgRef.current.getScreenCTM();
            if (CTM) {
                // Convert screen coordinates to SVG coordinates, accounting for Pan/Zoom
                const x = (e.clientX - CTM.e - pan.x) / zoom;
                const y = (e.clientY - CTM.f - pan.y) / zoom;

                setNodes(prev => prev.map(n =>
                    n.id === draggingNode.id ? { ...n, x, y, vx: 0, vy: 0 } : n
                ));
            }
        }
    };

    const handleMouseUp = () => {
        setDraggingNode(null);
    };

    // Color scaler
    const getColor = (group: string) => {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
        let hash = 0;
        for (let i = 0; i < group.length; i++) hash = group.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    // Unique Groups for Legend
    const groups = Array.from(new Set(data?.nodes.map(n => n.group))).sort();

    return (
        <div className="graph-page" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            {loading && (
                <div className="loading-overlay">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Computing semantic universe...</p>
                </div>
            )}

            <div className="visualization-container">
                <div className="controls">
                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))}><ZoomIn size={20} /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}><ZoomOut size={20} /></button>
                    <button onClick={() => { setZoom(0.8); setPan({ x: 0, y: 0 }); }}><Expand size={20} /></button>
                </div>

                <div className="legend">
                    <h4>Clusters</h4>
                    <div className="legend-items">
                        {groups.map(g => (
                            <div key={g} className="legend-item">
                                <span className="dot" style={{ background: getColor(g) }}></span>
                                <span>{g}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <svg
                    ref={svgRef}
                    className="graph-svg"
                    viewBox={`0 0 800 600`}
                >
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                        {/* Links */}
                        {links.map((link, i) => {
                            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
                            const s = nodes.find(n => n.id === sourceId);
                            const t = nodes.find(n => n.id === targetId);
                            if (!s || !t) return null;

                            // Highlight connections to hovered/selected
                            const isConnected = hoveredNode && (s.id === hoveredNode.id || t.id === hoveredNode.id);

                            return (
                                <line
                                    key={i}
                                    x1={s.x} y1={s.y}
                                    x2={t.x} y2={t.y}
                                    stroke={isConnected ? "#2563eb" : "#94a3b8"}
                                    strokeWidth={isConnected ? 3 : Math.max(Math.sqrt(link.value) * 1.5, 1)}
                                    opacity={isConnected ? 1 : 0.4}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node) => {
                            const isHovered = hoveredNode?.id === node.id;
                            // Show label if hovered OR zoom is high OR it's a neighbor of hovered
                            const showLabel = isHovered || zoom > 1.2;

                            return (
                                <g
                                    key={node.id}
                                    transform={`translate(${node.x},${node.y})`}
                                    onMouseDown={(e) => handleMouseDown(e, node)}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{ cursor: draggingNode ? 'grabbing' : 'grab' }}
                                >
                                    <circle
                                        r={node.val * 8 + 4}
                                        fill={getColor(node.group)}
                                        stroke="white"
                                        strokeWidth={isHovered ? 4 : 2}
                                        className="node-circle"
                                    />
                                    <text
                                        dy={25}
                                        textAnchor="middle"
                                        fontSize={12}
                                        fontWeight={600}
                                        fill="#1e293b"
                                        style={{
                                            opacity: showLabel ? 1 : 0,
                                            pointerEvents: 'none',
                                            textShadow: '0 1px 2px white'
                                        }}
                                        className="node-label"
                                    >
                                        {node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {selectedNode && (
                <div className="details-panel">
                    <div className="panel-header">
                        <h3>Book Details</h3>
                        <button onClick={() => setSelectedNode(null)}><X size={18} /></button>
                    </div>
                    <div className="panel-content">
                        <div className="node-icon" style={{ background: getColor(selectedNode.group) }}>
                            {selectedNode.label.charAt(0)}
                        </div>
                        <h4>{selectedNode.label}</h4>
                        <span className="badge">{selectedNode.group}</span>
                        <p className="cluster-info">
                            <MousePointer2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                            Drag nodes to rearrange the cluster!
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                .graph-page {
                    height: calc(100vh - 80px);
                    position: relative;
                    overflow: hidden;
                    background: #f8fafc;
                    user-select: none;
                }

                .loading-overlay {
                    position: absolute; inset: 0;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(4px);
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    color: #2563eb; gap: 1rem;
                    z-index: 20;
                }

                .visualization-container {
                    width: 100%; height: 100%;
                }

                .graph-svg {
                    width: 100%; height: 100%;
                    background-image: radial-gradient(#94a3b8 1px, transparent 1px);
                    background-size: 30px 30px;
                }

                .node-circle {
                    transition: stroke-width 0.2s;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }
                
                .node-label {
                    transition: opacity 0.2s;
                    font-family: sans-serif;
                }

                .controls {
                    position: absolute;
                    bottom: 2rem; left: 2rem;
                    display: flex; gap: 0.5rem;
                    background: white; padding: 0.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    z-index: 10;
                }

                .controls button {
                    width: 36px; height: 36px;
                    display: flex; align-items: center; justify-content: center;
                    background: none; border: 1px solid #e2e8f0;
                    border-radius: 4px; color: #475569;
                    cursor: pointer;
                }
                .controls button:hover { background: #f1f5f9; color: #1e293b; }

                .legend {
                    position: absolute;
                    top: 2rem; left: 2rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(4px);
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    max-height: 300px;
                    overflow-y: auto;
                    width: 200px;
                    z-index: 10;
                }
                
                .legend h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .legend-items { display: flex; flex-direction: column; gap: 0.5rem; }
                .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #334155; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }

                .details-panel {
                    position: absolute;
                    top: 2rem; right: 2rem;
                    width: 300px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                    border: 1px solid #e2e8f0;
                    animation: slideLeft 0.3s ease-out;
                    z-index: 15;
                }

                .panel-header {
                    padding: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .panel-header h3 { margin: 0; font-size: 1rem; color: #1e293b; }
                .panel-header button { border: none; background: none; cursor: pointer; color: #94a3b8; }
                
                .panel-content { padding: 1.5rem; text-align: center; }

                .node-icon {
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    color: white; font-size: 1.5rem; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    text-shadow: 0 2px 0 rgba(0,0,0,0.1);
                }
                
                .badge {
                    background: #f1f5f9; color: #475569;
                    padding: 0.25rem 0.5rem; border-radius: 4px;
                    font-size: 0.8rem; font-weight: 600;
                }
                
                .cluster-info {
                    margin-top: 1.5rem; color: #64748b; font-size: 0.85rem;
                    background: #f8fafc; padding: 0.75rem; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                }

                @keyframes slideLeft {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};
