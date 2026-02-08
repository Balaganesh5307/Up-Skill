const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-100',
    Advanced: 'bg-rose-50 text-rose-700 border-rose-100'
};

const ProjectCard = ({ project }) => {
    const difficultyClass = difficultyColors[project.difficulty] || difficultyColors.Intermediate;

    return (
        <div className="bg-white rounded-3xl border-2 border-neutral-100 p-6 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-50 transition-all duration-300 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h4 className="text-lg font-black text-neutral-900 group-hover:text-sky-600 transition-colors mb-1">
                        {project.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs">
                        <span className={`px-3 py-1 rounded-lg font-bold border ${difficultyClass}`}>
                            {project.difficulty}
                        </span>
                        <span className="text-neutral-400 font-medium">
                            ~{project.estimatedDays} days
                        </span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-4">
                {project.description}
            </p>

            {/* Tech Stack */}
            <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                    {project.techStack?.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Learning Outcomes */}
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">What You'll Learn</p>
                <ul className="space-y-1">
                    {project.learningOutcomes?.map((outcome, i) => (
                        <li key={i} className="text-sm text-neutral-600 font-medium flex items-start">
                            <span className="text-sky-500 mr-2">✓</span>
                            {outcome}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProjectCard;

