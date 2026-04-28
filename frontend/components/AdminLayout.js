import Topbar from './Topbar';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }) {
    return (
        <div className="bg-slate-50/50 min-h-screen">
            {/* Unified Topbar with Admin Links */}
            <Topbar />
            
            <div className="flex flex-col pt-4">
                {/* Main Content */}
                <main className="p-4 lg:p-8 flex-1 max-w-screen-2xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
