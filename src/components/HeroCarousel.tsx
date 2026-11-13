import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroCarousel: React.FC = () => {
  const { heroSlides, storeConfig, setActiveCategory } = useStore();
  const activeSlides = [...heroSlides]
    .filter(s => s.active)
    .sort((a, b) => {
      if (a.isFirstSlide && !b.isFirstSlide) return -1;
      if (!a.isFirstSlide && b.isFirstSlide) return 1;
      return (a.order || 0) - (b.order || 0);
    });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const touchStartX = useRef<number | null>(null);

  // Per-slide duration in seconds
  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const slideDurationSec = currentSlide?.durationSeconds || storeConfig.heroAutoplaySpeedSeconds || 5;
  const autoplaySpeedMs = Math.max(2, slideDurationSec) * 1000;

  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
    }, autoplaySpeedMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeSlides.length, currentIndex, autoplaySpeedMs]);

  if (activeSlides.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const handleCtaClick = (slide: typeof currentSlide) => {
    if (slide.categoryLink) {
      setActiveCategory(slide.categoryLink);
    }
  };

  return (
    <div className="relative w-full bg-[#0B1120] overflow-hidden group">
      {/* 1. Main Hero Carousel Stage with subtle laptop/desktop size boost */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full min-h-[260px] sm:min-h-[400px] lg:min-h-[505px] xl:min-h-[545px] max-h-[660px] aspect-[16/10] sm:aspect-[21/9.2] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      >
        {activeSlides.map((slide, index) => {
          const isCurrent = index === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isCurrent 
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                  : 'opacity-0 scale-100 z-0 pointer-events-none'
              }`}
            >
              {slide.mediaType === 'video' ? (
                <div className="relative w-full h-full">
                  {slide.mediaUrl.includes('youtube.com') || slide.mediaUrl.includes('youtu.be') ? (
                    <iframe
                      src={`${slide.mediaUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${slide.mediaUrl.split('/').pop()}`}
                      title={slide.title}
                      className="w-full h-full object-cover pointer-events-none"
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <video
                      ref={el => { videoRefs.current[slide.id] = el; }}
                      src={slide.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                </div>
              ) : (
                <img
                  src={slide.mediaUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center brightness-105 contrast-105"
                  loading="eager"
                />
              )}

              {/* Ultra-Light Soft Gradient for Text Readability Only */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"
                style={{ opacity: slide.overlayOpacity ?? 0.2 }}
              />
            </div>
          );
        })}

        {/* 2. Slide Content Typography & CTA */}
        {!currentSlide.hideTextOverlay && (
          <div className="relative z-20 max-w-[1360px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-5 sm:pb-12 md:pb-16">
            <div className="max-w-2xl space-y-1.5 sm:space-y-3.5 animate-fade-in">
              
              {/* High-Impact Badge */}
              {currentSlide.badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-xl shadow-amber-500/25 border border-amber-300/30 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200" />
                  <span>{currentSlide.badge}</span>
                </div>
              )}

              {/* Headline Title */}
              {currentSlide.title && (
                <h1 className="text-lg xs:text-xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-['Outfit'] tracking-tight drop-shadow-2xl line-clamp-2 sm:line-clamp-none">
                  {currentSlide.title}
                </h1>
              )}

              {/* Subtitle / Tagline */}
              {currentSlide.subtitle && (
                <p className="text-[11px] sm:text-sm md:text-base text-slate-200 font-medium max-w-xl drop-shadow-md leading-snug line-clamp-1 sm:line-clamp-2">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              {currentSlide.showCta !== false && (
                <div className="pt-1.5 sm:pt-4 flex flex-wrap items-center gap-2 sm:gap-4">
                  <a
                    href={currentSlide.ctaLink || '#products'}
                    onClick={() => handleCtaClick(currentSlide)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-7 sm:py-3 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#4F46E5] text-white font-extrabold text-[11px] sm:text-sm shadow-xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>{currentSlide.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Minimalist Dot Indicators */}
        {storeConfig.heroDotsActive !== false && activeSlides.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/15 shadow-xl">
            {activeSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === currentIndex 
                    ? 'w-4 sm:w-5 h-1 sm:h-1.5 bg-[#38BDF8] shadow-sm' 
                    : 'w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}

        {/* 3. Manual Pagination Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/80 text-white hover:bg-[#38BDF8] hover:text-slate-900 hover:border-[#38BDF8] transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl cursor-pointer"
          aria-label="Previous banner slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/80 text-white hover:bg-[#38BDF8] hover:text-slate-900 hover:border-[#38BDF8] transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl cursor-pointer"
          aria-label="Next banner slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
