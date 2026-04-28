import { create } from 'zustand';
import api from '@/services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // starts loading to check auth on mount

    checkAuth: async () => {
        // Only attempt to check auth if a token exists in localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return null;
        }

        set({ isLoading: true });
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                set({ 
                    user: res.data.data, 
                    isAuthenticated: true, 
                    isLoading: false 
                });
                return res.data.data;
            }
        } catch (error) {
            // Token invalid or expired
            console.log('Authentication failed or token invalid');
            get().clearAuth();
        }
        set({ isLoading: false });
        return null;
    },

    setUser: (userData) => {
        set({ 
            user: userData, 
            isAuthenticated: !!userData,
            isLoading: false
        });
    },

    clearAuth: () => {
        // Clear cookies
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Clear local storage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        // Reset state
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });
    },

    logout: async (router) => {
        try {
            await api.get('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        
        get().clearAuth();
        
        if (router) {
            router.push('/');
        } else if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
}));
