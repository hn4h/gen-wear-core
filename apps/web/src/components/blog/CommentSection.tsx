'use client';

import { useState } from 'react';
import { BlogComment } from '@/src/services/blog';
import { Send, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/src/lib/useAuthStore';

const SendIcon = Send as any;
const TrashIcon = Trash2 as any;

interface CommentSectionProps {
    postId: string;
    comments: BlogComment[];
    onAddComment: (content: string) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
}

export function CommentSection({ postId, comments, onAddComment, onDeleteComment }: CommentSectionProps) {
    const { user } = useAuthStore();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await onAddComment(newComment.trim());
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">💬</span>
                Bình luận ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                            {user.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                rows={3}
                                className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/60 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="absolute bottom-3 right-3 p-1.5 bg-purple-600 rounded-lg text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
                            >
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-slate-800/40 rounded-xl border border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        <a href="/login" className="text-purple-400 hover:underline">Đăng nhập</a> để bình luận
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                                {comment.author_name.charAt(0)}
                            </div>
                            <div className="flex-1 bg-slate-800/40 rounded-xl px-4 py-3 border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-purple-300">
                                        {comment.author_name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                        {user && (user.id === comment.author_id || user.role === 'ADMIN') && (
                                            <button
                                                onClick={() => onDeleteComment(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-slate-500"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
