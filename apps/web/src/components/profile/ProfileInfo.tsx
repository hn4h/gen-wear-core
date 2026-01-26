import { User } from '@/src/lib/useAuthStore';
import { User as UserIcon, Phone, Calendar, LogOut } from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';

// Cast icons
const UserIconLucide = UserIcon as any;
const PhoneIcon = Phone as any;
const CalendarIcon = Calendar as any;
const LogOutIcon = LogOut as any;

interface ProfileInfoProps {
    user: User;
    onEdit: () => void;
}

export function ProfileInfo({ user, onEdit }: ProfileInfoProps) {
    const { logout } = useAuthStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar / Avatar */}
            <div className="md:col-span-1">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4">
                        {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{user.full_name}</h2>
                    <p className="text-slate-400 text-sm mb-6">Member since {new Date(user.created_at).getFullYear()}</p>
                    
                    <button 
                        onClick={onEdit}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors mb-4"
                    >
                        Edit Profile
                    </button>
                    
                    <button 
                        onClick={() => logout()}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOutIcon className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-800/50 rounded-2xl p-8 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                    
                    <div className="space-y-6">
                        <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-colors">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
                                <UserIconLucide className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Full Name</p>
                                <p className="text-white font-medium text-lg">{user.full_name}</p>
                            </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-colors">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                                <PhoneIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Phone Number</p>
                                <p className="text-white font-medium text-lg">{user.phone_number}</p>
                            </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-purple-500/30 transition-colors">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Joined Date</p>
                                <p className="text-white font-medium text-lg">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
