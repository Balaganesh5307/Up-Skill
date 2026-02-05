const Input = ({
    label,
    error,
    id,
    className = '',
    required = false,
    helperText,
    icon,
    ...props
}) => {
    return (
        <div className={`flex flex-col space-y-2.5 ${className}`}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-semibold text-neutral-700 ml-1 flex items-center"
                >
                    {label}
                    {required && <span className="text-rose-500 ml-1.5">*</span>}
                </label>
            )}

            <div className="relative group transition-all duration-300">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0ea5e9] transition-colors duration-300">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`
            w-full bg-white border-2 transition-all duration-300 outline-none
            ${icon ? 'pl-11 pr-4' : 'px-4'} 
            py-3 rounded-xl
            ${error
                            ? 'border-rose-100 bg-rose-50/30 text-rose-900 focus:border-rose-500 placeholder:text-rose-200'
                            : 'border-neutral-100 bg-white hover:border-neutral-200 focus:border-[#0ea5e9] focus:bg-white focus:ring-4 focus:ring-sky-50 shadow-sm focus:shadow-md'
                        }
          `}
                    {...props}
                />
            </div>

            {(error || helperText) && (
                <p className={`text-xs ml-1 ${error ? 'text-rose-600 font-medium' : 'text-neutral-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
