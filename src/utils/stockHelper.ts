import { BuyMoreOffer, PreOrderProduct, Product, UnifiedStockStatus } from '../types/store';

export function getVariationColor(combination: Record<string, any> | null | undefined): string {
  if (!combination || typeof combination !== 'object') return '';
  const val = combination['Color'] || combination['color'] || combination['COLOUR'] || combination['Colour'] || '';
  return typeof val === 'string' ? val : String(val || '');
}

export function getVariationSize(combination: Record<string, any> | null | undefined): string {
  if (!combination || typeof combination !== 'object') return '';
  const val =
    combination['Size'] ||
    combination['size'] ||
    combination['Waist Size'] ||
    combination['waist size'] ||
    combination['Storage'] ||
    combination['storage'] ||
    combination['Option'] ||
    combination['option'] ||
    '';
  return typeof val === 'string' ? val : String(val || '');
}

const isStandardPlaceholderSize = (sz?: string): boolean => {
  const s = (sz || '').trim().toLowerCase();
  return !s || s === 'standard' || s === 'standard / free size' || s === 'default';
};

/**
 * Computes auto-calculated total stock across variations, sizes, colors, or master stock.
 */
export function computeAutoTotalStock(item: {
  variations?: { stock?: number }[];
  sizes?: (string | { size?: string; stock?: number })[];
  colors?: (string | { name?: string; enabled?: boolean; stock?: number })[];
  stock?: number;
}): number {
  if (Array.isArray(item.variations) && item.variations.length > 0) {
    return item.variations.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
  }
  const realSizes = Array.isArray(item.sizes)
    ? item.sizes.filter((s) => {
        const szName = typeof s === 'string' ? s : s?.size;
        return !isStandardPlaceholderSize(szName);
      })
    : [];
  if (realSizes.length > 0) {
    return realSizes.reduce((sum, s) => {
      const st = typeof s === 'string' ? 0 : Number(s?.stock ?? 0);
      return sum + Math.max(0, st || 0);
    }, 0);
  }
  const enabledColors = Array.isArray(item.colors)
    ? item.colors.filter((c) => (typeof c === 'string' ? true : c?.enabled !== false))
    : [];
  if (enabledColors.length > 0 && enabledColors.some((c) => typeof c !== 'string' && c.stock !== undefined)) {
    return enabledColors.reduce((sum, c) => {
      const st = typeof c === 'string' ? 0 : Number(c?.stock ?? 0);
      return sum + Math.max(0, st || 0);
    }, 0);
  }
  return Math.max(0, Number(item.stock ?? 0) || 0);
}

export function getVariationStockForSelection(
  product: Pick<Product, 'stock' | 'variations' | 'sizes' | 'colors'>,
  selectedColor?: string,
  selectedSize?: string
): number {
  const cleanCol = (selectedColor || '').trim();
  const cleanSz = !isStandardPlaceholderSize(selectedSize) ? (selectedSize || '').trim() : '';

  if (Array.isArray(product?.variations) && product.variations.length > 0) {
    const exactMatch = product.variations.find((v) => {
      const vCol = getVariationColor(v?.combination).trim();
      const vSz = getVariationSize(v?.combination).trim();
      const colOk = !cleanCol
        ? !vCol
        : vCol.toLowerCase() === cleanCol.toLowerCase() || (!vCol && cleanCol === 'Default');
      const szOk = !cleanSz
        ? isStandardPlaceholderSize(vSz)
        : vSz.toLowerCase() === cleanSz.toLowerCase();
      return colOk && szOk;
    });
    if (exactMatch) {
      return Math.max(0, Number(exactMatch.stock) || 0);
    }

    // Fallback when color-only variation exists without size or vice versa
    const partialMatches = product.variations.filter((v) => {
      const vCol = getVariationColor(v?.combination).trim();
      const vSz = getVariationSize(v?.combination).trim();
      const colOk = !cleanCol || !vCol || vCol.toLowerCase() === cleanCol.toLowerCase();
      const szOk = !cleanSz || isStandardPlaceholderSize(vSz) || vSz.toLowerCase() === cleanSz.toLowerCase();
      return colOk && szOk;
    });
    if (partialMatches.length > 0) {
      return partialMatches.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
    }
  }

  if (cleanSz && Array.isArray(product.sizes) && product.sizes.length > 0) {
    const foundSz = product.sizes.find(
      (s) => s.size.trim().toLowerCase() === cleanSz.toLowerCase()
    );
    if (foundSz) {
      return Math.max(0, Number(foundSz.stock) || 0);
    }
  }

  if (cleanCol && Array.isArray(product.colors) && product.colors.length > 0) {
    const foundCol = product.colors.find(
      (c) => c.name.trim().toLowerCase() === cleanCol.toLowerCase()
    );
    if (foundCol && foundCol.stock !== undefined) {
      return Math.max(0, Number(foundCol.stock) || 0);
    }
  }

  return Math.max(0, Number(product.stock ?? 0) || 0);
}

export function getProductStockStatus(product: Product, selectedColor?: string): UnifiedStockStatus {
  if (!product) {
    return {
      totalStock: 0,
      effectiveStock: 0,
      threshold: 4,
      isOutOfStock: true,
      isLowStock: false,
      isInStock: false,
      status: 'Out of Stock',
      badgeText: 'Out of Stock',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      textColor: 'text-rose-600',
      pillClass: 'bg-rose-500 text-white',
      getColorStock: () => 0,
    };
  }

  const rawMasterStock = Math.max(
    0,
    Number(product.stock !== undefined && product.stock !== null ? product.stock : 0) || 0
  );
  // Strict Low Stock threshold: < 5 pcs (i.e. 1 to 4 pcs) shows Low Stock; 0 is Out of Stock; 5+ is In Stock
  const threshold =
    typeof product.lowStockThreshold === 'number' &&
    !isNaN(product.lowStockThreshold) &&
    product.lowStockThreshold > 0
      ? Math.min(4, product.lowStockThreshold)
      : 4;

  let totalStock = rawMasterStock;
  let hasOutOfStockVariant = false;
  let hasLowStockVariant = false;
  let outOfStockVariantsCount = 0;
  let lowStockVariantsCount = 0;

  if (Array.isArray(product.variations) && product.variations.length > 0) {
    // Respect exact sum even when variations equal 0!
    totalStock = product.variations.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
    outOfStockVariantsCount = product.variations.filter((v) => (Number(v.stock) || 0) <= 0).length;
    lowStockVariantsCount = product.variations.filter(
      (v) => (Number(v.stock) || 0) > 0 && (Number(v.stock) || 0) <= threshold
    ).length;
    hasOutOfStockVariant = outOfStockVariantsCount > 0;
    hasLowStockVariant = lowStockVariantsCount > 0;
  } else if (
    Array.isArray(product.sizes) &&
    product.sizes.some((s) => !isStandardPlaceholderSize(s.size))
  ) {
    const validSizes = product.sizes.filter((s) => !isStandardPlaceholderSize(s.size));
    totalStock = validSizes.reduce((sum, s) => sum + Math.max(0, Number(s.stock) || 0), 0);
    outOfStockVariantsCount = validSizes.filter((s) => (Number(s.stock) || 0) <= 0).length;
    lowStockVariantsCount = validSizes.filter(
      (s) => (Number(s.stock) || 0) > 0 && (Number(s.stock) || 0) <= threshold
    ).length;
    hasOutOfStockVariant = outOfStockVariantsCount > 0;
    hasLowStockVariant = lowStockVariantsCount > 0;
  } else if (
    Array.isArray(product.colors) &&
    product.colors.length > 0 &&
    product.colors.some((c) => c.stock !== undefined)
  ) {
    const enabledColors = product.colors.filter((c) => c.enabled !== false);
    totalStock = enabledColors.reduce(
      (sum, c) => sum + Math.max(0, Number(c.stock ?? 0) || 0),
      0
    );
    outOfStockVariantsCount = enabledColors.filter((c) => (Number(c.stock) || 0) <= 0).length;
    lowStockVariantsCount = enabledColors.filter(
      (c) => (Number(c.stock) || 0) > 0 && (Number(c.stock) || 0) <= threshold
    ).length;
    hasOutOfStockVariant = outOfStockVariantsCount > 0;
    hasLowStockVariant = lowStockVariantsCount > 0;
  } else {
    totalStock = rawMasterStock;
  }

  const getColorStock = (colName: string): number => {
    if (!colName) return totalStock;
    if (Array.isArray(product.variations) && product.variations.length > 0) {
      const matching = product.variations.filter((v) => {
        const vCol = getVariationColor(v.combination);
        return vCol && vCol.toLowerCase() === colName.toLowerCase();
      });
      if (matching.length > 0) {
        return matching.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0);
      }
    }
    const foundCol = product.colors?.find(
      (c) => c.name.toLowerCase() === colName.toLowerCase()
    );
    if (foundCol?.stock !== undefined) {
      return Math.max(0, Number(foundCol.stock) || 0);
    }
    return totalStock;
  };

  const effectiveStock = selectedColor ? getColorStock(selectedColor) : totalStock;
  const isOutOfStock = effectiveStock <= 0;
  const isLowStock = !isOutOfStock && effectiveStock <= threshold;
  const isInStock = effectiveStock > threshold;

  const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = isOutOfStock
    ? 'Out of Stock'
    : isLowStock
      ? 'Low Stock'
      : 'In Stock';

  const badgeClass = isOutOfStock
    ? 'bg-rose-100 text-rose-700 border-rose-200'
    : isLowStock
      ? 'bg-amber-100 text-amber-900 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const textColor = isOutOfStock
    ? 'text-rose-600'
    : isLowStock
      ? 'text-amber-600'
      : 'text-emerald-600';

  const pillClass = isOutOfStock
    ? 'bg-rose-500 text-white'
    : isLowStock
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-500 text-white';

  return {
    totalStock,
    effectiveStock,
    threshold,
    isOutOfStock,
    isLowStock,
    isInStock,
    status,
    badgeText: status,
    badgeClass,
    textColor,
    pillClass,
    getColorStock,
    hasOutOfStockVariant,
    hasLowStockVariant,
    outOfStockVariantsCount,
    lowStockVariantsCount,
  };
}

export function getPreOrderQuotaStatus(item: PreOrderProduct) {
  const hasVariantStock =
    (Array.isArray(item.variations) && item.variations.length > 0) ||
    (Array.isArray(item.sizes) &&
      item.sizes.some((s) => typeof s !== 'string' && !isStandardPlaceholderSize(s?.size))) ||
    (Array.isArray(item.colors) &&
      item.colors.some((c) => typeof c !== 'string' && c?.stock !== undefined));

  const remainingFromVariants = hasVariantStock ? computeAutoTotalStock(item) : undefined;
  const explicitStock =
    item.stock !== undefined && item.stock !== null ? Math.max(0, Number(item.stock)) : undefined;
  const maxQuota =
    item.preOrderMaxQuota !== undefined && item.preOrderMaxQuota > 0
      ? Number(item.preOrderMaxQuota)
      : explicitStock ?? remainingFromVariants ?? 0;

  const bookedCount = Math.max(0, Number(item.preOrderBookedCount || 0));

  let remaining = 999;
  if (hasVariantStock && remainingFromVariants !== undefined) {
    remaining = remainingFromVariants;
  } else if (item.preOrderMaxQuota !== undefined && item.preOrderMaxQuota > 0) {
    remaining = Math.max(0, Number(item.preOrderMaxQuota) - bookedCount);
  } else if (explicitStock !== undefined) {
    remaining = explicitStock;
  }

  const tracksQuota =
    hasVariantStock ||
    (item.preOrderMaxQuota !== undefined && item.preOrderMaxQuota > 0) ||
    explicitStock !== undefined;

  const totalQuotaDisplay =
    item.preOrderMaxQuota && item.preOrderMaxQuota > 0
      ? item.preOrderMaxQuota
      : Math.max(remaining + bookedCount, maxQuota);

  const isFulfilled = tracksQuota && remaining <= 0;
  const isLowSlot = tracksQuota && remaining > 0 && remaining <= 4;

  return {
    tracksQuota,
    remaining,
    bookedCount,
    totalQuotaDisplay,
    isFulfilled,
    isLowSlot,
  };
}

export function getOfferCountdown(offer: Pick<BuyMoreOffer, 'expiresAt'>, nowMs: number = Date.now()) {
  if (!offer.expiresAt) {
    return {
      hasTimer: false,
      isExpired: false,
      label: '',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const targetMs = new Date(offer.expiresAt).getTime();
  if (isNaN(targetMs)) {
    return {
      hasTimer: false,
      isExpired: false,
      label: '',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return {
      hasTimer: true,
      isExpired: true,
      label: 'Offer Expired',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  const label = days > 0 ? `Ends in ${days}d ${hh}h ${mm}m ${ss}s` : `Ends in ${hh}h ${mm}m ${ss}s`;

  return {
    hasTimer: true,
    isExpired: false,
    label,
    days,
    hours,
    minutes,
    seconds,
  };
}

export function getVariantStockStatus(variant: any, threshold: number = 4) {
  const stock = Number(variant?.stock || 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= threshold;

  return {
    isOutOfStock,
    isLowStock,
    badgeText: isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock',
    badgeClass: isOutOfStock
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : isLowStock
        ? 'bg-amber-100 text-amber-900 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

export function getUnifiedStockStatus(totalStock: number, threshold: number = 4) {
  if (totalStock <= 0)
    return {
      label: 'Out of Stock',
      class: 'text-rose-600',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    };
  if (totalStock <= threshold)
    return {
      label: 'Low Stock',
      class: 'text-amber-600',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    };
  return {
    label: 'In Stock',
    class: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}
