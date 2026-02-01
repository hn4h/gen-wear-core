import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product_name: string;
    product_image?: string;
}

export interface Order {
    id: string;
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
    payment_method: string;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

export interface CreateOrderData {
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
    payment_method: string;
    items?: {
        product_id: string;
        quantity: number;
    }[];
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ordersAPI = {
    createOrder: async (data: CreateOrderData) => {
        const response = await axios.post<Order>(`${API_URL}/api/orders`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    
    getMyOrders: async () => {
        const response = await axios.get<Order[]>(`${API_URL}/api/orders/my`, {
            headers: getHeaders()
        });
        return response.data;
    },
    
    getOrder: async (id: string) => {
        const response = await axios.get<Order>(`${API_URL}/api/orders/${id}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Admin Methods
    getAllOrders: async (page: number = 1, status?: string) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (status) params.append('status', status);
        
        const response = await axios.get<OrderListResponse>(`${API_URL}/api/orders?${params.toString()}`, {
            headers: getHeaders()
        });
        return response.data;
    },
    
    updateOrderStatus: async (id: string, status: string) => {
        const response = await axios.put<Order>(`${API_URL}/api/orders/${id}/status`, { status }, {
            headers: getHeaders()
        });
        return response.data;
    }
};
