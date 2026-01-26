import axios from 'axios';
import { User } from '@/src/lib/useAuthStore';
import { getAuthToken } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export const adminAPI = {
    getUsers: async (page = 1, pageSize = 20, search = '') => {
        const token = getAuthToken();
        const response = await axios.get<UserListResponse>(`${API_URL}/admin/users`, {
            params: { page, page_size: pageSize, search },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateUserRole: async (userId: string, role: string) => {
        const token = getAuthToken();
        const response = await axios.put<{role: string}>(`${API_URL}/admin/users/${userId}/role`, 
            { role },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },

    deleteUser: async (userId: string) => {
        const token = getAuthToken();
        await axios.delete(`${API_URL}/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
