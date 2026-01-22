import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { type Book } from '../types/Book';

interface BookUploadModalProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const BookUploadModal: React.FC<BookUploadModalProps> = ({ book, isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`/api/books/${book.id}/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                onUploadSuccess();
                onClose();
            } else {
                const text = await response.text();
                setError(`Upload failed: ${text}`);
            }
        } catch (err) {
            setError("Network error occurred during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <div className="modal-header">
                    <h2>Upload Content for "{book.title}"</h2>
                    <p>Provide the text content to enable chatting with this book.</p>
                </div>

                <div className="upload-area">
                    <input
                        type="file"
                        id="book-file"
                        accept=".txt,.md,.pdf"
                        onChange={handleFileChange}
                        className="file-input-hidden"
                    />
                    <label htmlFor="book-file" className={`upload-dropzone ${file ? 'has-file' : ''}`}>
                        {file ? (
                            <div className="file-info">
                                <FileText size={48} className="text-blue-500" />
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                <span className="change-file-text">Click to change</span>
                            </div>
                        ) : (
                            <div className="empty-dropzone">
                                <Upload size={48} className="text-gray-400" />
                                <span>Click to select a file (TXT, MD)</span>
                            </div>
                        )}
                    </label>
                </div>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-upload"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner-sm"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Upload Book
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease-out;
                }

                .modal-content {
                    background: white;
                    border-radius: 1rem;
                    width: 90%;
                    max-width: 500px;
                    padding: 2rem;
                    position: relative;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    animation: slideUp 0.3s ease-out;
                }

                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .modal-header { margin-bottom: 2rem; text-align: center; }
                .modal-header h2 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 1.5rem; }
                .modal-header p { margin: 0; color: #64748b; }

                .file-input-hidden { display: none; }
                
                .upload-dropzone {
                    display: block;
                    border: 2px dashed #cbd5e1;
                    border-radius: 0.75rem;
                    padding: 3rem 1rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                .upload-dropzone:hover {
                    border-color: #2563eb;
                    background: #eff6ff;
                }

                .upload-dropzone.has-file {
                    border-style: solid;
                    border-color: #bfdbfe;
                    background: #eff6ff;
                }

                .empty-dropzone {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    color: #64748b;
                }

                .file-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .file-name { font-weight: 600; color: #1e293b; }
                .file-size { font-size: 0.85rem; color: #64748b; }
                .change-file-text { font-size: 0.8rem; color: #2563eb; margin-top: 0.5rem; }

                .error-message {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-top: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .modal-footer {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .btn-cancel, .btn-upload {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-cancel {
                    background: transparent;
                    color: #64748b;
                }

                .btn-cancel:hover { background: #f1f5f9; color: #475569; }

                .btn-upload {
                    background: #2563eb;
                    color: white;
                }

                .btn-upload:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }

                .btn-upload:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                    transform: none;
                }

                .spinner-sm {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
