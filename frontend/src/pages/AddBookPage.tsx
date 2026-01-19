
import React, { useState } from 'react';
import { type Book } from '../types/Book';
import { useNavigate } from 'react-router-dom';

export const AddBookPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Book>>({
        title: '',
        author: '',
        summary: '',
        genre: '',
        publicationYear: new Date().getFullYear(),
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'publicationYear' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newBook = {
            ...formData,
            id: crypto.randomUUID(), // Generate client-side or let backend handle it? Backend logic says "addBook(book)", usually assumes ID is there or generated.
        };

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook),
            });

            if (response.ok) {
                alert('Book added successfully!');
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

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add a New Book</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                    <input required name="title" className="input-field" value={formData.title} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Author</label>
                    <input required name="author" className="input-field" value={formData.author} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Genre</label>
                    <input required name="genre" className="input-field" value={formData.genre} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Publication Year</label>
                    <input required type="number" name="publicationYear" className="input-field" value={formData.publicationYear} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Summary</label>
                    <textarea required name="summary" className="input-field" rows={5} value={formData.summary} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cover Image URL (Optional)</label>
                    <input name="imageUrl" className="input-field" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." style={{ width: '100%' }} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                    {loading ? 'Adding...' : 'Add Book'}
                </button>
            </form>
        </div>
    );
};
