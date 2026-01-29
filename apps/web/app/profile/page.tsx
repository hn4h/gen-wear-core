'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { ProfileInfo } from '@/src/components/profile/ProfileInfo';
import { ProfileEdit } from '@/src/components/profile/ProfileEdit';
import { useAuthStore } from '@/src/lib/useAuthStore';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    if (!user) {
        // Redirect to login handled by protected route or client-side check
        // For better UX, we could show a loading state first
        return (
            <main className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Please Log In</h1>
                    <p className="text-slate-400 mb-6">You need to be logged in to view your profile.</p>
                    <Link 
                        href="/login"
                        className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors"
                    >
                        Log In
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-900">
            <Header />
            
            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-slate-400">Manage your account settings and preferences</p>
                    </div>

                    {isEditing ? (
                        <ProfileEdit 
                            user={user}
                            onCancel={() => setIsEditing(false)}
                            onSave={(updatedUser) => {
                                setUser(updatedUser);
                                setIsEditing(false);
                            }}
                        />
                    ) : (
                        <ProfileInfo 
                            user={user}
                            onEdit={() => setIsEditing(true)}
                        />
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
