import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Spinner, Button } from '../components/common';
import api from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers(1);
        }
    }, [activeTab, search]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            const { stats: s, recentUsers: ru, recentAnalyses: ra } = response.data.data;
            setStats(s);
            setRecentUsers(ru);
            setRecentAnalyses(ra);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            const response = await api.get(`/admin/users?page=${page}&limit=15&search=${search}`);
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        setActionLoading(userId);
        try {
            await api.delete(`/admin/users/${userId}`);
            setDeleteModal(null);
            fetchUsers(pagination.page);
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(userId);
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            fetchUsers(pagination.page);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl animate-premium-fade-in">
            {/* Header */}
            <div className="mb-10">
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-3">
                    <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Admin Panel
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-tight">
                    Admin <span className="text-amber-500">Dashboard</span>
                </h1>
                <p className="text-neutral-500 font-medium mt-1">Manage users and monitor platform activity.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-neutral-100 p-1 rounded-xl w-fit">
                {['overview', 'users'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                        <StatCard label="Total Users" value={stats?.totalUsers || 0} color="sky" icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        } />
                        <StatCard label="Total Analyses" value={stats?.totalAnalyses || 0} color="emerald" icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        } />
                        <StatCard label="Avg Match Score" value={`${stats?.avgMatchScore || 0}%`} color="violet" icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        } />
                        <StatCard label="Google Users" value={stats?.googleUsers || 0} color="amber" icon={
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        } />
                    </div>

                    {/* Weekly Trend Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                        <TrendCard label="New Users Today" value={stats?.newUsersToday || 0} />
                        <TrendCard label="Analyses Today" value={stats?.analysesToday || 0} />
                        <TrendCard label="New Users (7d)" value={stats?.newUsersWeek || 0} />
                        <TrendCard label="Analyses (7d)" value={stats?.analysesWeek || 0} />
                    </div>

                    {/* Recent Activity */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Recent Users */}
                        <div>
                            <h3 className="text-lg font-black text-neutral-900 mb-4 px-1">Recent Users</h3>
                            <div className="space-y-3">
                                {recentUsers.map((u) => (
                                    <Card key={u._id} noPadding className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                                                    {u.profileImage ? (
                                                        <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-neutral-900">{u.name}</p>
                                                    <p className="text-xs text-neutral-400">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {u.role === 'admin' && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100">Admin</span>
                                                )}
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.authProvider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-neutral-50 text-neutral-500 border border-neutral-100'
                                                    }`}>
                                                    {u.authProvider}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Recent Analyses */}
                        <div>
                            <h3 className="text-lg font-black text-neutral-900 mb-4 px-1">Recent Analyses</h3>
                            <div className="space-y-3">
                                {recentAnalyses.map((a) => (
                                    <Card key={a._id} noPadding className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-sm text-neutral-900">{a.jobTitle || 'Untitled'}</p>
                                                <p className="text-xs text-neutral-400">by {a.user?.name || 'Unknown'} • {new Date(a.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${a.matchScore >= 70 ? 'bg-emerald-50 text-emerald-600' : a.matchScore >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {a.matchScore}%
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {recentAnalyses.length === 0 && (
                                    <p className="text-neutral-400 text-sm text-center py-8">No analyses yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <>
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-300 transition-all"
                            />
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 pl-1">{pagination.total} users total</p>
                    </div>

                    {/* Users Table */}
                    <Card noPadding className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-100">
                                        <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">User</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hidden sm:table-cell">Provider</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hidden md:table-cell">Analyses</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hidden lg:table-cell">Joined</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Role</th>
                                        <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                                                        {u.profileImage ? (
                                                            <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.name?.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-neutral-900 truncate">{u.name}</p>
                                                        <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.authProvider === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
                                                    }`}>
                                                    {u.authProvider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="font-bold text-sm text-neutral-700">{u.analysisCount}</span>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <span className="text-xs text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-neutral-50 text-neutral-400'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {u._id !== user?.id && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                                                                disabled={actionLoading === u._id}
                                                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all disabled:opacity-50"
                                                            >
                                                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteModal(u)}
                                                                disabled={actionLoading === u._id}
                                                                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all disabled:opacity-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                    {u._id === user?.id && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">You</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
                                <span className="text-xs text-neutral-400 font-medium">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchUsers(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-white transition-all disabled:opacity-30"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => fetchUsers(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.pages}
                                        className="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-white transition-all disabled:opacity-30"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-premium-slide-up">
                        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 text-center mb-2">Delete User</h3>
                        <p className="text-neutral-500 text-sm text-center mb-6">
                            Are you sure you want to delete <strong>{deleteModal.name}</strong> ({deleteModal.email})? This will also delete all their analyses. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(deleteModal._id)}
                                disabled={actionLoading === deleteModal._id}
                                className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading === deleteModal._id ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, color, icon }) => {
    const colors = {
        sky: 'bg-sky-50 text-sky-600 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        violet: 'bg-violet-50 text-violet-600 border-violet-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };

    return (
        <Card className="relative overflow-hidden">
            <div className={`w-10 h-10 rounded-xl ${colors[color]} border flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">{label}</span>
            <span className="text-3xl font-black text-neutral-900">{value}</span>
        </Card>
    );
};

const TrendCard = ({ label, value }) => (
    <Card noPadding className="p-4 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500">{label}</span>
        <span className="text-lg font-black text-neutral-900">{value}</span>
    </Card>
);

export default AdminDashboard;
