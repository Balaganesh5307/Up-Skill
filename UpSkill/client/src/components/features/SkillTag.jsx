const SkillTag = ({ name, type = 'matched', className = '' }) => {
    const variants = {
        matched: 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10',
        missing: 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10',
        extra: 'bg-sky-50 text-sky-700 border-sky-100 ring-sky-500/10',
    };

    const icons = {
        matched: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        ),
        missing: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        extra: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
        )
    };

    return (
        <span
            className={`
        inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border transition-all duration-300
        hover:scale-105 hover:shadow-sm animate-premium-fade-in ring-1
        ${variants[type]} 
        ${className}
      `}
        >
            {icons[type]}
            {name}
        </span>
    );
};

export default SkillTag;
