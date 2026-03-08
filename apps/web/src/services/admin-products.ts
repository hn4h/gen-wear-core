import { Product } from '@/src/services/products';
import { getAuthToken } from '@/src/lib/useAuthStore';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

export const adminProductsAPI = {
    createProduct: async (data: any) => {
        const token = getAuthToken();
        const response = await axios.post<Product>(`${API_URL}/api/products`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateProduct: async (id: string, data: any) => {
        const token = getAuthToken();
        const response = await axios.put<Product>(`${API_URL}/api/products/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    uploadImage: async (file: File) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<{url: string}>(`${API_URL}/api/products/upload-image`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
