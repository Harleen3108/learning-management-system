'use client';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseCard({ course }) {
  // Mocked data for UI demonstration
  const originalPrice = (course.price * 1.5).toFixed(2);
  const ratingsCount = Math.floor(Math.random() * 20000) + 500;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      <div className="px-4 py-6 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-slate-800 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-[11px] text-slate-500 mb-2 truncate">
          {course.instructor?.name || 'Academic Expert'}
        </p>
        
        <div className="flex items-center gap-1 mb-3">
          <span className="text-sm font-bold text-orange-700">{course.averageRating || 4.6}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                fill={i < Math.floor(course.averageRating || 4) ? "#F59E0B" : "transparent"} 
                className={i < Math.floor(course.averageRating || 4) ? "text-orange-400" : "text-slate-200"}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400">({ratingsCount.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
            Bestseller
          </div>
          {course.difficulty === 'beginner' && (
            <div className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded">
              Hot & New
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-50">
          <span className="text-lg font-black text-slate-900">${course.price || '199.00'}</span>
          <span className="text-sm text-slate-400 line-through">${originalPrice}</span>
        </div>
      </div>
    </motion.div>
  );
}
