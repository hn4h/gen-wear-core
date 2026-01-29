'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/src/services/admin';
import { User } from '@/src/lib/useAuthStore';
import { Search, MoreVertical, Shield, ShieldAlert, Trash2 } from 'lucide-react';

const SearchIcon = Search as any;
const MoreVerticalIcon = MoreVertical as any;
const ShieldIcon = Shield as any;
const ShieldAlertIcon = ShieldAlert as any;
const TrashIcon = Trash2 as any;

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await adminAPI.getUsers(page, 20, searchTerm);
            setUsers(data.users);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                await adminAPI.updateUserRole(userId, newRole);
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error('Failed to update role:', error);
                alert('Failed to update role');
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await adminAPI.deleteUser(userId);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-slate-400">Manage user accounts and permissions</p>
                </div>
                
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-w-[300px]"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-sm font-medium text-slate-400">User</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Contact</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Role</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Joined Date</th>
                                <th className="p-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.full_name}</p>
                                                <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{user.phone_number}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            user.role === 'ADMIN' 
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                            {user.role === 'ADMIN' ? <ShieldAlertIcon className="w-3 h-3" /> : <ShieldIcon className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-slate-300 text-sm">{user.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleRoleUpdate(user.id, user.role || 'USER')}
                                                className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                                                title="Toggle Admin Role"
                                            >
                                                <ShieldAlertIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg">
                        Page {page} of {Math.max(1, totalPages)}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
