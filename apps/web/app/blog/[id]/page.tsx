'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { CommentSection } from '@/src/components/blog/CommentSection';
import { blogAPI, BlogPostDetail } from '@/src/services/blog';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { Heart, ArrowLeft, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';

const HeartIcon = Heart as any;
const ArrowLeftIcon = ArrowLeft as any;
const ChevronLeftIcon = ChevronLeft as any;
const ChevronRightIcon = ChevronRight as any;
const TrashIcon = Trash2 as any;
const Loader2Icon = Loader2 as any;

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const postId = params.id as string;

    const [post, setPost] = useState<BlogPostDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const loadPost = async () => {
        try {
            const data = await blogAPI.getPost(postId);
            setPost(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [postId]);

    const handleLike = async () => {
        if (!user || isLiking || !post) return;
        setIsLiking(true);
        try {
            const result = await blogAPI.toggleLike(postId);
            setPost(prev => prev ? { ...prev, is_liked: result.liked, like_count: result.like_count } : prev);
        } finally {
            setIsLiking(false);
        }
    };

    const handleAddComment = async (content: string) => {
        const comment = await blogAPI.addComment(postId, content);
        setPost(prev => prev ? { ...prev, comments: [...prev.comments, comment], comment_count: prev.comment_count + 1 } : prev);
    };

    const handleDeleteComment = async (commentId: string) => {
        await blogAPI.deleteComment(postId, commentId);
        setPost(prev => prev ? {
            ...prev,
            comments: prev.comments.filter(c => c.id !== commentId),
            comment_count: prev.comment_count - 1,
        } : prev);
    };

    const handleDelete = async () => {
        if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;
        setIsDeleting(true);
        try {
            await blogAPI.deletePost(postId);
            router.push('/blog');
        } catch {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2Icon className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            </main>
        );
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-slate-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-slate-400 text-xl mb-4">Bài viết không tồn tại</p>
                        <Link href="/blog" className="text-purple-400 hover:underline">Quay lại Blog</Link>
                    </div>
                </div>
            </main>
        );
    }

    const tagList = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const images = post.image_urls || [];

    return (
        <main className="min-h-screen bg-slate-900">
            <Header />

            <div className="pt-28 pb-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">

                    {/* Back */}
                    <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Quay lại Blog
                    </Link>

                    {/* Image Carousel */}
                    {images.length > 0 && (
                        <div className="relative rounded-2xl overflow-hidden mb-8 bg-slate-800 aspect-video">
                            <img
                                src={images[currentImage]}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImage(p => (p - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImage(p => (p + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                    {/* Dots */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentImage(i)}
                                                className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tagList.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

                    {/* Author + Meta */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {post.author_name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-medium">{post.author_name}</p>
                                <p className="text-slate-500 text-xs">
                                    {new Date(post.created_at).toLocaleDateString('vi-VN', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Like */}
                            <button
                                onClick={handleLike}
                                disabled={!user || isLiking}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    post.is_liked
                                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                                        : 'bg-slate-800 border-white/10 text-slate-400 hover:border-pink-500/40 hover:text-pink-300'
                                } disabled:opacity-60`}
                            >
                                <HeartIcon className={`w-4 h-4 ${post.is_liked ? 'fill-pink-400 text-pink-400' : ''}`} />
                                {post.like_count}
                            </button>

                            {/* Delete (owner or admin) */}
                            {user && (user.id === post.author_id || user.role === 'ADMIN') && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <TrashIcon className="w-4 h-4" />}
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none mb-10">
                        <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Comments */}
                    <CommentSection
                        postId={postId}
                        comments={post.comments}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}
