import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      
      addToCart: (course) => {
        const items = get().items;
        if (!items.find(i => i._id === course._id)) {
          set({ items: [...items, course] });
        }
      },
      
      removeFromCart: (courseId) => {
        set({ items: get().items.filter(i => i._id !== courseId) });
      },
      
      addToWishlist: (course) => {
        const wishlist = get().wishlist;
        if (!wishlist.find(i => i._id === course._id)) {
          set({ wishlist: [...wishlist, course] });
        }
      },
      
      removeFromWishlist: (courseId) => {
        set({ wishlist: get().wishlist.filter(i => i._id !== courseId) });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((acc, item) => acc + (item.price || 0), 0);
      }
    }),
    {
      name: 'lms-cart-storage',
    }
  )
);
