import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Bot, User, Sparkles, Paperclip, X, ChevronRight, ChevronDown } from 'lucide-react';
import { InsightsPanel } from '../components/InsightsPanel';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    queryContext?: string;
    showInsights?: boolean;
    image?: File;
}

export const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your library concierge. Ask me about any book, or share a cover image for analysis.' }
    ]);
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !selectedFile) || loading) return;

        const userMessage = input;
        const currentFile = selectedFile; // Capture for state closure

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            image: currentFile || undefined
        }]);

        setInput('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLoading(true);

        const formData = new FormData();
        formData.append('query', userMessage || 'Describe this image');
        if (currentFile) {
            formData.append('file', currentFile);
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
                setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered a system error.' }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network connection failed. Please check your internet.' }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleInsights = (index: number) => {
        setMessages(prev => prev.map((m, i) => i === index ? { ...m, showInsights: !m.showInsights } : m));
    };

    return (
        <div className="chat-concierge-page">
            <div className="chat-header">
                <div className="header-status">
                    <span className="status-dot"></span>
                    <span>AI Assistant Online</span>
                </div>
            </div>

            <div className="chat-viewport">
                <div className="messages-container">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role}`}>
                            <div className={`avatar ${msg.role}`}>
                                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                            </div>

                            <div className="message-content-wrapper">
                                <div className="message-bubble">
                                    {msg.image && (
                                        <div className="message-attachment">
                                            <ImageIcon size={14} />
                                            <span>{msg.image.name}</span>
                                        </div>
                                    )}
                                    <div className="bubble-text">{msg.content}</div>
                                </div>

                                {msg.role === 'assistant' && msg.queryContext && (
                                    <div className="insights-actions">
                                        <button
                                            className={`btn-insights ${msg.showInsights ? 'active' : ''}`}
                                            onClick={() => toggleInsights(idx)}
                                        >
                                            <Sparkles size={14} />
                                            {msg.showInsights ? 'Hide Analysis' : 'Show Thinking'}
                                            {msg.showInsights ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>

                                        {msg.showInsights && (
                                            <div className="insights-drawer">
                                                <InsightsPanel userQuery={msg.queryContext} aiResponse={msg.content} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message-row assistant">
                            <div className="avatar assistant"><Bot size={20} /></div>
                            <div className="message-bubble typing">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="input-dock">
                {selectedFile && (
                    <div className="attachment-preview">
                        <div className="preview-chip">
                            <ImageIcon size={14} />
                            <span className="filename">{selectedFile.name}</span>
                            <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <form className="input-capsule" onSubmit={handleSend}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />

                    <button
                        type="button"
                        className={`btn-attach ${selectedFile ? 'has-file' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        <Paperclip size={20} />
                    </button>

                    <input
                        type="text"
                        className="main-input"
                        placeholder="Ask about a book or upload a cover..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        className="btn-msg-send"
                        disabled={loading || (!input.trim() && !selectedFile)}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>

            <style>{`
                .chat-concierge-page {
                    max-width: 900px;
                    margin: 0 auto;
                    height: calc(100vh - 80px); /* Adjust for Navbar */
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                    position: relative;
                }

                .chat-header {
                    padding: 1rem 2rem;
                    text-align: center;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }

                .header-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    background: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .status-dot {
                    width: 6px; height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                }

                .chat-viewport {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                    scroll-behavior: smooth;
                }

                .chat-viewport::-webkit-scrollbar { width: 6px; }
                .chat-viewport::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }

                .messages-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding-bottom: 2rem;
                }

                .message-row {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    max-width: 85%;
                }

                .message-row.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .avatar {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .avatar.assistant { background: white; color: #2563eb; border: 1px solid #e2e8f0; }
                .avatar.user { background: #2563eb; color: white; }

                .message-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-start;
                }

                .message-row.user .message-content-wrapper { align-items: flex-end; }

                .message-bubble {
                    padding: 1rem 1.25rem;
                    border-radius: 1.25rem;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    position: relative;
                }

                .message-row.assistant .message-bubble {
                    background: white;
                    color: #1e293b;
                    border: 1px solid #e2e8f0;
                    border-top-left-radius: 0.25rem;
                }

                .message-row.user .message-bubble {
                    background: #2563eb;
                    color: white;
                    border-top-right-radius: 0.25rem;
                }
                
                .message-bubble.typing {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #64748b;
                    font-style: italic;
                    padding: 0.75rem 1.25rem;
                }

                .message-attachment {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    background: rgba(255,255,255,0.2);
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                    width: fit-content;
                }

                .message-row.assistant .message-attachment { background: #f1f5f9; color: #475569; }

                .insights-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    width: 100%;
                }

                .btn-insights {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: #64748b;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                    width: fit-content;
                }

                .btn-insights:hover, .btn-insights.active {
                    color: #2563eb;
                    background: #eff6ff;
                }

                .insights-drawer {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1rem;
                    font-size: 0.85rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    animation: slideDown 0.3s ease-out;
                    max-width: 600px;
                }

                /* Input Area */
                .input-dock {
                    padding: 1rem 2rem 2rem;
                }

                .input-capsule {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.5rem;
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }

                .input-capsule:focus-within {
                    border-color: #cbd5e1;
                    box-shadow: 0 10px 20px -3px rgba(0,0,0,0.1);
                }

                .main-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 0.5rem;
                    font-size: 1rem;
                    color: #1e293b;
                }

                .btn-attach, .btn-msg-send {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .btn-attach {
                    background: transparent;
                    color: #94a3b8;
                }

                .btn-attach:hover, .btn-attach.has-file {
                    background: #f1f5f9;
                    color: #2563eb;
                }

                .btn-msg-send {
                    background: #2563eb;
                    color: white;
                }

                .btn-msg-send:hover:not(:disabled) { background: #1d4ed8; }
                .btn-msg-send:disabled { background: #e2e8f0; color: #94a3b8; cursor: default; }

                .attachment-preview {
                    margin-bottom: 0.75rem;
                    padding-left: 0.5rem;
                }

                .preview-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #eff6ff;
                    color: #1e40af;
                    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.8rem;
                    border: 1px solid #dbeafe;
                }

                .preview-chip button {
                    background: none; border: none;
                    color: #60a5fa; cursor: pointer;
                    display: flex;
                }
                .preview-chip button:hover { color: #1e40af; }

                @media (max-width: 640px) {
                    .chat-viewport { padding: 1rem; }
                    .chat-header { padding: 0.75rem; }
                    .input-dock { padding: 1rem; }
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
