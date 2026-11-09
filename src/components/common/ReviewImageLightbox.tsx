import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export const ReviewImageLightbox: React.FC<ReviewImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, initialIndex, images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation: Escape to close, arrows for next/prev
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Floating Image Box: Crisp elevated card with zero black bars above or below */}
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-2.5 max-w-[92vw] sm:max-w-[85vw] md:max-w-3xl max-h-[88vh] flex flex-col items-center justify-center border border-white/40 ring-1 ring-slate-900/10 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 sm:top-3 sm:right-3 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-90 cursor-pointer border border-white/20"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Displayed Image */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center max-h-[82vh] max-w-full">
          <img
            src={currentImage}
            alt={`Customer review photo ${currentIndex + 1}`}
            className="w-auto h-auto max-h-[80vh] max-w-full object-contain rounded-xl shadow-xs"
            draggable={false}
          />

          {/* Left Arrow (if multiple images) */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95 border border-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow (if multiple images) */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95 border border-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Mini indicator dots if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs border border-white/20 shadow-md">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all rounded-full ${
                    idx === currentIndex 
                      ? 'w-4 h-1.5 bg-[#38BDF8]' 
                      : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
