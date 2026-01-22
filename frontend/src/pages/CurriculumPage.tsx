import React, { useState } from 'react';
import { GraduationCap, Loader2, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import './CurriculumPage.css';

interface ReadingAssignment {
    bookId: string;
    bookTitle: string;
    chapterTitle: string;
    reason: string;
}

interface Module {
    week: number;
    topic: string;
    description: string;
    readings: ReadingAssignment[];
}

interface Curriculum {
    topic: string;
    level: string;
    modules: Module[];
}

export const CurriculumPage: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setCurriculum(null);

        try {
            const response = await fetch('/api/curriculum/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, level: 'University', duration: '4 Weeks' })
            });
            const data = await response.json();
            setCurriculum(data);
        } catch (error) {
            console.error('Failed to generate curriculum', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="curriculum-page">
            <div className="container">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="hero-title">
                        <GraduationCap size={56} className="text-primary" />
                        <span>Intelligent Curriculum</span>
                    </div>
                    <p className="hero-subtitle">
                        Transform your existing library into a personalized university-level course using AI.
                    </p>
                </div>

                {/* Magic Input */}
                <form onSubmit={handleGenerate} className="magic-input-wrapper">
                    <input
                        type="text"
                        className="magic-input"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What do you want to master today? (e.g. Stoicism, System Design)"
                    />
                    <button
                        type="submit"
                        disabled={loading || !topic}
                        className="magic-btn"
                    >
                        {loading ? <Loader2 className="spin" size={20} /> : <><Sparkles size={18} /> Generate</>}
                    </button>
                </form>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <div style={{
                                position: 'absolute', inset: -10, borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
                                animation: 'pulse 2s infinite'
                            }} />
                            <Loader2 size={64} className="spin text-primary" style={{ position: 'relative' }} />
                        </div>
                        <h3 style={{ marginTop: '2rem', fontSize: '1.2rem', fontWeight: 600 }}>Designing your syllabus...</h3>
                        <p style={{ opacity: 0.7 }}>Scanning library content & extracting chapters</p>
                    </div>
                )}

                {/* Timeline */}
                {curriculum && (
                    <div className="curriculum-timeline">
                        {curriculum.modules.map((module) => (
                            <div key={module.week} className="timeline-module">
                                <div className="timeline-marker">
                                    {module.week}
                                </div>

                                <div className="module-card">
                                    <h3>{module.topic}</h3>
                                    <p className="module-desc">{module.description}</p>

                                    <div className="readings-grid">
                                        {module.readings.map((reading, idx) => (
                                            <div key={idx} className="reading-item">
                                                <div className="reading-icon">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div className="reading-content">
                                                    <div className="reading-title">{reading.chapterTitle}</div>
                                                    <div className="reading-book">
                                                        From: <em>{reading.bookTitle}</em>
                                                    </div>
                                                    <div className="reading-reason">
                                                        🎯 {reading.reason}
                                                    </div>
                                                </div>
                                                <button className="btn-read"
                                                    onClick={() => alert(`Opening ${reading.chapterTitle}...`)}
                                                >
                                                    Read <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
