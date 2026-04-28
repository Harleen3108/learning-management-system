'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { Trash2, ArrowRight, ShoppingBag, CreditCard, Tag, X, Check, Loader2 } from 'lucide-react';
import { Card } from '../../../components/UIElements';
import DashboardLayout from '../../../components/DashboardLayout';
import Link from 'next/link';
import api from '../../../services/api';
import { clsx } from 'clsx';

const payable = (item) => Number(item.payable) || (
  Number(item.discountPrice) > 0 && Number(item.discountPrice) < Number(item.price)
    ? Number(item.discountPrice)
    : Number(item.price) || 0
);

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, clearCart } = useCartStore();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountType, discountValue }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = items.reduce((s, i) => s + payable(i), 0);
  const discount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
    return Math.min(subtotal, Math.round(appliedCoupon.discountValue));
  })();
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponInput.trim() });
      if (res.data?.success) {
        setAppliedCoupon(res.data.data);
        setCouponInput('');
      } else {
        setCouponError(res.data?.message || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Could not apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const courseIds = items.map(i => i._id);
      const res = await api.post('/enrollments/cart/order', {
        courseIds,
        couponCode: appliedCoupon?.code
      });

      // 100%-off / all-free: backend already enrolled the user
      if (res.data?.free) {
        clearCart();
        router.push('/dashboard/student/my-courses');
        return;
      }

      const { orderId, amount, currency } = res.data;
      const ok = await loadRazorpay();
      if (!ok) {
        alert('Could not load Razorpay. Check your internet connection.');
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'EduFlow LMS',
        description: `Cart checkout — ${items.length} course${items.length === 1 ? '' : 's'}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verify = await api.post('/enrollments/cart/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon?.code
            });
            if (verify.data?.success) {
              clearCart();
              router.push('/dashboard/student/my-courses');
            } else {
              alert('Payment received but verification failed. Contact support.');
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => setCheckingOut(false)
        },
        theme: { color: '#2563eb' }
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 font-light">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={48} strokeWidth={1.25} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-light text-slate-900">Your cart is empty</h2>
            <p className="text-slate-500 mt-1 font-light">Explore courses and start learning today.</p>
          </div>
          <Link href="/dashboard/explore" className="bg-blue-600 hover:bg-blue-700 text-white font-normal px-8 py-3 rounded-xl transition-all">
            Browse Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-10 font-light">
        <header>
          <h1 className="text-4xl font-light text-slate-900 tracking-tight">Your Cart</h1>
          <p className="text-slate-500 font-light mt-1">Review your selected courses before checkout.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const lineAmount = payable(item);
              const hasDiscount = Number(item.discountPrice) > 0 && Number(item.discountPrice) < Number(item.price);
              return (
                <Card key={item._id} className="p-6 flex items-center gap-6">
                  <img
                    src={item.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : item.thumbnail}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                    alt={item.title}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-normal text-slate-900 leading-tight truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-light uppercase mt-1 tracking-wide">By {item.instructor?.name || 'Instructor'}</p>
                    {hasDiscount && (
                      <p className="text-[11px] text-emerald-600 font-light mt-1">
                        Saving ₹{Number(item.price) - Number(item.discountPrice)} on list price
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    <span className="font-normal text-slate-900 text-lg">₹{lineAmount}</span>
                    {hasDiscount && <span className="text-[11px] text-slate-400 line-through font-light">₹{item.price}</span>}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            {/* Coupon */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Tag size={16} strokeWidth={1.5} className="text-blue-600" />
                <h3 className="font-light text-slate-900 uppercase text-xs tracking-widest">Coupon code</h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Check size={16} strokeWidth={1.5} className="text-emerald-600" />
                    <div>
                      <p className="text-xs font-normal text-emerald-900 tracking-wide">{appliedCoupon.code}</p>
                      <p className="text-[10px] font-light text-emerald-600">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off`
                          : `₹${appliedCoupon.discountValue} off`}
                      </p>
                    </div>
                  </div>
                  <button onClick={removeCoupon} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg" aria-label="Remove coupon">
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') applyCoupon(); }}
                      placeholder="Enter code"
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-light text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-500 focus:bg-white transition-all uppercase tracking-wider"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      className="px-5 bg-slate-900 hover:bg-black text-white text-xs font-normal uppercase tracking-widest rounded-xl disabled:opacity-50 transition-all"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] font-light text-rose-500">{couponError}</p>}
                </div>
              )}
            </Card>

            {/* Order Summary */}
            <Card className="p-8 space-y-6">
              <h3 className="font-light text-slate-900 uppercase text-xs tracking-widest">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-light text-slate-500">
                  <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className={clsx("flex justify-between text-sm font-light", discount > 0 ? "text-emerald-600" : "text-slate-500")}>
                  <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                  <span>{discount > 0 ? `-₹${discount}` : '-₹0'}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between text-lg font-normal text-slate-900">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-normal py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 group disabled:opacity-60"
              >
                {checkingOut ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing…</>
                ) : (
                  <>{total === 0 ? 'Enroll Now' : 'Checkout Now'} <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] font-light text-slate-400 uppercase tracking-widest">
                <CreditCard size={12} strokeWidth={1.5} />
                Secure Payment with Razorpay
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
