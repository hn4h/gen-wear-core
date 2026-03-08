import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

export const creditsAPI = {
    getBalance: async () => {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/credits/balance`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    
    getHistory: async (limit = 50, offset = 0) => {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/credits/history`, {
            params: { limit, offset },
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    
    getPackages: async () => {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_URL}/api/credits/packages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    
    purchase: async (data: { package_id: number; return_url: string; cancel_url: string }) => {
        const token = localStorage.getItem('auth_token');
        const res = await axios.post(`${API_URL}/api/credits/purchase`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};
