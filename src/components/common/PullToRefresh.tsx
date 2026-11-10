import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from './Toast';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
}

// Find closest scrollable ancestor's scrollTop, or window.scrollY
const getScrollTop = (target: EventTarget | null): number => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    try {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el.scrollTop;
      }
    } catch {}
    el = el.parentElement;
  }
  return window.scrollY || document.documentElement.scrollTop || 0;
};

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const { refreshStore } = useStore();
  const { showToast } = useToast();

  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'refreshing' | 'success'>('idle');

  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const currentPullYRef = useRef(0);
  const isHorizontalScrollRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const THRESHOLD = 42; // Snappy Chrome-style activation distance
  const MAX_DRAG = 75;

  // Direct GPU update with requestAnimationFrame for buttery smooth 60/120fps
  const updateIndicatorDOM = useCallback((pullDistance: number) => {
    if (!indicatorRef.current) return;

    if (pullDistance <= 0) {
      indicatorRef.current.style.transform = 'translate3d(-50%, -65px, 0) scale(0.7)';
      indicatorRef.current.style.opacity = '0';
      return;
    }

    const progress = Math.min(1, pullDistance / THRESHOLD);
    // Smooth Google Chrome elastic drop curve
    const dropY = -45 + pullDistance * 1.35;
    const scale = Math.min(1.05, 0.7 + progress * 0.35);
    const opacity = Math.min(1, progress * 1.4);

    indicatorRef.current.style.transform = `translate3d(-50%, ${dropY}px, 0) scale(${scale})`;
    indicatorRef.current.style.opacity = `${opacity}`;

    // Google Blue circular arc
    if (ringRef.current) {
      const strokeDashoffset = 75 - progress * 75;
      ringRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
      ringRef.current.style.stroke = '#4285F4'; // Google Chrome Blue
    }

    // Google rotating arrow indicator
    if (arrowRef.current) {
      const rotation = progress * 270;
      arrowRef.current.style.transform = `rotate(${rotation}deg)`;
      arrowRef.current.style.color = '#4285F4';
    }
  }, []);

  const triggerRefresh = useCallback(async () => {
    setRefreshState('refreshing');

    // Trigger subtle tactile feedback if device supports it
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {}

    if (indicatorRef.current) {
      indicatorRef.current.style.transition = 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
      indicatorRef.current.style.transform = 'translate3d(-50%, 56px, 0) scale(1)';
      indicatorRef.current.style.opacity = '1';
    }

    const startTime = Date.now();

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshStore();
      }

      // Snappy, authentic Google Chrome cycle (~450ms)
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 420 - elapsed);
      await new Promise(res => setTimeout(res, remainingTime));

      setRefreshState('success');
      showToast('গুগল রিফ্রেশ সম্পন্ন: স্টোর লাইভ আপডেট হয়েছে', 'success');

      // Hold checkmark briefly, then smoothly glide up offscreen
      setTimeout(() => {
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -65px, 0) scale(0.6)';
          indicatorRef.current.style.opacity = '0';
        }

        setTimeout(() => {
          setRefreshState('idle');
          currentPullYRef.current = 0;
        }, 250);
      }, 300);
    } catch {
      setRefreshState('idle');
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = 'translate3d(-50%, -65px, 0) scale(0.6)';
        indicatorRef.current.style.opacity = '0';
      }
      currentPullYRef.current = 0;
    }
  }, [onRefresh, refreshStore, showToast]);

  // Listen for global 'trigger-store-refresh' events (header button, keyboard 'r', etc.)
  useEffect(() => {
    const handleGlobalTrigger = () => {
      triggerRefresh();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey 'r' (when not inside inputs or dialogs)
      if (e.key === 'r' || e.key === 'R') {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && activeTag !== 'select') {
          triggerRefresh();
        }
      }
    };

    window.addEventListener('trigger-store-refresh', handleGlobalTrigger);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('trigger-store-refresh', handleGlobalTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerRefresh]);

  useEffect(() => {
    // -------------------------------------------------------------
    // Touch Events for Mobile (Authentic Google Chrome Pull-To-Refresh)
    // -------------------------------------------------------------
    const handleTouchStart = (e: TouchEvent) => {
      if (refreshState !== 'idle') return;

      const target = e.touches[0].target;
      const scrollTop = getScrollTop(target);

      // Triggerable when at top of window
      if (scrollTop <= 2 && window.scrollY <= 2) {
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        isPullingRef.current = true;
        isHorizontalScrollRef.current = false;
        currentPullYRef.current = 0;

        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'none'; // Instant follow during drag
        }
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || refreshState !== 'idle') return;

      const currentScrollTop = getScrollTop(e.touches[0].target);
      if (currentScrollTop > 2 || window.scrollY > 2) {
        isPullingRef.current = false;
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = Math.abs(currentX - startXRef.current);

      // If user is swiping horizontally, cancel vertical pull
      if (diffX > Math.abs(diffY) && diffX > 6) {
        isHorizontalScrollRef.current = true;
        isPullingRef.current = false;
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
        return;
      }

      if (isHorizontalScrollRef.current) return;

      // Only pull down when pulling downwards from the top
      if (diffY > 0) {
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.35);
        currentPullYRef.current = damped;

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          updateIndicatorDOM(damped);
        });

        if (damped > 8 && e.cancelable) {
          e.preventDefault();
        }
      } else {
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || refreshState !== 'idle') return;
      isPullingRef.current = false;

      const finalPull = currentPullYRef.current;

      if (finalPull >= THRESHOLD) {
        triggerRefresh();
      } else {
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -65px, 0) scale(0.6)';
          indicatorRef.current.style.opacity = '0';
        }
        currentPullYRef.current = 0;
      }
    };

    // -------------------------------------------------------------
    // Mouse Support for Desktop Browser Testing
    // -------------------------------------------------------------
    let isMouseDown = false;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && refreshState === 'idle') {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, [role="button"]')) return;
        const scrollTop = getScrollTop(target);
        if (scrollTop <= 2 && window.scrollY <= 2) {
          startYRef.current = e.clientY;
          isMouseDown = true;
          if (indicatorRef.current) indicatorRef.current.style.transition = 'none';
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || refreshState !== 'idle') return;
      const currentScrollTop = getScrollTop(e.target);
      if (currentScrollTop > 2 || window.scrollY > 2) {
        isMouseDown = false;
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
        return;
      }

      const diffY = e.clientY - startYRef.current;
      if (diffY > 0) {
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.35);
        currentPullYRef.current = damped;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          updateIndicatorDOM(damped);
        });
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDown || refreshState !== 'idle') return;
      isMouseDown = false;
      const finalPull = currentPullYRef.current;
      if (finalPull >= THRESHOLD) {
        triggerRefresh();
      } else {
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -65px, 0) scale(0.6)';
          indicatorRef.current.style.opacity = '0';
        }
        currentPullYRef.current = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [refreshState, triggerRefresh, updateIndicatorDOM]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* GOOGLE CHROME ORIGINAL MATERIAL REFRESH SPINNER (Hardware-accelerated) */}
      <div
        ref={indicatorRef}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] pointer-events-none select-none will-change-transform"
        style={{
          transform: 'translate3d(-50%, -65px, 0) scale(0.7)',
          opacity: 0,
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-slate-100 flex items-center justify-center relative">
          {refreshState === 'success' ? (
            /* Google Green Success Checkmark */
            <div className="w-6 h-6 rounded-full bg-[#34A853] text-white flex items-center justify-center shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : refreshState === 'refreshing' ? (
            /* Authentic Google Chrome 4-Color Animated Material Spinner */
            <div className="w-6 h-6 relative flex items-center justify-center">
              <svg className="w-6 h-6 google-spinner" viewBox="25 25 50 50">
                <circle
                  className="google-spinner-path"
                  cx="50"
                  cy="50"
                  r="20"
                  fill="none"
                  strokeWidth="4"
                  strokeMiterlimit="10"
                />
              </svg>
            </div>
          ) : (
            /* Google Chrome Pulling Down State (Google Blue Arc + Clockwise Rotating Arrow) */
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="12"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.2"
                />
                <circle
                  ref={ringRef}
                  cx="18"
                  cy="18"
                  r="12"
                  fill="none"
                  stroke="#4285F4"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray="75"
                  strokeDashoffset="75"
                />
              </svg>
              <svg 
                ref={arrowRef}
                className="w-3.5 h-3.5 text-[#4285F4] absolute transition-transform"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Main Page Content */}
      {children}
    </div>
  );
};
