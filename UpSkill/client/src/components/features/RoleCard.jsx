const RoleCard = ({ role }) => {
    const getMatchColor = (percentage) => {
        if (percentage >= 80) return 'from-emerald-500 to-teal-600';
        if (percentage >= 60) return 'from-sky-500 to-blue-600';
        if (percentage >= 40) return 'from-amber-500 to-orange-600';
        return 'from-rose-500 to-pink-600';
    };

    const getMatchBg = (percentage) => {
        if (percentage >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (percentage >= 60) return 'bg-sky-50 text-sky-700 border-sky-100';
        if (percentage >= 40) return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-rose-50 text-rose-700 border-rose-100';
    };

    return (
        <div className="bg-white rounded-3xl border-2 border-neutral-100 p-6 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all duration-300 group relative overflow-hidden">
            {/* Match Badge */}
            <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-white font-black text-sm bg-gradient-to-r ${getMatchColor(role.matchPercentage)}`}>
                {role.matchPercentage}% Match
            </div>

            {/* Role Name */}
            <div className="pr-20 mb-4">
                <h4 className="text-xl font-black text-neutral-900 group-hover:text-sky-600 transition-colors">
                    {role.roleName}
                </h4>
            </div>

            {/* Fit Rationale */}
            <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-5">
                {role.fitRationale}
            </p>

            {/* Skills to Add */}
            {role.skillsToAdd?.length > 0 && (
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Skills to Add</p>
                    <div className="flex flex-wrap gap-2">
                        {role.skillsToAdd.map((skill, i) => (
                            <span key={i} className={`px-3 py-1 rounded-lg text-xs font-bold border ${getMatchBg(role.matchPercentage)}`}>
                                + {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleCard;

