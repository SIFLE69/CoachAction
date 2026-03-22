import { useState } from 'react';
import { useUI } from '../context/UIContext';

const Icons = {
    Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>,
    Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>,
    Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
};

export default function SettingsPage() {
    const {
        theme, toggleTheme, showToast,
        instituteName, setInstituteName,
        instituteLogo, setInstituteLogo,
        currency, setCurrency
    } = useUI();

    const [name, setName] = useState(instituteName);
    const [logo, setLogo] = useState(instituteLogo);
    const [localCurrency, setLocalCurrency] = useState(currency);

    const handleSaveGeneral = () => {
        setInstituteName(name);
        setInstituteLogo(logo);
        setCurrency(localCurrency);
        showToast('Brand identity updated');
    };

    const resetData = () => {
        if (window.confirm('Reload student data and clear current application state?')) {
            window.location.reload();
        }
    };

    return (
        <div className="page animate-in">
            <div className="mb-12">
                <h1 className="page-title">Configuration</h1>
                <p className="page-subtitle">Manage academy preferences and institute profile</p>
            </div>

            <div className="grid gap-10 max-w-3xl">
                {/* General Section */}
                <section className="card p-6">
                    <p className="section-label mb-6">Institute Identity</p>
                    <div className="flex flex-col gap-6 max-w-sm">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">
                                Public Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input h-10 font-medium"
                                placeholder="Academy Name"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">
                                Brand Asset (Logo URL)
                            </label>
                            <input
                                type="text"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                className="input h-10 font-medium"
                                placeholder="Paste your logo's direct URL here"
                            />
                            <p className="text-[10px] text-[var(--text-muted)] pl-1">Leave empty to use the default CoachAction logo.</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-0.5">
                                Base Currency
                            </label>
                            <select
                                value={localCurrency}
                                onChange={(e) => setLocalCurrency(e.target.value)}
                                className="input h-10 px-2 font-medium"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <button onClick={handleSaveGeneral} className="btn btn-primary h-11 px-10 w-fit shadow-lg mt-2">
                            Apply Identity Changes
                        </button>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="card p-6">
                    <p className="section-label mb-6">User Interface</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[14px] font-bold tracking-tight mb-1">Accessibility Mode</p>
                            <p className="text-[12px] text-[var(--text-muted)]">Toggle between high-contrast and depth modes</p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-12 h-6 rounded-full bg-[var(--border-subtle)] border border-[var(--border-main)] p-0.5 relative transition-colors duration-300"
                        >
                            <div className={`w-4.5 h-4.5 rounded-full bg-primary-600 shadow-sm flex items-center justify-center text-white transition-all transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
                                {theme === 'dark' ? <Icons.Moon /> : <Icons.Sun />}
                            </div>
                        </button>
                    </div>
                </section>

                {/* Data Section */}
                <section className="card p-6 border-danger/5">
                    <p className="section-label text-danger mb-6">System & Data</p>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 mr-8">
                            <p className="text-[14px] font-bold tracking-tight mb-1">Synchronize State</p>
                            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">Refresh the local application cache and reload current dataset from the server.</p>
                        </div>
                        <button onClick={resetData} className="btn btn-ghost h-9 px-6 text-red-600 border border-red-600/10 hover:bg-red-600/5">
                            <Icons.Refresh /><span className="ml-2 pt-0.5">Reset Cache</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
