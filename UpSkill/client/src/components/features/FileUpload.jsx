import { useState, useRef } from 'react';
import { Button } from '../common';

const FileUpload = ({ onFileSelect, error, loading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndProcessFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    const validateAndProcessFile = (file) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            onFileSelect(null, 'Only PDF and DOCX files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            onFileSelect(null, 'File size must be less than 5MB');
            return;
        }
        setSelectedFile(file);
        onFileSelect(file, null);
    };

    const removeFile = () => {
        setSelectedFile(null);
        onFileSelect(null, null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <div
                className={`
          relative border-2 border-dashed rounded-3xl transition-all duration-500 overflow-hidden
          ${dragActive ? 'border-[#0ea5e9] bg-sky-50/50 scale-[1.01]' : 'border-neutral-200 bg-neutral-50/30 hover:bg-neutral-50 hover:border-neutral-300'}
          ${error ? 'border-rose-300 bg-rose-50/20' : ''}
          ${selectedFile ? 'border-emerald-200 bg-emerald-50/10' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleChange}
                    disabled={loading}
                />

                {!selectedFile ? (
                    <div className="flex flex-col items-center justify-center py-14 px-6 text-center cursor-pointer group" onClick={() => inputRef.current.click()}>
                        <div className={`
              w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500
              ${dragActive ? 'bg-[#0ea5e9] text-white scale-110 shadow-lg shadow-sky-200' : 'bg-white text-neutral-400 group-hover:bg-sky-50 group-hover:text-[#0ea5e9] shadow-sm'}
            `}>
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-black text-neutral-900 mb-2">Drop your resume here</h4>
                        <p className="text-neutral-500 max-w-xs text-sm leading-relaxed mb-6 font-medium">
                            We support <span className="text-neutral-900 font-bold">PDF</span> and <span className="text-neutral-900 font-bold">DOCX</span> files up to 5MB.
                        </p>
                        <Button variant="outline" size="sm" type="button" className="pointer-events-none group-hover:scale-105">
                            Select File
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-8 animate-premium-slide-up">
                        <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-neutral-900 font-black truncate max-w-[200px] md:max-w-xs">
                                    {selectedFile.name}
                                </p>
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                            className="p-2.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300"
                            title="Remove file"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-3 text-sm text-rose-600 font-bold flex items-center px-2 animate-premium-fade-in">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default FileUpload;
