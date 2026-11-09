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

  const [refreshState, setRefreshState] = useState<'idle' | 'refreshing' | 'success'>('idle');

  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const currentPullYRef = useRef(0);
  const isHorizontalScrollRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const THRESHOLD = 48; // Light pull threshold for instant smooth activation
  const MAX_DRAG = 90;

  // Direct GPU update with requestAnimationFrame (Zero React re-renders during drag = buttery smooth 60/120fps)
  const updateIndicatorDOM = useCallback((pullDistance: number) => {
    if (!indicatorRef.current) return;

    if (pullDistance <= 0) {
      indicatorRef.current.style.transform = 'translate3d(-50%, -70px, 0) scale(0.6)';
      indicatorRef.current.style.opacity = '0';
      return;
    }

    const progress = Math.min(1, pullDistance / THRESHOLD);
    const dropY = -45 + pullDistance * 1.25;
    const scale = Math.min(1.05, 0.6 + progress * 0.45);
    const opacity = Math.min(1, progress * 1.3);

    indicatorRef.current.style.transform = `translate3d(-50%, ${dropY}px, 0) scale(${scale})`;
    indicatorRef.current.style.opacity = `${opacity}`;

    // Update circular progress ring
    if (ringRef.current) {
      const strokeDashoffset = 88 - progress * 88;
      ringRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
      ringRef.current.style.stroke = progress >= 1 ? '#F97316' : '#64748B';
    }

    // Update inner rotating arrow
    if (arrowRef.current) {
      const rotation = progress * 180;
      arrowRef.current.style.transform = `rotate(${rotation}deg)`;
      arrowRef.current.style.color = progress >= 1 ? '#F97316' : '#64748B';
    }
  }, []);

  const triggerRefresh = useCallback(async () => {
    setRefreshState('refreshing');

    if (indicatorRef.current) {
      indicatorRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
      indicatorRef.current.style.transform = 'translate3d(-50%, 60px, 0) scale(1)';
      indicatorRef.current.style.opacity = '1';
    }

    const startTime = Date.now();

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshStore();
      }

      // Ensure the spinner spins smoothly for at least 1.1s so the user sees a satisfying, polished spin animation
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1100 - elapsed);
      await new Promise(res => setTimeout(res, remainingTime));

      setRefreshState('success');
      showToast('Store refreshed live with latest version', 'success');

      // Hold checkmark briefly, then smoothly glide up offscreen
      setTimeout(() => {
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -70px, 0) scale(0.6)';
          indicatorRef.current.style.opacity = '0';
        }

        setTimeout(() => {
          setRefreshState('idle');
          currentPullYRef.current = 0;
        }, 360);
      }, 500);
    } catch {
      setRefreshState('idle');
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = 'translate3d(-50%, -70px, 0) scale(0.6)';
        indicatorRef.current.style.opacity = '0';
      }
      currentPullYRef.current = 0;
    }
  }, [onRefresh, refreshStore, showToast]);

  useEffect(() => {
    // -------------------------------------------------------------
    // Touch Events for Mobile (Smooth Daraz App Native Feel across all views)
    // -------------------------------------------------------------
    const handleTouchStart = (e: TouchEvent) => {
      if (refreshState !== 'idle') return;

      const target = e.touches[0].target;
      const scrollTop = getScrollTop(target);

      // Triggerable when at top of window or top of active modal (like ProductModal)
      if (scrollTop <= 2) {
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
      if (currentScrollTop > 2) {
        isPullingRef.current = false;
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = Math.abs(currentX - startXRef.current);

      // If user is swiping horizontally (like image gallery in ProductModal), cancel vertical pull
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
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.4);
        currentPullYRef.current = damped;

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          updateIndicatorDOM(damped);
        });

        if (damped > 6 && e.cancelable) {
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
          indicatorRef.current.style.transform = 'translate3d(-50%, -70px, 0) scale(0.6)';
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
        if (scrollTop <= 2) {
          startYRef.current = e.clientY;
          isMouseDown = true;
          if (indicatorRef.current) indicatorRef.current.style.transition = 'none';
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || refreshState !== 'idle') return;
      const currentScrollTop = getScrollTop(e.target);
      if (currentScrollTop > 2) {
        isMouseDown = false;
        currentPullYRef.current = 0;
        updateIndicatorDOM(0);
        return;
      }

      const diffY = e.clientY - startYRef.current;
      if (diffY > 0) {
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.4);
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
          indicatorRef.current.style.transform = 'translate3d(-50%, -70px, 0) scale(0.6)';
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
      {/* DARAZ-STYLE FLOATING CIRCULAR LOADING SPINNER (Hardware-accelerated) */}
      <div
        ref={indicatorRef}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] pointer-events-none select-none will-change-transform"
        style={{
          transform: 'translate3d(-50%, -70px, 0) scale(0.6)',
          opacity: 0,
        }}
      >
        <div className="w-11 h-11 rounded-full bg-white shadow-xl shadow-slate-900/15 border border-slate-200/90 flex items-center justify-center relative">
          {refreshState === 'success' ? (
            /* Success checkmark */
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-scale-in shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : refreshState === 'refreshing' ? (
            /* Smooth circular spinning ring (Daraz vibrant orange) */
            <svg className="w-6 h-6 animate-spin text-orange-500" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#F97316"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="80"
                strokeDashoffset="50"
              />
            </svg>
          ) : (
            /* Pulling down dynamic progress arc with rotating arrow */
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.5"
                />
                <circle
                  ref={ringRef}
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="88"
                  strokeDashoffset="88"
                />
              </svg>
              <svg 
                ref={arrowRef}
                className="w-3 h-3 text-slate-500 absolute transition-transform"
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

      {/* Main Page Content - Clean, 100% static & buttery smooth without layout thrashing */}
      {children}
    </div>
  );
};
