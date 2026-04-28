'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const testimonials = [
  {
    id: 1,
    quote: "The course did a great job explaining AI - from development through application. I appreciated the varying perspectives presented, which were helpful in understanding how to use AI responsibly.",
    author: "Cris M.",
    role: "Google AI Essentials graduate",
    avatar: "https://i.pravatar.cc/150?u=cris",
    linkText: "View AI courses",
    linkHref: "/courses?category=AI"
  },
  {
    id: 2,
    quote: "Eduflow was truly a game-changer and a great guide for me as we brought Dimensional to life. The practical approach and industry insights were exactly what I needed to scale our product.",
    author: "Alvin Lim",
    role: "Technical Co-Founder, CTO at Dimensional",
    avatar: "https://i.pravatar.cc/150?u=alvin",
    linkText: "View this iOS & Swift course",
    linkHref: "/courses?category=Development"
  },
  {
    id: 3,
    quote: "Eduflow gives you the ability to be persistent. I learned exactly what I needed to know in the real world. It helped me sell myself to get a new role in Cloud Engineering.",
    author: "William A. Wachlin",
    role: "Partner Account Manager at Amazon Web Services",
    avatar: "https://i.pravatar.cc/150?u=william",
    linkText: "View this AWS course",
    linkHref: "/courses?category=Cloud"
  },
  {
    id: 4,
    quote: "I loved the course about Al Studio. I was not aware of this Google tool, but immediately after taking the course, I started using it. Within 24 hours, I had a functional app for my law firm.",
    author: "Ben C.",
    role: "Google AI Professional Certificate graduate",
    avatar: "https://i.pravatar.cc/150?u=ben",
    linkText: "View Google AI Certificates",
    linkHref: "/courses?category=AI"
  },
  {
    id: 5,
    quote: "The management courses here are top-notch. I've been able to implement better workflows for my team almost immediately. The community support is also fantastic.",
    author: "Sarah J.",
    role: "Project Manager at TechCorp",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    linkText: "View Management courses",
    linkHref: "/courses?category=Business"
  }
];

export default function TestimonialSection() {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-12">
          Join others transforming their lives through learning
        </h2>

        <div className="relative group">
          {/* Navigation Arrows */}
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          {showRightArrow && (
            <button 
              onClick={() => scroll('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-10 scroll-smooth snap-x snap-mandatory"
          >
            {testimonials.map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="min-w-full md:min-w-[400px] lg:min-w-[380px] bg-white border border-slate-200 p-8 flex flex-col justify-between snap-start hover:shadow-lg transition-shadow"
              >
                <div>
                  <Quote size={40} className="text-slate-200 mb-6" fill="currentColor" />
                  <p className="text-slate-800 text-lg font-medium leading-relaxed mb-8">
                    {t.quote}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={t.avatar} 
                      alt={t.author} 
                      className="w-12 h-12 rounded-full object-cover grayscale" 
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                      <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <Link 
                      href={t.linkHref}
                      className="text-primary font-bold text-sm flex items-center gap-2 hover:underline decoration-2 underline-offset-4"
                    >
                      {t.linkText} <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/stories" className="text-primary font-bold text-sm flex items-center gap-2 group">
            View all stories 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
