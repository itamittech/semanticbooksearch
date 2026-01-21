import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send, Sparkles, Brain, Zap, FileText, Upload,
    ArrowLeft, CheckCircle, XCircle, ChevronRight, ChevronLeft,
    MessageSquare, HelpCircle, Layers
} from 'lucide-react';
import type { Course, StudyMaterial, QuizQuestion, Flashcard } from '../types/study-room';

// --- STYLES & UTILS ---
const gradients = {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    dark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    glass: 'rgba(255, 255, 255, 0.95)',
    glassDark: 'rgba(30, 41, 59, 0.95)',
    card: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
};

const shadows = {
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    glow: '0 0 15px rgba(59, 130, 246, 0.3)',
    float: '0 10px 30px -10px rgba(0, 0, 0, 0.15)'
};

// --- SUB-COMPONENTS ---

const MaterialsTab: React.FC<{ courseId: string }> = ({ courseId }) => {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const refresh = () => {
        fetch(`/api/study-room/courses/${courseId}/materials`)
            .then(res => res.json())
            .then(setMaterials);
    };

    useEffect(refresh, [courseId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);
        setUploading(true);
        setUploadStatus(`Uploading ${files.length} file(s)...`);

        try {
            let successCount = 0;
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const res = await fetch(`/api/study-room/courses/${courseId}/materials`, {
                        method: 'POST',
                        body: formData
                    });
                    if (res.ok) successCount++;
                } catch (err) {
                    console.error("Failed to upload", file.name, err);
                }
            }
            setUploadStatus(`Uploaded ${successCount}/${files.length} files successfully.`);
            refresh();
            setTimeout(() => setUploadStatus(''), 3000);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText color="#3b82f6" /> Course Materials
                    </h2>
                    {uploadStatus && (
                        <span style={{
                            fontSize: '0.9rem',
                            color: uploading ? '#f59e0b' : '#10b981',
                            marginTop: '0.5rem',
                            display: 'block',
                            fontWeight: 500
                        }}>
                            {uploadStatus}
                        </span>
                    )}
                </div>
                <div>
                    <input type="file" id="file-upload" multiple style={{ display: 'none' }} onChange={handleUpload} />
                    <label
                        htmlFor="file-upload"
                        style={{
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: gradients.primary,
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 600,
                            boxShadow: shadows.glow,
                            opacity: uploading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {uploading ? <Sparkles className="spin" size={18} /> : <Upload size={18} />}
                        {uploading ? 'Processing...' : 'Upload Files'}
                    </label>
                </div>
            </div>

            <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {materials.map(m => (
                    <div key={m.id} className="book-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        position: 'relative',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}>
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            fontSize: '0.7rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px',
                            color: '#64748b', fontWeight: 600, textTransform: 'uppercase'
                        }}>
                            {m.type}
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            background: '#eff6ff',
                            width: '80px', height: '80px',
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {m.type === 'PDF' ? '📄' : m.type === 'PPT' ? '📊' : m.type === 'DOC' ? '📝' : '📁'}
                        </div>
                        <div style={{ fontWeight: '600', textAlign: 'center', wordBreak: 'break-word', fontSize: '1rem', lineHeight: 1.4, color: '#1e293b' }}>
                            {m.filename}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={12} /> Uploaded {new Date(m.uploadDate).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                {materials.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                        <div style={{ background: '#f1f5f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Upload size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Time to add content</h3>
                        <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                            Upload PDF textbooks, lecture slides (PPT), or notes to start training your AI Teacher.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TeacherTab: React.FC<{ courseId: string }> = ({ courseId }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch(`/api/study-room/courses/${courseId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{
            display: 'flex', flexDirection: 'column', height: '650px',
            background: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: shadows.float,
            border: '1px solid #e2e8f0'
        }}>
            {/* Chat Area */}
            <div style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                        <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <Brain size={48} color="#3b82f6" />
                        </div>
                        <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>AI Teacher Ready</h3>
                        <p style={{ color: '#64748b' }}>Ask me anything about your uploaded materials!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '20px',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                        background: msg.role === 'user' ? gradients.primary : 'white',
                        color: msg.role === 'user' ? 'white' : '#1e293b',
                        boxShadow: msg.role === 'assistant' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : '0 4px 15px rgba(37, 99, 235, 0.2)',
                        lineHeight: 1.6,
                        border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none'
                    }}>
                        {msg.role === 'assistant' && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700,
                                color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                <Sparkles size={14} /> Teacher AI
                            </div>
                        )}
                        {msg.content}
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '1rem 1.5rem', borderRadius: '20px', borderBottomLeftRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#64748b' }}>
                            <div className="typing-dot" style={{ animationDelay: '0s' }}>●</div>
                            <div className="typing-dot" style={{ animationDelay: '0.2s' }}>●</div>
                            <div className="typing-dot" style={{ animationDelay: '0.4s' }}>●</div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} style={{
                padding: '1.5rem', background: 'white', borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: '1rem', alignItems: 'center'
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question about your course..."
                    style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        borderRadius: '99px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                        background: '#f8fafc',
                        transition: 'all 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    style={{
                        width: '50px', height: '50px',
                        borderRadius: '50%',
                        background: (!input.trim() || loading) ? '#e2e8f0' : gradients.primary,
                        color: 'white',
                        border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: (!input.trim() || loading) ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        transform: (!input.trim() || loading) ? 'none' : 'scale(1.05)'
                    }}
                >
                    <Send size={20} style={{ marginLeft: '-2px' }} />
                </button>
            </form>
        </div>
    );
};

const QuizTab: React.FC<{ courseId: string }> = ({ courseId }) => {
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const generateQuiz = async () => {
        setLoading(true);
        setQuiz(null);
        setScore(null);
        setAnswers({});
        try {
            const res = await fetch(`/api/study-room/courses/${courseId}/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: 'general review' })
            });
            const data = await res.json();
            let quizData = data;
            if (typeof data === 'string') {
                const cleaned = data.replace(/```json/g, '').replace(/```/g, '').trim();
                quizData = JSON.parse(cleaned);
            }
            setQuiz(quizData);
        } catch (e) {
            console.error(e);
            alert("Failed to generate quiz. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = () => {
        if (!quiz) return;
        let correct = 0;
        quiz.forEach((q, idx) => {
            if (answers[idx] === q.answer) correct++;
        });
        setScore(correct);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {!quiz && (
                <div style={{
                    textAlign: 'center', padding: '5rem 2rem',
                    background: 'white', borderRadius: '24px',
                    boxShadow: shadows.soft, border: '1px solid #e2e8f0'
                }}>
                    <div style={{ background: '#f0fdf4', color: '#16a34a', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <HelpCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b' }}>Knowledge Check</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Generate a 5-question multiple choice quiz to test your understanding of the uploaded materials.
                    </p>
                    <button
                        onClick={generateQuiz}
                        disabled={loading}
                        style={{
                            padding: '1rem 2.5rem', fontSize: '1.1rem',
                            background: gradients.primary, color: 'white',
                            border: 'none', borderRadius: '99px',
                            cursor: 'pointer', boxShadow: shadows.glow,
                            fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {loading ? <Sparkles className="spin" /> : <Zap size={20} />}
                        {loading ? 'Generating AI Quiz...' : 'Start New Quiz'}
                    </button>
                </div>
            )}

            {quiz && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '2rem', background: 'white', padding: '1rem 2rem',
                        borderRadius: '16px', boxShadow: shadows.soft
                    }}>
                        <h3 style={{ margin: 0, color: '#334155' }}>Quiz Session</h3>
                        <span style={{ fontWeight: 600, color: '#3b82f6' }}>{Object.keys(answers).length} / {quiz.length} Answered</span>
                    </div>

                    {quiz.map((q, idx) => (
                        <div key={idx} style={{
                            marginBottom: '2rem', padding: '2rem',
                            background: 'white', borderRadius: '24px',
                            boxShadow: shadows.soft,
                            border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{
                                    background: '#eff6ff', color: '#3b82f6',
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', flexShrink: 0
                                }}>
                                    {idx + 1}
                                </span>
                                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0, color: '#1e293b', lineHeight: 1.5 }}>{q.question}</p>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem', paddingLeft: '3.5rem' }}>
                                {q.options.map((opt, oIdx) => {
                                    const isSelected = answers[idx] === opt;
                                    const isCorrect = score !== null && opt === q.answer;
                                    const isWrong = score !== null && isSelected && opt !== q.answer;

                                    let bg = '#f8fafc';
                                    let borderColor = 'transparent';

                                    if (score !== null) {
                                        if (isCorrect) { bg = '#dcfce7'; borderColor = '#22c55e'; }
                                        else if (isWrong) { bg = '#fee2e2'; borderColor = '#ef4444'; }
                                    } else if (isSelected) {
                                        bg = '#eff6ff'; borderColor = '#3b82f6';
                                    }

                                    return (
                                        <label key={oIdx} style={{
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            background: bg,
                                            border: `2px solid ${borderColor}`,
                                            cursor: score === null ? 'pointer' : 'default',
                                            transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <input
                                                type="radio"
                                                name={`q-${idx}`}
                                                value={opt}
                                                onChange={() => setAnswers(prev => ({ ...prev, [idx]: opt }))}
                                                disabled={score !== null}
                                                checked={isSelected}
                                                style={{ marginRight: '1rem', accentColor: '#3b82f6', width: '18px', height: '18px' }}
                                            />
                                            {opt}
                                            {isCorrect && <CheckCircle size={18} color="#16a34a" style={{ marginLeft: 'auto' }} />}
                                            {isWrong && <XCircle size={18} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {score === null ? (
                        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                            <button
                                onClick={submitQuiz}
                                style={{
                                    padding: '1rem 3rem', fontSize: '1.1rem',
                                    background: gradients.primary, color: 'white',
                                    border: 'none', borderRadius: '99px',
                                    cursor: 'pointer', boxShadow: shadows.glow,
                                    fontWeight: 600,
                                    opacity: Object.keys(answers).length === quiz.length ? 1 : 0.5
                                }}
                            >
                                Submit Answers
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '3rem',
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                            borderRadius: '24px', color: '#14532d',
                            boxShadow: shadows.soft, marginTop: '3rem'
                        }}>
                            <Sparkles size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>Score: {score} / {quiz.length}</h2>
                            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                                {score === quiz.length ? 'Perfect Score! 🌟' : score > quiz.length / 2 ? 'Good job! Keep practicing. 👍' : 'Review the materials and try again. 📚'}
                            </p>
                            <button
                                onClick={generateQuiz}
                                style={{
                                    padding: '1rem 2rem', background: 'white', color: '#16a34a',
                                    border: 'none', borderRadius: '99px', fontWeight: 700,
                                    cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                Try Another Quiz
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FlashcardsTab: React.FC<{ courseId: string }> = ({ courseId }) => {
    const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateCards = async () => {
        setLoading(true);
        setFlashcards(null);
        try {
            const res = await fetch(`/api/study-room/courses/${courseId}/flashcards`, { method: 'POST' });
            const data = await res.json();
            let cards = data;
            if (typeof data === 'string') {
                const cleaned = data.replace(/```json/g, '').replace(/```/g, '').trim();
                cards = JSON.parse(cleaned);
            }
            setFlashcards(cards);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (e) {
            console.error(e);
            alert("Failed to generate flashcards.");
        } finally {
            setLoading(false);
        }
    };

    if (!flashcards) {
        return (
            <div className="fade-in" style={{
                textAlign: 'center', padding: '5rem 2rem',
                background: 'white', borderRadius: '24px',
                boxShadow: shadows.soft, border: '1px solid #e2e8f0',
                maxWidth: '800px', margin: '0 auto'
            }}>
                <div style={{ background: '#fef3c7', color: '#d97706', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Layers size={40} />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#1e293b' }}>Master Key Concepts</h3>
                <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Generate a deck of flashcards from your course materials to memorize definitions and terms efficiently.
                </p>
                <button
                    onClick={generateCards}
                    disabled={loading}
                    style={{
                        padding: '1rem 2.5rem', fontSize: '1.1rem',
                        background: gradients.primary, color: 'white',
                        border: 'none', borderRadius: '99px',
                        cursor: 'pointer', boxShadow: shadows.glow,
                        fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    {loading ? <Sparkles className="spin" /> : <Zap size={20} />}
                    {loading ? 'Generating Deck...' : 'Create Flashcards'}
                </button>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
            <div
                onClick={() => setFlipped(!flipped)}
                style={{
                    width: '600px', height: '400px',
                    perspective: '1500px', cursor: 'pointer',
                    position: 'relative',
                    marginBottom: '2rem'
                }}
            >
                {/* Card Stack Effect */}
                <div style={{
                    position: 'absolute', top: '10px', left: '10px', width: '100%', height: '100%',
                    background: 'white', borderRadius: '30px', zIndex: -1,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
                }}></div>
                <div style={{
                    position: 'absolute', top: '20px', left: '20px', width: '100%', height: '100%',
                    background: 'white', borderRadius: '30px', zIndex: -2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
                }}></div>

                <div style={{
                    width: '100%', height: '100%',
                    position: 'absolute',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    borderRadius: '30px'
                }}>
                    {/* Front */}
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden',
                        background: '#ffffff',
                        backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        borderRadius: '30px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        padding: '3rem', textAlign: 'center',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            position: 'absolute', top: '2rem', left: '2rem',
                            background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '6px',
                            fontSize: '0.8rem', fontWeight: 700, color: '#64748b',
                            textTransform: 'uppercase', letterSpacing: '1px',
                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                            <Layers size={14} /> Card {currentIndex + 1}
                        </div>
                        <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                            {currentCard.front}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: '2rem',
                            color: '#3b82f6', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem', borderRadius: '99px', background: '#eff6ff'
                        }}>
                            Tap to flip <Sparkles size={16} />
                        </div>
                    </div>

                    {/* Back */}
                    <div style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden',
                        background: gradients.dark,
                        color: 'white',
                        borderRadius: '30px',
                        transform: 'rotateY(180deg)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        padding: '3rem', textAlign: 'center',
                        fontSize: '1.5rem', lineHeight: 1.6,
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                            <Sparkles size={32} />
                        </div>
                        {currentCard.back}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '2rem',
                background: 'white', padding: '1rem 2rem', borderRadius: '24px',
                boxShadow: shadows.soft, marginBottom: '2rem'
            }}>
                <button
                    disabled={currentIndex === 0}
                    onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(c => c - 1), 300); }}
                    style={{
                        background: 'none', border: 'none', outline: 'none',
                        color: currentIndex === 0 ? '#cbd5e1' : '#334155',
                        cursor: currentIndex === 0 ? 'default' : 'pointer',
                        padding: '0.5rem', display: 'flex'
                    }}
                >
                    <ChevronLeft size={32} />
                </button>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                        {currentIndex + 1} <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/ {flashcards.length}</span>
                    </span>
                </div>
                <button
                    disabled={currentIndex === flashcards.length - 1}
                    onClick={() => { setFlipped(false); setTimeout(() => setCurrentIndex(c => c + 1), 300); }}
                    style={{
                        background: 'none', border: 'none', outline: 'none',
                        color: currentIndex === flashcards.length - 1 ? '#cbd5e1' : '#334155',
                        cursor: currentIndex === flashcards.length - 1 ? 'default' : 'pointer',
                        padding: '0.5rem', display: 'flex'
                    }}
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            <button
                onClick={generateCards}
                style={{
                    background: 'transparent', border: 'none',
                    color: '#3b82f6', cursor: 'pointer', fontWeight: 600,
                    fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '8px',
                    transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
                <Zap size={16} /> Generate New Deck
            </button>
        </div>
    );
};


// --- MAIN PAGE ---
export const CourseViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<'materials' | 'teacher' | 'quiz' | 'flashcards'>('materials');
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/api/study-room/courses/${id}`)
            .then(res => res.json())
            .then(setCourse)
            .catch(() => navigate('/study-room'));
    }, [id, navigate]);

    if (!course) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b' }}>
                <Sparkles className="spin" /> Loading Course...
            </div>
        </div>
    );

    const tabs = [
        { id: 'materials', icon: FileText, label: 'Materials' },
        { id: 'teacher', icon: MessageSquare, label: 'Teacher AI' },
        { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
        { id: 'flashcards', icon: Layers, label: 'Flashcards' }
    ] as const;

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <button
                    onClick={() => navigate('/study-room')}
                    style={{
                        background: 'none', border: 'none',
                        color: '#64748b', cursor: 'pointer',
                        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontWeight: 500, padding: 0
                    }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{course.name}</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '800px' }}>{course.description}</p>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                gap: '1rem',
                marginBottom: '2.5rem',
                background: 'white', padding: '0.5rem', borderRadius: '16px',
                boxShadow: shadows.soft, display: 'inline-flex'
            }}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: isActive ? '#eff6ff' : 'transparent',
                                border: 'none',
                                borderRadius: '12px',
                                color: isActive ? '#3b82f6' : '#64748b',
                                fontWeight: isActive ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '1rem',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Icon size={18} /> {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '500px' }}>
                {activeTab === 'materials' && <MaterialsTab courseId={course.id} />}
                {activeTab === 'teacher' && <TeacherTab courseId={course.id} />}
                {activeTab === 'quiz' && <QuizTab courseId={course.id} />}
                {activeTab === 'flashcards' && <FlashcardsTab courseId={course.id} />}
            </div>

            <style>{`
                .spin { animation: spin 2s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .typing-dot {
                    width: 6px; height: 6px; background: #94a3b8; borderRadius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
