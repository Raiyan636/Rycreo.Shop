import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ShoppingBag, Heart, Eye, Play, Sparkles, Check, Star, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { useToast } from './common/Toast';
import { getVariationColor } from '../utils/stockHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { 
    setSelectedProduct, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setIsSearchPageOpen,
    reviews,
    openVariantModal,
    getProductStockStatus
  } = useStore();
  const { showToast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Available colors from admin
  const enabledColors = useMemo(() => {
    return (product.colors || []).filter(c => c.enabled !== false);
  }, [product.colors]);

  // Default to first in-stock enabled color, or first enabled color
  const [selectedColorName, setSelectedColorName] = useState<string>(() => {
    const firstEnabled = enabledColors[0]?.name || '';
    return firstEnabled;
  });

  // Calculate unified stock status using single source of truth from StoreContext
  const stockInfo = useMemo(() => {
    return getProductStockStatus(product, selectedColorName);
  }, [getProductStockStatus, product, selectedColorName]);

  const { 
    totalStock, 
    effectiveStock: activeColorStock, 
    isOutOfStock, 
    isLowStock, 
    badgeText: stockBadgeText, 
    textColor: stockTextColor, 
    getColorStock 
  } = stockInfo;

  const isActiveColorOutOfStock = isOutOfStock;
  const displayedSold = (product.baseSoldCount ?? (product.soldCount ?? 0)) + (product.realSalesCount ?? 0);

  // Images list: combine product images and any color images cleanly without mixing across products
  const productImages = useMemo(() => {
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      list.push(...product.images);
    }
    // Also include color specific images if not already in list
    enabledColors.forEach(c => {
      if (c.image && !list.includes(c.image)) {
        list.push(c.image);
      }
      if (Array.isArray(c.gallery)) {
        c.gallery.forEach(g => {
          if (g && !list.includes(g)) list.push(g);
        });
      }
    });
    return list.length > 0 ? list : [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800"
    ];
  }, [product.images, enabledColors]);

  // Reviews & Rating
  const productReviews = useMemo(() => {
    return reviews.filter(r => r.productId === product.id && r.status === 'approved');
  }, [reviews, product.id]);
  const reviewCount = productReviews.length;
  const avgRating = reviewCount > 0
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : 0;

  const isWishlisted = isInWishlist(product.id);
  const effectivePrice = product.salePrice > 0 ? product.salePrice : product.price;
  const hasDiscount = product.salePrice > 0 && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Prominent dynamic discount badge (e.g. "50% OFF", "50% off", or calculated "-50% OFF")
  const displayedDiscountBadge = useMemo(() => {
    if (product.discountBadge && product.discountBadge.trim()) {
      return product.discountBadge.trim();
    }
    if (hasDiscount && discountPercent > 0) {
      return `-${discountPercent}% OFF`;
    }
    return null;
  }, [product.discountBadge, hasDiscount, discountPercent]);

  // Touch and drag swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDraggingMouse = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - (touchStartY.current || 0);

    // If horizontal swipe detected
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      e.stopPropagation();
      if (diffX > 0) {
        // Swipe right -> prev
        setCurrentImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      } else {
        // Swipe left -> next
        setCurrentImageIndex(prev => (prev + 1) % productImages.length);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    isDraggingMouse.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null && Math.abs(e.clientX - mouseStartX.current) > 10) {
      isDraggingMouse.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null && isDraggingMouse.current) {
      const diffX = e.clientX - mouseStartX.current;
      if (Math.abs(diffX) > 30) {
        e.stopPropagation();
        if (diffX > 0) {
          setCurrentImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
        } else {
          setCurrentImageIndex(prev => (prev + 1) % productImages.length);
        }
      }
    }
    mouseStartX.current = null;
    isDraggingMouse.current = false;
  };

  // Open Details Modal with Exact Scroll Position Preservation
  const handleOpenDetails = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      sessionStorage.setItem('rycreo_return_scroll_y', String(currentScrollY));
      sessionStorage.setItem('rycreo_return_product_id', product.id);

      const params = new URLSearchParams(window.location.search);
      params.set('product', product.id);
      window.history.pushState(
        { type: 'product-modal', productId: product.id, scrollY: currentScrollY },
        '',
        `${window.location.pathname}?${params.toString()}`
      );
    }
    setIsSearchPageOpen(false);
    setSelectedProduct(product);
  };

  // Automatically swift/switch image to the matching color variant image when selectedColorName changes
  useEffect(() => {
    if (!selectedColorName) return;
    const foundCol = enabledColors.find(c => c.name.toLowerCase() === selectedColorName.toLowerCase());
    const targetImg = foundCol?.image || (foundCol?.gallery && foundCol.gallery[0]);
    if (targetImg) {
      const imgIdx = productImages.findIndex(img => img === targetImg);
      if (imgIdx !== -1) {
        setCurrentImageIndex(imgIdx);
      }
    }
  }, [selectedColorName, enabledColors, productImages]);

  // Handle color selection directly on the card: immediately swift to color image
  const handleSelectColor = (e: React.MouseEvent, colName: string) => {
    e.stopPropagation();
    setSelectedColorName(colName);

    const foundCol = enabledColors.find(c => c.name.toLowerCase() === colName.toLowerCase());
    const targetImg = foundCol?.image || (foundCol?.gallery && foundCol.gallery[0]);
    if (targetImg) {
      const imgIdx = productImages.findIndex(img => img === targetImg);
      if (imgIdx !== -1) {
        setCurrentImageIndex(imgIdx);
      }
    }
  };

  // Quick Add To Cart from Card
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const activeCol = selectedColorName || enabledColors[0]?.name;
    if (activeCol && getColorStock(activeCol) <= 0) {
      showToast(`${activeCol} is currently Out of Stock!`, 'error');
      return;
    }

    // Match exact variation if available
    const matchedVar = product.variations?.find(v => {
      const colMatch = !activeCol || v.combination['Color'] === activeCol;
      return colMatch && (v.stock || 0) > 0;
    }) || product.variations?.find(v => (v.stock || 0) > 0);

    const matchedSize = matchedVar?.combination['Size'] || 
      matchedVar?.combination['Waist Size'] || 
      product.sizes?.find(s => s.stock > 0)?.size || 
      product.sizes?.[0]?.size;

    addToCart(product, matchedSize, 1, activeCol, matchedVar);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  // Buy Now from Card
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    openVariantModal(product);
  };

  const activeColorObj = enabledColors.find(c => c.name === selectedColorName);

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={handleOpenDetails}
      className="group bg-white rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-xl hover:border-[#38BDF8]/40 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer relative active:scale-[0.98]"
    >
      {/* 1. Image & Badges Container with Swipe & Drag Navigation */}
      <div 
        className="relative aspect-[3/4] w-full bg-white overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Displayed Product Image - Crystal Clear HD with smooth transition */}
        <img
          key={productImages[currentImageIndex] || 'card-img'}
          src={productImages[currentImageIndex] || productImages[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-300 ease-in-out"
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {/* Unified Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2 left-2 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg z-10 shadow-md">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg z-10 shadow-md">
            Low Stock
          </span>
        ) : null}

        {/* Previous / Next Chevron Buttons (Visible on hover & touch, stops modal click) */}
        {productImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
              }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(prev => (prev + 1) % productImages.length);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/65 hover:bg-slate-900 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Compact Image Navigation Dots / Indicator at bottom of image */}
        {productImages.length > 1 && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-20 pointer-events-auto"
          >
            {productImages.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to image ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  currentImageIndex === idx 
                    ? 'w-4 h-1.5 bg-[#38BDF8] shadow-xs' 
                    : 'w-1.5 h-1.5 bg-white/70 hover:bg-white shadow-xs'
                }`}
              />
            ))}
            {productImages.length > 6 && (
              <span className="text-[8px] text-white/90 font-mono font-bold ml-0.5 bg-slate-900/70 px-1 rounded-full">
                +{productImages.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between pointer-events-none gap-2 z-10">
          <div className="flex flex-col gap-1.5 items-start">
            {product.isPujaSpecial && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3" /> PUJA EDITION
              </span>
            )}

            {/* Prominent Red Discount Badge: Always shows for 50% OFF, -50% OFF, or any custom discount badge */}
            {displayedDiscountBadge && (
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse-subtle">
                {displayedDiscountBadge}
              </span>
            )}

            {displayedSold > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-amber-400 text-[10px] font-black tracking-wide border border-amber-500/30 shadow-xs">
                🔥 {displayedSold} Sold
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full shadow-md transition-transform duration-150 pointer-events-auto hover:scale-105 active:scale-95 cursor-pointer ${
              isWishlisted 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/95 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Video Badge if available */}
        {product.videoUrl && (
          <div className="absolute bottom-6 left-2.5 bg-slate-900/90 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 border border-slate-700 z-10 pointer-events-none">
            <Play className="w-3 h-3 fill-white text-white" />
            <span>Video</span>
          </div>
        )}

        {/* Quick View Hover Trigger overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xl border border-slate-700">
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* 2. Details Container */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Category & Stock Alert */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span className="uppercase tracking-wider font-semibold text-[#334155] truncate max-w-[120px]">
              {product.category}
            </span>
            <span className={`text-[10px] font-extrabold ${stockTextColor}`}>
              {stockBadgeText}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#6366F1] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Price & Rating */}
        <div className="pt-1 flex items-end justify-between border-t border-slate-100">
          <div>
            <div className="flex items-center flex-wrap gap-1.5">
              {product.isFreeShipping && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-wide border border-emerald-300">
                  <Truck className="w-3 h-3 text-emerald-600" /> Free Delivery
                </span>
              )}
              <span className="text-base sm:text-lg font-extrabold text-[#1E293B]">
                ৳{effectivePrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ৳{product.price}
                </span>
              )}
              {displayedDiscountBadge && (
                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase border border-rose-200">
                  {displayedDiscountBadge}
                </span>
              )}
            </div>

            {reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-0.5 text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{avgRating}</span>
                <span className="text-slate-400 font-normal text-[10px]">({reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Admin-Controlled Color Swatch & Tone Selector with Instant Photo Switching */}
        {enabledColors.length > 0 && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="pt-1 pb-0.5 border-t border-slate-100 flex flex-col gap-1 select-none"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                Color:
                {selectedColorName && (
                  <strong className="text-slate-900 font-bold truncate max-w-[90px]">
                    {selectedColorName}
                  </strong>
                )}
              </span>
            </div>

            {/* Subtle Color Indicator Swatches Configured From Admin Dashboard */}
            <div className="flex items-center flex-wrap gap-1.5">
              {enabledColors.map((col, idx) => {
                const isSelected = selectedColorName.toLowerCase() === col.name.toLowerCase();
                const colStock = getColorStock(col.name);
                const isColOutOfStock = colStock <= 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleSelectColor(e, col.name)}
                    title={`${col.name}${isColOutOfStock ? ' (Out of Stock)' : ` (${colStock} in stock)`}`}
                    className={`group/color relative p-0.5 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'ring-2 ring-[#38BDF8] ring-offset-1 scale-110 shadow-xs' 
                        : 'hover:scale-105'
                    } ${isColOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-slate-300 relative shadow-2xs overflow-hidden flex items-center justify-center bg-slate-100"
                      style={{ backgroundColor: col.hex || '#000000' }}
                    >
                      {col.image && (
                        <img 
                          src={col.image} 
                          alt={col.name} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                      {/* Subtle diagonal strike if color is out of stock */}
                      {isColOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-full h-0.5 bg-rose-600 rotate-45 transform" />
                        </div>
                      )}
                    </div>

                    {/* Active Check Dot */}
                    {isSelected && !isColOutOfStock && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#38BDF8] ring-1.5 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Action Buttons Stack: Details -> Buy Now -> Add to Cart */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails();
            }}
            className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <span>🔍 Details / View Details</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isActiveColorOutOfStock}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <span>⚡ Buy Now</span>
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isActiveColorOutOfStock}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-xs ${
              addedAnimation
                ? 'bg-[#10B981] text-white'
                : (isOutOfStock || isActiveColorOutOfStock)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white hover:shadow-md hover:shadow-sky-500/20 active:scale-95 cursor-pointer'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Added to Cart!</span>
              </>
            ) : (isOutOfStock || isActiveColorOutOfStock) ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

