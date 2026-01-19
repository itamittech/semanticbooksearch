
import React, { useEffect, useState } from 'react';
import { type Book } from '../types/Book';
import { BookCard } from '../components/BookCard';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            fetchBooks();
            return;
        }

        setLoading(true);
        try {
            // Using the compare search endpoint which returns { result: string, similarBooks: Book[] }
            // Or just a standard search if available. Based on controller:
            // /api/books/search/compare?q=... returns CompareSearchResponse

            const response = await fetch(`/api/books/search/compare?q=${encodeURIComponent(query)}&limit=10`);
            if (response.ok) {
                const data = await response.json();
                // The controller returns CompareSearchResponse with 'semantic' and 'keyword' lists of SearchResult
                const results = data.semantic || [];
                // Map SearchResult (which has { book: Book, score: number }) back to Book
                // Note: The backend SearchResult JSON likely has a 'book' field.
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
        <div className="container">
            <div className="search-bar-container">
                <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                    <div className="search-input-wrapper">
                        <Search className="text-muted" size={20} style={{ marginLeft: '0.5rem', color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search for books by title, author, or concept..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-icon">
                        <Search size={24} />
                    </button>
                </form>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <div className="book-grid">
                    {books.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                    {books.length === 0 && !loading && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
                            No books found. Try a different query.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
