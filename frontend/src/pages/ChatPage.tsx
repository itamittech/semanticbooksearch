
import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';

import { InsightsPanel } from '../components/InsightsPanel';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    queryContext?: string; // The user query that prompted this response
    showInsights?: boolean;
}

export const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your library assistant. Ask me about books or upload a cover to identify a book.' }
    ]);
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !selectedFile) || loading) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage + (selectedFile ? ` [Image: ${selectedFile.name}]` : '') }]);
        setInput('');
        setLoading(true);

        const formData = new FormData();
        formData.append('query', userMessage || 'Describe this image'); // Fallback if only image
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            const response = await fetch('/api/books/chat', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const text = await response.text();
                setMessages(prev => [...prev, { role: 'assistant', content: text, queryContext: userMessage }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        } finally {
            setLoading(false);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="chat-page-container">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '14px', cursor: 'pointer' }}
                                    onClick={() => {
                                        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, showInsights: !m.showInsights } : m));
                                    }}
                                    title="Toggle AI Insights"
                                >
                                    {msg.showInsights ? '📊' : '🤖'}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className="message-bubble">
                                {msg.content}
                            </div>
                            {msg.showInsights && msg.queryContext && (
                                <InsightsPanel userQuery={msg.queryContext} aiResponse={msg.content} />
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, fontSize: '14px' }}>
                            🤖
                        </div>
                        <div className="message-bubble">
                            <Loader2 className="animate-spin" size={20} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-positioner">
                {selectedFile && (
                    <div className="image-preview-chip">
                        <ImageIcon size={14} />
                        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                        <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: '0.25rem', color: '#0369a1' }}>×</button>
                    </div>
                )}
                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                    <button
                        type="button"
                        className="image-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload image"
                        disabled={loading}
                    >
                        <ImageIcon size={20} style={{ color: selectedFile ? '#2563eb' : 'inherit' }} />
                    </button>

                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />

                    <button type="submit" className="btn-send" disabled={loading || (!input.trim() && !selectedFile)}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};
