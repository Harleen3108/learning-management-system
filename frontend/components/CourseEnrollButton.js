'use client';
import { useState, useEffect } from 'react';
import { Play, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import ParentLinkModal from './ParentLinkModal';

export default function CourseEnrollButton({ course, onEnrollSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);
    const [tempParentData, setTempParentData] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.data);
            } catch (err) {
                console.error('Failed to fetch user in enroll button:', err);
            }
        };
        fetchUser();
    }, []);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleEnroll = async (parentData = null) => {
        // If user is a student and has no linked parent, show modal first
        if (user?.role === 'student' && !user.linkedParent && !parentData) {
            setIsParentModalOpen(true);
            return;
        }

        setLoading(true);
        try {
            // 1. Request enrollment (returns order info if paid)
            const payload = parentData ? { ...parentData } : {};
            const res = await api.post(`/enrollments/${course._id}`, payload);
            
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
                        const verifyPayload = {
                            courseId: course._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            ...(parentData || {}) // Send parent data for linking if newly provided
                        };

                        const verifyRes = await api.post('/enrollments/verify', verifyPayload);
                        
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
        <>
            <button 
                onClick={() => handleEnroll()}
                disabled={loading}
                className="w-full bg-white text-primary px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
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

            <ParentLinkModal 
                isOpen={isParentModalOpen}
                onClose={() => setIsParentModalOpen(false)}
                onSubmit={(data) => {
                    setIsParentModalOpen(false);
                    handleEnroll(data);
                }}
            />
        </>
    );
}
