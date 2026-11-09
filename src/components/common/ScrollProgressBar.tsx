import React, { useState, useEffect } from 'react';

export const ScrollProgressBar: React.FC = () => {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = windowHeight === 0 ? 0 : (window.scrollY / windowHeight) * 100;
          setScrollWidth(scrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 w-full bg-slate-900/10 pointer-events-none">
      <div 
        className="h-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#F59E0B] transition-all duration-75 ease-out shadow-sm shadow-sky-500/20"
        style={{ 
          width: `${scrollWidth}%`,
          backgroundSize: '200% auto',
          animation: 'shimmer 4s linear infinite'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};
