'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { BlogCard } from '@/src/components/blog/BlogCard';
import { blogAPI, BlogPost } from '@/src/services/blog';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { Search, PenLine, Loader2 } from 'lucide-react';

const SearchIcon = Search as any;
const PenLineIcon = PenLine as any;
const Loader2Icon = Loader2 as any;

export default function BlogPage() {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const data = await blogAPI.getPosts(page, search || undefined);
                setPosts(data.posts);
                setTotalPages(data.total_pages);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        const t = setTimeout(fetch, 400);
        return () => clearTimeout(t);
    }, [page, search]);

    return (
        <main className="min-h-screen bg-slate-900">
            <Header />

            <div className="pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white mb-2">
                                Blog & Cộng đồng
                            </h1>
                            <p className="text-slate-400">
                                Chia sẻ outfit, thiết kế yêu thích và thu thập feedback từ cộng đồng
                            </p>
                        </div>

                        {user && (
                            <Link
                                href="/blog/new"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/30 flex-shrink-0"
                            >
                                <PenLineIcon className="w-4 h-4" />
                                Viết bài mới
                            </Link>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative mb-8 max-w-md">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Tìm kiếm bài viết..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2Icon className="w-8 h-8 text-purple-400 animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-slate-400 text-lg mb-2">Chưa có bài viết nào</p>
                            {user && (
                                <Link href="/blog/new" className="text-purple-400 hover:underline text-sm">
                                    Hãy là người đầu tiên chia sẻ!
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="mt-10 flex justify-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                        page === p
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
