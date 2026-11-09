import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getVariationColor, getVariationSize } from '../utils/stockHelper';
import { 
  X, 
  ShoppingBag, 
  Heart, 
  MessageSquare, 
  Play, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Star,
  Upload,
  Flame,
  Zap,
  Plus,
  Minus,
  Trash2,
  PackageCheck,
  AlertCircle,
  ZoomIn
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CartItem, ProductVariation } from '../types/store';
import { compressImage } from '../utils/imageCompressor';
import { Header } from './Header';
import { Footer } from './Footer';
import { useToast } from './common/Toast';
import { ReviewImageLightbox } from './common/ReviewImageLightbox';

export const ProductModal: React.FC = () => {
  const { 
    selectedProduct: _selectedProduct, 
    variantModalProduct,
    setSelectedProduct, 
    closeVariantModal,
    addToCart, 
    setIsCartOpen,
    setIsCheckoutOpen,
    toggleWishlist, 
    isInWishlist, 
    storeConfig, 
    products, 
    reviews,
    addReview,
    setDirectCheckoutItem,
    setDirectCheckoutItems,
    openOrderPolicyModal,
    getProductStockStatus
  } = useStore();

  const selectedProduct = variantModalProduct || _selectedProduct;

  const { showToast } = useToast();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // SkyBuyBD-Style Inline Variant Selection State
  const availableColors = selectedProduct?.colors || [];
  const availableSizes = selectedProduct?.sizes || [];
  const hasVariations = !!(selectedProduct?.variations && selectedProduct.variations.length > 0);
  const variations = selectedProduct?.variations || [];
  const showColorSection = selectedProduct?.hasColorVariants !== false && availableColors.length > 0;

  // Comprehensive image list for modal: combines main product photos, all color variant photos, and galleries
  const modalImages = useMemo(() => {
    if (!selectedProduct) return [];
    const list: string[] = [];
    if (selectedProduct.images && selectedProduct.images.length > 0) {
      list.push(...selectedProduct.images);
    }
    // Also include color specific images if not already in list
    (selectedProduct.colors || []).forEach(c => {
      if (c.image && !list.includes(c.image)) {
        list.push(c.image);
      }
      if (Array.isArray(c.gallery)) {
        c.gallery.forEach(g => {
          if (g && !list.includes(g)) list.push(g);
        });
      }
    });
    // Include variations images if any
    (selectedProduct.variations || []).forEach(v => {
      const vImg = (v as any).image;
      if (vImg && !list.includes(vImg)) {
        list.push(vImg);
      }
    });
    return list.length > 0 ? list : [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800"
    ];
  }, [selectedProduct?.images, selectedProduct?.colors, selectedProduct?.variations]);

  const [activeColor, setActiveColor] = useState<string>('');
  const [variantQuantities, setVariantQuantities] = useState<Record<string, number>>({});
  const [stockNotice, setStockNotice] = useState<string | null>(null);

  // Review Submission State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5.0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Review Image Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openReviewLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Helper: total stock for any color
  const getColorTotalStock = (colName: string): number => {
    if (hasVariations && variations.length > 0) {
      return variations
        .filter(v => {
          const vCol = getVariationColor(v.combination);
          return !colName || !vCol || vCol === colName;
        })
        .reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    const found = availableColors.find(c => c.name === colName);
    return found?.stock !== undefined ? found.stock : (selectedProduct?.stock ?? 10);
  };

  const handleBackToStore = () => {
    setSelectedProduct(null);
    closeVariantModal();

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('product');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch (e) {
        // ignore history error
      }

      const savedY = sessionStorage.getItem('rycreo_return_scroll_y');
      const savedProdId = sessionStorage.getItem('rycreo_return_product_id');
      if (savedY !== null) {
        const targetY = parseInt(savedY, 10);
        const restore = () => {
          if (savedProdId) {
            const el = document.getElementById(`product-card-${savedProdId}`);
            if (el) {
              el.scrollIntoView({ block: 'center', behavior: 'instant' });
              return;
            }
          }
          window.scrollTo({ top: targetY, behavior: 'instant' });
        };
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 60);
          setTimeout(restore, 180);
          sessionStorage.removeItem('rycreo_return_scroll_y');
          sessionStorage.removeItem('rycreo_return_product_id');
        });
      }
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTo(0, 0);
      }
      setActiveMediaIndex(0);
      setShowVideoModal(false);
      setShowReviewForm(false);
      setReviewSuccess(false);
      setShowAllReviews(false);
      setReviewImages([]);
      setReviewRating(5.0);
      setVariantQuantities({});
      setStockNotice(null);

      // Find first enabled color that is strictly IN STOCK
      const enabledCols = availableColors.filter(c => c.enabled !== false);
      const inStockCol = enabledCols.find(c => getColorTotalStock(c.name) > 0);
      const defaultCol = inStockCol ? inStockCol.name : (enabledCols[0]?.name || '');
      setActiveColor(defaultCol);

      // Default: auto-select 1 unit of first in-stock variant or size for THAT in-stock color
      if (defaultCol && getColorTotalStock(defaultCol) > 0) {
        if (hasVariations && variations.length > 0) {
          const colorVars = variations.filter(v => {
            const vCol = getVariationColor(v.combination);
            return !vCol || vCol === defaultCol;
          });
          const firstInStock = colorVars.find(v => (v.stock || 0) > 0);
          if (firstInStock) {
            const colVal = getVariationColor(firstInStock.combination) || defaultCol;
            const sizeVal = getVariationSize(firstInStock.combination) || 'default';
            const key = `${colVal}__${sizeVal}`;
            setVariantQuantities({ [key]: 1 });
          }
        } else if (availableSizes.length > 0) {
          const inStockSize = availableSizes.find(s => s.stock > 0);
          if (inStockSize) {
            const key = `${defaultCol}__${inStockSize.size}`;
            setVariantQuantities({ [key]: 1 });
          }
        } else {
          const initialStock = selectedProduct.stock ?? 10;
          if (initialStock > 0) {
            const key = `${defaultCol}__default`;
            setVariantQuantities({ [key]: 1 });
          }
        }
      }
    }
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (stockNotice) {
      const timer = setTimeout(() => setStockNotice(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [stockNotice]);

  // Automatically swift/switch main modal photo when activeColor changes
  useEffect(() => {
    if (!activeColor || modalImages.length === 0) return;
    const foundCol = availableColors.find(c => c.name.toLowerCase() === activeColor.toLowerCase());
    const targetImg = foundCol?.image || (foundCol?.gallery && foundCol.gallery[0]);
    if (targetImg) {
      const imgIdx = modalImages.findIndex(img => img === targetImg);
      if (imgIdx !== -1) {
        setActiveMediaIndex(imgIdx);
        setShowVideoModal(false);
      }
    }
  }, [activeColor, availableColors, modalImages]);

  if (!selectedProduct) return null;

  const isWishlisted = isInWishlist(selectedProduct.id);

  // Helper: Retrieve combination details
  const getCombinationDetails = (colorName: string, sizeName: string) => {
    const cleanCol = colorName || undefined;
    const cleanSz = sizeName || undefined;

    if (hasVariations && variations.length > 0) {
      const matched = variations.find(v => {
        const vCol = getVariationColor(v.combination);
        const vSz = getVariationSize(v.combination);
        const matchesColor = !cleanCol || !vCol || vCol === cleanCol;
        const matchesSize = !cleanSz || !vSz || vSz === cleanSz;
        return matchesColor && matchesSize;
      });

      if (matched) {
        return {
          stock: matched.stock,
          price: matched.salePrice || matched.price,
          regularPrice: matched.price,
          variation: matched
        };
      }
    }

    let stock = selectedProduct.stock ?? 10;
    if (cleanSz && availableSizes.length > 0) {
      const szObj = availableSizes.find(s => s.size === cleanSz);
      if (szObj) stock = szObj.stock;
    } else if (cleanCol && availableColors.length > 0) {
      const colObj = availableColors.find(c => c.name === cleanCol);
      if (colObj && colObj.stock !== undefined) stock = colObj.stock;
    }

    const price = selectedProduct.salePrice > 0 ? selectedProduct.salePrice : selectedProduct.price;
    return {
      stock,
      price,
      regularPrice: selectedProduct.price,
      variation: undefined
    };
  };

  // Available sizes for active color
  const currentSizes = useMemo(() => {
    let activeColorStock = 0;
    if (hasVariations && variations.length > 0) {
      const matched = variations.filter(v => {
        const vCol = getVariationColor(v.combination);
        return !activeColor || !vCol || vCol === activeColor;
      });
      activeColorStock = matched.reduce((sum, v) => sum + (v.stock || 0), 0);
    } else {
      const col = availableColors.find(c => c.name === activeColor);
      activeColorStock = col?.stock !== undefined ? col.stock : (selectedProduct.stock ?? 10);
    }

    if (activeColorStock <= 0 && hasVariations && variations.length > 0) {
      const totalVarStock = variations.reduce((sum, v) => sum + (v.stock || 0), 0);
      if (totalVarStock > 0 && !activeColor) {
        activeColorStock = totalVarStock;
      }
    }

    if (activeColorStock <= 0 && availableSizes.length === 0 && (!hasVariations || variations.length === 0)) {
      if ((selectedProduct.stock ?? 10) > 0) {
        activeColorStock = selectedProduct.stock ?? 10;
      }
    }

    if (activeColorStock <= 0) return [];

    if (hasVariations && variations.length > 0) {
      const matchingVars = variations.filter(v => {
        const vCol = getVariationColor(v.combination);
        if (!showColorSection || !activeColor) return true;
        return !vCol || vCol === activeColor;
      });

      const extractedSizes: string[] = [];
      matchingVars.forEach(v => {
        const s = getVariationSize(v.combination);
        if (s && !extractedSizes.includes(s)) {
          extractedSizes.push(s);
        }
      });

      if (extractedSizes.length > 0) {
        return extractedSizes.map(sz => {
          const { stock, price, regularPrice, variation } = getCombinationDetails(activeColor, sz);
          return { size: sz, stock, price, regularPrice, variation };
        });
      } else if (matchingVars.length > 0) {
        return matchingVars.map((v, idx) => {
          const sz = getVariationSize(v.combination) || `Variant ${idx + 1}`;
          return { size: sz, stock: v.stock || 0, price: v.salePrice || v.price, regularPrice: v.price, variation: v };
        });
      }
    }

    if (availableSizes.length > 0) {
      return availableSizes.map(s => {
        const { stock, price, regularPrice, variation } = getCombinationDetails(activeColor, s.size);
        return { size: s.size, stock, price, regularPrice, variation };
      });
    }

    const { stock, price, regularPrice, variation } = getCombinationDetails(activeColor, '');
    return [{ size: 'Standard / Free Size', stock, price, regularPrice, variation }];
  }, [selectedProduct, activeColor, showColorSection, hasVariations, variations, availableSizes, availableColors]);

  // Stepper quantity handlers
  const handleSetQuantity = (colorName: string, sizeName: string, desiredQty: number, maxStock: number) => {
    const key = `${colorName || 'default'}__${sizeName || 'default'}`;
    if (desiredQty <= 0) {
      setVariantQuantities(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    if (desiredQty > maxStock) {
      setStockNotice('Stock limit reached! Maximum available stock reached for this variant.');
      setVariantQuantities(prev => ({
        ...prev,
        [key]: maxStock
      }));
      return;
    }

    setVariantQuantities(prev => ({
      ...prev,
      [key]: desiredQty
    }));
  };

  const handleIncrement = (colorName: string, sizeName: string, maxStock: number) => {
    const key = `${colorName || 'default'}__${sizeName || 'default'}`;
    const current = variantQuantities[key] || 0;
    if (maxStock <= 0) {
      setStockNotice('This variant is currently Stock Out!');
      return;
    }
    if (current >= maxStock) {
      setStockNotice('Stock limit reached! Maximum available stock reached for this variant.');
      return;
    }
    setVariantQuantities(prev => ({
      ...prev,
      [key]: current + 1
    }));
  };

  const handleDecrement = (colorName: string, sizeName: string) => {
    const key = `${colorName || 'default'}__${sizeName || 'default'}`;
    const current = variantQuantities[key] || 0;
    if (current <= 1) {
      setVariantQuantities(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setVariantQuantities(prev => ({
        ...prev,
        [key]: current - 1
      }));
    }
  };

  const handleRemoveKey = (key: string) => {
    setVariantQuantities(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Compiled Cart Items across all colors and sizes
  const selectedLineItems: CartItem[] = useMemo(() => {
    const list: CartItem[] = [];

    Object.entries(variantQuantities).forEach(([key, qty]) => {
      if (qty > 0) {
        const [col, sz] = key.split('__');
        const cleanCol = col === 'default' ? undefined : col;
        const cleanSz = (sz === 'default' || sz === 'Standard / Free Size') ? undefined : sz;

        const { price, variation } = getCombinationDetails(cleanCol || '', cleanSz || '');

        list.push({
          productId: selectedProduct.id,
          product: selectedProduct,
          selectedSize: cleanSz,
          selectedColor: cleanCol,
          quantity: qty,
          price,
          selectedVariation: variation
        });
      }
    });

    return list;
  }, [variantQuantities, selectedProduct]);

  const totalSelectedUnits = selectedLineItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalBillAmount = selectedLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Active color preview image
  const activeColorImage = activeColor && availableColors.find(c => c.name === activeColor)?.image
    ? availableColors.find(c => c.name === activeColor)?.image!
    : selectedProduct.images[0];

  const stockInfo = useMemo(() => {
    return getProductStockStatus(selectedProduct, activeColor);
  }, [getProductStockStatus, selectedProduct, activeColor]);

  const { totalStock: totalProductStock, isOutOfStock: isProductOutOfStock, isLowStock: isProductLowStock, badgeText: stockBadgeText, badgeClass: stockBadgeClass } = stockInfo;

  const hasDiscount = selectedProduct.salePrice > 0 && selectedProduct.salePrice < selectedProduct.price;
  const discountPercent = hasDiscount 
    ? Math.round(((selectedProduct.price - selectedProduct.salePrice) / selectedProduct.price) * 100) 
    : 0;

  // Prominent dynamic discount badge (e.g. "50% OFF", "50% off", or calculated "-50% OFF")
  const displayedDiscountBadge = useMemo(() => {
    if (selectedProduct.discountBadge && selectedProduct.discountBadge.trim()) {
      return selectedProduct.discountBadge.trim();
    }
    if (hasDiscount && discountPercent > 0) {
      return `-${discountPercent}% OFF`;
    }
    return null;
  }, [selectedProduct.discountBadge, hasDiscount, discountPercent]);

  const displayedSold = (selectedProduct.baseSoldCount ?? (selectedProduct.soldCount ?? 0)) + (selectedProduct.realSalesCount ?? 0);

  const handleAddToCartAll = () => {
    if (selectedLineItems.length === 0) {
      setStockNotice("Please select at least 1 unit of any variant to add to cart!");
      return;
    }

    selectedLineItems.forEach(item => {
      addToCart(item.product, item.selectedSize, item.quantity, item.selectedColor, item.selectedVariation);
    });

    showToast(`🛒 Successfully added ${totalSelectedUnits} item(s) to Cart!`, 'success');
  };

  const handleProceedToCheckout = () => {
    if (selectedLineItems.length === 0) {
      setStockNotice("Please select at least 1 unit of any variant to proceed to checkout!");
      return;
    }

    setDirectCheckoutItem(selectedLineItems[0]);
    setDirectCheckoutItems(selectedLineItems);

    setIsCartOpen(false);
    setSelectedProduct(null);
    closeVariantModal();
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppOrder = () => {
    const variationDetails = selectedLineItems.map(item => {
      const parts = [item.selectedColor, item.selectedSize].filter(Boolean).join(' ');
      return `${parts ? `[${parts}]` : 'Standard'} × ${item.quantity}`;
    }).join(', ');

    const message = encodeURIComponent(
      `Hi ${storeConfig.storeName}! I want to order:\n\n*Product:* ${selectedProduct.title}\n*Selections:* ${variationDetails || 'Standard'} \n*Total Qty:* ${totalSelectedUnits} pcs\n*Total Price:* ৳${totalBillAmount}\n*Product Code:* ${selectedProduct.productCode || selectedProduct.sku || selectedProduct.id}\n\nPlease confirm availability and delivery!`
    );
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleWhatsAppChat = () => {
    const code = selectedProduct.productCode || selectedProduct.sku || selectedProduct.id;
    const tagline = selectedProduct.tagline || selectedProduct.tag || "Premium Quality Collection";
    const imgUrl = selectedProduct.images[0] || "";

    const text = `Assalamu Alaikum! I am inquiring about this product:

*Product:* ${selectedProduct.title}
*Product Code/No:* ${code}
*Tagline:* ${tagline}
*Price:* ৳${selectedProduct.salePrice > 0 ? selectedProduct.salePrice : selectedProduct.price}
*Product Image:* ${imgUrl}

Please let me know if this is available and any details about pricing/delivery!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${storeConfig.whatsappNumber}?text=${encoded}`, '_blank');
  };

  const handleReviewPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const file = files[0];
      const compressed = await compressImage(file, 800, 0.85);
      if (!reviewImages.includes(compressed)) {
        setReviewImages(prev => [...prev, compressed].slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    addReview({
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      customerName: reviewerName.trim(),
      rating: parseFloat(Number(reviewRating).toFixed(1)),
      comment: reviewComment.trim(),
      images: reviewImages.length > 0 ? reviewImages : undefined,
      status: 'approved'
    });

    setReviewSuccess(true);
    setReviewerName('');
    setReviewComment('');
    setReviewImages([]);
    setReviewRating(5.0);
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSuccess(false);
    }, 2000);
  };

  const approvedReviews = React.useMemo(() => {
    return reviews
      .filter(r => r.productId === selectedProduct.id && r.status === 'approved')
      .sort((a, b) => {
        // 1. Admin priority order if configured
        const posA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 9999);
        const posB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 9999);
        if (posA !== posB) {
          return posA - posB;
        }
        // 2. Default to Latest Review First (newest submitted review goes straight to the top)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [reviews, selectedProduct.id]);
  const calculatedRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div ref={modalContainerRef} className="min-h-screen w-full bg-[#F8FAFC] text-[#1E293B] flex flex-col relative animate-fade-in overflow-y-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:rounded-2xl bg-white border-b sm:border border-slate-100 shrink-0 shadow-2xs select-none">
          <button
            type="button"
            onClick={handleBackToStore}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-slate-200 text-xs font-extrabold text-slate-800 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <span>← Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold text-xs shadow-md cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBackToStore}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all cursor-pointer text-xs font-bold active:scale-95"
              title="Close Product View"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split */}
        <div className="bg-white sm:rounded-3xl sm:border border-slate-100 p-0 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 lg:gap-10">
          
          {/* Left Column: Media Gallery - Edge-to-Edge Full-Width Square Layout */}
          <div className="md:col-span-7 flex flex-col md:flex-row gap-0 md:gap-4">
            
            {/* Desktop Left Vertical Thumbnails */}
            <div className="hidden md:flex flex-col gap-2.5 shrink-0 w-16 overflow-y-auto max-h-[520px] scrollbar-none">
              {modalImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setShowVideoModal(false);
                    setActiveMediaIndex(idx);
                  }}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                    !showVideoModal && activeMediaIndex === idx 
                      ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm scale-102' 
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {selectedProduct.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className={`w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-1 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                    showVideoModal 
                      ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm scale-102' 
                      : 'border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Play className="w-5 h-5 text-[#38BDF8] fill-[#38BDF8]" />
                  <span className="text-[9px] font-bold uppercase">Video</span>
                </button>
              )}
            </div>

            {/* Main Interactive Display Image - Edge-to-Edge Daraz/MoveOn Style */}
            <div className="flex-1 w-full">
              <div 
                className="relative aspect-square w-full sm:rounded-2xl bg-slate-900/5 overflow-hidden sm:border border-slate-100 group select-none"
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const deltaX = e.changedTouches[0].clientX - touchStartX.current;
                  touchStartX.current = null;
                  if (deltaX > 40 && modalImages.length > 1) {
                    setActiveMediaIndex(prev => (prev - 1 + modalImages.length) % modalImages.length);
                  } else if (deltaX < -40 && modalImages.length > 1) {
                    setActiveMediaIndex(prev => (prev + 1) % modalImages.length);
                  }
                }}
              >
                {showVideoModal && selectedProduct.videoUrl ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <iframe
                      src={`${selectedProduct.videoUrl}?autoplay=1`}
                      title={selectedProduct.title}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                    />
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(false)}
                      className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md z-20 cursor-pointer"
                    >
                      ← Back to Photos
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      key={modalImages[activeMediaIndex] || 'modal-img'}
                      src={modalImages[activeMediaIndex] || modalImages[0]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover object-center transition-all duration-300 ease-in-out"
                    />

                    {modalImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveMediaIndex(prev => (prev - 1 + modalImages.length) % modalImages.length)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-md cursor-pointer z-10 text-base font-bold active:scale-95"
                          aria-label="Previous Image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMediaIndex(prev => (prev + 1) % modalImages.length)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-md cursor-pointer z-10 text-base font-bold active:scale-95"
                          aria-label="Next Image"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Slide Counter Badge (Daraz / MoveOn Style) */}
                    {modalImages.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none select-none tracking-wider shadow-sm z-10">
                        {activeMediaIndex + 1} / {modalImages.length}
                      </div>
                    )}
                  </>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                  {selectedProduct.isPujaSpecial && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[11px] font-extrabold uppercase shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" /> PUJA SPECIAL
                    </span>
                  )}
                  {displayedDiscountBadge && (
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg animate-pulse-subtle">
                      {displayedDiscountBadge}
                    </span>
                  )}
                  {displayedSold > 0 ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-amber-400 text-[11px] font-black tracking-wide border border-amber-500/30 shadow-lg">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> {displayedSold} Sold
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Clean Thumbnail Strip Beneath Image (Edge-to-Edge Scrollable on Mobile) */}
              <div className="flex items-center gap-2.5 overflow-x-auto px-4 sm:px-0 py-3 scrollbar-none">
                {modalImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setShowVideoModal(false);
                      setActiveMediaIndex(idx);
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                      !showVideoModal && activeMediaIndex === idx 
                        ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm scale-102' 
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}

                {selectedProduct.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5 border-2 transition-all shrink-0 aspect-square cursor-pointer ${
                      showVideoModal 
                        ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-sm scale-102' 
                        : 'border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Play className="w-4 h-4 text-[#38BDF8] fill-[#38BDF8]" />
                    <span className="text-[8px] font-bold uppercase">Video</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Variant Selection */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6 px-4 py-4 sm:px-0 sm:py-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-[#334155] text-xs font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.subcategory && (
                    <span className="text-xs text-slate-500 font-medium">/ {selectedProduct.subcategory}</span>
                  )}
                </div>

                <button
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`p-2 rounded-full border transition-colors ${
                    isWishlisted 
                      ? 'bg-rose-50 border-rose-200 text-rose-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Title & Code */}
              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight font-['Outfit']">
                {selectedProduct.title}
              </h2>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Product Code: <strong className="font-mono text-slate-800">{selectedProduct.productCode || selectedProduct.sku || selectedProduct.id}</strong></span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stockBadgeClass}`}>
                  {stockBadgeText}
                </span>
              </div>

              {/* Price & Free Delivery */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center flex-wrap gap-3">
                  {selectedProduct.isFreeShipping && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 text-xs font-black text-emerald-700 shadow-2xs">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Free Delivery</span>
                    </div>
                  )}
                  <span className="text-3xl font-black text-[#1E293B]">
                    ৳{selectedProduct.salePrice > 0 ? selectedProduct.salePrice : selectedProduct.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-slate-400 line-through font-semibold">
                      ৳{selectedProduct.price}
                    </span>
                  )}
                  {displayedDiscountBadge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm">
                      {displayedDiscountBadge}
                    </span>
                  )}
                </div>

                {calculatedRating !== null && (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{calculatedRating}</span>
                  </div>
                )}
              </div>

              {/* Stock Notice Alert */}
              {stockNotice && (
                <div className="p-2.5 rounded-xl bg-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-md animate-bounce">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-200" />
                  <span>{stockNotice}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* SKYBUYBD INLINE SECTION 1: COLOR GRID                    */}
              {/* ======================================================== */}
              {showColorSection && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>1. Select Color:</span>
                      <span className="text-[#38BDF8] font-black">{activeColor || 'None'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">{availableColors.length} Colors</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableColors.filter(c => c.enabled !== false).map((col, idx) => {
                      const isActive = activeColor === col.name;
                      const colorStock = getColorTotalStock(col.name);
                      const isColOutOfStock = colorStock <= 0;

                      const chosenUnitsInColor = Object.entries(variantQuantities).reduce((sum, [key, qty]) => {
                        const [c] = key.split('__');
                        return c === col.name ? sum + qty : sum;
                      }, 0);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isColOutOfStock}
                          onClick={() => {
                            if (isColOutOfStock) return;
                            setActiveColor(col.name);
                            const targetImg = col.image || (col.gallery && col.gallery[0]);
                            if (targetImg) {
                              const imgIdx = modalImages.findIndex(img => img === targetImg);
                              if (imgIdx !== -1) {
                                setActiveMediaIndex(imgIdx);
                                setShowVideoModal(false);
                              }
                            }
                          }}
                          className={`p-2.5 rounded-2xl border text-left transition-all relative flex items-center gap-2.5 ${
                            isColOutOfStock 
                              ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                              : isActive
                                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-sky-400 shadow-md cursor-pointer'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                          }`}
                        >
                          {/* Display both Original Color Swatch Tone AND Gallery Image Thumbnail */}
                          <div className="relative shrink-0">
                            {col.image ? (
                              <img 
                                src={col.image} 
                                alt={col.name} 
                                className={`w-11 h-11 object-cover rounded-xl border border-slate-200 bg-white shadow-2xs ${isColOutOfStock ? 'grayscale opacity-60' : ''}`} 
                              />
                            ) : (
                              <div 
                                className="w-11 h-11 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center" 
                                style={{ backgroundColor: isColOutOfStock ? '#94a3b8' : (col.hex || '#000') }}
                              >
                                {isActive && <Check className="w-5 h-5 text-white" />}
                              </div>
                            )}

                            {/* Physical color swatch dot indicator */}
                            <div 
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ring-1 ring-slate-300"
                              style={{ backgroundColor: col.hex || '#000000' }}
                              title={`Tone: ${col.hex || 'Standard'}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className={`font-extrabold text-xs truncate ${isColOutOfStock ? 'line-through text-slate-400' : ''}`}>
                              {col.name}
                            </p>
                            <p className={`text-[9px] font-bold ${colorStock <= 0 ? 'text-rose-600' : (colorStock <= (selectedProduct.lowStockThreshold || 5) ? 'text-amber-600' : 'text-emerald-600')}`}>
                              {colorStock <= 0 ? 'Out of Stock' : (colorStock <= (selectedProduct.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock')}
                            </p>
                          </div>

                          {chosenUnitsInColor > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                              {chosenUnitsInColor}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SKYBUYBD INLINE SECTION 2: SIZE & QUANTITY TABLE          */}
              {/* ======================================================== */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    {showColorSection ? '2. Select Sizes & Quantities:' : '1. Select Sizes & Quantities:'}
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold">{currentSizes.length} Size Option(s)</span>
                </div>

                {/* If selected color is completely Out of Stock or no sizes available */}
                {(activeColor && getColorTotalStock(activeColor) <= 0) || currentSizes.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2 my-2">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600 font-black">
                      ✕
                    </div>
                    <p className="text-sm font-black text-rose-900">
                      {activeColor ? `Color "${activeColor}" is Currently Out of Stock` : 'Currently Out of Stock'}
                    </p>
                    <p className="text-xs text-rose-600 max-w-sm mx-auto">
                      All sizes for this color are sold out. Please select an active available color above or check back later!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Size</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Quantity / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentSizes.map((rowItem, idx) => {
                          const colKey = activeColor || 'default';
                          const szKey = rowItem.size || 'default';
                          const comboKey = `${colKey}__${szKey}`;
                          const currentQty = variantQuantities[comboKey] || 0;
                          const isOutOfStock = rowItem.stock <= 0;
                          const isLowStock = rowItem.stock > 0 && rowItem.stock <= (selectedProduct.lowStockThreshold || 5);
                          const isLimitReached = currentQty >= rowItem.stock && rowItem.stock > 0;

                          return (
                            <tr 
                              key={idx}
                              className={`transition-colors ${currentQty > 0 ? 'bg-sky-50/70 font-semibold' : isOutOfStock ? 'opacity-60 bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-1 rounded-lg font-extrabold text-xs ${isOutOfStock ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'}`}>
                                  {rowItem.size}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <span className="font-black font-mono text-rose-600 text-xs">
                                  ৳{rowItem.price}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                {isOutOfStock ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 uppercase">
                                    Out of Stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-50">
                                    In Stock
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right">
                                {isOutOfStock ? (
                                  <span className="px-2 py-1 rounded-md text-[10px] font-extrabold text-rose-500 bg-rose-50 border border-rose-200">
                                    Out of Stock
                                  </span>
                                ) : currentQty === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleIncrement(activeColor, rowItem.size, rowItem.stock)}
                                    className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-500 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    <div className="inline-flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleDecrement(activeColor, rowItem.size)}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-800 hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
                                      >
                                        {currentQty === 1 ? <Trash2 className="w-3 h-3 text-rose-500" /> : <Minus className="w-3 h-3" />}
                                      </button>

                                      <input
                                        type="number"
                                        min={1}
                                        max={rowItem.stock}
                                        value={currentQty}
                                        onChange={(e) => handleSetQuantity(activeColor, rowItem.size, Number(e.target.value), rowItem.stock)}
                                        className="w-8 text-center font-black font-mono text-xs text-slate-900 outline-none bg-transparent"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => handleIncrement(activeColor, rowItem.size, rowItem.stock)}
                                        disabled={isLimitReached}
                                        className={`w-6 h-6 flex items-center justify-center rounded font-black ${isLimitReached ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#38BDF8] text-slate-950 hover:bg-sky-500 cursor-pointer'}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <span className="font-mono font-black text-xs text-slate-900 min-w-[45px] text-right">
                                      ৳{rowItem.price * currentQty}
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* ITEMIZED SUMMARY CHIPS                                   */}
              {/* ======================================================== */}
              {selectedLineItems.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-extrabold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-emerald-600" />
                      <span>Selected Items ({totalSelectedUnits} pcs):</span>
                    </span>
                    <span className="font-mono text-rose-600 font-black text-sm">
                      ৳{totalBillAmount}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLineItems.map((item, idx) => {
                      const key = `${item.selectedColor || 'default'}__${item.selectedSize || 'default'}`;
                      return (
                        <div key={idx} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-lg text-xs border border-slate-200 shadow-2xs">
                          <span>{[item.selectedColor, item.selectedSize].filter(Boolean).join(' - ') || 'Standard'}:</span>
                          <strong className="font-mono text-rose-600">×{item.quantity}</strong>
                          <button onClick={() => handleRemoveKey(key)} className="p-0.5 hover:bg-rose-100 rounded-full text-rose-600 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (Add to Cart, Buy Now, WhatsApp) */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (totalSelectedUnits === 0) {
                      showToast("Please select at least one product!", 'error');
                      return;
                    }
                    handleProceedToCheckout();
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer ring-2 ring-amber-400/30 animate-pulse"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>BUY NOW {totalBillAmount > 0 ? `(৳${totalBillAmount})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (totalSelectedUnits === 0) {
                      showToast("Please select at least one product!", 'error');
                      return;
                    }
                    handleAddToCartAll();
                  }}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(2,6,23,0.3)] transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.01] active:scale-[0.98] animate-pulse"
                >
                  <ShoppingBag className="w-4 h-4 text-sky-400" />
                  <span>ADD TO CART {totalSelectedUnits > 0 ? `(${totalSelectedUnits})` : ''}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-white text-emerald-600 animate-pulse" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Description & Reviews */}
        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200 space-y-6 rounded-3xl">
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-['Outfit'] border-b border-slate-200 pb-2">
              Full Product Description & Highlights
            </h3>
            <div 
              className="text-xs sm:text-sm text-slate-700 leading-relaxed prose prose-slate max-w-none bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
              dangerouslySetInnerHTML={{ __html: selectedProduct.description || 'No detailed description provided.' }}
            />
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200 space-y-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                Customer Reviews & Ratings ({approvedReviews.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Genuine buyer feedback and photos.</p>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm self-start cursor-pointer"
            >
              {showReviewForm ? 'Cancel Review' : '+ Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Rating: {typeof reviewRating === 'number' ? reviewRating.toFixed(1) : '5.0'} *</label>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    {typeof reviewRating === 'number' ? reviewRating.toFixed(1) : '5.0'} / 5.0
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseFloat(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 transition-all shadow-inner"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1.5">
                  <span>1.0 (Low)</span>
                  <span>5.0 (Excellent)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Review *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with the fabric, fitting and delivery..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Upload Photo (Optional)</label>
                  {isUploadingPhoto && (
                    <span className="text-[10px] text-sky-600 font-bold animate-pulse">Processing image...</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={reviewImages.length >= 3 || isUploadingPhoto}
                  onChange={(e) => handleReviewPhotoUpload(e.target.files)}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer disabled:opacity-50"
                />

                {/* Uploaded Review Photos Preview with Full-Screen Lightbox & Zoom */}
                {reviewImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-sky-600" />
                      <span>Uploaded Photos ({reviewImages.length}/3) — Tap photo to inspect full-screen & zoom:</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {reviewImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <button
                            type="button"
                            onClick={() => openReviewLightbox(reviewImages, idx)}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-sky-400/80 bg-slate-100 shadow-sm cursor-zoom-in hover:scale-105 active:scale-95 transition-all block relative"
                            title="Click to view full-screen & zoom"
                          >
                            <img src={img} alt={`Uploaded review photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md text-[10px] cursor-pointer"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-md"
              >
                Submit Review
              </button>
            </form>
          )}

          {approvedReviews.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedReviews.slice(0, showAllReviews ? undefined : 7).map((rev) => (
                  <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{rev.customerName}</span>
                      <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-black text-amber-900 border border-amber-200">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{typeof rev.rating === 'number' ? rev.rating.toFixed(1) : '5.0'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{rev.comment}</p>
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rev.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => openReviewLightbox(rev.images || [], idx)}
                            className="group relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs cursor-zoom-in hover:border-sky-400 transition-all hover:scale-105 active:scale-95"
                            title="Click to view full-screen & zoom"
                          >
                            <img src={img} alt="Customer Review Photo" className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {approvedReviews.length > 7 && (
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full py-3 text-xs font-black text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  {showAllReviews ? 'Show Less' : `See All Reviews (${approvedReviews.length})`}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      {/* Interactive Lightbox Viewer for Product Review Photos */}
      <ReviewImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        title="Customer Review Photo (Verified Buyer)"
      />

      <Footer />
    </div>
  );
};
