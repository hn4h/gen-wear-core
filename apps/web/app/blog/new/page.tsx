'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/src/components/layout/Header';
import { Footer } from '@/src/components/layout/Footer';
import { blogAPI } from '@/src/services/blog';
import { useAuthStore } from '@/src/lib/useAuthStore';
import { Upload, X, ImagePlus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const UploadIcon = Upload as any;
const XIcon = X as any;
const ImagePlusIcon = ImagePlus as any;
const Loader2Icon = Loader2 as any;
const ArrowLeftIcon = ArrowLeft as any;

export default function NewBlogPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [localPreviews, setLocalPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <main className="min-h-screen bg-slate-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-slate-400 mb-4">Vui lòng đăng nhập để viết bài</p>
                        <Link href="/login" className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setLocalPreviews(prev => [...prev, ...newPreviews]);

        try {
            const urls = await Promise.all(files.map(f => blogAPI.uploadImage(f)));
            setImages(prev => [...prev, ...urls]);
        } catch (err) {
            setError('Upload ảnh thất bại. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setLocalPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('Vui lòng điền đầy đủ tiêu đề và nội dung.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            const post = await blogAPI.createPost({
                title: title.trim(),
                content: content.trim(),
                image_urls: images,
                tags: tags.trim() || undefined,
                is_published: true,
            });
            router.push(`/blog/${post.id}`);
        } catch (err) {
            setError('Đăng bài thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

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

                    <h1 className="text-3xl font-bold text-white mb-8">✍️ Viết bài mới</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tiêu đề *</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Tiêu đề bài viết..."
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung *</label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Chia sẻ câu chuyện, cảm nhận về outfit, feedback về thiết kế..."
                                rows={8}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Tags <span className="text-slate-500 text-xs">(phân cách bằng dấu phẩy)</span></label>
                            <input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="vd: outfit, bandana, summer2024"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Ảnh</label>

                            {localPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {localPreviews.map((preview, i) => (
                                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                                            <img src={preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XIcon className="w-3 h-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-colors text-sm"
                            >
                                {isUploading ? (
                                    <><Loader2Icon className="w-4 h-4 animate-spin" /> Đang upload...</>
                                ) : (
                                    <><ImagePlusIcon className="w-4 h-4" /> Thêm ảnh (JPEG, PNG, WEBP)</>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                multiple
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <Link
                                href="/blog"
                                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                Huỷ
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <><Loader2Icon className="w-4 h-4 animate-spin" /> Đang đăng...</>
                                ) : (
                                    '🚀 Đăng bài'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </main>
    );
}
