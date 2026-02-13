"use client";

import { FaPlane } from "react-icons/fa";

export default function SearchingOverlay() {
    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-50/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-12 max-w-md px-6 text-center">
                {/* Brand / Context */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-64 h-24 mb-2">
                        <img
                            src="/logo.png"
                            alt="HiFi Travels"
                            className="w-full h-full object-contain animate-pulse"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Finding the best flights for your journey</h2>
                    <p className="text-gray-500 font-medium">Checking live fares from over 400+ airlines across the globe...</p>
                </div>

                {/* Progress Indicators */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#071C4B] via-[#C41E22] to-[#071C4B] w-full animate-loading-bar shadow-[0_0_15px_rgba(196,30,34,0.5)]"></div>
                    </div>

                    <div className="flex gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-2.5 h-2.5 bg-gray-200 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Micro-text */}
                <div className="pt-8 border-t border-gray-100 w-full">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Real-time API connection established</p>
                </div>
            </div>

            {/* Large Decorative Icon */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden">
                <FaPlane className="text-[60rem] rotate-12" />
            </div>

            <style jsx global>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
