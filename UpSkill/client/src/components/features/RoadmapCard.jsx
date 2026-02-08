import { Card } from '../common';

const RoadmapCard = ({ item, index }) => {
    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 'bg-sky-50 text-sky-700 border-sky-100 ring-sky-500/10';
            case 'intermediate': return 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10';
            case 'advanced': return 'bg-violet-50 text-violet-700 border-violet-100 ring-violet-500/10';
            default: return 'bg-neutral-50 text-neutral-700 border-neutral-100 ring-neutral-500/10';
        }
    };

    return (
        <Card
            className="h-full transform transition-transform duration-500 hover:-translate-y-2 animate-premium-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex flex-col h-full space-y-5">
                <div className="flex justify-between items-start">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ring-1 ${getLevelColor(item.level)}`}>
                        {item.level || 'General'}
                    </div>
                    <div className="flex items-center text-neutral-500 text-xs font-black bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                        <svg className="w-3.5 h-3.5 mr-1.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.estimatedDays} Days
                    </div>
                </div>

                <div>
                    <h4 className="text-xl font-black text-neutral-900 mb-2 leading-tight">
                        {item.skill}
                    </h4>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed line-clamp-2">
                        Master this essential skill to close the gap for this role.
                    </p>
                </div>

                <div className="pt-4 mt-auto border-t border-neutral-50">
                    <a
                        href={item.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-neutral-50 hover:bg-[#0ea5e9]/5 hover:text-[#0ea5e9] group transition-all duration-300 border border-transparent hover:border-[#0ea5e9]/20"
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] uppercase tracking-widest font-black text-neutral-400 group-hover:text-[#0ea5e9]/70">Recommended Source</span>
                            <span className="text-sm font-black truncate pr-4">{item.resourceName}</span>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#0ea5e9] group-hover:text-white transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                    </a>
                </div>
            </div>
        </Card>
    );
};

export default RoadmapCard;
