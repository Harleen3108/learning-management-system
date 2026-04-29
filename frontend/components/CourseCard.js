import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

export default function CourseCard({ course }) {
  const router = useRouter();
  const { items, addToCart } = useCartStore();
  const isInCart = items.some(item => item._id === course._id);

  // Show the discounted price the instructor set; "list price" is the higher of price vs discountPrice.
  const list = Number(course.price) || 0;
  const disc = Number(course.discountPrice) || 0;
  const originalPrice = (disc > 0 && disc < list ? list : null);
  const ratingsCount = Number(course.totalRatings || course.reviewsCount || 0);
  const rating = Number(course.averageRating || 0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => router.push(`/dashboard/courses/${course._id}`)}
      className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img 
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (isInCart) {
                router.push('/dashboard/cart');
              } else {
                addToCart(course);
              }
            }}
            className="bg-white p-3 rounded-full text-[#071739] hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-slate-800 leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-[11px] text-slate-500 mb-2 truncate font-normal">
          {course.instructor?.name || 'Academic Expert'}
        </p>
        
        {ratingsCount > 0 ? (
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm font-semibold text-orange-700">{rating.toFixed(1)}</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(rating) ? "#F59E0B" : "transparent"}
                  className={i < Math.round(rating) ? "text-orange-400" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-light">({ratingsCount.toLocaleString()})</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 font-medium italic mb-3">No ratings yet</p>
        )}

        <div className="flex items-center gap-2 mb-4">
          {rating >= 4.5 && ratingsCount >= 10 && (
            <div className="bg-[#A68868]/10 text-[#A68868] text-[9px] font-semibold px-2 py-0.5 rounded">
              Bestseller
            </div>
          )}
          {course.difficulty === 'beginner' && (
            <div className="bg-[#E3C39D]/20 text-[#8B6E4E] text-[9px] font-semibold px-2 py-0.5 rounded">
              Hot & New
            </div>
          )}
          {course.category?.name && (
            <div className="bg-blue-50 text-blue-600 text-[9px] font-semibold px-2 py-0.5 rounded">
              {course.category.name}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-50">
          {(disc > 0 && disc < list) ? (
            <>
              <span className="text-lg font-semibold text-slate-900">₹{disc}</span>
              <span className="text-sm text-slate-400 font-light line-through">₹{list}</span>
            </>
          ) : list === 0 ? (
            <span className="text-lg font-semibold text-emerald-600">Free</span>
          ) : (
            <span className="text-lg font-semibold text-slate-900">₹{list}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
