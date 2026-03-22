import { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [toasts, setToasts] = useState([]);
    const [instituteName, setInstituteName] = useState(localStorage.getItem('instituteName') || 'CoachAction');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('instituteName', instituteName);
    }, [instituteName]);

    const showToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <UIContext.Provider value={{
            theme, toggleTheme,
            toasts, showToast,
            instituteName, setInstituteName,
            sidebarOpen, setSidebarOpen
        }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`px-5 py-3 rounded-xl shadow-lg border animate-in flex items-center gap-3 ${t.type === 'error'
                            ? 'bg-danger text-white border-danger'
                            : 'bg-success text-white border-success'
                            }`}
                        style={{ minWidth: '240px' }}
                    >
                        <span className="text-lg">{t.type === 'error' ? '⚠️' : '✅'}</span>
                        <span className="font-semibold">{t.message}</span>
                    </div>
                ))}
            </div>
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);
