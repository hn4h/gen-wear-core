'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { AdminSidebar } from '@/src/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';

const Loader2Icon = Loader2 as any;

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, hasHydrated } = useAuthStore();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (hasHydrated) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'ADMIN') {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, hasHydrated, router]);

    if (!hasHydrated || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2Icon className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <AdminSidebar />
            <main className="md:ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
