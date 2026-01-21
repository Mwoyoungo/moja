'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Show for 2.5 seconds, then fade out
        const timer = setTimeout(() => {
            setOpacity(0);
        }, 2500);

        const removeTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // Wait for fade out transition to finish

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F0F12] overflow-hidden transition-opacity duration-700 ease-out"
            style={{ opacity: opacity }}
        >
            {/* Harmonious Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#C6B7E2]/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px]"></div>

            {/* Logo Container */}
            <div className="relative flex flex-col items-center justify-center gap-6 z-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-2 bg-primary/5 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>

                    {/* Logo Image */}
                    <div className="relative w-28 h-28 bg-surface/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl p-5 flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Moja Events"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(198,183,226,0.5)]"
                        />
                    </div>
                </div>

                {/* Brand Name / Tagline */}
                <div className="flex flex-col items-center gap-2 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards_0.5s]">
                    <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase">Moja Events</h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
