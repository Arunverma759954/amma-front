"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlane, FaChevronLeft, FaChevronRight, FaWhatsapp, FaPhoneAlt, FaCheckCircle } from "react-icons/fa";

const slides = [
  "/1.jpg",
  "/2.jpg",
  "/3.jpg",
  "/4.jpg",
  "/5.jpg"
];

export default function HeroSlider({ children }: { children?: React.ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[500px] md:h-[700px] overflow-hidden font-sans">
      {/* Slides */}
      {slides.map((src, index) => {
        // Calculate position classes for sliding effect
        let slideClass = "translate-x-full opacity-0 z-10"; // Default: off-screen right
        if (index === currentSlide) {
            slideClass = "translate-x-0 opacity-100 z-20"; // Active: on-screen
        } else if (index === (currentSlide - 1 + slides.length) % slides.length) {
            slideClass = "-translate-x-full opacity-0 z-10"; // Previous: off-screen left (optional, keeps flow)
        }

        return (
            <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${slideClass}`}
            >
            <div className="absolute inset-0 bg-transparent z-10"></div>
            <img 
                src={src} 
                alt={`Slide ${index + 1}`} 
                className="w-full h-full object-cover object-center"
            />
            </div>
        );
      })}

      {/* Left Blue Curve Overlay */}
      <div 
        className="absolute top-0 left-0 w-full md:w-[75%] h-full z-20 hidden md:block"
        style={{
          display: 'none',
          background: "#071C4B",
          clipPath: "path('M 0 0 L 85% 0 Q 60% 50% 85% 100% L 0 100% Z')"
        }}
      >
      </div>

      {/* White Curve Border (Simulated with pseudo or separate div) - behind logo */}
      <div 
        className="absolute top-0 left-0 w-full md:w-[76%] h-full z-10 hidden md:block"
        style={{
            display: 'none',
            background: "white",
            clipPath: "path('M 0 0 L 85.5% 0 Q 60.5% 50% 85.5% 100% L 0 100% Z')"
        }}
      ></div>

       {/* Mobile Overlay */}
       <div className="absolute inset-0 bg-gradient-to-r from-[#071C4B] via-[#071C4B]/80 to-transparent md:hidden z-20"></div>


      {/* Content Layer */}
      <div className="absolute inset-0 z-30 flex flex-col justify-center w-full max-w-7xl mx-auto px-4 pointer-events-none">
        
        {/* Floating Elements (Decorative) */}
        <div className="absolute top-1/2 left-0 w-full h-full hidden md:block">
             {/* Dots Grid Top Center */}
             <div className="absolute top-10 left-[40%] grid grid-cols-8 gap-2 opacity-30">
                {[...Array(32)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                ))}
             </div>
             
             {/* Circles Bottom Left */}
             <div className="absolute bottom-20 left-10 w-32 h-32 border-4 border-white/10 rounded-full"></div>
             <div className="absolute bottom-32 left-[-20px] w-20 h-20 border-4 border-white/10 rounded-full"></div>
        </div>

        {/* Text Content (removed custom overlay text & extra logo so banner images show exactly as designed) */}
      </div>

      {/* Controls */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/20 text-white p-3 rounded-full z-40 transition-colors">
        <FaChevronLeft size={30} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/20 text-white p-3 rounded-full z-40 transition-colors">
        <FaChevronRight size={30} />
      </button>

      {/* Search Form Container */}
      <div className="absolute bottom-16 md:bottom-20 left-0 w-full z-40 pointer-events-auto px-4">
        {children}
      </div>

    </div>
  );
}
