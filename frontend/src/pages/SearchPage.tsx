import React, { useEffect, useState } from 'react';
import { type Book } from '../types/Book';
import { BookCard } from '../components/BookCard';
import { Search, Sparkles, BookOpen, Zap, ArrowRight, RefreshCw } from 'lucide-react';

export const SearchPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/books/all');
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleRefreshCatalog = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('/api/books/refresh-catalog', { method: 'POST' });
            if (response.ok) {
                // Reload books after refresh
                fetchBooks();
            }
        } catch (error) {
            console.error('Error refreshing catalog:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            fetchBooks();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/books/search/compare?q=${encodeURIComponent(query)}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                const results = data.semantic || [];
                const mappedBooks = results.map((r: any) => r.book);
                setBooks(mappedBooks);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="discovery-page">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Powered by Spring AI</span>
                    </div>
                    <h1 className="hero-title">
                        Discover Your Next <br />
                        <span className="text-gradient">Great Read</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore our library using natural language. Search by plot, character, emotion, or keyword.
                    </p>

                    <div className="search-actions">
                        <form className="search-capsule" onSubmit={handleSearch}>
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Try 'books about space travel' or 'dystopian classics'..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn" disabled={loading}>
                                {loading ? 'Searching...' : <ArrowRight size={20} />}
                            </button>
                        </form>


                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <BookOpen size={18} className="feature-icon" />
                            <span>Semantic Search</span>
                        </div>
                        <div className="divider-dot"></div>
                        <div className="feature-item">
                            <Zap size={18} className="feature-icon" />
                            <span>Instant Results</span>
                        </div>
                        <div className="divider-dot"></div>
                        <div className="feature-item">
                            <Sparkles size={18} className="feature-icon" />
                            <span>Smart Matching</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="results-section">
                <div className="section-header">

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2>{query ? `Results for "${query}"` : 'Recently Added'}</h2>
                        <button
                            onClick={handleRefreshCatalog}
                            disabled={refreshing}
                            title="Refresh catalog"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <span className="result-count">{books.length} books</span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Scanning library...</p>
                    </div>
                ) : (
                    <>
                        <div className="book-grid">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} onBookUpdate={fetchBooks} />
                            ))}
                        </div>

                        {books.length === 0 && !loading && (
                            <div className="empty-state">
                                <BookOpen size={48} />
                                <h3>No books found</h3>
                                <p>Try adjusting your search terms or browsing the full collection.</p>
                                <button onClick={() => { setQuery(''); fetchBooks(); }} className="btn-reset">
                                    Show All Books
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .discovery-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .hero-section {
                    background: white;
                    padding: 4rem 2rem;
                    text-align: center;
                    border-bottom: 1px solid #e2e8f0;
                    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
                    background-size: 24px 24px;
                }

                .hero-content {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.35rem 0.85rem;
                    border-radius: 99px;
                    margin-bottom: 1.5rem;
                    border: 1px solid #dbeafe;
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0 0 1rem 0;
                    color: #0f172a;
                    letter-spacing: -0.03em;
                }

                .text-gradient {
                    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    font-size: 1.1rem;
                    color: #64748b;
                    margin: 0 0 2.5rem 0;
                    max-width: 500px;
                }

                .search-capsule {
                    background: white;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem;
                    padding-left: 1rem;
                    border-radius: 99px;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    max-width: 600px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s;
                    margin-bottom: 2rem;
                }

                .search-capsule:focus-within {
                    border-color: #2563eb;
                    box-shadow: 0 10px 30px -5px rgba(37, 99, 235, 0.15);
                    transform: translateY(-2px);
                }

                .search-icon { color: #94a3b8; margin-right: 0.75rem; flex-shrink: 0; }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 1.1rem;
                    color: #1e293b;
                    background: transparent;
                }

                .search-btn {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .search-btn:hover:not(:disabled) { background: #1d4ed8; transform: scale(1.05); }
                .search-btn:hover:not(:disabled) { background: #1d4ed8; transform: scale(1.05); }
                .search-btn:disabled { background: #e2e8f0; color: #94a3b8; }

                .btn-refresh {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    background: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 99px;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    height: 50px;
                }

                .btn-refresh:hover:not(:disabled) {
                    border-color: #2563eb;
                    color: #2563eb;
                    background: #eff6ff;
                }

                .animate-spin { animation: spin 1s linear infinite; }

                .features-grid {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .feature-item { display: flex; align-items: center; gap: 0.5rem; }
                .divider-dot { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; }

                /* Results Section */
                .results-section {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 3rem 2rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 2rem;
                }

                .section-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .result-count {
                    font-size: 0.9rem;
                    color: #64748b;
                    font-weight: 500;
                    background: #e2e8f0;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                }

                .loading-state {
                    text-align: center;
                    padding: 4rem;
                    color: #64748b;
                }

                .spinner {
                    width: 40px; height: 40px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    animation: spin 1s linear infinite;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem;
                    color: #94a3b8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .empty-state h3 { color: #1e293b; font-size: 1.25rem; margin: 0; }
                
                .btn-reset {
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: 1px solid #cbd5e1;
                    border-radius: 0.5rem;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-reset:hover { border-color: #2563eb; color: #2563eb; }

                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .hero-title { font-size: 2.5rem; }
                    .features-grid { flex-direction: column; gap: 0.5rem; }
                    .divider-dot { display: none; }
                }
            `}</style>
        </div>
    );
};
