import React, { useState } from 'react';
import { type Book } from '../types/Book';
import { BookChatModal } from './BookChatModal';
import { BookUploadModal } from './BookUploadModal';
import { Upload } from 'lucide-react';

interface BookCardProps {
    book: Book;
    onBookUpdate?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookUpdate }) => {
    // Use backend image if available, else a placeholder service
    const imageSrc = book.imageUrl || `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`;

    // State for Modals
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleUploadSuccess = () => {
        if (onBookUpdate) {
            onBookUpdate();
        }
    };

    return (
        <>
            <div className="book-card">
                <div className="book-cover-container">
                    <img src={imageSrc} alt={book.title} className="book-cover" onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`;
                    }} />

                </div>
                <div className="book-details">
                    {book.genre && <span className="book-genre">{book.genre}</span>}
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <p className="book-summary">{book.summary}</p>

                    {/* Action Button */}
                    {book.hasContent ? (
                        <button
                            className="btn-chat-book"
                            onClick={() => setIsChatOpen(true)}
                            title="Talk to this book"
                        >
                            💬 Chat
                        </button>
                    ) : (
                        <button
                            className="btn-upload-book"
                            onClick={() => setIsUploadOpen(true)}
                            title="Upload book content"
                        >
                            <Upload size={16} />
                            Upload & Chat
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <BookChatModal
                book={book}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />

            <BookUploadModal
                book={book}
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            <style>{`
                .missing-content-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 0.7rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                }

                .btn-upload-book {
                    margin-top: auto;
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    background: white;
                    color: #2563eb;
                    font-weight: 600;
                    border: 1px solid #2563eb;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .btn-upload-book:hover {
                    background: #eff6ff;
                }
            `}</style>
        </>
    );
};
