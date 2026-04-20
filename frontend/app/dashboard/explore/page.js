'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, ArrowRight, ShoppingCart, Heart, Play } from 'lucide-react';
import { Card } from '../../../components/UIElements';
import DashboardLayout from '../../../components/DashboardLayout';
import { useCartStore } from '../../../store/useCartStore';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';
import CourseEnrollButton from '@/components/CourseEnrollButton';

export default function ExplorePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data);
      } catch (err) {
        console.error('Error fetching courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing'];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Explore Courses</h1>
            <p className="text-slate-500 font-medium mt-1">Discover premium learning paths tailored to your goals.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
            <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600 hover:bg-slate-50">
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === cat 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
             [1, 2, 3, 4].map(i => (
               <div key={i} className="bg-slate-100 rounded-3xl h-96 animate-pulse"></div>
             ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <Card key={course._id} className="group relative">
                <div className="h-48 overflow-hidden relative">
                  <img src={course.thumbnail === 'no-photo.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80' : course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-tighter">
                      {course.category}
                    </span>
                    {course.price === 0 && (
                       <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-tighter">Free</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                    <CourseEnrollButton course={course} />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-900 uppercase">
                      < Star className="text-orange-400 fill-orange-400" size={14} />
                      {course.averageRating || 'New'}
                    </div>
                    <span className="text-xs font-black text-slate-900">{course.price ? `₹${course.price}` : 'Free'}</span>
                  </div>
                  <h5 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{course.title}</h5>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <div className="w-6 h-6 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-white">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.name}`} alt="Instructor" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.instructor?.name || 'EduFlow Instructor'}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
              <div className="col-span-full py-20 text-center">
                  <p className="text-slate-400 font-bold">No courses found matching your criteria.</p>
              </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

