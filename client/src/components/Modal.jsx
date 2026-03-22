import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 fade-in">
            <div
                className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative card scale-in w-full max-w-md p-8 bg-[var(--bg-card)] border-[var(--border-main)] shadow-2xl">
                {title && (
                    <div className="mb-6">
                        <h3 className="section-title">
                            {title}
                        </h3>
                    </div>
                )}

                <div className="text-[14px] text-[var(--text-muted)] leading-relaxed mb-8">
                    {children}
                </div>

                <div className="flex gap-4 justify-end">
                    {footer || (
                        <button onClick={onClose} className="btn btn-ghost h-10 px-8 text-[13px]">
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

