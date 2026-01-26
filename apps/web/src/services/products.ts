import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Collection {
    id: string;
    name: string;
    description?: string;
    season?: string;
    year?: number;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    collection_id?: string;
    image_url?: string;
    stock: number;
    created_at: string;
    category?: Category;
    collection?: Collection;
    tags?: Tag[];
}

export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface ProductFilters {
    category_id?: string;
    collection_id?: string;
    tag?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    page_size?: number;
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export const productsAPI = {
    getProducts: async (filters: ProductFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        
        const response = await axios.get<ProductListResponse>(`${API_URL}/api/products?${params.toString()}`);
        return response.data;
    },

    getProduct: async (id: string) => {
        const response = await axios.get<Product>(`${API_URL}/api/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await axios.get<Category[]>(`${API_URL}/api/categories`);
        return response.data;
    },

    getCollections: async () => {
        const response = await axios.get<Collection[]>(`${API_URL}/api/collections`);
        return response.data;
    },

    getTags: async () => {
        const response = await axios.get<Tag[]>(`${API_URL}/api/tags`);
        return response.data;
    },

    createCategory: async (name: string, description?: string) => {
        const token = getAuthToken();
        const response = await axios.post<Category>(`${API_URL}/api/categories`, { name, description }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createCollection: async (name: string, description?: string) => {
        const token = getAuthToken();
        const response = await axios.post<Collection>(`${API_URL}/api/collections`, { name, description }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createTag: async (name: string) => {
        const token = getAuthToken();
        const response = await axios.post<Tag>(`${API_URL}/api/tags`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/api/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    deleteCollection: async (id: string) => {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/api/collections/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    deleteTag: async (id: string) => {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/api/tags/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    updateCategory: async (id: string, name: string, description?: string) => {
        const token = getAuthToken();
        const response = await axios.put<Category>(`${API_URL}/api/categories/${id}`, { name, description }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateCollection: async (id: string, name: string, description?: string) => {
        const token = getAuthToken();
        const response = await axios.put<Collection>(`${API_URL}/api/collections/${id}`, { name, description }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateTag: async (id: string, name: string) => {
        const token = getAuthToken();
        const response = await axios.put<Tag>(`${API_URL}/api/tags/${id}`, { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
