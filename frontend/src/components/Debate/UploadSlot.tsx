import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

interface UploadSlotProps {
    label: string;
    name: string;
    onFileSelect: (file: File) => void;
    status: 'idle' | 'uploading' | 'ready';
}

export const UploadSlot: React.FC<UploadSlotProps> = ({ label, name, onFileSelect, status }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`upload-slot ${status === 'ready' ? 'ready' : ''}`} onClick={handleClick}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.txt,.docx,.md"
            />

            <div className="slot-header">
                <h3>{label}</h3>
                {status === 'ready' ? <CheckCircle className="icon-success" /> : <Upload className="icon-upload" />}
            </div>

            <div className="slot-content">
                {fileName ? (
                    <div className="file-info">
                        <FileText size={24} />
                        <span className="filename">{fileName}</span>
                    </div>
                ) : (
                    <div className="placeholder">
                        <span>{name}</span>
                        <small>Click to upload (PDF/TXT)</small>
                    </div>
                )}
            </div>

            {status === 'uploading' && <div className="progress-bar"><div className="fill"></div></div>}
        </div>
    );
};
