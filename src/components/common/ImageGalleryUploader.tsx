import React, { useRef, useState } from 'react';
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage, deleteImageFromStorage } from '../../storageService';

interface ImageGalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageGalleryUploader: React.FC<ImageGalleryUploaderProps> = ({
  images,
  onChange,
  maxImages = 12,
  label = "Product Image Gallery",
  helperText = "Upload high-resolution photos (Recommended: 1200x1200px to 2000x2000px in JPG/PNG/WebP) for crystal clear zoom & storefront display. First photo is the Main Featured thumbnail."
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage('');

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsProcessing(true);
    try {
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const uploadPromises = filesToProcess.map(async (file) => {
        try {
          return await uploadImageToStorage(file, 'products');
        } catch (fileErr) {
          console.error("Individual file upload error:", fileErr);
          return '';
        }
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.filter((url): url is string => Boolean(url && url.length > 0));

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      } else {
        setErrorMessage('Failed to process selected photos. Please try another image or paste an image URL.');
      }
    } catch (err: any) {
      console.error("Image processing error", err);
      setErrorMessage(err?.message || "Error optimizing photos");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (images.length >= maxImages) {
      setErrorMessage(`Maximum ${maxImages} images reached.`);
      return;
    }
    setErrorMessage('');
    setUrlInput('');
    setIsProcessing(true);
    try {
      const safeUrl = await uploadImageToStorage(trimmed, 'products');
      if (safeUrl) {
        onChange([...images, safeUrl]);
      } else {
        setErrorMessage('Unable to process the provided image URL.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const toRemoveUrl = images[indexToRemove];
    if (toRemoveUrl) {
      deleteImageFromStorage(toRemoveUrl).catch(console.warn);
    }
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetMain = (indexToPromote: number) => {
    if (indexToPromote === 0) return;
    const selected = images[indexToPromote];
    const rest = images.filter((_, idx) => idx !== indexToPromote);
    onChange([selected, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-3 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-700/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
            {label} ({images.length}/{maxImages})
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
        </div>

        {/* Direct Device Gallery File Picker Button */}
        <div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{isProcessing ? 'Optimizing photos...' : '📸 Upload from Device'}</span>
          </button>
        </div>
      </div>

      {/* Direct Image URL input bar */}
      <div className="flex items-center gap-2 pt-1">
        <input 
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
          placeholder="Or paste direct image URL (https://...)"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#38BDF8]"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-colors shrink-0"
        >
          + Add URL
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Drop / Upload Zone if empty */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-[#38BDF8] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-800/40 hover:bg-slate-800/80 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#38BDF8] group-hover:scale-110 transition-all mb-3 border border-slate-700 shadow-md">
            {isProcessing ? <Loader2 className="w-7 h-7 animate-spin text-[#38BDF8]" /> : <Upload className="w-7 h-7" />}
          </div>
          <p className="text-sm font-bold text-slate-200">
            {isProcessing ? 'Optimizing & compressing photos...' : 'ক্লিক করুন এবং সরাসরি ডিভাইস গ্যালারি থেকে ছবি সিলেক্ট করুন'}
          </p>
          <p className="text-xs text-[#38BDF8] font-semibold mt-1">
            (একাধিক ছবি একবারে সিলেক্ট করতে পারবেন • JPG, PNG, WEBP)
          </p>
        </div>
      ) : (
        /* Image Grid with Thumbnails, Reorder, Delete and Set Main actions */
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
            {images.map((imgUrl, index) => {
              const isMain = index === 0;

              return (
                <div 
                  key={`${imgUrl.slice(0, 30)}-${index}`}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-slate-950 ${
                    isMain ? 'border-[#38BDF8] shadow-lg shadow-sky-500/20' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="aspect-square w-full">
                    <img 
                      src={imgUrl} 
                      alt={`Product thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Image Badge */}
                  {isMain ? (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#38BDF8] text-slate-900 font-extrabold text-[9px] flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-slate-900" />
                      <span>MAIN</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMain(index)}
                      className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-white hover:bg-[#38BDF8] hover:text-slate-900 font-bold text-[9px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Set as Main Featured Image"
                    >
                      Set Main
                    </button>
                  )}

                  {/* Top Right Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom Reorder Controls */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-xs rounded-lg p-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'left')}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] text-slate-400 font-mono">#{index + 1}</span>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isProcessing || images.length >= maxImages}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#38BDF8] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ আরও ছবি গ্যালারি থেকে যোগ করুন ({images.length}/{maxImages})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
