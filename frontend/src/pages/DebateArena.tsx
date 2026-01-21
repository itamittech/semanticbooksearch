import React, { useState, useEffect, useRef } from 'react';
import './Debate.css';
import { UploadSlot } from '../components/Debate/UploadSlot';
import { Play, RefreshCw } from 'lucide-react';

interface Message {
    sender: 'A' | 'B';
    content: string;
}

export const DebateArena: React.FC = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [topic, setTopic] = useState('');
    const [statusA, setStatusA] = useState<'idle' | 'uploading' | 'ready'>('idle');
    const [statusB, setStatusB] = useState<'idle' | 'uploading' | 'ready'>('idle');
    const [isDebating, setIsDebating] = useState(false);
    const [history, setHistory] = useState<Message[]>([]);


    const [names, setNames] = useState({ A: 'Contender 1', B: 'Contender 2' });

    // Auto-scroll to bottom of chat
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleUpload = async (file: File, label: 'A' | 'B') => {
        const setStatus = label === 'A' ? setStatusA : setStatusB;
        setStatus('uploading');
        setNames(prev => ({ ...prev, [label]: file.name }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('label', label);
        if (sessionId) formData.append('sessionId', sessionId);

        try {
            const res = await fetch('/api/debate/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setSessionId(data.sessionId);
            setStatus('ready');
        } catch (e) {
            console.error('Upload failed', e);
            setStatus('idle');
        }
    };

    const startDebate = () => {
        if (!topic || statusA !== 'ready' || statusB !== 'ready') return;
        setIsDebating(true);
        triggerTurn(); // Initial turn
    };

    const triggerTurn = async () => {
        if (!sessionId) return;

        // Optimistic UI could go here, but we'll wait for server for simplicity
        try {
            const res = await fetch('/api/debate/turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    topic,
                    history
                })
            });
            const data = await res.json();

            const newMessage: Message = { sender: data.speaker, content: data.content };
            setHistory(prev => [...prev, newMessage]);


        } catch (e) {
            console.error('Turn failed', e);
            setIsDebating(false);
        }
    };

    return (
        <div className="debate-container">
            <header className="debate-header">
                <h1>⚔️ The Great Debate</h1>
                <p>Upload two documents and watch them battle.</p>
            </header>

            <div className="arena-setup">
                <UploadSlot
                    label="Contender A"
                    name={names.A}
                    status={statusA}
                    onFileSelect={(f) => handleUpload(f, 'A')}
                />

                <div className="vs-badge">VS</div>

                <UploadSlot
                    label="Contender B"
                    name={names.B}
                    status={statusB}
                    onFileSelect={(f) => handleUpload(f, 'B')}
                />
            </div>

            <div className="control-panel">
                <input
                    type="text"
                    placeholder="Enter Debate Topic (e.g. 'Is Freedom absolute?')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isDebating}
                />
                {!isDebating ? (
                    <button
                        className="start-btn"
                        onClick={startDebate}
                        disabled={!topic || statusA !== 'ready' || statusB !== 'ready'}
                    >
                        <Play size={18} /> Start Debate
                    </button>
                ) : (
                    <button className="next-turn-btn" onClick={triggerTurn}>
                        <RefreshCw size={18} /> Next Turn
                    </button>
                )}
            </div>

            <div className="debate-transcript">
                {history.length === 0 && isDebating && (
                    <div className="loading-indicator">The Debate is starting...</div>
                )}

                {history.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.sender === 'A' ? 'left' : 'right'}`}>
                        <div className="avatar">{msg.sender === 'A' ? 'A' : 'B'}</div>
                        <div className="content">
                            <strong>{msg.sender === 'A' ? names.A : names.B}</strong>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};
