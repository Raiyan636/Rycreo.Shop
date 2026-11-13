import React, { useState, useMemo, useRef } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Edit,
  Search,
  Check,
  X,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Copy,
  Package,
  ChevronUp,
  ChevronDown,
  Loader2,
  CalendarClock,
  Users,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Truck,
  Globe,
  Tag,
  Video,
  CreditCard,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  PreOrderProduct,
  PreOrderRecord,
  ProductColorVariant,
  ProductSizeStock,
  ProductVariation,
} from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { ImageGalleryUploader } from '../common/ImageGalleryUploader';
import { useToast } from '../common/Toast';
import { resolveStoreAssetUrl } from '../../utils/clientAssetResolver';
import { uploadImageToStorage } from '../../storageService';
import { getVariationColor, getVariationSize } from '../../utils/stockHelper';

type PreOrderSubTab = 'orders' | 'products';
type PreOrderFormTab =
  | 'basic'
  | 'images'
  | 'pricing'
  | 'variations_and_stock'
  | 'shipping'
  | 'seo';

interface VariantMatrixEntry {
  activeSizes: string[];
  stock: Record<string, number>;
}

const STATUS_STYLES: Record<PreOrderRecord['status'], string> = {
  Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Confirmed: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Arrived: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Canceled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const PreOrderManager: React.FC = () => {
  const {
    preOrderProducts,
    preOrders,
    categories,
    storeConfig,
    updateStoreConfig,
    addPreOrderProduct,
    updatePreOrderProduct,
    deletePreOrderProduct,
    movePreOrderProduct,
    updatePreOrderStatus,
    togglePreOrderSeen,
    deletePreOrder,
  } = useStore();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<PreOrderSubTab>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PreOrderRecord['status']>('All');
  const [preOrderToDelete, setPreOrderToDelete] = useState<PreOrderRecord | null>(null);

  // Section Settings local draft
  const [sectionTitle, setSectionTitle] = useState(
    storeConfig.preOrderSectionTitle || 'Upcoming Products'
  );
  const [sectionSubtitle, setSectionSubtitle] = useState(
    storeConfig.preOrderSectionSubtitle ||
      'Pre-order exclusive upcoming arrivals before stock runs out'
  );
  const [layoutMaxRows, setLayoutMaxRows] = useState<number>(
    storeConfig.sectionLayouts?.preOrder?.maxRows ?? 3
  );
  const [layoutDesktopCols, setLayoutDesktopCols] = useState<number>(
    storeConfig.sectionLayouts?.preOrder?.desktopColumns ?? 4
  );
  const [layoutMobileRows, setLayoutMobileRows] = useState<number>(
    storeConfig.sectionLayouts?.preOrder?.mobileMaxRows ?? 4
  );
  const [layoutMaxPerRow, setLayoutMaxPerRow] = useState<number>(
    storeConfig.sectionLayouts?.preOrder?.maxItemsPerRow ?? 20
  );

  // Pre-Order Product 6-Tab Editor State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<PreOrderFormTab>('basic');
  const [editingProduct, setEditingProduct] = useState<PreOrderProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<PreOrderProduct | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Tab 1: Basic Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Upcoming');
  const [productCode, setProductCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [weWillGetText, setWeWillGetText] = useState('');
  const [youWillGetText, setYouWillGetText] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Tab 2: Images & Gallery
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Tab 3: Pricing & Advance
  const [price, setPrice] = useState<number>(1800);
  const [salePrice, setSalePrice] = useState<number>(1500);
  const [advanceType, setAdvanceType] = useState<'fixed' | 'percent'>('fixed');
  const [advanceValue, setAdvanceValue] = useState<string>('');

  // Tab 4: Variations & Stock
  const [enableColorVariant, setEnableColorVariant] = useState(true);
  const [enableSizeVariant, setEnableSizeVariant] = useState(true);
  const [colors, setColors] = useState<ProductColorVariant[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#0F172A');
  const [colorImageInput, setColorImageInput] = useState('');
  const [isUploadingColorPhoto, setIsUploadingColorPhoto] = useState(false);
  const [editingColorGallery, setEditingColorGallery] = useState<number | null>(null);
  const colorFileInputRef = useRef<HTMLInputElement | null>(null);

  const [sizes, setSizes] = useState<ProductSizeStock[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [masterStock, setMasterStock] = useState<number>(50);
  const [preOrderMaxQuota, setPreOrderMaxQuota] = useState<string>('');
  const [preOrderBookedCount, setPreOrderBookedCount] = useState<number>(0);
  const [variantQuantities, setVariantQuantities] = useState<
    Record<string, VariantMatrixEntry>
  >({});

  // Tab 5: Shipping
  const [shippingWeight, setShippingWeight] = useState('0.4 kg');
  const [shippingDimensions, setShippingDimensions] = useState('30 x 25 x 4 cm');
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  // Tab 6: SEO & Keywords
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const isSectionVisible = storeConfig.isPreOrderSectionVisible !== false;

  const sortedPreOrderProducts = useMemo(
    () => [...preOrderProducts].sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [preOrderProducts]
  );

  const filteredPreOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return preOrders.filter((o) => {
      const statusOk = statusFilter === 'All' || o.status === statusFilter;
      const searchOk =
        !q ||
        (o.preOrderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.address || '').toLowerCase().includes(q) ||
        (o.productTitle || '').toLowerCase().includes(q) ||
        (o.paymentTrxId || '').toLowerCase().includes(q) ||
        (o.linkedOrderNumber || '').toLowerCase().includes(q) ||
        (o.district || '').toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [preOrders, orderSearch, statusFilter]);

  const unseenCount = preOrders.filter((o) => !o.isSeen).length;
  const pendingCount = preOrders.filter((o) => o.status === 'Pending').length;
  const activeCount = preOrders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Arrived'
  ).length;
  const deliveredCount = preOrders.filter((o) => o.status === 'Delivered').length;

  const resetProductForm = () => {
    setEditingProduct(null);
    setActiveFormTab('basic');
    setTitle('');
    setCategory(categories[0]?.name || 'Upcoming');
    setProductCode('');
    setTagline('');
    setDescription('');
    setWeWillGetText('');
    setYouWillGetText('');
    setIsVisible(true);

    setImages([]);
    setVideoUrl('');

    setPrice(1800);
    setSalePrice(1500);
    setAdvanceType('fixed');
    setAdvanceValue('');

    setEnableColorVariant(true);
    setEnableSizeVariant(true);
    setColors([]);
    setColorNameInput('');
    setColorHexInput('#0F172A');
    setColorImageInput('');
    setEditingColorGallery(null);
    setSizes([
      { size: 'M', stock: 20 },
      { size: 'L', stock: 20 },
      { size: 'XL', stock: 20 },
    ]);
    setSizeInput('');
    setMasterStock(50);
    setPreOrderMaxQuota('');
    setPreOrderBookedCount(0);
    setVariantQuantities({});

    setShippingWeight('0.4 kg');
    setShippingDimensions('30 x 25 x 4 cm');
    setIsFreeShipping(false);

    setSeoTitle('');
    setSeoDescription('');
    setSlug('');
    setKeywords([]);
    setKeywordInput('');

    setIsProductFormOpen(false);
  };

  const handleEditProduct = (item: PreOrderProduct) => {
    setEditingProduct(item);
    setActiveFormTab('basic');
    setTitle(item.title || '');
    setCategory(item.category || 'Upcoming');
    setProductCode(item.productCode || '');
    setTagline(item.tagline || '');
    setDescription(item.description || '');
    setWeWillGetText(item.weWillGetText || '');
    setYouWillGetText(item.youWillGetText || '');
    setIsVisible(item.isVisible !== false);

    setImages(item.images || []);
    setVideoUrl(item.videoUrl || '');

    setPrice(item.price || 0);
    setSalePrice(item.salePrice || item.price || 0);
    const resolvedType = item.advanceType || 'fixed';
    const resolvedVal =
      item.advanceValue !== undefined
        ? String(item.advanceValue)
        : item.advanceAmount !== undefined
          ? String(item.advanceAmount)
          : '';
    setAdvanceType(resolvedType);
    setAdvanceValue(resolvedVal);

    // Normalize colors & sizes (support legacy string[] as well as object arrays)
    const normColors: ProductColorVariant[] = (item.colors || [])
      .map((c) =>
        typeof c === 'string'
          ? { name: c, hex: '#1E293B', enabled: true, stock: 20 }
          : c
      )
      .filter((c) => c && c.name);
    const normSizes: ProductSizeStock[] = (item.sizes || [])
      .map((s) => (typeof s === 'string' ? { size: s, stock: 20 } : s))
      .filter((s) => s && s.size);

    setColors(normColors);
    setSizes(normSizes);
    setMasterStock(item.stock ?? 50);
    setPreOrderMaxQuota(item.preOrderMaxQuota !== undefined ? String(item.preOrderMaxQuota) : '');
    setPreOrderBookedCount(item.preOrderBookedCount ?? 0);

    const hasCols = normColors.length > 0 || item.hasColorVariants === true;
    const hasSzs =
      normSizes.length > 0 ||
      Boolean(item.variations?.some((v) => Boolean(getVariationSize(v.combination))));
    setEnableColorVariant(hasCols);
    setEnableSizeVariant(hasSzs);

    // Rehydrate matrix
    const matrix: Record<string, VariantMatrixEntry> = {};
    normColors.forEach((c) => {
      matrix[c.name] = { activeSizes: [], stock: {} };
    });

    if (item.variations && item.variations.length > 0) {
      item.variations.forEach((v) => {
        const col = getVariationColor(v.combination);
        const sz = getVariationSize(v.combination) || 'Standard';
        if (col) {
          if (!matrix[col]) matrix[col] = { activeSizes: [], stock: {} };
          if (!matrix[col].activeSizes.includes(sz)) {
            matrix[col].activeSizes.push(sz);
          }
          matrix[col].stock[sz] = v.stock ?? 20;
        }
      });
    } else {
      normColors.forEach((c) => {
        matrix[c.name] = {
          activeSizes: normSizes.map((s) => s.size),
          stock: normSizes.reduce(
            (acc, s) => ({ ...acc, [s.size]: s.stock ?? 20 }),
            {} as Record<string, number>
          ),
        };
      });
    }
    setVariantQuantities(matrix);

    setShippingWeight(item.shippingWeight || '0.4 kg');
    setShippingDimensions(item.shippingDimensions || '30 x 25 x 4 cm');
    setIsFreeShipping(Boolean(item.isFreeShipping));

    setSeoTitle(item.seoTitle || '');
    setSeoDescription(item.seoDescription || '');
    setSlug(item.slug || '');
    setKeywords(item.keywords || []);
    setKeywordInput('');

    setIsProductFormOpen(true);
  };

  // Variant helpers
  const handleAddColor = () => {
    const trimmed = colorNameInput.trim();
    if (!trimmed) return;
    if (colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Color "${trimmed}" already exists.`, 'info');
      return;
    }
    const newColor: ProductColorVariant = {
      name: trimmed,
      hex: colorHexInput,
      image: colorImageInput || undefined,
      gallery: [],
      enabled: true,
    };
    setColors((prev) => [...prev, newColor]);
    setVariantQuantities((prev) => ({
      ...prev,
      [trimmed]: {
        activeSizes: sizes.map((s) => s.size),
        stock: sizes.reduce(
          (acc, s) => ({ ...acc, [s.size]: s.stock || 20 }),
          {} as Record<string, number>
        ),
      },
    }));
    setColorNameInput('');
    setColorImageInput('');
  };

  const handleRemoveColor = (idx: number) => {
    const targetName = colors[idx]?.name;
    setColors((prev) => prev.filter((_, i) => i !== idx));
    if (targetName) {
      setVariantQuantities((prev) => {
        const next = { ...prev };
        delete next[targetName];
        return next;
      });
    }
  };

  const handleAddSize = () => {
    const trimmed = sizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (sizes.some((s) => s.size.toUpperCase() === trimmed)) {
      showToast(`Size "${trimmed}" already exists.`, 'info');
      return;
    }
    setSizes((prev) => [...prev, { size: trimmed, stock: 20 }]);
    setVariantQuantities((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((colName) => {
        if (!next[colName].activeSizes.includes(trimmed)) {
          next[colName] = {
            activeSizes: [...next[colName].activeSizes, trimmed],
            stock: { ...next[colName].stock, [trimmed]: 20 },
          };
        }
      });
      return next;
    });
    setSizeInput('');
  };

  const handleRemoveSize = (idx: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const tokens = keywordInput
      .split(/[,;\n]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const updated = [...keywords];
    tokens.forEach((t) => {
      if (!updated.includes(t) && updated.length < 15) updated.push(t);
    });
    setKeywords(updated);
    setKeywordInput('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter product title.', 'error');
      setActiveFormTab('basic');
      return;
    }
    if (images.length === 0) {
      showToast('Please upload or add at least one product image.', 'error');
      setActiveFormTab('images');
      return;
    }

    setIsSavingProduct(true);
    try {
      // Upload any local data/blob images cleanly
      const processedImages = await Promise.all(
        images.map(async (img) => {
          if (img.startsWith('blob:') || img.startsWith('data:')) {
            try {
              return (await uploadImageToStorage(img, 'preorders')) || img;
            } catch {
              return img;
            }
          }
          return img;
        })
      );

      // Build variations matrix
      const finalSizes = enableSizeVariant ? sizes : [];
      const finalVariations: ProductVariation[] = [];
      const effectivePrice = Number(salePrice) > 0 ? Number(salePrice) : Number(price);

      if (enableColorVariant && enableSizeVariant) {
        colors.forEach((col) => {
          const entry = variantQuantities[col.name];
          sizes.forEach((sz) => {
            const isActive = entry?.activeSizes?.includes(sz.size);
            if (isActive) {
              const sVal = Math.max(0, Number(entry?.stock?.[sz.size] ?? 20));
              finalVariations.push({
                id: `povar-${col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sz.size
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')}`,
                combination: { Color: col.name, Size: sz.size },
                price: Number(price) || 0,
                salePrice: Number(salePrice) > 0 ? Number(salePrice) : undefined,
                stock: sVal,
                sku: `${productCode || 'PRE'}-${col.name.slice(0, 2).toUpperCase()}-${sz.size}`,
                inStock: sVal > 0,
              });
            }
          });
        });
      } else if (enableColorVariant) {
        colors.forEach((col) => {
          const explicitStd = variantQuantities[col.name]?.stock?.['Standard'];
          const sVal = Math.max(0, Number(explicitStd !== undefined ? explicitStd : (col.stock ?? masterStock)) || 0);
          finalVariations.push({
            id: `povar-${col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            combination: { Color: col.name },
            price: Number(price) || 0,
            salePrice: Number(salePrice) > 0 ? Number(salePrice) : undefined,
            stock: sVal,
            inStock: sVal > 0,
          });
        });
      } else if (enableSizeVariant) {
        sizes.forEach((sz) => {
          const sVal = Math.max(0, Number(sz.stock ?? 0));
          finalVariations.push({
            id: `povar-${sz.size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            combination: { Size: sz.size },
            price: Number(price) || 0,
            salePrice: Number(salePrice) > 0 ? Number(salePrice) : undefined,
            stock: sVal,
            inStock: sVal > 0,
          });
        });
      }

      // Process color thumbnails & galleries
      let finalColors: ProductColorVariant[] | undefined;
      if (enableColorVariant && colors.length > 0) {
        finalColors = await Promise.all(
          colors.map(async (col) => {
            let colImg = col.image;
            if (colImg && (colImg.startsWith('blob:') || colImg.startsWith('data:'))) {
              try {
                colImg = (await uploadImageToStorage(colImg, 'preorders/colors')) || colImg;
              } catch {}
            }
            let colGal = col.gallery;
            if (Array.isArray(colGal) && colGal.length > 0) {
              colGal = await Promise.all(
                colGal.map(async (g) => {
                  if (g && (g.startsWith('blob:') || g.startsWith('data:'))) {
                    try {
                      return (await uploadImageToStorage(g, 'preorders/colors')) || g;
                    } catch {
                      return g;
                    }
                  }
                  return g;
                })
              );
            }
            const colVars = finalVariations.filter(
              (v) => getVariationColor(v.combination) === col.name
            );
            const colStock =
              colVars.length > 0
                ? colVars.reduce((s, v) => s + (v.stock || 0), 0)
                : 20;
            return {
              ...col,
              image: colImg,
              gallery: colGal,
              stock: colStock,
              inStock: colStock > 0 && col.enabled !== false,
            };
          })
        );
      }

      const parsedQuota = preOrderMaxQuota.trim() !== '' ? Math.max(0, Number(preOrderMaxQuota) || 0) : undefined;
      const calculatedStock =
        finalVariations.length > 0
          ? finalVariations.reduce((sum, v) => sum + (v.stock || 0), 0)
          : finalSizes.length > 0
            ? finalSizes.reduce((sum, s) => sum + (s.stock || 0), 0)
            : (parsedQuota !== undefined ? parsedQuota : Math.max(0, Number(masterStock) || 0));

      const parsedAdvVal = advanceValue.trim() !== '' ? Number(advanceValue) : undefined;
      const computedLegacyAdvanceAmount =
        parsedAdvVal && parsedAdvVal > 0
          ? advanceType === 'percent'
            ? Math.round((effectivePrice * Math.min(100, parsedAdvVal)) / 100)
            : parsedAdvVal
          : undefined;

      const finalSlug =
        slug.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const payload: Omit<PreOrderProduct, 'id' | 'createdAt'> = {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim() || 'Upcoming',
        productCode: productCode.trim() || undefined,
        tagline: tagline.trim() || undefined,
        price: Number(price) || 0,
        salePrice: Number(salePrice) || Number(price) || 0,
        advanceType,
        advanceValue: parsedAdvVal,
        advanceAmount: computedLegacyAdvanceAmount,
        images: processedImages,
        videoUrl: videoUrl.trim() || undefined,
        description: description.trim() || 'Pre-order exclusive arrival.',
        colors: finalColors,
        sizes: finalSizes,
        variations: finalVariations,
        hasColorVariants: enableColorVariant && (finalColors?.length || 0) > 0,
        stock: calculatedStock,
        preOrderMaxQuota: parsedQuota ?? calculatedStock,
        preOrderBookedCount: preOrderBookedCount || 0,
        weWillGetText: weWillGetText.trim(),
        youWillGetText: youWillGetText.trim(),
        shippingWeight: shippingWeight.trim() || undefined,
        shippingDimensions: shippingDimensions.trim() || undefined,
        isFreeShipping,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        isVisible,
        position: editingProduct?.position ?? preOrderProducts.length + 1,
      };

      if (editingProduct) {
        await updatePreOrderProduct({
          ...editingProduct,
          ...payload,
        });
        showToast(`Updated pre-order product "${payload.title}"!`, 'success');
      } else {
        await addPreOrderProduct(payload);
        showToast(`Added pre-order product "${payload.title}"!`, 'success');
      }
      resetProductForm();
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleToggleSectionVisible = (checked: boolean) => {
    updateStoreConfig({ isPreOrderSectionVisible: checked });
    showToast(
      checked
        ? 'Upcoming / Pre-Order section is now VISIBLE on website.'
        : 'Upcoming / Pre-Order section is now HIDDEN from website.',
      'info'
    );
  };

  const handleSaveHeading = () => {
    const existingLayouts = storeConfig.sectionLayouts || {
      ourProducts: { maxRows: 4, mobileMaxRows: 4, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 3 },
      preOrder: { maxRows: 3, mobileMaxRows: 4, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 3 },
      buyMore: { maxRows: 2, mobileMaxRows: 2, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 4 },
    };
    updateStoreConfig({
      preOrderSectionTitle: sectionTitle.trim() || 'Upcoming Products',
      preOrderSectionSubtitle: sectionSubtitle.trim(),
      sectionLayouts: {
        ...existingLayouts,
        preOrder: {
          ...existingLayouts.preOrder,
          maxRows: Math.min(20, Math.max(1, Number(layoutMaxRows) || 3)),
          mobileMaxRows: Math.min(20, Math.max(1, Number(layoutMobileRows) || 4)),
          desktopColumns: Math.min(6, Math.max(2, Number(layoutDesktopCols) || 4)),
          mobileColumns: existingLayouts.preOrder?.mobileColumns ?? 2,
          maxItemsPerRow: Math.min(50, Math.max(4, Number(layoutMaxPerRow) || 20)),
        },
      },
    });
    showToast('Pre-Order heading & grid rows/columns saved!', 'success');
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, 'info');
  };

  const effectiveUnitForPreview = Number(salePrice) > 0 ? Number(salePrice) : Number(price);
  const parsedAdvPreview = advanceValue.trim() !== '' ? Number(advanceValue) : 0;
  const computedUpfrontPreview =
    parsedAdvPreview > 0
      ? advanceType === 'percent'
        ? Math.round((effectiveUnitForPreview * Math.min(100, parsedAdvPreview)) / 100)
        : Math.min(effectiveUnitForPreview, parsedAdvPreview)
      : effectiveUnitForPreview;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Checkmark Visibility Toggle */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Pre-Order Products &amp; Pre-Order Management
              </h3>
              <p className="text-xs text-slate-400">
                Full 6-tab product studio for upcoming pre-orders, advance payment rules, delivery schedules, and customer bookings.
              </p>
            </div>
          </div>

          {/* Checkmark Visibility Toggle */}
          <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-amber-400/50 transition-colors self-start lg:self-auto">
            <input
              type="checkbox"
              checked={isSectionVisible}
              onChange={(e) => handleToggleSectionVisible(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              {isSectionVisible ? (
                <Eye className="w-4 h-4 text-emerald-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-extrabold text-white block">
                  Show Section on Website (টিকমার্ক)
                </span>
                <span className="text-[10px] text-slate-400">
                  {isSectionVisible ? 'Visible to customers' : 'Hidden from customers'}
                </span>
              </div>
            </div>
          </label>
        </div>

        {/* Editable Heading */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-700/70">
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Website Section Title
            </label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Upcoming Products"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-6">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Website Section Subtitle
            </label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Pre-order exclusive upcoming arrivals"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={handleSaveHeading}
              className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              Save Heading &amp; Grid
            </button>
          </div>
        </div>

        {/* Section Grid Rows & Columns Control */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Desktop Rows (সারি — e.g. 3 or 10)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={layoutMaxRows}
              onChange={(e) => setLayoutMaxRows(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Mobile Rows (মোবাইল লাইন)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={layoutMobileRows}
              onChange={(e) => setLayoutMobileRows(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Desktop Columns / Row
            </label>
            <select
              value={layoutDesktopCols}
              onChange={(e) => setLayoutDesktopCols(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Columns / Row</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Max Items / Row (সর্বোচ্চ)
            </label>
            <input
              type="number"
              min={4}
              max={50}
              value={layoutMaxPerRow}
              onChange={(e) => setLayoutMaxPerRow(Math.min(50, Math.max(4, Number(e.target.value) || 20)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 2 Sub-tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'orders'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pre-Order Management (Bookings)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
              {preOrders.length}
            </span>
            {unseenCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white">
                {unseenCount} New
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'products'
                ? 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white shadow-md'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pre-Order Products</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/25">
              {preOrderProducts.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRE-ORDER MANAGEMENT (BOOKINGS DASHBOARD) */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-[11px] text-slate-400 font-bold">Total Pre-Orders</p>
              <p className="text-2xl font-black text-white tabular-nums mt-1">{preOrders.length}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-[11px] text-amber-300 font-bold">Pending / Unseen</p>
              <p className="text-2xl font-black text-amber-400 tabular-nums mt-1">
                {pendingCount}{' '}
                <span className="text-xs font-bold text-rose-400">({unseenCount} new)</span>
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-[11px] text-sky-300 font-bold">Confirmed / Arrived</p>
              <p className="text-2xl font-black text-sky-400 tabular-nums mt-1">{activeCount}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
              <p className="text-[11px] text-emerald-300 font-bold">Delivered</p>
              <p className="text-2xl font-black text-emerald-400 tabular-nums mt-1">
                {deliveredCount}
              </p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Pre-Order #, linked Order #, TrxID, customer, phone, product..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['All', 'Pending', 'Confirmed', 'Arrived', 'Delivered', 'Canceled'] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredPreOrders.length === 0 ? (
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-10 text-center text-slate-400 text-xs">
              No pre-orders match your filter yet.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPreOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    !order.isSeen
                      ? 'bg-slate-800 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-800/90 border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <img
                        src={resolveStoreAssetUrl(order.productImage)}
                        alt={order.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 inline-flex items-center gap-1.5">
                            <span>{order.preOrderNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyText(order.preOrderNumber, 'Pre-Order Number')}
                              className="text-sky-400 hover:text-sky-300 cursor-pointer"
                              title="Copy Pre-Order #"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </span>
                          {order.linkedOrderNumber && (
                            <span className="font-mono text-[10px] font-bold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded border border-sky-500/30 inline-flex items-center gap-1.5">
                              <span>Order #{order.linkedOrderNumber}</span>
                              <button
                                type="button"
                                onClick={() => copyText(order.linkedOrderNumber!, 'Order ID')}
                                className="text-sky-200 hover:text-white cursor-pointer"
                                title="Copy Order #"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                              STATUS_STYLES[order.status] || STATUS_STYLES.Pending
                            }`}
                          >
                            {order.status}
                          </span>
                          {!order.isSeen && (
                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {order.orderTimeFormatted ||
                              new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm font-extrabold text-white">
                          {order.productTitle}{' '}
                          <span className="text-amber-300 font-black tabular-nums">
                            × {order.quantity} (৳{order.totalAmount.toLocaleString()})
                          </span>
                        </p>

                        {(order.selectedColor || order.selectedSize) && (
                          <p className="text-[11px] text-slate-300">
                            {order.selectedColor ? `Color: ${order.selectedColor}` : ''}
                            {order.selectedColor && order.selectedSize ? ' • ' : ''}
                            {order.selectedSize ? `Size: ${order.selectedSize}` : ''}
                          </p>
                        )}

                        {/* Advance / Due / Gateway Payment Breakdown */}
                        {(order.advancePaidAmount !== undefined ||
                          order.dueAmount !== undefined ||
                          order.paymentTrxId) && (
                          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                            {order.advancePaidAmount !== undefined && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold tabular-nums inline-flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                Advance Paid: ৳{order.advancePaidAmount.toLocaleString()}
                              </span>
                            )}
                            {order.dueAmount !== undefined && order.dueAmount > 0 && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold tabular-nums">
                                Due on Delivery: ৳{order.dueAmount.toLocaleString()}
                              </span>
                            )}
                            {order.paymentMethod && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700 font-mono">
                                {order.paymentMethod}
                              </span>
                            )}
                            {order.paymentTrxId && (
                              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono font-bold inline-flex items-center gap-1.5">
                                <span>TrxID: {order.paymentTrxId}</span>
                                <button
                                  type="button"
                                  onClick={() => copyText(order.paymentTrxId!, 'TrxID')}
                                  className="text-indigo-200 hover:text-white cursor-pointer"
                                  title="Copy TrxID"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            )}
                            {order.senderPhone && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700 font-mono inline-flex items-center gap-1.5">
                                <span>Sender: {order.senderPhone}</span>
                                <button
                                  type="button"
                                  onClick={() => copyText(order.senderPhone!, 'Sender Phone')}
                                  className="text-sky-200 hover:text-white cursor-pointer"
                                  title="Copy Sender Phone"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="font-bold text-white inline-flex items-center gap-1">
                              <span>{order.customerName}</span>
                              <button
                                type="button"
                                onClick={() => copyText(order.customerName, 'Customer Name')}
                                className="text-slate-400 hover:text-white cursor-pointer"
                                title="Copy Customer Name"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-sky-300 inline-flex items-center gap-1">
                              <span>{order.phone}</span>
                              <button
                                type="button"
                                onClick={() => copyText(order.phone, 'Phone')}
                                className="text-sky-400 hover:text-white cursor-pointer"
                                title="Copy Phone"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </span>
                            {order.altPhone && (
                              <span className="text-slate-400 font-mono">({order.altPhone})</span>
                            )}
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-slate-300 flex-1">
                              {order.address}
                              {(order.upazila || order.district || order.division) && (
                                <span className="text-slate-400">
                                  {' '}
                                  (
                                  {[order.upazila, order.district, order.division]
                                    .filter(Boolean)
                                    .join(', ')}
                                  )
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyText(
                                  `${order.address}${[order.upazila, order.district, order.division].filter(Boolean).length ? `, ${[order.upazila, order.district, order.division].filter(Boolean).join(', ')}` : ''}`,
                                  'Address'
                                )
                              }
                              className="text-emerald-400 hover:text-emerald-200 cursor-pointer shrink-0 mt-0.5"
                              title="Copy Delivery Address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {(order.weWillGetText || order.youWillGetText || order.notes) && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                            {order.weWillGetText && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                                We will get: {order.weWillGetText}
                              </span>
                            )}
                            {order.youWillGetText && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300">
                                You will get: {order.youWillGetText}
                              </span>
                            )}
                            {order.notes && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                                Note: {order.notes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!order.isSeen && (
                        <button
                          type="button"
                          onClick={() => togglePreOrderSeen(order.id)}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-300 border border-sky-500/30 text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Seen</span>
                        </button>
                      )}

                      <select
                        value={order.status}
                        onChange={(e) => {
                          updatePreOrderStatus(
                            order.id,
                            e.target.value as PreOrderRecord['status']
                          );
                          showToast(`Status updated to ${e.target.value}`, 'success');
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Canceled">Canceled</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => copyText(order.phone, 'Phone number')}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        title="Copy Phone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            `${order.customerName} | ${order.phone} | ${order.address} (${[
                              order.upazila,
                              order.district,
                              order.division,
                            ]
                              .filter(Boolean)
                              .join(', ')})`,
                            'Customer full address'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        Copy Info
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreOrderToDelete(order)}
                        className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete Pre-Order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRE-ORDER PRODUCTS 6-TAB STUDIO */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Upcoming Pre-Order Catalog (6-Tab Studio)
              </h4>
              <p className="text-[11px] text-slate-400">
                Upload bulk images, configure Fixed ৳ or % advance payment, Color × Size stock matrix, and SEO search keywords.
              </p>
            </div>
            {!isProductFormOpen && (
              <button
                type="button"
                onClick={() => {
                  resetProductForm();
                  setIsProductFormOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pre-Order Product</span>
              </button>
            )}
          </div>

          {isProductFormOpen && (
            <form
              onSubmit={handleSaveProduct}
              className="bg-slate-800/98 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h4 className="text-base font-extrabold text-amber-400 font-['Outfit'] flex items-center gap-2">
                  <span>
                    {editingProduct ? 'Edit Pre-Order Product' : 'Add New Pre-Order Product'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="p-1.5 rounded-xl bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 6-Tab Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-700/80 scrollbar-none text-xs font-bold">
                {[
                  { id: 'basic', label: '1. Basic Info', icon: Package },
                  { id: 'images', label: '2. Images & Gallery', icon: ImageIcon },
                  { id: 'pricing', label: '3. Pricing & Advance', icon: DollarSign },
                  { id: 'variations_and_stock', label: '4. Variations & Stock', icon: Layers },
                  { id: 'shipping', label: '5. Shipping', icon: Truck },
                  { id: 'seo', label: '6. SEO & Keywords', icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeFormTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFormTab(tab.id as PreOrderFormTab)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (!editingProduct) {
                            setSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '')
                            );
                          }
                        }}
                        placeholder="ChronoX Titanium Smartwatch"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="Upcoming">Upcoming</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#38BDF8] block mb-1">
                        Product Code / SKU
                      </label>
                      <input
                        type="text"
                        value={productCode}
                        onChange={(e) => setProductCode(e.target.value)}
                        placeholder="PRE-2026-01"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-[#38BDF8] block mb-1">
                        Product Tagline (Optional)
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Limited Edition Titanium Build • Early Bird Pre-Order"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Conditional We Will Get & You Will Get */}
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold">
                      <CalendarClock className="w-4 h-4" />
                      <span>
                        Optional Arrival &amp; Delivery Schedule (Shown ONLY when filled)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          We will get (e.g. "20 দিনের মধ্যে")
                        </label>
                        <input
                          type="text"
                          value={weWillGetText}
                          onChange={(e) => setWeWillGetText(e.target.value)}
                          placeholder="Leave empty to hide on website"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          You will get (e.g. "25 দিনের মধ্যে ডেলিভারি")
                        </label>
                        <input
                          type="text"
                          value={youWillGetText}
                          onChange={(e) => setYouWillGetText(e.target.value)}
                          placeholder="Leave empty to hide on website"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Full Product Description &amp; Highlights
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Full specifications, pre-order terms, materials, and highlights..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES & GALLERY (BULK UPLOAD) */}
              {activeFormTab === 'images' && (
                <div className="space-y-4 animate-fade-in">
                  <ImageGalleryUploader
                    images={images}
                    onChange={setImages}
                    maxImages={12}
                    label="Pre-Order Bulk Image Gallery & Main Photo *"
                    helperText="Select multiple photos at once from your device. Click 'Set Main' on any image to make it the primary photo."
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#38BDF8]" />
                      Product Video URL (Optional — MP4 or YouTube Embed URL)
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/... or https://.../video.mp4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & REQUIRED ADVANCE */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Regular Price (৳) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Pre-Order Price (৳) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={salePrice}
                        onChange={(e) => setSalePrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-sky-300 block mb-1">
                        Advance Rule Type
                      </label>
                      <select
                        value={advanceType}
                        onChange={(e) =>
                          setAdvanceType(e.target.value as 'fixed' | 'percent')
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-400"
                      >
                        <option value="fixed">Fixed Advance (৳ per unit)</option>
                        <option value="percent">Percentage Advance (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-sky-300 block mb-1">
                        {advanceType === 'percent'
                          ? 'Advance Percent (%)'
                          : 'Advance Amount (৳)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={advanceType === 'percent' ? 100 : undefined}
                        value={advanceValue}
                        onChange={(e) => setAdvanceValue(e.target.value)}
                        placeholder={
                          advanceType === 'percent'
                            ? 'e.g. 50 (blank = 100%)'
                            : 'e.g. 500 (blank = Full)'
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 text-xs space-y-1">
                    <p className="font-extrabold text-sky-300">
                      Customer Checkout Preview (Cash on Delivery 0% is always disabled for Pre-Orders):
                    </p>
                    <p className="text-slate-300">
                      Unit Price:{' '}
                      <strong className="text-white tabular-nums">
                        ৳{effectiveUnitForPreview.toLocaleString()}
                      </strong>{' '}
                      → Customer Pays Upfront:{' '}
                      <strong className="text-amber-300 tabular-nums">
                        ৳{computedUpfrontPreview.toLocaleString()}
                      </strong>{' '}
                      • Due on Delivery:{' '}
                      <strong className="text-emerald-300 tabular-nums">
                        ৳
                        {Math.max(
                          0,
                          effectiveUnitForPreview - computedUpfrontPreview
                        ).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: VARIATIONS & STOCK */}
              {activeFormTab === 'variations_and_stock' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-white">
                      <input
                        type="checkbox"
                        checked={enableColorVariant}
                        onChange={(e) => setEnableColorVariant(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <span>Enable Color Variants</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-white">
                      <input
                        type="checkbox"
                        checked={enableSizeVariant}
                        onChange={(e) => setEnableSizeVariant(e.target.checked)}
                        className="w-4 h-4 accent-sky-500"
                      />
                      <span>Enable Size Variants</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                        Default / Master Stock:
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={masterStock}
                        onChange={(e) => setMasterStock(Math.max(0, Number(e.target.value) || 0))}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 whitespace-nowrap">
                        Pre-Order Quota Limit:
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={preOrderMaxQuota}
                        onChange={(e) => setPreOrderMaxQuota(e.target.value)}
                        placeholder={String(masterStock || 50)}
                        className="w-20 bg-slate-950 border border-amber-500/40 rounded-lg p-1.5 text-xs text-amber-300 font-mono font-bold text-center"
                      />
                      {editingProduct && (
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          (Booked: {preOrderBookedCount})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Colors Management */}
                    {enableColorVariant && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase">Manage Colors</h5>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={colorHexInput}
                            onChange={(e) => setColorHexInput(e.target.value)}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={colorNameInput}
                            onChange={(e) => setColorNameInput(e.target.value)}
                            placeholder="Color Name (e.g. Titanium Black)"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={colorFileInputRef}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIsUploadingColorPhoto(true);
                                const url = await uploadImageToStorage(file, 'preorders/colors');
                                setColorImageInput(url || '');
                                setIsUploadingColorPhoto(false);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => colorFileInputRef.current?.click()}
                            className="flex-1 p-2 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white cursor-pointer"
                          >
                            {isUploadingColorPhoto
                              ? 'Uploading...'
                              : colorImageInput
                                ? '✅ Thumbnail Selected'
                                : '🖼️ Select Thumbnail'}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="px-4 bg-[#38BDF8] text-slate-900 rounded text-xs font-black cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>

                        <div className="space-y-2">
                          {colors.map((c, i) => (
                            <div
                              key={`${c.name}-${i}`}
                              className="flex items-center justify-between gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={c.enabled !== false}
                                  onChange={(e) => {
                                    const updated = [...colors];
                                    updated[i].enabled = e.target.checked;
                                    setColors(updated);
                                  }}
                                  className="w-3.5 h-3.5 accent-sky-400"
                                />
                                <span
                                  className="w-4 h-4 rounded-full border border-slate-500 shrink-0"
                                  style={{ backgroundColor: c.hex || '#000' }}
                                />
                                {c.image && (
                                  <img
                                    src={resolveStoreAssetUrl(c.image)}
                                    alt={c.name}
                                    referrerPolicy="no-referrer"
                                    className="w-6 h-6 rounded object-cover border border-slate-600 shrink-0"
                                  />
                                )}
                                <span className="text-xs font-bold text-white truncate">
                                  {c.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <label className="text-[10px] text-sky-400 font-bold cursor-pointer px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                                  <span>{c.image ? '📷 Edit' : '+ Photo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadImageToStorage(
                                          file,
                                          'preorders/colors'
                                        );
                                        const updated = [...colors];
                                        updated[i].image = url;
                                        setColors(updated);
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setEditingColorGallery(i)}
                                  className="text-sky-400 text-[10px] font-bold hover:underline cursor-pointer"
                                >
                                  Gallery ({c.gallery?.length || 0})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(i)}
                                  className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer px-1"
                                >
                                  ✕
                                </button>
                              </div>

                              {editingColorGallery === i && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
                                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-4">
                                      <h5 className="text-white font-bold text-xs uppercase">
                                        Color Gallery: {c.name}
                                      </h5>
                                      <button
                                        type="button"
                                        onClick={() => setEditingColorGallery(null)}
                                        className="text-slate-400 font-bold cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <ImageGalleryUploader
                                      images={c.gallery || []}
                                      onChange={(gal) => {
                                        const updated = [...colors];
                                        updated[i].gallery = gal;
                                        setColors(updated);
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes Management */}
                    {enableSizeVariant && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase">Manage Sizes</h5>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            placeholder="Size (e.g. M, 42, 44mm)"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddSize}
                            className="px-4 bg-[#38BDF8] text-slate-900 rounded text-xs font-black cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((s, i) => (
                            <div
                              key={`${s.size}-${i}`}
                              className="flex items-center gap-2 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
                            >
                              <span className="text-xs font-bold text-white">{s.size}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(i)}
                                className="text-rose-400 text-[10px] cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color x Size Stock Matrix */}
                  {enableColorVariant && enableSizeVariant && colors.length > 0 && sizes.length > 0 && (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3 overflow-x-auto">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">
                        Color × Size Pre-Order Allocation Matrix
                      </h5>
                      <table className="w-full text-xs text-slate-300 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-950/60">
                            <th className="p-2 text-left text-[10px] uppercase text-slate-400">
                              Color
                            </th>
                            {sizes.map((s) => (
                              <th
                                key={s.size}
                                className="p-2 text-center text-[10px] uppercase text-sky-400"
                              >
                                {s.size}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {colors.map((c) => {
                            const entry = variantQuantities[c.name] || {
                              activeSizes: [],
                              stock: {},
                            };
                            return (
                              <tr key={c.name} className="border-b border-slate-800">
                                <td className="p-2 font-bold text-white flex items-center gap-2">
                                  <span
                                    className="w-4 h-4 rounded-full border border-slate-500"
                                    style={{ backgroundColor: c.hex || '#000' }}
                                  />
                                  <span>{c.name}</span>
                                </td>
                                {sizes.map((s) => {
                                  const active = entry.activeSizes.includes(s.size);
                                  const qty = entry.stock[s.size] ?? 20;
                                  return (
                                    <td key={s.size} className="p-2 text-center">
                                      <div className="flex flex-col items-center gap-1">
                                        <input
                                          type="checkbox"
                                          checked={active}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setVariantQuantities((prev) => {
                                              const curr = prev[c.name] || {
                                                activeSizes: [],
                                                stock: {},
                                              };
                                              const nextSizes = checked
                                                ? [...curr.activeSizes, s.size]
                                                : curr.activeSizes.filter((x) => x !== s.size);
                                              return {
                                                ...prev,
                                                [c.name]: {
                                                  activeSizes: nextSizes,
                                                  stock: {
                                                    ...curr.stock,
                                                    [s.size]: curr.stock[s.size] ?? 20,
                                                  },
                                                },
                                              };
                                            });
                                          }}
                                          className="w-3.5 h-3.5 accent-emerald-500"
                                        />
                                        {active && (
                                          <input
                                            type="number"
                                            min={0}
                                            value={qty}
                                            onChange={(e) => {
                                              const val = Math.max(0, Number(e.target.value) || 0);
                                              setVariantQuantities((prev) => {
                                                const curr = prev[c.name] || {
                                                  activeSizes: [],
                                                  stock: {},
                                                };
                                                return {
                                                  ...prev,
                                                  [c.name]: {
                                                    ...curr,
                                                    stock: { ...curr.stock, [s.size]: val },
                                                  },
                                                };
                                              });
                                            }}
                                            className="w-12 bg-slate-950 border border-slate-700 rounded p-0.5 text-center font-mono text-[11px] text-white"
                                          />
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Per-Color Only Allocation */}
                  {enableColorVariant && !enableSizeVariant && colors.length > 0 && (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">
                        Per-Color Pre-Order Slot Allocation
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {colors.map((c, idx) => {
                          const qty = variantQuantities[c.name]?.stock?.['Standard'] ?? c.stock ?? masterStock ?? 20;
                          return (
                            <div key={`${c.name}-${idx}`} className="flex items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full border border-slate-500 shrink-0" style={{ backgroundColor: c.hex || '#000' }} />
                                <span className="text-xs font-bold text-white truncate">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value) || 0);
                                    setVariantQuantities((prev) => ({
                                      ...prev,
                                      [c.name]: {
                                        activeSizes: ['Standard'],
                                        stock: { ...(prev[c.name]?.stock || {}), Standard: val },
                                      },
                                    }));
                                    setColors((prev) => prev.map((col, cIdx) => cIdx === idx ? { ...col, stock: val, inStock: val > 0 } : col));
                                  }}
                                  className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center font-mono text-xs text-white"
                                />
                                <span className="text-[10px] text-slate-400">pcs</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Per-Size Only Allocation */}
                  {!enableColorVariant && enableSizeVariant && sizes.length > 0 && (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3">
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">
                        Per-Size Pre-Order Slot Allocation
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sizes.map((s, idx) => (
                          <div key={`${s.size}-${idx}`} className="flex items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-xs font-bold text-white">Size {s.size}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min={0}
                                value={s.stock ?? 0}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  setSizes((prev) => prev.map((item, sIdx) => sIdx === idx ? { ...item, stock: val } : item));
                                }}
                                className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center font-mono text-xs text-white"
                              />
                              <span className="text-[10px] text-slate-400">pcs</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SHIPPING */}
              {activeFormTab === 'shipping' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Package Weight
                      </label>
                      <input
                        type="text"
                        value={shippingWeight}
                        onChange={(e) => setShippingWeight(e.target.value)}
                        placeholder="0.4 kg"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Dimensions (L × W × H)
                      </label>
                      <input
                        type="text"
                        value={shippingDimensions}
                        onChange={(e) => setShippingDimensions(e.target.value)}
                        placeholder="30 x 25 x 4 cm"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFreeShipping}
                        onChange={(e) => setIsFreeShipping(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Free Delivery for this Pre-Order Product</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Displays Free Delivery badge and waives delivery charge at checkout.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO & SEARCH KEYWORDS */}
              {activeFormTab === 'seo' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Search / SEO Title
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="ChronoX Titanium Smartwatch Pre-Order | RycreoShop"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="chronox-titanium-smartwatch"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Short search preview summary..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Keywords Chip Tagger */}
                  <div className="pt-3 border-t border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Search Keywords ({keywords.length}/15)</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        placeholder="Enter search keywords (comma-separated or Enter)..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="px-4 py-2.5 rounded-xl bg-[#38BDF8] text-slate-900 text-xs font-bold hover:bg-sky-400 cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs"
                        >
                          <span>{kw}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setKeywords(keywords.filter((_, i) => i !== idx))
                            }
                            className="hover:text-rose-400 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-xs font-bold text-white">
                    Visible on Storefront (টিকমার্ক থাকলে ওয়েবসাইটে দেখাবে)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {editingProduct ? 'Update Pre-Order Product' : 'Save Pre-Order Product'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Pre-Order Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPreOrderProducts.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex gap-3.5 items-start ${
                  item.isVisible !== false
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-900/70 border-slate-800 opacity-75'
                }`}
              >
                <img
                  src={resolveStoreAssetUrl(item.images?.[0] || '')}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">
                        {item.category}
                      </span>
                      <h5 className="text-sm font-extrabold text-white line-clamp-1">
                        {item.title}
                      </h5>
                    </div>
                    <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={item.isVisible !== false}
                        onChange={(e) =>
                          updatePreOrderProduct({ ...item, isVisible: e.target.checked })
                        }
                        className="w-3.5 h-3.5 accent-amber-400 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-200">Visible</span>
                    </label>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span className="font-black text-white tabular-nums">
                      ৳{(item.salePrice || item.price).toLocaleString()}
                    </span>
                    {item.price > (item.salePrice || item.price) && (
                      <span className="text-slate-500 line-through tabular-nums">
                        ৳{item.price.toLocaleString()}
                      </span>
                    )}
                    {(item.advanceValue || item.advanceAmount) ? (
                      <span className="text-[10px] text-sky-300 bg-sky-500/15 px-1.5 py-0.5 rounded">
                        Advance:{' '}
                        {item.advanceType === 'percent' && item.advanceValue
                          ? `${item.advanceValue}%`
                          : `৳${item.advanceValue || item.advanceAmount}`}
                      </span>
                    ) : null}
                    {item.images && item.images.length > 1 && (
                      <span className="text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">
                        {item.images.length} photos
                      </span>
                    )}
                  </div>

                  {(item.weWillGetText || item.youWillGetText) && (
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {item.weWillGetText && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                          We will get: {item.weWillGetText}
                        </span>
                      )}
                      {item.youWillGetText && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-700">
                          You will get: {item.youWillGetText}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => movePreOrderProduct(item.id, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePreOrderProduct(item.id, 'down')}
                      disabled={idx === sortedPreOrderProducts.length - 1}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditProduct(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(item)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!preOrderToDelete}
        title="Delete Pre-Order Booking?"
        message={`Remove pre-order "${preOrderToDelete?.preOrderNumber}" for ${preOrderToDelete?.customerName}?`}
        confirmLabel="Yes, Delete"
        onConfirm={() => {
          if (preOrderToDelete) {
            deletePreOrder(preOrderToDelete.id);
            showToast(`Deleted pre-order ${preOrderToDelete.preOrderNumber}`, 'success');
            setPreOrderToDelete(null);
          }
        }}
        onCancel={() => setPreOrderToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Pre-Order Product?"
        message={`Remove "${productToDelete?.title}" from Upcoming Pre-Order Products?`}
        confirmLabel="Yes, Delete"
        onConfirm={async () => {
          if (productToDelete) {
            await deletePreOrderProduct(productToDelete.id);
            showToast(`Deleted "${productToDelete.title}"`, 'success');
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
