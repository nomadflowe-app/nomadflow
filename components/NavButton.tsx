
import React from 'react';

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-1.5 py-4 transition-all duration-500 rounded-[2rem] ${active
            ? 'bg-navy-950 text-brand-yellow shadow-xl scale-105'
            : 'text-navy-950/60 hover:text-navy-950 hover:bg-navy-50'
            }`}
    >
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
);
