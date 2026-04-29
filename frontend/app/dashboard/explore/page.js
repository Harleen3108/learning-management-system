'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, ShoppingCart, Check, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { useCartStore } from '../../../store/useCartStore';
import api from '../../../services/api';
import CourseEnrollButton from '@/components/CourseEnrollButton';
import CourseHoverPreview from '@/components/CoursePreviewPopup';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

// EduFlow palette
//   Navy    : #071739
//   Tan     : #A68868
//   Action  : blue-600
// Typography matches admin pages: font-semibold for headings/values, font-medium for body.

export default function ExplorePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const { items: cartItems, addToCart, removeFromCart } = useCartStore();

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [coursesRes, catsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/categories')
        ]);
        setCourses(coursesRes.data.data || []);
        const all = catsRes.data.data || [];
        setCategories(all.filter(c => !c.parentId));
        setSubcategories(all.filter(c => c.parentId));
      } catch (err) {
        console.error('Error fetching explore data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const visibleSubcategories = useMemo(() => {
    if (activeCategory === 'All') return [];
    return subcategories.filter(s => (s.parentId?._id || s.parentId) === activeCategory);
  }, [activeCategory, subcategories]);

  useEffect(() => { setActiveSubcategory('All'); }, [activeCategory]);

  const filteredCourses = useMemo(() => {
    let list = courses.filter(course => {
      const catId = course.category?._id || course.category;
      const subId = course.subcategory?._id || course.subcategory;
      const matchCat = activeCategory === 'All' || String(catId) === String(activeCategory);
      const matchSub = activeSubcategory === 'All' || String(subId) === String(activeSubcategory);
      const q = searchQuery.toLowerCase();
      const matchSearch = !q
        || course.title?.toLowerCase().includes(q)
        || course.description?.toLowerCase().includes(q);
      return matchCat && matchSub && matchSearch;
    });

    // Sorting
    if (sortBy === 'latest') {
      list = list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'price-low') {
      list = list.sort((a, b) => payable(a) - payable(b));
    } else if (sortBy === 'price-high') {
      list = list.sort((a, b) => payable(b) - payable(a));
    } else if (sortBy === 'rating') {
      list = list.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    return list;
  }, [courses, activeCategory, activeSubcategory, searchQuery, sortBy]);

  const isInCart = (id) => cartItems.some(i => i._id === id);

  const payable = (course) => {
    const list = Number(course?.price) || 0;
    const disc = Number(course?.discountPrice) || 0;
    return disc > 0 && disc < list ? disc : list;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ───────── Header ───────── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Explore Courses</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Discover premium learning paths tailored to your goals.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-[#071739]/10 focus:border-[#071739]/20 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-2xl pl-4 pr-9 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-[#071739]/10 cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* ───────── Categories ───────── */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <CategoryPill
              active={activeCategory === 'All'}
              onClick={() => setActiveCategory('All')}
              label="All"
            />
            {categories.map(cat => (
              <CategoryPill
                key={cat._id}
                active={activeCategory === cat._id}
                onClick={() => setActiveCategory(cat._id)}
                label={cat.name}
              />
            ))}
          </div>

          {visibleSubcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <SubPill
                active={activeSubcategory === 'All'}
                onClick={() => setActiveSubcategory('All')}
                label="All Topics"
              />
              {visibleSubcategories.map(sub => (
                <SubPill
                  key={sub._id}
                  active={activeSubcategory === sub._id}
                  onClick={() => setActiveSubcategory(sub._id)}
                  label={sub.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* ───────── Result summary ───────── */}
        {!loading && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
              {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} found
            </p>
          </div>
        )}

        {/* ───────── Course Grid ───────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-100 rounded-3xl h-96 animate-pulse"></div>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                payable={payable(course)}
                inCart={isInCart(course._id)}
                onAdd={() => addToCart({ ...course, payable: payable(course) })}
                onRemove={() => removeFromCart(course._id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500 font-semibold">No courses match your filters.</p>
              <button
                onClick={() => { setActiveCategory('All'); setActiveSubcategory('All'); setSearchQuery(''); }}
                className="text-xs text-[#071739] font-semibold uppercase tracking-widest hover:underline mt-3"
              >
                Reset filters →
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────────

function CategoryPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap border',
        active
          ? 'bg-[#071739] text-white border-[#071739] shadow-md shadow-[#071739]/15'
          : 'bg-white text-slate-600 border-slate-200 hover:border-[#071739]/30 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function SubPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all whitespace-nowrap border',
        active
          ? 'bg-[#A68868] text-white border-[#A68868]'
          : 'bg-white text-slate-500 border-slate-200 hover:border-[#A68868]/40 hover:text-[#A68868]'
      )}
    >
      {label}
    </button>
  );
}

function CourseCard({ course, payable, inCart, onAdd, onRemove }) {
  const hasDiscount = Number(course.discountPrice) > 0 && Number(course.discountPrice) < Number(course.price);
  return (
    <CourseHoverPreview course={course} enrolled={false}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden group h-full"
      >
        {/* The thumbnail + body up to the action row are all part of one navigation target */}
        <Link href={`/dashboard/courses/${course._id}`} className="flex flex-col flex-1">
          <div className="aspect-[16/9] overflow-hidden relative shrink-0">
            <img
              src={course.thumbnail === 'no-photo.jpg'
                ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'
                : course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className="bg-white/95 backdrop-blur-md text-[#071739] text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                {course.category?.name ?? course.category ?? 'Course'}
              </span>
              {payable === 0 && (
                <span className="bg-emerald-500 text-white text-[9px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                  Free
                </span>
              )}
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1 gap-3">
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#071739] transition-colors">
                {course.title}
              </h5>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {course.instructor?.name || 'EduFlow Mentor'}
              </p>
            </div>

            {course.averageRating > 0 ? (
              <div className="flex items-center gap-1.5">
                <Star size={11} className="text-[#A68868] fill-[#A68868]" />
                <span className="text-xs font-semibold text-slate-700">
                  {Number(course.averageRating).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({course.reviewsCount || course.totalRatings || 0} {(course.reviewsCount || course.totalRatings) === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium italic">No ratings yet</span>
            )}

            <div className="flex items-center gap-2">
              {payable === 0 ? (
                <span className="text-base font-semibold text-emerald-600">Free</span>
              ) : (
                <>
                  <span className="text-base font-semibold text-slate-900">₹{payable}</span>
                  {hasDiscount && (
                    <span className="text-[11px] text-slate-400 font-medium line-through">₹{course.price}</span>
                  )}
                  {hasDiscount && (
                    <span className="text-[10px] font-semibold text-[#A68868] uppercase tracking-widest ml-auto">
                      {Math.round(((Number(course.price) - Number(course.discountPrice)) / Number(course.price)) * 100)}% off
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Action row — outside the Link so the buttons don't trigger navigation */}
        <div className="px-5 pb-5 mt-auto" onClick={(e) => e.stopPropagation()}>
          {payable === 0 ? (
            <CourseEnrollButton course={course} />
          ) : inCart ? (
            <button
              onClick={onRemove}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-emerald-100 transition-all"
            >
              <Check size={13} /> In cart — Remove
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 bg-[#071739] text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-[#020a1a] transition-all shadow-md shadow-[#071739]/15"
            >
              <ShoppingCart size={13} /> Add to cart
            </button>
          )}
        </div>
      </motion.div>
    </CourseHoverPreview>
  );
}
