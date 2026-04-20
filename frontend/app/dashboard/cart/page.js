'use client';
import { useCartStore } from '../../../store/useCartStore';
import { Trash2, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { Card } from '../../../components/UIElements';
import DashboardLayout from '../../../components/DashboardLayout';
import Link from 'next/link';
import api from '../../../services/api';

export default function CartPage() {
  const { items, removeFromCart, getTotal } = useCartStore();
  const total = getTotal();

  const handleCheckout = async () => {
    // Razorpay Integration Logic
    alert('Redirecting to Razorpay...');
  };

  if (items.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={48} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">Your cart is empty</h2>
            <p className="text-slate-500 mt-1 font-medium">Explore our courses and start learning today!</p>
          </div>
          <Link href="/dashboard/explore" className="btn-primary px-8">
            Browse Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Cart</h1>
          <p className="text-slate-500 font-medium mt-1">Review your selected courses before checkout.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item._id} className="p-6 flex items-center gap-6">
                <img src={item.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : item.thumbnail} className="w-24 h-24 rounded-2xl object-cover" alt={item.title} />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">By {item.instructor?.name || 'Instructor'}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="font-black text-slate-900">₹{item.price}</span>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="p-8 space-y-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Discount</span>
                  <span>-₹0</span>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="flex justify-between text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 group"
              >
                Checkout Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <CreditCard size={12} />
                Secure Payment with Razorpay
              </div>
            </Card>

            <Card className="p-6 bg-slate-50 border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm">
                 <ShoppingBag size={18} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Need Help?</p>
                  <p className="text-xs font-bold text-slate-900">Contact support for bulk purchase.</p>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
