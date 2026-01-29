import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface OrderItem {
    product_id: string;
    quantity: number;
    price: number;
}

export interface CreateOrderData {
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
    payment_method: string;
    items: OrderItem[];
}

export interface Order {
    id: string;
    full_name: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export const ordersAPI = {
    createOrder: async (data: CreateOrderData) => {
        const response = await axios.post<Order>(`${API_URL}/api/orders`, data);
        return response.data;
    },
    
    // Placeholder for other potential order-related methods
    getOrders: async () => {
        // Implement when needed
    },
    
    getOrder: async (id: string) => {
        // Implement when needed
    }
};
