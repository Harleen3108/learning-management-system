'use client';
import { useState } from 'react';
import api from '@/services/api';

export default function SeedPage() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Seeding data...');
        try {
            const res = await api.get('/seed-data');
            setStatus(res.data.message);
        } catch (err) {
            setStatus('Error: ' + (err.response?.data?.error || err.message));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-20 text-center">
            <h1 className="text-3xl font-bold mb-8">Database Seeder</h1>
            <button 
                onClick={handleSeed}
                disabled={loading}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50"
            >
                {loading ? 'Seeding...' : 'Seed 10 Courses & 6 Categories'}
            </button>
            {status && <p className="mt-8 text-lg font-semibold">{status}</p>}
        </div>
    );
}
