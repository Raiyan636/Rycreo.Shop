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
  const { refreshStore, storeConfig } = useStore();
  const { showToast } = useToast();

  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'refreshing' | 'success'>('idle');

  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const logoBoxRef = useRef<HTMLDivElement | null>(null);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const currentPullYRef = useRef(0);
  const hasTriggeredHapticRef = useRef(false);
  const isHorizontalScrollRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const THRESHOLD = 52; // Activation pull distance
  const MAX_DRAG = 90;

  // The website's official permanent logo
  const logoUrl = storeConfig.logoUrl && storeConfig.logoUrl !== '/logo.svg' ? storeConfig.logoUrl : '/logo.png';

  // Direct GPU update with requestAnimationFrame for buttery smooth 60/120fps
  const updateIndicatorDOM = useCallback((pullDistance: number) => {
    if (!indicatorRef.current) return;

    if (pullDistance <= 0) {
      indicatorRef.current.style.transform = 'translate3d(-50%, -75px, 0) scale(0.65)';
      indicatorRef.current.style.opacity = '0';
      if (contentRef.current) {
        contentRef.current.style.transform = '';
      }
      return;
    }

    const progress = Math.min(1, pullDistance / THRESHOLD);
    // Smooth Google Chrome elastic drop curve
    const dropY = -40 + pullDistance * 1.35;
    const scale = Math.min(1.05, 0.65 + progress * 0.38);
    const opacity = Math.min(1, progress * 1.35);

    indicatorRef.current.style.transform = `translate3d(-50%, ${dropY}px, 0) scale(${scale})`;
    indicatorRef.current.style.opacity = `${opacity}`;

    // Natural content displacement (content smoothly flexes down with user pull)
    if (contentRef.current) {
      const contentDrop = pullDistance * 0.42;
      contentRef.current.style.transform = `translate3d(0, ${contentDrop}px, 0)`;
    }

    // Outer circular progress stroke ring around logo
    if (ringRef.current) {
      const strokeDashoffset = 120 - progress * 120;
      ringRef.current.style.strokeDashoffset = `${strokeDashoffset}`;
      ringRef.current.style.stroke = progress >= 1 ? '#38BDF8' : '#0284C7';
    }

    // Logo rotates and scales smoothly with user's pull distance
    if (logoBoxRef.current) {
      const rotation = progress * 240;
      logoBoxRef.current.style.transform = `rotate(${rotation}deg) scale(${0.85 + progress * 0.15})`;
    }

    // Trigger subtle tactile tick when threshold is crossed
    if (progress >= 1 && !hasTriggeredHapticRef.current) {
      hasTriggeredHapticRef.current = true;
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(12);
        }
      } catch {}
    } else if (progress < 1) {
      hasTriggeredHapticRef.current = false;
    }
  }, []);

  const triggerRefresh = useCallback(async () => {
    setRefreshState('refreshing');

    // Tactile vibration when refresh initiates
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 30]);
      }
    } catch {}

    // Bounce indicator into steady spinning position
    if (indicatorRef.current) {
      indicatorRef.current.style.transition = 'transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease';
      indicatorRef.current.style.transform = 'translate3d(-50%, 65px, 0) scale(1)';
      indicatorRef.current.style.opacity = '1';
    }

    // Smoothly hold content slightly down while refreshing
    if (contentRef.current) {
      contentRef.current.style.transition = 'transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      contentRef.current.style.transform = 'translate3d(0, 32px, 0)';
    }

    const startTime = Date.now();

    try {
      // 1. Perform REAL live database & server refresh from Cloud Firestore
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshStore();
      }

      // Snappy, authentic feel: minimum 450ms so user can enjoy the animated logo
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 480 - elapsed);
      await new Promise(res => setTimeout(res, remainingTime));

      // 2. Success state with green checkmark & completion vibration (Pure visual feedback, no written text)
      setRefreshState('success');
      try {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(18);
        }
      } catch {}

      // 3. Smoothly bounce content and glide indicator back up
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)';
          contentRef.current.style.transform = '';
        }

        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -75px, 0) scale(0.65)';
          indicatorRef.current.style.opacity = '0';
        }

        setTimeout(() => {
          setRefreshState('idle');
          currentPullYRef.current = 0;
          hasTriggeredHapticRef.current = false;
        }, 280);
      }, 350);

    } catch (err) {
      console.warn("[PullToRefresh error]", err);
      setRefreshState('idle');

      if (contentRef.current) {
        contentRef.current.style.transition = 'transform 0.25s ease';
        contentRef.current.style.transform = '';
      }
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = 'translate3d(-50%, -75px, 0) scale(0.65)';
        indicatorRef.current.style.opacity = '0';
      }
      currentPullYRef.current = 0;
      hasTriggeredHapticRef.current = false;
    }
  }, [onRefresh, refreshStore, showToast]);

  // Listen for global 'trigger-store-refresh' events (header, menu drawer, or hotkey 'R')
  useEffect(() => {
    const handleGlobalTrigger = () => {
      triggerRefresh();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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
    // Touch Events for Mobile (Google Chrome Android Custom Pull-to-Refresh)
    // -------------------------------------------------------------
    const handleTouchStart = (e: TouchEvent) => {
      if (refreshState !== 'idle') return;

      // Triggerable ONLY when touch originates on menubar / top header area
      const target = e.touches[0].target as HTMLElement | null;
      const scrollTop = getScrollTop(target);

      const isFromMenubar = !!(
        target?.closest('header') || 
        target?.closest('nav') || 
        target?.closest('[data-menubar="true"]') ||
        target?.closest('.top-menubar') ||
        (e.touches[0].clientY <= 85 && window.scrollY <= 4)
      );

      if (isFromMenubar && scrollTop <= 2 && window.scrollY <= 2) {
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        isPullingRef.current = true;
        isHorizontalScrollRef.current = false;
        hasTriggeredHapticRef.current = false;
        currentPullYRef.current = 0;

        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'none';
        }
        if (contentRef.current) {
          contentRef.current.style.transition = 'none';
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

      // If user is swiping horizontally (carousel, tabs, gallery), cancel vertical pull
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
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.5);
        currentPullYRef.current = damped;

        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          updateIndicatorDOM(damped);
        });

        // Prevent Chrome Android native pull-to-refresh collision
        if (damped > 4 && e.cancelable) {
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
        // Did not reach threshold: smoothly glide back
        if (indicatorRef.current) {
          indicatorRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease';
          indicatorRef.current.style.transform = 'translate3d(-50%, -75px, 0) scale(0.65)';
          indicatorRef.current.style.opacity = '0';
        }
        if (contentRef.current) {
          contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
          contentRef.current.style.transform = '';
        }
        currentPullYRef.current = 0;
        hasTriggeredHapticRef.current = false;
      }
    };

    // -------------------------------------------------------------
    // Mouse Support for Desktop Browser Testing
    // -------------------------------------------------------------
    let isMouseDown = false;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && refreshState === 'idle') {
        const target = e.target as HTMLElement;
        const isFromMenubar = !!(
          target.closest('header') || 
          target.closest('nav') || 
          target.closest('[data-menubar="true"]') ||
          (e.clientY <= 85 && window.scrollY <= 4)
        );
        const scrollTop = getScrollTop(target);
        if (isFromMenubar && scrollTop <= 2 && window.scrollY <= 2) {
          startYRef.current = e.clientY;
          isMouseDown = true;
          if (indicatorRef.current) indicatorRef.current.style.transition = 'none';
          if (contentRef.current) contentRef.current.style.transition = 'none';
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
        const damped = Math.min(MAX_DRAG, Math.pow(diffY, 0.82) * 1.5);
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
          indicatorRef.current.style.transform = 'translate3d(-50%, -75px, 0) scale(0.65)';
          indicatorRef.current.style.opacity = '0';
        }
        if (contentRef.current) {
          contentRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
          contentRef.current.style.transform = '';
        }
        currentPullYRef.current = 0;
        hasTriggeredHapticRef.current = false;
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
      {/* 
        AUTHENTIC GOOGLE CHROME ANDROID PULL-TO-REFRESH CARD
        FEATURING OFFICIAL WEBSITE LOGO WITH NATURAL SMOOTH ANIMATION
      */}
      <div
        ref={indicatorRef}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] pointer-events-none select-none will-change-transform"
        style={{
          transform: 'translate3d(-50%, -75px, 0) scale(0.65)',
          opacity: 0,
        }}
      >
        <div className="w-13 h-13 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-slate-200/90 flex items-center justify-center relative p-1.5 backdrop-blur-md">
          {refreshState === 'success' ? (
            /* Success State: Green Checkmark Badge overlaying Logo */
            <div className="relative w-full h-full flex items-center justify-center animate-scale-in">
              <img 
                src={logoUrl} 
                alt="Store Logo" 
                className="w-8 h-8 object-contain rounded-full opacity-35" 
              />
              <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md animate-ping-once">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          ) : refreshState === 'refreshing' ? (
            /* Refreshing State: Authentic Logo Animation with Glowing Gradient Ring */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Animated Outer Gradient Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#38BDF8] border-r-[#6366F1] border-b-[#F59E0B] border-l-[#10B981] animate-spin" />
              
              {/* Glowing Pulse Ring */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-sky-400/20 to-indigo-500/20 animate-logo-pulse-ring" />

              {/* Website Logo with Smooth 3D Spin & Elastic Pulse Animation */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-2xs animate-logo-refresh">
                <img 
                  src={logoUrl} 
                  alt="Store Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          ) : (
            /* Pulling Down State: Dynamic Stroke Progress Ring + Rotating Store Logo */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Circular SVG Track */}
              <svg className="w-10 h-10 -rotate-90 transform absolute" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.2"
                />
                <circle
                  ref={ringRef}
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray="120"
                  strokeDashoffset="120"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Centered Website Logo Rotating with Pull */}
              <div 
                ref={logoBoxRef}
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs will-change-transform"
              >
                <img 
                  src={logoUrl} 
                  alt="Store Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Page Content - Has Elastic Google Chrome Pull Flexing without trapping fixed overlays */}
      <div ref={contentRef} className="transition-transform">
        {children}
      </div>
    </div>
  );
};
