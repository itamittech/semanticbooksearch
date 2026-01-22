
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageCircle, GitMerge, Share2, Swords } from 'lucide-react';

export const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="nav-brand">Semantic Library</Link>
                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        <BookOpen size={18} />
                        Browse
                    </Link>
                    <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
                        <MessageCircle size={18} />
                        Chat Assistant
                    </Link>

                    <Link to="/hybrid-search" className={`nav-link ${isActive('/hybrid-search')}`}>
                        <GitMerge size={18} />
                        Hybrid Search
                    </Link>
                    <Link to="/knowledge-graph" className={`nav-link ${isActive('/knowledge-graph')}`}>
                        <Share2 size={18} />
                        Visualize
                    </Link>
                    <Link to="/study-room" className={`nav-link ${isActive('/study-room')}`}>
                        <span style={{ fontSize: '1.2rem' }}>🎓</span>
                        Study Room
                    </Link>
                    <Link to="/debate" className={`nav-link ${isActive('/debate')}`}>
                        <Swords size={18} />
                        Debate Arena
                    </Link>
                    <Link to="/curriculum" className={`nav-link ${isActive('/curriculum')}`}>
                        <span style={{ fontSize: '1.2rem' }}>📜</span>
                        Curriculum
                    </Link>
                </div>
            </div>
        </nav>
    );
};
