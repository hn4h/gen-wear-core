import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';
import { Product } from '@/src/services/products';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CartItemResponse {
    id: string;
    product_id: string;
    quantity: number;
    product: Product;
}

export interface CartResponse {
    id: string;
    items: CartItemResponse[];
    total_price: number;
    total_items: number;
}

const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartAPI = {
    getCart: async () => {
        const response = await axios.get<CartResponse>(`${API_URL}/api/cart`, {
            headers: getHeaders()
        });
        return response.data;
    },

    addItem: async (productId: string, quantity: number = 1) => {
        const response = await axios.post<CartResponse>(`${API_URL}/api/cart/items`, {
            product_id: productId,
            quantity
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    updateItem: async (itemId: string, quantity: number) => {
        const response = await axios.put<CartResponse>(`${API_URL}/api/cart/items/${itemId}`, {
            quantity
        }, {
            headers: getHeaders()
        });
        return response.data;
    },

    removeItem: async (itemId: string) => {
        const response = await axios.delete<CartResponse>(`${API_URL}/api/cart/items/${itemId}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    clearCart: async () => {
        await axios.delete(`${API_URL}/api/cart`, {
            headers: getHeaders()
        });
    }
};
