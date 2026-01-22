import React, { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { Loader2, X, MousePointer2, Filter } from 'lucide-react';

interface GraphNode {
    id: string;
    label: string;
    group: string;
    val: number;
    x?: number;
    y?: number;
    z?: number;
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
    const fgRef = useRef<any>(null);
    const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/graph/data');
                if (response.ok) {
                    const jsonData: GraphData = await response.json();
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Failed to load graph", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const allGroups = useMemo(() => {
        return Array.from(new Set(data.nodes.map(n => n.group))).sort();
    }, [data]);

    const getColor = (group: string) => {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
        let hash = 0;
        for (let i = 0; i < group.length; i++) hash = group.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredData = useMemo(() => {
        if (hiddenGroups.size === 0) return data;

        const visibleNodes = data.nodes.filter(n => !hiddenGroups.has(n.group));
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        const visibleLinks = data.links.filter(l => {
            const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
            const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
            return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        });

        return { nodes: visibleNodes, links: visibleLinks };
    }, [data, hiddenGroups]);

    const handleNodeClick = (node: any) => {
        setSelectedNode(node);
        const distance = 150;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        if (fgRef.current) {
            fgRef.current.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                node,
                3000
            );
        }
    };

    const toggleGroup = (group: string) => {
        setHiddenGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    };

    return (
        <div className="graph-page">
            {loading && (
                <div className="loading-overlay">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Computing 3D semantic universe...</p>
                </div>
            )}

            <div className="sidebar">
                <div className="sidebar-header">
                    <Filter size={18} />
                    <h3>Filters (Genre)</h3>
                </div>
                <div className="filter-list">
                    {allGroups.map(g => (
                        <label key={g} className="filter-item">
                            <input
                                type="checkbox"
                                checked={!hiddenGroups.has(g)}
                                onChange={() => toggleGroup(g)}
                            />
                            <span className="dot" style={{ background: getColor(g) }}></span>
                            <span className="label-text">{g}</span>
                        </label>
                    ))}
                </div>
            </div>

            <ForceGraph3D
                ref={fgRef}
                graphData={filteredData}
                nodeLabel="label"
                nodeColor={node => getColor((node as GraphNode).group)}
                nodeVal={node => (node as GraphNode).val}
                linkWidth={link => link.value * 2}
                linkOpacity={0.3}
                linkColor={() => "#94a3b8"}
                backgroundColor="#0f172a"
                showNavInfo={false}
                onNodeClick={handleNodeClick}
            />

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
                            Similarity Value: {selectedNode.val.toFixed(2)}
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                .graph-page {
                    height: calc(100vh - 80px);
                    position: relative;
                    overflow: hidden;
                    background: #0f172a;
                    display: flex;
                }
                .loading-overlay {
                    position: absolute; inset: 0;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(4px);
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    color: #3b82f6; gap: 1rem;
                    z-index: 50;
                }
                .sidebar {
                    position: absolute;
                    top: 2rem; left: 2rem;
                    width: 240px;
                    max-height: calc(100% - 4rem);
                    background: rgba(30, 41, 59, 0.9);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    z-index: 20;
                    color: #e2e8f0;
                    display: flex; flex-direction: column;
                    overflow: hidden;
                }
                .sidebar-header {
                    display: flex; align-items: center; gap: 0.5rem;
                    margin-bottom: 1rem; padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8;
                }
                .sidebar-header h3 { margin: 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .filter-list { overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
                .filter-item {
                    display: flex; align-items: center; gap: 0.75rem;
                    cursor: pointer; padding: 0.25rem 0;
                    font-size: 0.85rem; transition: opacity 0.2s;
                }
                .filter-item:hover { opacity: 0.8; }
                .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .label-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .details-panel {
                    position: absolute;
                    top: 2rem; right: 2rem;
                    width: 300px;
                    background: rgba(30, 41, 59, 0.95);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: white;
                    animation: slideLeft 0.3s ease-out;
                    z-index: 20;
                }
                .panel-header {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .panel-header h3 { margin: 0; font-size: 1rem; }
                .panel-header button { border: none; background: none; cursor: pointer; color: #94a3b8; }
                .panel-content { padding: 1.5rem; text-align: center; }
                .node-icon {
                    width: 64px; height: 64px; border-radius: 50%;
                    color: white; font-size: 1.5rem; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1rem;
                    box-shadow: 0 0 20px rgba(0,0,0,0.3);
                }
                .badge {
                    background: rgba(255,255,255,0.1); color: #e2e8f0;
                    padding: 0.25rem 0.5rem; border-radius: 4px;
                    font-size: 0.8rem; font-weight: 600;
                }
                .cluster-info {
                    margin-top: 1.5rem; color: #94a3b8; font-size: 0.85rem;
                    background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 6px;
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
