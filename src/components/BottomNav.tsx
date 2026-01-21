'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;
    const isHome = pathname === '/';

    // Styles based on page
    const containerClasses = "bg-black/95 backdrop-blur-xl border-t border-white/5 pb-5 pt-3";

    return (
        <>
            <nav className={`fixed bottom-0 left-0 right-0 px-6 flex justify-between items-center z-50 h-[70px] ${containerClasses}`}>
                <Link href="/" className={`flex flex-col items-center gap-0.5 group transition-all ${isActive('/') ? 'text-white' : 'text-white/40'}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive('/') ? "'FILL' 1" : "'FILL' 0" }}>explore</span>
                    <span className="text-[9px] font-medium tracking-wide">Discover</span>
                </Link>

                <Link href="/tickets" className={`flex flex-col items-center gap-0.5 group transition-all ${isActive('/tickets') ? 'text-primary' : 'text-white/40'}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive('/tickets') ? "'FILL' 1" : "'FILL' 0" }}>confirmation_number</span>
                    <span className="text-[9px] font-medium tracking-wide">Tickets</span>
                </Link>

                {/* Create Button - Normalized */}
                <Link href="/create" className="flex flex-col items-center gap-0.5 group transition-all text-white/40 hover:text-white">
                    <div className="w-6 h-6 rounded-lg border-2 border-currentColor flex items-center justify-center mb-0.5">
                        <span className="material-symbols-outlined text-[18px] font-bold">add</span>
                    </div>
                    <span className="text-[9px] font-medium tracking-wide">Create</span>
                </Link>

                <button className="flex flex-col items-center gap-0.5 text-white/40 group hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">favorite</span>
                    <span className="text-[9px] font-medium tracking-wide">Saved</span>
                </button>

                <Link href="/dashboard" className={`flex flex-col items-center gap-0.5 group transition-all ${isActive('/dashboard') ? 'text-white' : 'text-white/40'}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                    <span className="text-[9px] font-medium tracking-wide">Profile</span>
                </Link>
            </nav>
            {/* iOS Home Indicator */}
            <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-[60] pointer-events-none"></div>
        </>
    );
}
