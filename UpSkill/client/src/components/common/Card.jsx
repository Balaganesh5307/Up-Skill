const Card = ({
    children,
    title,
    subtitle,
    footer,
    className = '',
    noPadding = false,
    accent = false,
    ...props
}) => {
    return (
        <div
            className={`
        ${className.includes('bg-') ? '' : 'bg-white'} rounded-3xl premium-shadow premium-shadow-hover overflow-hidden transition-all duration-300 border border-neutral-100/50
        ${accent ? 'border-t-4 border-t-sky-500' : ''}
        ${className}
      `}
            {...props}
        >
            {(title || subtitle) && (
                <div className="px-8 py-6 border-b border-neutral-50 bg-neutral-50/30">
                    {title && <h3 className="text-xl font-bold text-neutral-900 mb-1">{title}</h3>}
                    {subtitle && <p className="text-neutral-500 text-sm leading-relaxed">{subtitle}</p>}
                </div>
            )}

            <div className={`${noPadding ? '' : 'p-8'}`}>
                {children}
            </div>

            {footer && (
                <div className="px-8 py-5 bg-neutral-50/50 border-t border-neutral-50">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
