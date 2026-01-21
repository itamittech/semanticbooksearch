import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, ArrowRight, X } from 'lucide-react';
import type { Course } from '../types/study-room';

export const StudyRoomPage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseDesc, setNewCourseDesc] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/study-room/courses')
            .then(res => res.json())
            .then(setCourses);
    }, []);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/study-room/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCourseName, description: newCourseDesc })
        });
        const course = await res.json();
        setCourses([...courses, course]);
        setShowCreateModal(false);
        setNewCourseName('');
        setNewCourseDesc('');
    };

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '2rem 2.5rem',
                borderRadius: '1.5rem',
                color: 'white',
                boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.3)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <GraduationCap size={32} color="#60a5fa" />
                        <h1 style={{ fontSize: '2rem', margin: 0 }}>Study Room</h1>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px' }}>
                        Your personalized AI learning space. Organize your materials, generate quizzes, and master any subject.
                    </p>
                </div>
                <button
                    className="search-button"
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        padding: '0.8rem 1.5rem',
                        fontSize: '1rem',
                        background: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    <Plus size={20} />
                    New Course
                </button>
            </div>

            {/* Courses Grid */}
            <div className="books-grid">
                {courses.map(course => (
                    <div
                        key={course.id}
                        className="book-card"
                        onClick={() => navigate(`/study-room/course/${course.id}`)}
                        style={{
                            cursor: 'pointer',
                            position: 'relative',
                            borderTop: '4px solid #3b82f6'
                        }}
                    >
                        <div className="book-card-content" style={{ padding: '2rem 1.5rem' }}>
                            <div style={{
                                width: '50px', height: '50px',
                                background: '#eff6ff', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem', color: '#3b82f6'
                            }}>
                                <GraduationCap size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{course.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                                {course.description || 'No description provided.'}
                            </p>

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem',
                                marginTop: 'auto'
                            }}>
                                Open Course <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '5rem', color: '#64748b',
                    background: 'white', borderRadius: '1rem', border: '2px dashed #e2e8f0'
                }}>
                    <GraduationCap size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>No courses yet</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>Create your first course to start uploading PDFs, PPTs, and chatting with your AI Teacher.</p>
                    <button className="search-button" onClick={() => setShowCreateModal(true)}>
                        Create Now
                    </button>
                </div>
            )}

            {/* Premium Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ height: 'auto', maxHeight: 'none', maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3>Create New Course</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCourse}>
                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                                        Course Name
                                    </label>
                                    <input
                                        placeholder="e.g. Biology 101"
                                        value={newCourseName}
                                        onChange={e => setNewCourseName(e.target.value)}
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            borderRadius: '0.5rem', border: '1px solid #e2e8f0',
                                            fontSize: '1rem', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="What is this course about?"
                                        value={newCourseDesc}
                                        onChange={e => setNewCourseDesc(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.75rem',
                                            borderRadius: '0.5rem', border: '1px solid #e2e8f0',
                                            fontSize: '1rem', outline: 'none', minHeight: '100px',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{
                                padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0',
                                display: 'flex', justifyContent: 'flex-end', gap: '1rem',
                                background: '#f8fafc'
                            }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{
                                    padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0',
                                    background: 'white', borderRadius: '0.5rem',
                                    cursor: 'pointer', fontWeight: 500, color: '#475569'
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{
                                    padding: '0.6rem 1.5rem', border: 'none',
                                    background: '#3b82f6', color: 'white', borderRadius: '0.5rem',
                                    cursor: 'pointer', fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                }}>
                                    Create Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
