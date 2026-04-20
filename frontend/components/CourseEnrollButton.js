'use client';
import { useState } from 'react';
import { Play, CreditCard, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function CourseEnrollButton({ course, onEnrollSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleEnroll = async () => {
        setLoading(true);
        try {
            // 1. Request enrollment (returns order info if paid)
            const res = await api.post(`/enrollments/${course._id}`);
            
            if (course.price === 0 || !res.data.orderId) {
                // Free course - enrolled instantly
                router.push(`/dashboard/courses/${course._id}`);
                if (onEnrollSuccess) onEnrollSuccess();
                return;
            }

            // 2. Paid course - Setup Razorpay
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            const { orderId, amount, currency } = res.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: amount,
                currency: currency,
                name: 'EduFlow LMS',
                description: `Enrollment for ${course.title}`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/enrollments/verify', {
                            courseId: course._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        
                        if (verifyRes.data.success) {
                            router.push(`/dashboard/courses/${course._id}`);
                            if (onEnrollSuccess) onEnrollSuccess();
                        }
                    } catch (err) {
                        alert(err.response?.data?.message || 'Payment verification failed. Please try again or contact support.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                },
                theme: {
                    color: '#2563eb',
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error('Enrollment error:', err);
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
                router.push(`/dashboard/courses/${course._id}`);
            } else {
                alert(err.response?.data?.message || 'Enrollment failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleEnroll}
            disabled={loading}
            className="w-full bg-white text-blue-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
            {loading ? (
                <Loader2 className="animate-spin" size={14} />
            ) : course.price === 0 ? (
                <>
                    Start Learning
                    <Play size={14} fill="currentColor" />
                </>
            ) : (
                <>
                    Enroll Now
                    <CreditCard size={14} />
                </>
            )}
        </button>
    );
}
