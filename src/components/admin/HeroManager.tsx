import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Video, Image as ImageIcon, Upload, Eye, EyeOff, X, Sparkles, Link as LinkIcon, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroSlide } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage } from '../../storageService';

export const HeroManager: React.FC = () => {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlides, categories, storeConfig, updateStoreConfig } = useStore();
  const { showToast } = useToast();

  const [autoplaySeconds, setAutoplaySeconds] = useState<number>(
    storeConfig.heroAutoplaySpeedSeconds || 5
  );

  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [ctaText, setCtaText] = useState('SHOP NOW');
  const [ctaLink, setCtaLink] = useState('#products');
  const [categoryLink, setCategoryLink] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [slideOrderNumber, setSlideOrderNumber] = useState<number>(1);
  const [isFirstSlide, setIsFirstSlide] = useState(false);
  const [active, setActive] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [hideTextOverlay, setHideTextOverlay] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sorted list of hero slides for rendering & reordering
  const sortedHeroSlides = [...heroSlides].sort((a, b) => {
    if (a.isFirstSlide && !b.isFirstSlide) return -1;
    if (!a.isFirstSlide && b.isFirstSlide) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setBadge('');
    setCtaText('SHOP NOW');
    setCtaLink('#products');
    setCategoryLink('');
    setMediaType('image');
    setMediaUrl('');
    setOverlayOpacity(0.4);
    setDurationSeconds(5);
    setSlideOrderNumber(heroSlides.length + 1);
    setIsFirstSlide(false);
    setActive(true);
    setShowCta(true);
    setHideTextOverlay(false);
    setEditingSlide(null);
    setIsCreating(false);
  };

  const handleStartEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle);
    setBadge(slide.badge);
    setCtaText(slide.ctaText);
    setCtaLink(slide.ctaLink);
    setCategoryLink(slide.categoryLink || '');
    setMediaType(slide.mediaType);
    setMediaUrl(slide.mediaUrl);
    setOverlayOpacity(slide.overlayOpacity ?? 0.4);
    setDurationSeconds(slide.durationSeconds || storeConfig.heroAutoplaySpeedSeconds || 5);
    setSlideOrderNumber(slide.order || 1);
    setIsFirstSlide(!!slide.isFirstSlide);
    setActive(slide.active);
    setShowCta(slide.showCta !== false);
    setHideTextOverlay(!!slide.hideTextOverlay);
    setIsCreating(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    try {
      const downloadUrl = await uploadImageToStorage(file, 'hero-slides');
      if (downloadUrl) {
        setMediaUrl(downloadUrl);
        setMediaType('image');
        showToast("Banner image uploaded and saved successfully!", "success");
      } else {
        const compressedDataUrl = await compressImage(file, 1400, 0.80);
        setMediaUrl(compressedDataUrl);
        setMediaType('image');
        showToast("Banner image optimized successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to upload image. Please try another.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimarySlide = (targetSlide: HeroSlide) => {
    const currentSorted = [...sortedHeroSlides];
    const targetIdx = currentSorted.findIndex(s => s.id === targetSlide.id);
    if (targetIdx > -1) {
      const [promoted] = currentSorted.splice(targetIdx, 1);
      currentSorted.unshift(promoted);
    }
    const updated = currentSorted.map((s, idx) => ({
      ...s,
      isFirstSlide: idx === 0,
      order: idx + 1
    }));
    reorderHeroSlides(updated);
    showToast(`"${targetSlide.title}" কে ১ম/প্রধান ব্যানার হিসেবে সেট করা হয়েছে!`, 'success');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedHeroSlides.length) return;

    const newSorted = [...sortedHeroSlides];
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const updated = newSorted.map((slide, i) => ({
      ...slide,
      order: i + 1,
      isFirstSlide: i === 0 ? slide.isFirstSlide : false
    }));
    reorderHeroSlides(updated);
    showToast(`Banner move successful! Set as Banner #${targetIndex + 1}`, "info");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      showToast("Please provide a Banner Media URL/Upload!", "error");
      return;
    }

    if (isFirstSlide) {
      heroSlides.forEach(s => {
        if (editingSlide && s.id === editingSlide.id) return;
        if (s.isFirstSlide) {
          updateHeroSlide({ ...s, isFirstSlide: false });
        }
      });
    }

    if (editingSlide) {
      updateHeroSlide({
        ...editingSlide,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        ctaText: ctaText.trim() || 'SHOP NOW',
        ctaLink: ctaLink.trim() || '#products',
        categoryLink: categoryLink.trim() || undefined,
        mediaType,
        mediaUrl: mediaUrl.trim(),
        overlayOpacity,
        durationSeconds: Number(durationSeconds) || 5,
        order: Number(slideOrderNumber) || 1,
        isFirstSlide,
        active,
        showCta,
        hideTextOverlay
      });
      showToast(`Updated banner "${title.trim()}" successfully!`, 'success');
    } else {
      addHeroSlide({
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        ctaText: ctaText.trim() || 'SHOP NOW',
        ctaLink: ctaLink.trim() || '#products',
        categoryLink: categoryLink.trim() || undefined,
        mediaType,
        mediaUrl: mediaUrl.trim(),
        overlayOpacity,
        durationSeconds: Number(durationSeconds) || 5,
        isFirstSlide,
        order: Number(slideOrderNumber) || (isFirstSlide ? 1 : heroSlides.length + 1),
        active,
        showCta,
        hideTextOverlay
      });
      showToast(`Added new banner "${title.trim()}" successfully!`, 'success');
    }

    resetForm();
  };

  const confirmDeleteSlide = () => {
    if (slideToDelete) {
      deleteHeroSlide(slideToDelete.id);
      showToast(`Deleted banner "${slideToDelete.title}" successfully!`, 'success');
      setSlideToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white font-['Outfit']">Daraz-Style Hero Banner & Slider Manager</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-[#38BDF8] font-mono text-xs font-black border border-sky-500/30">
              মোট ব্যানার: {heroSlides.length}টি
            </span>
          </div>
          <p className="text-xs text-slate-400">Upload banner graphics directly from your device, embed videos, and configure promo CTAs.</p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Upload New Banner</span>
          </button>
        )}
      </div>

      {/* MODULE 1: UI Image Size Guidelines Documentation Card */}
      <div className="bg-slate-900/90 border border-sky-500/30 p-4 rounded-2xl space-y-2">
        <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#38BDF8]" /> সার্বজনীন ব্যানার ও ইমেজ সাইজ গাইডলাইন (Universal Size Guide)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-200 block">Universal Banner (মোবাইল ও পিসি)</span>
            <span className="text-sky-400 font-mono font-bold text-[11px]">1200 x 500 px (বা 1920 x 800 px)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-200 block">ফেস্টিভ্যাল স্পটলাইট ব্যানার</span>
            <span className="text-amber-400 font-mono font-bold text-[11px]">1200 x 450 px</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-200 block">প্রোডাক্ট শোকেস ছবি (Square)</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">800 x 800 px (1:1 Square)</span>
          </div>
        </div>
      </div>

      {/* Banner Auto-Slide Speed & Timer Control Card */}
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            ⏱️ Banner Auto-Slide Speed (ব্যানার পরিবর্তনের সময়সীমা)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            কত সেকেন্ড পর পর একটি ব্যানার স্লাইড হয়ে পরের ব্যানার আসবে তা সেট করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <input 
              type="number"
              min={2}
              max={60}
              value={autoplaySeconds}
              onChange={(e) => setAutoplaySeconds(Math.max(2, Number(e.target.value)))}
              className="w-16 bg-transparent text-amber-400 font-mono font-black text-sm text-center outline-none"
            />
            <span className="text-xs font-bold text-slate-300">সেকেন্ড</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              await updateStoreConfig({ heroAutoplaySpeedSeconds: Number(autoplaySeconds) || 5 });
              showToast(`Banner auto-slide speed updated to ${autoplaySeconds}s!`, 'success');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            Save Speed
          </button>
        </div>
      </div>

      {/* Carousel Pagination Dots Master Toggle Card */}
      <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            🔘 Carousel Pagination Dots (ব্যানার ডট ইন্ডিকেটর)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            ওয়েবসাইটে ব্যানার ক্যারোসেলের নিচে ছোট ডট ডট ইন্ডিকেটর গ্লোবালি শো বা হাইড করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
            <input 
              type="checkbox"
              checked={storeConfig.heroDotsActive !== false}
              onChange={async (e) => {
                await updateStoreConfig({ heroDotsActive: e.target.checked });
                showToast(e.target.checked ? "Carousel dots enabled on website!" : "Carousel dots hidden on website!", "success");
              }}
              className="w-4 h-4 rounded accent-[#38BDF8] cursor-pointer"
            />
            <span className="text-xs font-bold text-white">ডট ডট (Dots) শো করুন</span>
          </label>
        </div>
      </div>

      {/* Slide Form */}
      {isCreating && (
        <form onSubmit={handleSave} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
              {editingSlide ? 'Edit Hero Banner Slide' : 'Upload / Create Banner Slide'}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-600 shadow-sm"
                title="Close Form / বন্ধ করুন"
              >
                <span>✕ Close Form</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-xl bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Headline Title (Optional)</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="PUJA FESTIVAL SPECIAL COLLECTION"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Subtitle / Tagline</label>
              <input 
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Celebrate with Royal Traditional Fusion Kurtas"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Badge Tag</label>
              <input 
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="30% OFF • PUJA SPECIAL"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Category Link</label>
              <select
                value={categoryLink}
                onChange={(e) => setCategoryLink(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="">None (General Store)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">CTA Button Label</label>
              <input 
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="SHOP NOW"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">CTA Destination Hash/Link</label>
              <input 
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="#products"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={showCta}
                  onChange={(e) => setShowCta(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#38BDF8]"
                />
                <span className="text-xs font-bold text-white">🛍️ Show 'Shop Now' CTA Button on this Banner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer" title="টিকমার্ক দিলে ব্যানারের উপর কোনো বাংলা লেখা বা শিরোনাম শো করবে না, শুধু ছবি দেখাবে">
                <input 
                  type="checkbox"
                  checked={hideTextOverlay}
                  onChange={(e) => setHideTextOverlay(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-xs font-bold text-amber-400">🚫 ব্যানারের উপর সমস্ত লেখা (বাংলা লেখা/টাইটেল) হাইড করুন</span>
              </label>
            </div>
          </div>

          {/* Media Selector & Device Upload */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
                <span>Banner Media (Image or MP4 Video) *</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    mediaType === 'image' ? 'bg-[#38BDF8] text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    mediaType === 'video' ? 'bg-[#38BDF8] text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            {/* Media input options */}
            <div className="space-y-3">
              {mediaType === 'image' ? (
                <div>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] hover:opacity-90 text-xs font-black text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Optimizing photo...' : '📸 ডিভাইস গ্যালারি থেকে ব্যানার ছবি সিলেক্ট করুন'}</span>
                    </button>
                    {mediaUrl && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> ফটো সফলভাবে সিলেক্ট হয়েছে
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Video Stream URL (MP4 or YouTube)</label>
                  <input 
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://...mp4 or https://youtube.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                </div>
              )}
            </div>

            {/* Live Media Preview */}
            {mediaUrl && (
              <div className="relative h-44 rounded-xl overflow-hidden border border-slate-700 mt-2 bg-slate-950">
                {mediaType === 'image' ? (
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
                )}
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ opacity: overlayOpacity }}
                />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-xs font-black drop-shadow">{title || 'Banner Headline Preview'}</p>
                  <p className="text-[10px] text-slate-200 drop-shadow">{subtitle || 'Subtitle Preview'}</p>
                </div>
              </div>
            )}

            {/* Overlay opacity, per-banner duration, sequence order, first banner check & active toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-400">Dimming:</label>
                <input 
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="accent-[#38BDF8] cursor-pointer w-16"
                />
                <span className="text-xs font-mono text-slate-300">{Math.round(overlayOpacity * 100)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-300 shrink-0">⏱️ দেখাবে:</label>
                <input 
                  type="number"
                  min={2}
                  max={60}
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Math.max(2, Number(e.target.value)))}
                  className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-400 font-mono font-extrabold text-center outline-none"
                />
                <span className="text-[11px] text-slate-400">সেকেন্ড</span>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-sky-400 shrink-0">🔢 পজিশন (Order):</label>
                <input 
                  type="number"
                  min={1}
                  max={50}
                  value={slideOrderNumber}
                  onChange={(e) => setSlideOrderNumber(Math.max(1, Number(e.target.value)))}
                  className="w-14 bg-slate-900 border border-sky-500/50 rounded-lg p-1.5 text-xs text-sky-300 font-mono font-black text-center outline-none"
                  title="১ম, ২য়, ৩য় ব্যানার নির্ধারণ করুন"
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isFirstSlide}
                    onChange={(e) => setIsFirstSlide(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span className="text-xs font-black text-amber-400">⭐ ১ম ব্যানার</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#38BDF8]"
                  />
                  <span className="text-xs font-bold text-slate-300">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
            >
              ✕ Close Form / ফর্ম বন্ধ করুন
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
            >
              {editingSlide ? 'Update Banner' : 'Publish Banner'}
            </button>
          </div>
        </form>
      )}

      {/* Banner Slides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedHeroSlides.map((slide, index) => {
          return (
            <div 
              key={slide.id}
              className={`bg-slate-800 rounded-2xl overflow-hidden border transition-all ${
                slide.active ? 'border-slate-700' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="relative h-44 bg-slate-900">
                {slide.mediaType === 'image' ? (
                  <img src={slide.mediaUrl} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400">
                    <Video className="w-8 h-8 text-[#38BDF8]" />
                  </div>
                )}
                
                <div 
                  className="absolute inset-0 bg-black"
                  style={{ opacity: slide.overlayOpacity ?? 0.4 }}
                />

                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="bg-slate-900/80 backdrop-blur-md text-sky-300 font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/40">
                    Position #{index + 1}
                  </span>
                  {slide.isFirstSlide && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      ⭐ 1st / Primary Banner
                    </span>
                  )}
                  {slide.badge && !slide.isFirstSlide && (
                    <span className="bg-amber-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {slide.badge}
                    </span>
                  )}
                  <span className="bg-slate-950/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    ⏱️ {slide.durationSeconds || storeConfig.heroAutoplaySpeedSeconds || 5}s
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-700/80 shadow-lg">
                  {/* Active Tick/Untick Checkbox */}
                  <label className="flex items-center gap-1 cursor-pointer px-1" title="টিকমার্ক দিলে ওয়েবসাইটে শো করবে, না হলে নাই">
                    <input 
                      type="checkbox"
                      checked={slide.active}
                      onChange={(e) => updateHeroSlide({ ...slide, active: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-[#38BDF8] cursor-pointer"
                    />
                    <span className={`text-[10px] font-black ${slide.active ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {slide.active ? 'Show' : 'Hide'}
                    </span>
                  </label>

                  <div className="w-[1px] h-3.5 bg-slate-700" />

                  {/* Direct Shop Now CTA Button Toggle */}
                  <label className="flex items-center gap-1 cursor-pointer px-1" title="Show or hide 'Shop Now' CTA button on this specific banner">
                    <input 
                      type="checkbox"
                      checked={slide.showCta !== false}
                      onChange={(e) => {
                        const nextShowCta = e.target.checked;
                        updateHeroSlide({ ...slide, showCta: nextShowCta });
                        showToast(`Banner #${index + 1} 'Shop Now' button ${nextShowCta ? 'Enabled' : 'Disabled'}!`, 'success');
                      }}
                      className="w-3.5 h-3.5 rounded accent-sky-400 cursor-pointer"
                    />
                    <span className={`text-[10px] font-black ${slide.showCta !== false ? 'text-sky-300' : 'text-slate-400'}`}>
                      🛍️ {slide.showCta !== false ? 'CTA On' : 'CTA Off'}
                    </span>
                  </label>

                  <div className="w-[1px] h-3.5 bg-slate-700" />

                  {/* Move Up / Down */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveSlide(index, 'up')}
                    className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
                    title="Move Up"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    disabled={index === heroSlides.length - 1}
                    onClick={() => handleMoveSlide(index, 'down')}
                    className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
                    title="Move Down"
                  >
                    ⬇️
                  </button>

                  <button
                    onClick={() => handleStartEdit(slide)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSlideToDelete({ id: slide.id, title: slide.title })}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-extrabold text-sm leading-tight drop-shadow font-['Outfit']">{slide.title}</h4>
                  <p className="text-[11px] text-slate-200 truncate drop-shadow">{slide.subtitle}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-700/60">
                <span className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#38BDF8]" />
                  <span>Category: {slide.categoryLink || 'All'}</span>
                </span>

                {!slide.isFirstSlide ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimarySlide(slide)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    ⭐ ১ম/প্রধান ব্যানার করুন
                  </button>
                ) : (
                  <span className="text-[11px] font-black text-amber-400 flex items-center gap-1">
                    ⭐ প্রধান ব্যানার (Active First)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!slideToDelete}
        title="Delete Banner Slide?"
        message={`Are you sure you want to permanently delete the banner "${slideToDelete?.title}"? It will be immediately removed from the customer carousel.`}
        confirmLabel="Yes, Delete Banner"
        onConfirm={confirmDeleteSlide}
        onCancel={() => setSlideToDelete(null)}
      />
    </div>
  );
};
