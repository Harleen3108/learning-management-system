'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-black">E</div>
              EduFlow
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
              Redefining excellence in digital education through rigorous curriculum and global mentorship.
            </p>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer">
              <span className="font-black text-lg italic">a</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4">
              {['Curriculum', 'Mentors', 'Admissions', 'Business Solutions'].map(item => (
                <li key={item}><Link href="#" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Anatomy</h4>
            <ul className="space-y-4">
              {['About Us', 'Stories', 'Careers', 'Support'].map(item => (
                <li key={item}><Link href="#" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4">
              {['Privacy', 'Terms', 'Contact'].map(item => (
                <li key={item}><Link href="#" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-center items-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-center">
              © 2024 THE ACADEMIC ARCHIVE. ENGINEERED BY EDUFLOW.
            </p>
        </div>
      </div>
    </footer>
  );
}
