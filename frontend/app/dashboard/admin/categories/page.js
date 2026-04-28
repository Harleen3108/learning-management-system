'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    ChevronRight, 
    ChevronDown, 
    LayoutGrid, 
    Tag, 
    Eye, 
    EyeOff,
    MoreVertical,
    Search,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { clsx } from 'clsx';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: null,
        isVisibleOnHome: false,
        topics: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedIds(newExpanded);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                topics: formData.topics.split(',').map(t => t.trim()).filter(t => t)
            };
            await api.post('/categories', data);
            setIsAddModalOpen(false);
            setFormData({ name: '', description: '', parentId: null, isVisibleOnHome: false, topics: '' });
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create category');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                topics: typeof formData.topics === 'string' ? formData.topics.split(',').map(t => t.trim()).filter(t => t) : formData.topics
            };
            await api.put(`/categories/${selectedCategory._id}`, data);
            setIsEditModalOpen(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete the category if it has no subcategories.')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const openEdit = (cat) => {
        setSelectedCategory(cat);
        setFormData({
            name: cat.name,
            description: cat.description,
            parentId: cat.parentId,
            isVisibleOnHome: cat.isVisibleOnHome,
            topics: cat.topics.join(', ')
        });
        setIsEditModalOpen(true);
    };

    const mainCategories = categories.filter(c => !c.parentId);
    const getSubcategories = (id) => categories.filter(c => c.parentId === id);

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Category Master</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage the platform's course taxonomy and discovery structure.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setFormData({ name: '', description: '', parentId: null, isVisibleOnHome: false, topics: '' });
                            setIsAddModalOpen(true);
                        }}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-primary/10"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                </div>

                {/* Categories Table/List */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <LayoutGrid size={20} className="text-slate-400" />
                            <span className="font-semibold text-slate-700">Hierarchy View</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Filter categories..." 
                                    className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium outline-none focus:border-primary transition-all w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-20 text-center text-slate-400 font-semibold uppercase text-[10px] tracking-widest animate-pulse">
                                Loading taxonomy...
                            </div>
                        ) : mainCategories.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-semibold">No categories found. Start by adding one.</div>
                        ) : mainCategories.map(category => (
                            <div key={category._id} className="group">
                                {/* Category Row */}
                                <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleExpand(category._id)}
                                            className="p-1 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            {expandedIds.has(category._id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </button>
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                            <LayoutGrid size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-800">{category.name}</h3>
                                                {category.isVisibleOnHome && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-semibold uppercase rounded">Home</span>}
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-md">{category.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex flex-wrap gap-1 max-w-xs justify-end">
                                            {category.topics.slice(0, 3).map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-semibold rounded-lg">{t}</span>
                                            ))}
                                            {category.topics.length > 3 && <span className="text-[9px] text-slate-400 font-semibold">+{category.topics.length - 3}</span>}
                                        </div>
                                        <div className="h-8 w-px bg-slate-100 mx-2"></div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => openEdit(category)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(category._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                <AnimatePresence>
                                    {expandedIds.has(category._id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-slate-50/30 pl-16 pr-4 border-l-2 border-slate-100 ml-8 my-1"
                                        >
                                            <div className="py-2 space-y-1">
                                                {getSubcategories(category._id).map(sub => (
                                                    <div key={sub._id} className="p-3 flex items-center justify-between hover:bg-white hover:shadow-sm rounded-xl transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                            <span className="text-sm font-semibold text-slate-700">{sub.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{sub.description}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => openEdit(sub)}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(sub._id)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({
                                                            name: '',
                                                            description: '',
                                                            parentId: category._id,
                                                            isVisibleOnHome: false,
                                                            topics: ''
                                                        });
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 p-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-all border border-dashed border-slate-200 hover:border-primary"
                                                >
                                                    <Plus size={14} /> Add Subcategory to {category.name}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="p-10 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                                        {isAddModalOpen
                                            ? (formData.parentId ? 'Add Subcategory' : 'Create Category')
                                            : (formData.parentId ? 'Edit Subcategory' : 'Edit Category')}
                                    </h2>
                                    {formData.parentId && (
                                        <p className="text-xs text-slate-400 font-medium mt-1">
                                            Under: <span className="text-slate-600 font-semibold">{categories.find(c => c._id === formData.parentId)?.name || ''}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all resize-none"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Top-level-only options: visibility + topics. Hidden for subcategories. */}
                                    {!formData.parentId && (
                                        <>
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <input
                                                    type="checkbox"
                                                    id="isVisibleOnHome"
                                                    className="w-5 h-5 rounded-lg text-primary border-slate-200"
                                                    checked={formData.isVisibleOnHome}
                                                    onChange={e => setFormData({ ...formData, isVisibleOnHome: e.target.checked })}
                                                />
                                                <label htmlFor="isVisibleOnHome" className="text-sm font-semibold text-slate-700 cursor-pointer">Visible on Homepage</label>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1">Topics (comma separated)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. React, Node.js, Web Design"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                                    value={formData.topics}
                                                    onChange={e => setFormData({ ...formData, topics: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                        className="flex-1 py-4 text-slate-500 font-semibold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-2 px-10 bg-primary text-white font-semibold text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-xl shadow-primary/20 transition-all"
                                    >
                                        {isAddModalOpen ? 'Create' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
