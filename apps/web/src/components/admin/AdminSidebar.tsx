'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Layers,
    LogOut,
    Menu,
    X,
    ClipboardList,
    FileText,
    ClipboardCheck,
    Zap,
    ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { useState } from 'react';

// Icon casts
const LayoutDashboardIcon = LayoutDashboard as any;
const UsersIcon = Users as any;
const ShoppingBagIcon = ShoppingBag as any;
const LayersIcon = Layers as any;
const LogOutIcon = LogOut as any;
const MenuIcon = Menu as any;
const XIcon = X as any;
const ClipboardListIcon = ClipboardList as any;
const FileTextIcon = FileText as any;
const ClipboardCheckIcon = ClipboardCheck as any;
const ZapIcon = Zap as any;
const ChevronRightIcon = ChevronRight as any;

const routes = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboardIcon, exact: true, color: 'from-violet-500 to-purple-600' },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardListIcon, exact: false, color: 'from-blue-500 to-cyan-600' },
    { href: '/admin/users', label: 'Users', icon: UsersIcon, exact: false, color: 'from-emerald-500 to-teal-600' },
    { href: '/admin/products', label: 'Products', icon: ShoppingBagIcon, exact: false, color: 'from-pink-500 to-rose-600' },
    { href: '/admin/categories', label: 'Categories', icon: LayersIcon, exact: false, color: 'from-orange-500 to-amber-600' },
    { href: '/admin/surveys', label: 'Surveys', icon: ClipboardCheckIcon, exact: false, color: 'from-indigo-500 to-violet-600' },
    { href: '/blog', label: 'Blog', icon: FileTextIcon, exact: false, color: 'from-cyan-500 to-sky-600' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (route: typeof routes[number]) =>
        route.exact ? pathname === route.href : pathname.startsWith(route.href);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-xl text-white cursor-pointer hover:border-purple-500/50 transition-all duration-200"
            >
                {isMobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Glass background */}
                <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-white/[0.06] shadow-2xl shadow-black/50">

                    {/* Logo */}
                    <div className="p-5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <ZapIcon size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-white tracking-tight">GenWear</h1>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Admin Console</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-3 pt-2 pb-2">Navigation</p>
                        {routes.map((route) => {
                            const Icon = route.icon;
                            const active = isActive(route);

                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                                        group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden
                                        ${active
                                            ? 'bg-white/[0.08] text-white'
                                            : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    {/* Active glow line */}
                                    {active && (
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-gradient-to-b ${route.color}`} />
                                    )}

                                    {/* Icon container */}
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                                        ${active
                                            ? `bg-gradient-to-br ${route.color} shadow-lg`
                                            : 'bg-white/5 group-hover:bg-white/10'
                                        }
                                    `}>
                                        <Icon size={15} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
                                    </div>

                                    <span className="text-sm font-medium flex-1">{route.label}</span>

                                    {active && <ChevronRightIcon size={14} className="text-slate-500" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User + Logout */}
                    <div className="p-3 border-t border-white/[0.06] space-y-1">
                        {/* User info */}
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] mb-1">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[11px] font-bold text-white">
                                        {user.email?.[0]?.toUpperCase() || 'A'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-300 truncate">{user.email || 'Admin'}</p>
                                    <p className="text-[10px] text-emerald-500 font-medium">● Online</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => logout()}
                            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-red-500/10 transition-all">
                                <LogOutIcon size={15} />
                            </div>
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
