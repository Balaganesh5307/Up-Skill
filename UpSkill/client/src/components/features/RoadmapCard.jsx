import { useState } from 'react';
import { Card } from '../common';

const RoadmapCard = ({ item, index, analysisId, onStatusChange, isPublic = false }) => {
    const [status, setStatus] = useState(item.status || 'todo');
    const [updating, setUpdating] = useState(false);

    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner': return 'bg-sky-50 text-sky-700 border-sky-100 ring-sky-500/10';
            case 'intermediate': return 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-500/10';
            case 'advanced': return 'bg-violet-50 text-violet-700 border-violet-100 ring-violet-500/10';
            default: return 'bg-neutral-50 text-neutral-700 border-neutral-100 ring-neutral-500/10';
        }
    };

    const getStatusConfig = (s) => {
        switch (s) {
            case 'done':
                return {
                    label: 'Done',
                    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                };
            case 'in-progress':
                return {
                    label: 'In Progress',
                    bg: 'bg-amber-100 text-amber-700 border-amber-200',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                };
            default:
                return {
                    label: 'To Do',
                    bg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                };
        }
    };

    const cycleStatus = async () => {
        if (isPublic || updating) return;

        const nextStatus = status === 'todo' ? 'in-progress' : status === 'in-progress' ? 'done' : 'todo';
        setUpdating(true);

        try {
            if (onStatusChange) {
                await onStatusChange(analysisId, index, nextStatus);
            }
            setStatus(nextStatus);
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdating(false);
        }
    };

    const statusConfig = getStatusConfig(status);
    const isDone = status === 'done';

    return (
        <Card
            className={`h-full transform transition-all duration-500 hover:-translate-y-2 animate-premium-slide-up ${isDone ? 'opacity-60' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex flex-col h-full space-y-5">
                <div className="flex justify-between items-start gap-2">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ring-1 ${getLevelColor(item.level)}`}>
                        {item.level || 'General'}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center text-neutral-500 text-xs font-black bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.estimatedDays} Days
                        </div>
                    </div>
                </div>

                <div className={isDone ? 'line-through' : ''}>
                    <h4 className="text-xl font-black text-neutral-900 mb-2 leading-tight">
                        {item.skill}
                    </h4>
                    <p className="text-neutral-500 text-sm font-medium leading-relaxed line-clamp-2">
                        Master this essential skill to close the gap for this role.
                    </p>
                </div>

                {!isPublic && (
                    <button
                        onClick={cycleStatus}
                        disabled={updating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${statusConfig.bg} ${updating ? 'opacity-50 cursor-wait' : 'hover:scale-105 cursor-pointer'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {statusConfig.icon}
                        </svg>
                        {updating ? 'Saving...' : statusConfig.label}
                    </button>
                )}

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
