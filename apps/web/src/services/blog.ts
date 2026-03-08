import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

function authHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlogComment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    content: string;
    created_at: string;
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author_name: string;
    image_urls: string[];
    tags: string | null;
    is_published: boolean;
    like_count: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
}

export interface BlogPostDetail extends BlogPost {
    comments: BlogComment[];
    is_liked: boolean;
}

export interface BlogPostCreate {
    title: string;
    content: string;
    image_urls?: string[];
    tags?: string;
    is_published?: boolean;
}

export interface BlogListResponse {
    posts: BlogPost[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const blogAPI = {
    getPosts: async (page = 1, search?: string): Promise<BlogListResponse> => {
        const params = new URLSearchParams({ page: String(page), page_size: '9' });
        if (search) params.append('search', search);
        const res = await axios.get<BlogListResponse>(`${API_URL}/api/blog?${params}`);
        return res.data;
    },

    getPost: async (id: string): Promise<BlogPostDetail> => {
        const res = await axios.get<BlogPostDetail>(`${API_URL}/api/blog/${id}`, {
            headers: authHeaders(),
        });
        return res.data;
    },

    createPost: async (data: BlogPostCreate): Promise<BlogPost> => {
        const res = await axios.post<BlogPost>(`${API_URL}/api/blog`, data, {
            headers: authHeaders(),
        });
        return res.data;
    },

    updatePost: async (id: string, data: Partial<BlogPostCreate>): Promise<BlogPost> => {
        const res = await axios.put<BlogPost>(`${API_URL}/api/blog/${id}`, data, {
            headers: authHeaders(),
        });
        return res.data;
    },

    deletePost: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/blog/${id}`, { headers: authHeaders() });
    },

    addComment: async (postId: string, content: string): Promise<BlogComment> => {
        const res = await axios.post<BlogComment>(
            `${API_URL}/api/blog/${postId}/comments`,
            { content },
            { headers: authHeaders() }
        );
        return res.data;
    },

    deleteComment: async (postId: string, commentId: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/blog/${postId}/comments/${commentId}`, {
            headers: authHeaders(),
        });
    },

    toggleLike: async (postId: string): Promise<{ liked: boolean; like_count: number }> => {
        const res = await axios.post<{ liked: boolean; like_count: number }>(
            `${API_URL}/api/blog/${postId}/like`,
            {},
            { headers: authHeaders() }
        );
        return res.data;
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post<{ url: string }>(`${API_URL}/api/blog/upload-image`, formData, {
            headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
        });
        return res.data.url;
    },
};
