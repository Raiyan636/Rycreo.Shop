import { Product, UnifiedStockStatus } from '../types/store';

export function getVariationColor(combination: Record<string, any>): string {
  if (!combination) return '';
  return combination['Color'] || combination['color'] || combination['COLOUR'] || combination['Colour'] || '';
}

export function getVariationSize(combination: Record<string, any>): string {
  if (!combination) return '';
  return combination['Size'] || combination['size'] || combination['Waist Size'] || combination['waist size'] || combination['Storage'] || combination['storage'] || combination['Option'] || combination['option'] || '';
}

export function getProductStockStatus(product: Product, selectedColor?: string): UnifiedStockStatus {
  if (!product) {
    return {
      totalStock: 0,
      effectiveStock: 0,
      threshold: 5,
      isOutOfStock: true,
      isLowStock: false,
      isInStock: false,
      status: 'Out of Stock',
      badgeText: 'Out of Stock',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      textColor: 'text-rose-600',
      pillClass: 'bg-rose-500 text-white',
      getColorStock: () => 0
    };
  }

  const rawMasterStock = Number(product.stock !== undefined && product.stock !== null ? product.stock : 0);
  // Default low stock threshold is 4 pcs (i.e. <= 4 pcs is Low Stock, 5 pcs or more is In Stock)
  const threshold = typeof product.lowStockThreshold === 'number' && !isNaN(product.lowStockThreshold) && product.lowStockThreshold > 0
    ? (product.lowStockThreshold >= 5 ? 4 : product.lowStockThreshold)
    : 4;

  let totalStock = rawMasterStock;
  let hasOutOfStockVariant = false;
  let hasLowStockVariant = false;
  let outOfStockVariantsCount = 0;
  let lowStockVariantsCount = 0;

  if (Array.isArray(product.variations) && product.variations.length > 0) {
    const varSum = product.variations.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    totalStock = varSum > 0 ? varSum : rawMasterStock;
    outOfStockVariantsCount = product.variations.filter(v => (Number(v.stock) || 0) <= 0).length;
    lowStockVariantsCount = product.variations.filter(v => (Number(v.stock) || 0) > 0 && (Number(v.stock) || 0) <= threshold).length;
    hasOutOfStockVariant = outOfStockVariantsCount > 0;
    hasLowStockVariant = lowStockVariantsCount > 0;
  } else if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    const sizeSum = product.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    totalStock = sizeSum > 0 ? sizeSum : rawMasterStock;
    outOfStockVariantsCount = product.sizes.filter(s => (Number(s.stock) || 0) <= 0).length;
    lowStockVariantsCount = product.sizes.filter(s => (Number(s.stock) || 0) > 0 && (Number(s.stock) || 0) <= threshold).length;
    hasOutOfStockVariant = outOfStockVariantsCount > 0;
    hasLowStockVariant = lowStockVariantsCount > 0;
  } else {
    totalStock = rawMasterStock;
  }

  const getColorStock = (colName: string): number => {
    if (!colName) return totalStock;
    if (Array.isArray(product.variations) && product.variations.length > 0) {
      const colVarStock = product.variations
        .filter(v => {
          const vCol = getVariationColor(v.combination);
          return !vCol || vCol.toLowerCase() === colName.toLowerCase();
        })
        .reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      if (colVarStock > 0) return colVarStock;
    }
    const foundCol = product.colors?.find(c => c.name.toLowerCase() === colName.toLowerCase());
    if (foundCol?.stock !== undefined && Number(foundCol.stock) > 0) {
      return Number(foundCol.stock);
    }
    return totalStock;
  };

  const effectiveStock = selectedColor ? getColorStock(selectedColor) : totalStock;
  const isOutOfStock = effectiveStock <= 0 && totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= threshold;
  const isInStock = totalStock > threshold;

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
    lowStockVariantsCount
  };
}

export function getVariantStockStatus(variant: any, threshold: number = 4) {
  const stock = variant?.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= threshold;

  return {
    isOutOfStock,
    isLowStock,
    badgeText: isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock'),
    badgeClass: isOutOfStock 
      ? 'bg-rose-100 text-rose-700 border-rose-200' 
      : (isLowStock ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
  };
}

export function getUnifiedStockStatus(totalStock: number, threshold: number = 4) {
  if (totalStock <= 0) return { label: 'Out of Stock', class: 'text-rose-600', badgeClass: 'bg-rose-100 text-rose-700 border-rose-200' };
  if (totalStock <= threshold) return { label: 'Low Stock', class: 'text-amber-600', badgeClass: 'bg-amber-100 text-amber-900 border-amber-200' };
  return { label: 'In Stock', class: 'text-emerald-600', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}
