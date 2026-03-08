import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  role?: string;
  account_tier?: string;
  daily_credits_remaining?: number;
  created_at: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => {
        console.log('[useAuthStore.setUser] Received user:', user);
        console.log('[useAuthStore.setUser] daily_credits_remaining:', user?.daily_credits_remaining);
        set({ user, isAuthenticated: !!user });
        console.log('[useAuthStore.setUser] Store updated');
      },
      setToken: (token) => set({ token }),
      login: (user, token) => {
        console.log('[useAuthStore.login] Received user:', user);
        console.log('[useAuthStore.login] daily_credits_remaining:', user?.daily_credits_remaining);
        set({ user, token, isAuthenticated: true });
        console.log('[useAuthStore.login] Store updated');
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      },
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }), 
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const getAuthToken = () => {
    // Access the state directly from the store
    const state = useAuthStore.getState();
    return state.token;
};
