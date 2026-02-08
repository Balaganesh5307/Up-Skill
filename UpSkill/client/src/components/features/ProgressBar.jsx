import { useEffect, useState } from 'react';

const ProgressBar = ({
    value,
    max = 100,
    label,
    showValue = true,
    className = '',
    size = 'md',
    animate = true
}) => {
    const [width, setWidth] = useState(0);
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => {
                setWidth(percentage);
            }, 200);
            return () => clearTimeout(timer);
        } else {
            setWidth(percentage);
        }
    }, [percentage, animate]);

    const getColorClass = (pct) => {
        if (pct < 40) return 'from-rose-500 to-rose-400 shadow-rose-200';
        if (pct < 70) return 'from-amber-500 to-amber-400 shadow-amber-200';
        return 'from-[#0ea5e9] to-[#6366f1] shadow-sky-200';
    };

    const sizes = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-7',
    };

    return (
        <div className={`w-full ${className}`}>
            {(label || showValue) && (
                <div className="flex justify-between items-end mb-2.5 px-1">
                    {label && <span className="text-sm font-bold text-neutral-800 tracking-tight">{label}</span>}
                    {showValue && (
                        <span className={`text-sm font-black ${percentage < 40 ? 'text-rose-600' : percentage < 70 ? 'text-amber-600' : 'text-[#0ea5e9]'}`}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-neutral-100 rounded-full overflow-hidden p-1 shadow-inner border border-neutral-200/50 ${sizes[size]}`}>
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-premium shadow-sm bg-gradient-to-r ${getColorClass(percentage)} relative group`}
                    style={{ width: `${width}%` }}
                >
                    {/* Subtle shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                    {/* Animated glow on the edge */}
                    {width > 0 && width < 100 && (
                        <div className="absolute right-0 top-0 bottom-0 w-2 h-full bg-white opacity-40 blur-sm animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
