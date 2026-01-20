import type { HybridSearchResponse } from '../types/Book';
import React, { useState } from 'react';
import { BookCard } from '../components/BookCard';
import { Search, Brain, TextSearch, Layers, Info, ArrowRight } from 'lucide-react';

export function HybridSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<HybridSearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/hybrid-search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hybrid-page">
            <div className="hero-section">
                <div className="badge">
                    <Layers size={14} className="badge-icon" />
                    <span>Experimental Feature</span>
                </div>
                <h1>Hybrid Search Engine</h1>
                <p className="subtitle">
                    Experience the power of <strong>Reciprocal Rank Fusion (RRF)</strong>.
                    We combine <span className="highlight-vector">Vector Semantics</span> and <span className="highlight-keyword">Keyword Precision</span> to deliver the perfect result.
                </p>

                <button
                    className="info-toggle"
                    onClick={() => setShowInfo(!showInfo)}
                >
                    <Info size={16} />
                    {showInfo ? 'Hide Technical Details' : 'How does this work?'}
                </button>

                {showInfo && (
                    <div className="info-card">
                        <div className="info-step">
                            <div className="step-icon vector"><Brain size={20} /></div>
                            <div>
                                <h3>1. Vector Search</h3>
                                <p>Converts your query into a 1536-dimensional vector to find books with similar <em>meaning</em>, even if they share no words.</p>
                            </div>
                        </div>
                        <ArrowRight size={20} className="step-arrow" />
                        <div className="info-step">
                            <div className="step-icon keyword"><TextSearch size={20} /></div>
                            <div>
                                <h3>2. Keyword Search</h3>
                                <p>Scans the database for <em>exact text matches</em> using PostgreSQL's full-text search capabilities.</p>
                            </div>
                        </div>
                        <ArrowRight size={20} className="step-arrow" />
                        <div className="info-step">
                            <div className="step-icon fusion"><Layers size={20} /></div>
                            <div>
                                <h3>3. Rank Fusion</h3>
                                <p>The RRF algorithm normalizes scores from both lists and re-ranks them to surface the most relevant results overall.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSearch} className="search-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Try 'coding patterns' or 'space exploration'..."
                        className="search-input"
                        autoFocus
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Search'}
                    </button>
                </div>
            </form>

            {results && (
                <div className="results-grid">
                    <div className="result-column vector-lane">
                        <div className="column-header">
                            <Brain size={18} className="col-icon" />
                            <div>
                                <h2>Semantic Matches</h2>
                                <span className="col-tag">Contextual</span>
                            </div>
                        </div>
                        <div className="scroll-area">
                            {results.vectorResults.map((result) => (
                                <div key={result.book.id} className="mini-card">
                                    <img src={result.book.imageUrl || 'https://placehold.co/100x150'} alt={result.book.title} />
                                    <div className="mini-info">
                                        <h4>{result.book.title}</h4>
                                        <div className="score-badge">Similarity: {(result.score * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="result-column keyword-lane">
                        <div className="column-header">
                            <TextSearch size={18} className="col-icon" />
                            <div>
                                <h2>Keyword Matches</h2>
                                <span className="col-tag">Literal</span>
                            </div>
                        </div>
                        <div className="scroll-area">
                            {results.keywordResults.length === 0 ? (
                                <div className="empty-state">No literal matches found</div>
                            ) : (
                                results.keywordResults.map((result) => (
                                    <div key={result.book.id + '_kw'} className="mini-card">
                                        <img src={result.book.imageUrl || 'https://placehold.co/100x150'} alt={result.book.title} />
                                        <div className="mini-info">
                                            <h4>{result.book.title}</h4>
                                            <span className="match-type">Text Match</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="result-column fusion-lane">
                        <div className="column-header major">
                            <Layers size={20} className="col-icon" />
                            <div>
                                <h2>Final Fusion Results</h2>
                                <span className="col-tag premium">RRF Optimized</span>
                            </div>
                        </div>
                        <div className="scroll-area flex-start">
                            {results.hybridResults.map((result) => (
                                <BookCard key={result.book.id + '_hy'} book={result.book} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hybrid-page {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                    color: var(--text-primary);
                }
                
                .hero-section {
                    text-align: center;
                    margin-bottom: 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(99, 102, 241, 0.1);
                    color: #6366f1;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.025em;
                }

                .subtitle {
                    font-size: 1.1rem;
                    color: #64748b;
                    max-width: 600px;
                    line-height: 1.6;
                }

                .highlight-vector { color: #8b5cf6; font-weight: 600; }
                .highlight-keyword { color: #059669; font-weight: 600; }

                .info-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: #6366f1;
                    font-weight: 500;
                    cursor: pointer;
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                }

                .info-toggle:hover { text-decoration: underline; }

                .info-card {
                    margin-top: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                    max-width: 900px;
                    animation: slideDown 0.3s ease-out;
                }

                .info-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    text-align: left;
                    flex: 1;
                }

                .info-step h3 { font-size: 0.9rem; margin: 0 0 0.25rem 0; font-weight: 700; color: #1e293b; }
                .info-step p { font-size: 0.8rem; margin: 0; color: #64748b; line-height: 1.4; }

                .step-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .step-icon.vector { background: #8b5cf6; }
                .step-icon.keyword { background: #059669; }
                .step-icon.fusion { background: #f59e0b; }
                .step-arrow { color: #cbd5e1; }

                .search-container {
                    max-width: 700px;
                    margin: 0 auto 3rem auto;
                }

                .search-wrapper {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .search-wrapper:focus-within {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .search-icon { color: #94a3b8; margin-left: 0.75rem; }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 1rem;
                    padding: 0.75rem;
                    color: #1e293b;
                }

                .search-btn {
                    padding: 0.75rem 1.5rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .search-btn:hover { background: #4f46e5; }

                .results-grid {
                    display: grid;
                    grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr) 1.5fr;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .result-column {
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    height: 700px;
                    overflow: hidden;
                    transition: transform 0.2s;
                }

                .result-column:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                    transform: translateY(-2px);
                }

                .vector-lane { border-top: 4px solid #8b5cf6; }
                .keyword-lane { border-top: 4px solid #059669; }
                .fusion-lane { 
                    border-top: 4px solid #f59e0b; 
                    background: white;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #f59e0b;
                    z-index: 1;
                    transform: scale(1.02);
                }

                .column-header {
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: white;
                }

                .col-icon { color: #64748b; }
                .column-header h2 { font-size: 1rem; margin: 0; font-weight: 700; color: #1e293b; }
                
                .col-tag {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    background: #f1f5f9;
                    color: #64748b;
                    font-weight: 600;
                }

                .col-tag.premium { background: #fffbeb; color: #d97706; }

                .scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                /* Custom Scrollbar */
                .scroll-area::-webkit-scrollbar { width: 6px; }
                .scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

                .mini-card {
                    display: flex;
                    gap: 0.75rem;
                    background: white;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .mini-card img {
                    width: 40px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 4px;
                }

                .mini-info h4 {
                    margin: 0 0 0.25rem 0;
                    font-size: 0.85rem;
                    line-height: 1.3;
                    color: #334155;
                }

                .score-badge {
                    font-size: 0.7rem;
                    color: #8b5cf6;
                    font-weight: 500;
                    background: #f5f3ff;
                    display: inline-block;
                    padding: 0 0.35rem;
                    border-radius: 4px;
                }

                .match-type {
                    font-size: 0.7rem;
                    color: #059669;
                    background: #ecfdf5;
                    padding: 0 0.35rem;
                    border-radius: 4px;
                }

                .empty-state {
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    padding: 2rem 0;
                    font-style: italic;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 1024px) {
                    .results-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .result-column { height: 500px; }
                    .fusion-lane { transform: none; }
                }
                .fusion-lane .book-card {
                    height: auto;
                    min-height: min-content;
                }
            `}</style>
        </div>
    );
}
