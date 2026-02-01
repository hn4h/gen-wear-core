import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    Layers, 
    Tags, 
    LogOut,
    Menu,
    X,
    ClipboardList
} from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { useState } from 'react';

// Cast icons
const LayoutDashboardIcon = LayoutDashboard as any;
const UsersIcon = Users as any;
const ShoppingBagIcon = ShoppingBag as any;
const LayersIcon = Layers as any;
const TagsIcon = Tags as any;
const LogOutIcon = LogOut as any;
const MenuIcon = Menu as any;
const XIcon = X as any;
const ClipboardListIcon = ClipboardList as any;

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuthStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const routes = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboardIcon },
        { href: '/admin/orders', label: 'Orders', icon: ClipboardListIcon },
        { href: '/admin/users', label: 'Users', icon: UsersIcon },
        { href: '/admin/products', label: 'Products', icon: ShoppingBagIcon },
        { href: '/admin/categories', label: 'Categories', icon: LayersIcon },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
            >
                {isMobileOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Gen Wear Admin
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {routes.map((route) => {
                            const Icon = route.icon;
                            const isActive = pathname === route.href;
                            
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                                        ${isActive 
                                            ? 'bg-purple-600 text-white' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{route.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={() => logout()}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOutIcon size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
