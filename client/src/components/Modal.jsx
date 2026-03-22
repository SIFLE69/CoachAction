import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in">
            <div
                className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
            />
            <div className="relative card w-full max-w-md p-6 bg-[var(--bg-card)] border-[var(--border-main)] shadow-2xl">
                {title && (
                    <div className="mb-4">
                        <h3 className="text-[17px] font-bold tracking-tight text-[var(--text-main)]">
                            {title}
                        </h3>
                    </div>
                )}

                <div className="text-[13.5px] text-[var(--text-muted)] leading-relaxed mb-6">
                    {children}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    {footer || (
                        <button onClick={onClose} className="btn btn-ghost h-9 px-6 text-[13px]">
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

