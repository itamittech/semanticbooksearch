import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ComponentProps {
    userQuery: string;
    aiResponse: string;
}

interface EvaluationResult {
    faithfulness_score: number;
    relevance_score: number;
    explanation: string;
}

export const InsightsPanel: React.FC<ComponentProps> = ({ userQuery, aiResponse }) => {
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<EvaluationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleEvaluate = async () => {
        setEvaluating(true);
        setError(null);
        try {
            const res = await fetch('/api/chat/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery, aiResponse })
            });
            if (!res.ok) throw new Error('Evaluation failed');
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError('Could not evaluate response.');
        } finally {
            setEvaluating(false);
        }
    };

    return (
        <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            fontSize: '0.9rem'
        }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                <Sparkles size={14} /> AI Insights
            </h4>

            {!result ? (
                <button
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.5rem',
                        cursor: evaluating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#334155',
                        fontWeight: 500
                    }}
                >
                    {evaluating ? 'Judging...' : 'Start Real-time Evaluation'}
                </button>
            ) : (
                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                        <ScoreCard label="Faithfulness" score={result.faithfulness_score} />
                        <ScoreCard label="Relevance" score={result.relevance_score} />
                    </div>
                    <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <strong>Judge's Reasoning:</strong>
                        <p style={{ marginTop: '0.25rem', color: '#475569' }}>{result.explanation}</p>
                    </div>
                </div>
            )}

            {error && <div style={{ color: '#ef4444', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={14} /> {error}</div>}
        </div>
    );
};

const ScoreCard = ({ label, score }: { label: string, score: number }) => {
    const isGood = score >= 4;
    return (
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '1.25rem', fontWeight: 'bold', color: isGood ? '#16a34a' : '#ea580c' }}>
                {isGood ? <CheckCircle size={20} /> : <XCircle size={20} />}
                {score}/5
            </div>
        </div>
    );
};
