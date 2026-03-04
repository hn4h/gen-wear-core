'use client';

import Link from 'next/link';
import { BlogPost } from '@/src/services/blog';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';

const HeartIcon = Heart as any;
const MessageIcon = MessageCircle as any;
const CalendarIcon = Calendar as any;
const UserIcon = User as any;

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const previewImage = post.image_urls?.[0];
    const tagList = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <Link href={`/blog/${post.id}`} className="group block">
            <div className="bg-slate-800/60 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative h-52 bg-slate-700/50 overflow-hidden">
                    {previewImage ? (
                        <img
                            src={previewImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                <span className="text-3xl">✍️</span>
                            </div>
                        </div>
                    )}
                    {tagList.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                            {tagList.slice(0, 2).map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-purple-600/80 backdrop-blur-sm text-white text-xs rounded-full font-medium"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h2 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {post.title}
                    </h2>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {post.content}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {post.author_name.charAt(0)}
                            </div>
                            <span className="text-slate-400">{post.author_name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <HeartIcon className="w-3.5 h-3.5 text-pink-400" />
                                {post.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageIcon className="w-3.5 h-3.5 text-blue-400" />
                                {post.comment_count}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {formattedDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
