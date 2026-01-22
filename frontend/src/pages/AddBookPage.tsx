import React, { useState } from 'react';
import { type Book } from '../types/Book';
import { useNavigate } from 'react-router-dom';
import { Database, Book as BookIcon, User, Calendar, FileText, Image as ImageIcon, Sparkles, Save } from 'lucide-react';
import { BookCard } from '../components/BookCard';

export const AddBookPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Book>>({
        title: '',
        author: '',
        genre: '',
        summary: '',
        publicationYear: new Date().getFullYear(),
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'publicationYear' ? parseInt(value) || new Date().getFullYear() : value
        }));
    };

    const handleLoadBooks = async () => {
        if (!confirm('This will load default books from books.json into the database. Continue?')) return;

        setBulkLoading(true);
        try {
            const response = await fetch('/api/books/load', { method: 'POST' });
            if (response.ok) {
                alert('Default books loaded successfully!');
            } else {
                alert('Failed to load books.');
            }
        } catch (error) {
            console.error('Error loading books:', error);
            alert('Error connecting to server.');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newBook = {
            ...formData,
            id: crypto.randomUUID(),
        };

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook),
            });

            if (response.ok) {
                navigate('/');
            } else {
                alert('Failed to add book.');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    // Construct a preview object (fill missing fields with placeholders)
    const previewBook: Book = {
        id: 'preview',
        title: formData.title || 'Book Title',
        author: formData.author || 'Author Name',
        genre: formData.genre || 'Genre',
        summary: formData.summary || 'A brief summary of the book will appear here as you type...',
        publicationYear: formData.publicationYear || 2024,
        imageUrl: formData.imageUrl,
        hasContent: false
    };

    return (
        <div className="add-book-page">
            <div className="page-header">
                <h1 className="page-title">
                    <Sparkles className="icon-title" size={28} />
                    Library Manager
                    <span className="subtitle">Add New Entry</span>
                </h1>
                <p className="page-desc">Expand the library collection manually or load the standard catalog.</p>
            </div>

            <div className="editor-grid">
                {/* Left Column: Form */}
                <div className="form-card">
                    <div className="card-header">
                        <h2>Book Details</h2>
                        <div className="divider"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="book-form">
                        <div className="form-group half">
                            <label><BookIcon size={16} /> Title</label>
                            <input
                                required
                                name="title"
                                placeholder="e.g. The Great Gatsby"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group half">
                            <label><User size={16} /> Author</label>
                            <input
                                required
                                name="author"
                                placeholder="e.g. F. Scott Fitzgerald"
                                value={formData.author}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group half">
                            <label><FileText size={16} /> Genre</label>
                            <input
                                required
                                name="genre"
                                placeholder="e.g. Classic Fiction"
                                value={formData.genre}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group half">
                            <label><Calendar size={16} /> Year</label>
                            <input
                                required
                                type="number"
                                name="publicationYear"
                                value={formData.publicationYear}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full">
                            <label><ImageIcon size={16} /> Cover Image URL</label>
                            <input
                                name="imageUrl"
                                placeholder="https://..."
                                value={formData.imageUrl}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group full">
                            <label><FileText size={16} /> Summary</label>
                            <textarea
                                required
                                name="summary"
                                rows={6}
                                placeholder="Enter a compelling summary of the book..."
                                value={formData.summary}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : <><Save size={18} /> Save to Library</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Preview & Actions */}
                <div className="sidebar">
                    {/* Live Preview */}
                    <div className="preview-section">
                        <div className="sidebar-header">
                            <h3>Live Preview</h3>
                            <span className="badge">Draft</span>
                        </div>
                        <div className="preview-card-wrapper">
                            <BookCard book={previewBook} />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="actions-section">
                        <div className="sidebar-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="action-card">
                            <div className="action-info">
                                <Database className="action-icon" size={24} />
                                <div>
                                    <h4>Load Sample Data</h4>
                                    <p>Reset library to default catalog</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLoadBooks}
                                disabled={bulkLoading}
                                className="btn-secondary"
                            >
                                {bulkLoading ? 'Loading...' : 'Load Defaults'}
                            </button>
                        </div>
                        <div className="action-card">
                            <div className="action-info">
                                <Sparkles className="action-icon" size={24} />
                                <div>
                                    <h4>Deep RAG Demo</h4>
                                    <p>Load "Alice in Wonderland" with full text content.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!confirm('Load "Alice in Wonderland" with full text content for Deep RAG?')) return;
                                    setBulkLoading(true);
                                    try {
                                        const res = await fetch('/api/books/load-demo', { method: 'POST' });
                                        if (res.ok) alert('Demo book loaded! Check the main page.');
                                        else alert('Failed to load demo.');
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error loading demo.');
                                    } finally {
                                        setBulkLoading(false);
                                    }
                                }}
                                disabled={bulkLoading}
                                className="btn-secondary"
                            >
                                {bulkLoading ? 'Loading...' : 'Load Alice Demo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .add-book-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    color: #1e293b;
                }

                .page-header {
                    margin-bottom: 2.5rem;
                    text-align: center;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .icon-title { color: #6366f1; }
                
                .subtitle {
                    font-weight: 400;
                    color: #94a3b8;
                    font-size: 2rem;
                    margin-left: 0.5rem;
                }

                .page-desc { color: #64748b; font-size: 1.1rem; }

                .editor-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 3rem;
                    align-items: start;
                }

                /* Form Card */
                .form-card {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }

                .card-header h2 { font-size: 1.25rem; font-weight: 700; color: #334155; margin-bottom: 0.5rem; }
                .divider { height: 1px; background: #e2e8f0; margin-bottom: 1.5rem; }

                .book-form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group.half { width: calc(50% - 0.75rem); }
                .form-group.full { width: 100%; }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .form-group input, .form-group textarea {
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #cbd5e1;
                    font-size: 1rem;
                    color: #1e293b;
                    transition: all 0.2s;
                    font-family: inherit;
                    background: #f8fafc;
                }

                .form-group input:focus, .form-group textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .form-actions { width: 100%; margin-top: 1rem; }

                .btn-save {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: background 0.2s;
                }

                .btn-save:hover { background: #4338ca; }
                .btn-save:disabled { background: #94a3b8; cursor: not-allowed; }

                /* Sidebar */
                .sidebar { display: flex; flex-direction: column; gap: 2rem; }

                .sidebar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .sidebar-header h3 { font-size: 1rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .badge {
                    background: #e0e7ff; color: #4338ca;
                    font-size: 0.75rem; font-weight: 700;
                    padding: 0.25rem 0.5rem; border-radius: 0.5rem;
                }

                .preview-card-wrapper {
                    transform: scale(0.95);
                    transform-origin: top center;
                }

                /* Action Card */
                .action-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .action-info { display: flex; gap: 1rem; align-items: flex-start; }
                .action-icon { color: #64748b; margin-top: 0.25rem; }
                .action-info h4 { margin: 0; font-size: 1rem; color: #1e293b; }
                .action-info p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }

                .btn-secondary {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: #475569;
                    font-weight: 600;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary:hover:not(:disabled) {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                    color: #1e293b;
                }

                @media (max-width: 900px) {
                    .editor-grid { grid-template-columns: 1fr; }
                    .form-group.half { width: 100%; }
                    .sidebar { order: -1; } /* Preview on top on mobile */
                    .preview-card-wrapper { display: flex; justify-content: center; transform: none; }
                }
            `}</style>
        </div >
    );
};
