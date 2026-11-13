import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SectionBannerConfig } from '../types/store';
import { useStore } from '../context/StoreContext';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';

interface SectionPromoBannerProps {
  banner?: SectionBannerConfig;
  defaultAnchor?: string;
}

export const SectionPromoBanner: React.FC<SectionPromoBannerProps> = ({
  banner,
  defaultAnchor = '#products',
}) => {
  const { setActiveCategory } = useStore();

  if (!banner || !banner.active || !banner.mediaUrl?.trim()) return null;

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (banner.categoryLink) {
      setActiveCategory(banner.categoryLink);
    }
    const targetHash = banner.ctaLink || defaultAnchor;
    if (targetHash.startsWith('#')) {
      const targetEl = document.getElementById(targetHash.slice(1));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const mediaSrc = resolveStoreAssetUrl(banner.mediaUrl);
  const isYoutube = mediaSrc.includes('youtube.com') || mediaSrc.includes('youtu.be');

  return (
    <div className="w-full max-w-5xl lg:max-w-[980px] mx-auto">
      <div className="relative w-full bg-[#0B1120] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 group">
        <div className="relative w-full min-h-[170px] sm:min-h-[245px] lg:min-h-[295px] max-h-[370px] aspect-[16/8.5] sm:aspect-[21/7.6] overflow-hidden select-none">
          {/* Background Media (Image or Video) */}
          <div className="absolute inset-0">
            {banner.mediaType === 'video' ? (
              isYoutube ? (
                <iframe
                  src={`${mediaSrc}?autoplay=1&mute=1&controls=0&loop=1&playlist=${mediaSrc.split('/').pop()}`}
                  title={banner.title || 'Promo Banner'}
                  className="w-full h-full object-cover pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video
                  src={mediaSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              )
            ) : (
              <img
                src={mediaSrc}
                alt={banner.title || 'Featured Collection Banner'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center brightness-105 contrast-105"
                loading="lazy"
                decoding="async"
              />
            )}

            {/* Ultra-Light Soft Gradient Matching Top Hero Banner */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none"
              style={{ opacity: banner.overlayOpacity ?? 0.35 }}
            />
          </div>

          {/* Banner Typography & CTA Matching Top Hero Styling */}
          {!banner.hideTextOverlay && (
            <div className="relative z-20 h-full px-4 sm:px-7 lg:px-9 flex flex-col justify-end pb-4 sm:pb-8 md:pb-10">
              <div className="max-w-xl space-y-1 sm:space-y-2.5">
                {banner.badge && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#B45309] text-white text-[9.5px] sm:text-xs font-black tracking-wider uppercase shadow-lg border border-amber-300/30 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>{banner.badge}</span>
                  </div>
                )}

                {banner.title && (
                  <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white leading-tight font-['Outfit'] tracking-tight drop-shadow-2xl line-clamp-2">
                    {banner.title}
                  </h2>
                )}

                {banner.subtitle && (
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-200 font-medium max-w-lg drop-shadow-md leading-snug line-clamp-1 sm:line-clamp-2">
                    {banner.subtitle}
                  </p>
                )}

                {banner.showCta !== false && (
                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={banner.ctaLink || defaultAnchor}
                      onClick={handleCtaClick}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#4F46E5] text-white font-extrabold text-[11px] sm:text-xs shadow-lg shadow-sky-500/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <span>{banner.ctaText || 'Explore Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
