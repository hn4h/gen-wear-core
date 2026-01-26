'use client';

import { Users, ShoppingBag, Layers, Activity } from 'lucide-react';

const UsersIcon = Users as any;
const ShoppingBagIcon = ShoppingBag as any;
const LayersIcon = Layers as any;
const ActivityIcon = Activity as any;

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back, Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: '1,234', icon: UsersIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Products', value: '156', icon: ShoppingBagIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Categories', value: '12', icon: LayersIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active Sessions', value: '45', icon: ActivityIcon, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Chart/Activity implementation coming soon
                    </div>
                </div>
                
                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Sales Overview</h3>
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Chart implementation coming soon
                    </div>
                </div>
            </div>
        </div>
    );
}
