import { useState } from 'react';
import { User } from '@/src/lib/useAuthStore';
import { authAPI } from '@/src/services/auth';
import { Loader2, Save, X } from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';

const Loader2Icon = Loader2 as any;
const SaveIcon = Save as any;
const XIcon = X as any;

interface ProfileEditProps {
    user: User;
    onCancel: () => void;
    onSave: (updatedUser: User) => void;
}

export function ProfileEdit({ user, onCancel, onSave }: ProfileEditProps) {
    const { setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form state
    const [fullName, setFullName] = useState(user.full_name);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Update profile info
            if (fullName !== user.full_name) {
                const updatedUser = await authAPI.updateProfile({ full_name: fullName });
                setUser(updatedUser);
                onSave(updatedUser);
            }

            // Update password if fields are filled
            if (currentPassword && newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords don't match");
                }
                await authAPI.changePassword({
                    current_password: currentPassword,
                    new_password: newPassword
                });
            }
            
            // If only name changed, success is handled above
            // If password changed, we might want to show a toast (omitted for simplicity)
            onSave({ ...user, full_name: fullName });
            
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Personal Info */}
                <div>
                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                            <input
                                type="text"
                                value={user.phone_number}
                                disabled
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">Phone number cannot be changed</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 my-6"></div>

                {/* Password Change */}
                <div>
                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">Change Password</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
