
import React from 'react';
import { type Book } from '../types/Book';

interface BookCardProps {
    book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
    // Use backend image if available, else a placeholder service
    const imageSrc = book.imageUrl || `https://placehold.co/400x600?text=${encodeURIComponent(book.title)}`;

    return (
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
            </div>
        </div>
    );
};
