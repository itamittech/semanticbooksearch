import React, { useState, useRef, useEffect } from 'react';
import { type Book } from '../types/Book';
import '../index.css';

interface BookChatModalProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const BookChatModal: React.FC<BookChatModalProps> = ({ book, isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: `Greetings. I am "${book.title}". Ask me anything about my contents.`
            }]);
        }
    }, [isOpen, book.title, messages.length]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/books/${book.id}/chat/content?title=${encodeURIComponent(book.title)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) throw new Error('Failed to chat');

            const data = await response.text();
            setMessages(prev => [...prev, { role: 'assistant', content: data }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I seem to have lost my place directly. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Talking to: <span className="italic">{book.title}</span></h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-chat-area">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-bubble">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="message-bubble typing-indicator">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="modal-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask the book a question..."
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
