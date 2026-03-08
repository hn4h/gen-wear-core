import axios from 'axios';
import { getAuthToken } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

export interface SavedDesign {
    id: string;
    user_id: string;
    image_url: string;
    prompt: string | null;
    created_at: string;
}

export interface SaveDesignData {
    image_url: string;
    prompt?: string;
}

const getHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const designsAPI = {
    saveDesign: async (data: SaveDesignData) => {
        const response = await axios.post<SavedDesign>(`${API_URL}/api/designs`, data, {
            headers: getHeaders()
        });
        return response.data;
    },
    
    getMyDesigns: async () => {
        const response = await axios.get<SavedDesign[]>(`${API_URL}/api/designs`, {
            headers: getHeaders()
        });
        return response.data;
    },
    
    deleteDesign: async (id: string) => {
        const response = await axios.delete(`${API_URL}/api/designs/${id}`, {
            headers: getHeaders()
        });
        return response.data;
    }
};
