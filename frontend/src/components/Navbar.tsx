
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageCircle, PlusCircle, GitMerge } from 'lucide-react';

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
                    <Link to="/add" className={`nav-link ${isActive('/add')}`}>
                        <PlusCircle size={18} />
                        Add Book
                    </Link>
                    <Link to="/hybrid-search" className={`nav-link ${isActive('/hybrid-search')}`}>
                        <GitMerge size={18} />
                        Hybrid Search
                    </Link>
                </div>
            </div>
        </nav>
    );
};
