import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Returns the price the student actually pays — discountPrice if set & lower, else price.
const payable = (course) => {
  const list = Number(course?.price) || 0;
  const disc = Number(course?.discountPrice) || 0;
  return disc > 0 && disc < list ? disc : list;
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],

      addToCart: (course) => {
        const items = get().items;
        if (!items.find(i => i._id === course._id)) {
          // Snapshot the payable amount at the moment of adding so stale list-prices
          // never reach the cart UI.
          set({ items: [...items, { ...course, payable: payable(course) }] });
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

      // Subtotal of the cart in ₹, using the discounted price for each course.
      getTotal: () => {
        return get().items.reduce((acc, item) => acc + (Number(item.payable) || payable(item)), 0);
      }
    }),
    {
      name: 'lms-cart-storage',
    }
  )
);
