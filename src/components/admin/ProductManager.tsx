import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Sparkles, 
  Check, 
  Video, 
  Image as ImageIcon, 
  Layers, 
  Sliders, 
  DollarSign, 
  Package, 
  Globe, 
  Truck, 
  Palette,
  X,
  AlertCircle,
  Tag,
  Flame,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariation, ProductColorVariant, ProductSizeStock } from '../../types/store';
import { ImageGalleryUploader } from '../common/ImageGalleryUploader';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage } from '../../storageService';

import { computeAutoTotalStock } from '../../utils/stockHelper';

type FormTab = 'basic' | 'images' | 'pricing' | 'variations_and_stock' | 'shipping' | 'seo';

export const ProductManager: React.FC = () => {
  const { products, categories, attributes, storeConfig, updateStoreConfig, addProduct, updateProduct, deleteProduct, deleteProducts, moveProduct, updateProductPosition, isLoading, error } = useStore();
  const { showToast } = useToast();

  // Our Products Storefront Grid Layout Controls
  const [layoutMaxRows, setLayoutMaxRows] = useState<number>(
    storeConfig.sectionLayouts?.ourProducts?.maxRows ?? 4
  );
  const [layoutMobileRows, setLayoutMobileRows] = useState<number>(
    storeConfig.sectionLayouts?.ourProducts?.mobileMaxRows ?? 4
  );
  const [layoutDesktopCols, setLayoutDesktopCols] = useState<number>(
    storeConfig.sectionLayouts?.ourProducts?.desktopColumns ?? 4
  );
  const [layoutMaxPerRow, setLayoutMaxPerRow] = useState<number>(
    storeConfig.sectionLayouts?.ourProducts?.maxItemsPerRow ?? 20
  );

  const handleSaveGridLayout = () => {
    const existingLayouts = storeConfig.sectionLayouts || {
      ourProducts: { maxRows: 4, mobileMaxRows: 4, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 3 },
      preOrder: { maxRows: 3, mobileMaxRows: 4, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 3 },
      buyMore: { maxRows: 2, mobileMaxRows: 2, desktopColumns: 4, mobileColumns: 2, maxItemsPerRow: 20, autoSingleRowThreshold: 4 },
    };
    updateStoreConfig({
      sectionLayouts: {
        ...existingLayouts,
        ourProducts: {
          ...existingLayouts.ourProducts,
          maxRows: Math.min(20, Math.max(1, Number(layoutMaxRows) || 4)),
          mobileMaxRows: Math.min(20, Math.max(1, Number(layoutMobileRows) || 4)),
          desktopColumns: Math.min(6, Math.max(2, Number(layoutDesktopCols) || 4)),
          mobileColumns: existingLayouts.ourProducts?.mobileColumns ?? 2,
          maxItemsPerRow: Math.min(50, Math.max(4, Number(layoutMaxPerRow) || 20)),
        },
      },
    });
    showToast('Our Products storefront grid layout saved!', 'success');
  };

  const submitLockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Single delete modal state
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  // Bulk selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Form State - Basic
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('RycreoShop');
  const [sku, setSku] = useState('');
  const [productCode, setProductCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');

  // Pre-Order Management State
  const [availability, setAvailability] = useState<'available' | 'preorder'>('available');
  const [preOrderDays, setPreOrderDays] = useState<number>(20);
  const [preOrderQuantityLimit, setPreOrderQuantityLimit] = useState<number | ''>('');

  // Wholesale & Reseller State
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [resellerPrice, setResellerPrice] = useState<number | ''>('');

  // Form State - Images
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Form State - Pricing
  const [price, setPrice] = useState(1500);
  const [salePrice, setSalePrice] = useState(1200);
  const [rating, setRating] = useState<number>(5.0);
  const [isFestiveSpecial, setIsFestiveSpecial] = useState(false);
  const [discountBadge, setDiscountBadge] = useState('');
  const [tag, setTag] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Form State - Inventory / Variations (Merged)
  const [stock, setStock] = useState(25);
  const [trackStock, setTrackStock] = useState(true);
  
  // New Inventory Tracking State
  const [autoStockManagementEnabled, setAutoStockManagementEnabled] = useState(true);
  const [manualStockInputEnabled, setManualStockInputEnabled] = useState(false);
  const [manualMasterStock, setManualMasterStock] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(5);
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState(true);

  const [categoryAttrs, setCategoryAttrs] = useState<{ [key: string]: string }>({});
  const [colors, setColors] = useState<ProductColorVariant[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#EF4444');
  const [colorEnabledInput, setColorEnabledInput] = useState(true);
  const [colorImageInput, setColorImageInput] = useState<string>('');
  const colorFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingColorPhoto, setIsUploadingColorPhoto] = useState(false);
  const [editingColorGallery, setEditingColorGallery] = useState<number | null>(null);
  const [sizes, setSizes] = useState<ProductSizeStock[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [sizeStockInput, setSizeStockInput] = useState(10);
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [hasColorVariants, setHasColorVariants] = useState<boolean>(true);
  const [enableSizeVariant, setEnableSizeVariant] = useState<boolean>(true);
  const [enableColorVariant, setEnableColorVariant] = useState<boolean>(true);

  interface VariantData {
    autoCalculate: boolean;
    activeSizes: string[];
    stock: Record<string, number>;
    lowStockAlert?: number;
    [key: string]: any;
  }

  const [variantQuantities, setVariantQuantities] = useState<Record<string, VariantData>>({});

  // Form State - Shipping
  const [shippingWeight, setShippingWeight] = useState('0.4 kg');
  const [shippingDimensions, setShippingDimensions] = useState('30 x 25 x 4 cm');

  // Form State - SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Form State - Keywords & Sold Count
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [soldCount, setSoldCount] = useState<number | ''>('');
  const [baseSoldCount, setBaseSoldCount] = useState<number | ''>('');
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [orderWeight, setOrderWeight] = useState<number | ''>('');

  // Category-Based Defaults Helper
  const getCategoryAttributeDefaults = (catName: string) => {
    const lower = (catName || '').toLowerCase().trim();
    if (lower.includes('watch') || lower.includes('clock') || lower.includes('timepiece')) {
      // Watches: Enable Size only (Color hidden/excluded)
      return { 
        enableSize: true, 
        enableColor: false, 
        presetName: 'Watches Preset',
        badgeColor: 'text-amber-400 bg-amber-950/70 border-amber-600/40',
        note: 'Size enabled (dial/strap size), Color excluded by default'
      };
    } else if (
      lower.includes('eye') || 
      lower.includes('glass') || 
      lower.includes('spectacle') || 
      lower.includes('sunglass') ||
      lower.includes('optical') ||
      lower.includes('frame')
    ) {
      // Eyewear: Enable Color only (Size hidden/excluded)
      return { 
        enableSize: false, 
        enableColor: true, 
        presetName: 'Eyewear Preset',
        badgeColor: 'text-sky-400 bg-sky-950/70 border-sky-600/40',
        note: 'Color enabled (frame/lens tint), Size excluded by default'
      };
    } else if (
      lower.includes('cloth') || 
      lower.includes('fashion') || 
      lower.includes('apparel') || 
      lower.includes('shirt') || 
      lower.includes('panjabi') || 
      lower.includes('dress') || 
      lower.includes('kurta') ||
      lower.includes('pant') ||
      lower.includes('t-shirt') ||
      lower.includes('polo') ||
      lower.includes('shoe') ||
      lower.includes('festive') ||
      lower.includes('eid') ||
      lower.includes('puja')
    ) {
      // Clothing: Enable both Size & Color (optional to toggle off)
      return { 
        enableSize: true, 
        enableColor: true, 
        presetName: 'Clothing Preset',
        badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-600/40',
        note: 'Both Size & Color enabled by default (optional to toggle off)'
      };
    } else {
      // Other/General categories (e.g. Electronics, Books, Accessories, Gadgets)
      return { 
        enableSize: false, 
        enableColor: false, 
        presetName: 'General / Simple Preset',
        badgeColor: 'text-purple-400 bg-purple-950/70 border-purple-600/40',
        note: 'Attributes optional (leave unchecked for simple product)'
      };
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setSubcategory('');
    const defs = getCategoryAttributeDefaults(newCat);
    setEnableSizeVariant(defs.enableSize);
    setEnableColorVariant(defs.enableColor);
    setHasColorVariants(defs.enableColor);
    showToast(`Applied ${defs.presetName}: ${defs.note}`, 'info');
  };

  const currentCategoryObj = categories.find(c => c.name.toLowerCase() === category.toLowerCase());

  // Filter attributes dynamically matching the selected category
  const applicableAttributes = attributes.filter(a => 
    a.assignedCategories.includes('all') || a.assignedCategories.includes(category)
  );

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const tokens = keywordInput.split(/[,;\n]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    const updated = [...keywords];
    for (const t of tokens) {
      if (!updated.includes(t) && updated.length < 15) {
        updated.push(t);
      }
    }
    setKeywords(updated);
    setKeywordInput('');
    if (updated.length >= 15) {
      showToast("Reached 15 custom search keywords limit!", "info");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setTitleBn('');
    setSlug('');
    setCategory('Clothing');
    setSubcategory('');
    setBrand('RycreoShop');
    setSku('');
    setDescription('');
    setDescriptionBn('');
    setAvailability('available');
    setPreOrderDays(20);
    setPreOrderQuantityLimit('');
    setWholesalePrice('');
    setResellerPrice('');
    setImages([]);
    setVideoUrl('');
    setPrice(1500);
    setSalePrice(1200);
    setIsFestiveSpecial(false);
    setDiscountBadge('');
    setTag('');
    setIsFeatured(false);
    setStock(25);
    setTrackStock(true);
    setAutoStockManagementEnabled(true);
    setManualStockInputEnabled(false);
    setManualMasterStock('');
    setLowStockThreshold(5);
    setLowStockAlertEnabled(true);
    setCategoryAttrs({});
    setColors([]);
    setColorNameInput('');
    setColorImageInput('');
    setColorHexInput('#0F172A');
    setSizes([
      { size: 'S', stock: 5 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 8 },
      { size: 'XL', stock: 5 }
    ]);
    setSizeInput('');
    setHasVariations(false);
    setVariations([]);
    setShippingWeight('0.4 kg');
    setShippingDimensions('30 x 25 x 4 cm');
    setSeoTitle('');
    setSeoDescription('');
    setKeywords([]);
    setKeywordInput('');
    setProductCode('');
    setTagline('');
    setSoldCount('');
    setBaseSoldCount('');
    // Apply Clothing category defaults by default
    const catDefaults = getCategoryAttributeDefaults('Clothing');
    setEnableSizeVariant(catDefaults.enableSize);
    setEnableColorVariant(catDefaults.enableColor);
    setHasColorVariants(catDefaults.enableColor);
    setIsFreeShipping(false);
    setOrderWeight('');
    setRating(5.0);
    setEditingProduct(null);
    setIsFormOpen(false);
    setActiveTab('basic');
  };

  const handleStartEdit = (p: Product) => {
    const formElement = document.getElementById('product-edit-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setEditingProduct(p);
    setTitle(p.title);
    setTitleBn(p.titleBn || '');
    setSlug(p.slug || '');
    setCategory(p.category);
    setSubcategory(p.subcategory || '');
    setBrand(p.brand || 'RycreoShop');
    setSku(p.sku || '');
    setDescription(p.description || '');
    setDescriptionBn(p.descriptionBn || '');
    setAvailability(p.availability || (p.isPreOrder ? 'preorder' : 'available'));
    setPreOrderDays(p.preOrderDays || 20);
    setPreOrderQuantityLimit(p.preOrderQuantityLimit ?? '');
    setWholesalePrice(p.wholesalePrice ?? '');
    setResellerPrice(p.resellerPrice ?? '');
    setImages(p.images || []);
    setVideoUrl(p.videoUrl || '');
    setPrice(p.price);
    setSalePrice(p.salePrice);
    setRating(p.rating ?? 5.0);
    setIsFestiveSpecial(!!(p.isFestiveSpecial || p.isPujaSpecial));
    setDiscountBadge(p.discountBadge || '');
    setTag(p.tag || '');
    setIsFeatured(!!p.isFeatured);
    setStock(p.stock ?? 20);
    setTrackStock(p.trackStock ?? true);
    setAutoStockManagementEnabled(p.autoStockManagementEnabled ?? true);
    setManualStockInputEnabled(p.manualStockInputEnabled ?? false);
    setManualMasterStock(p.manualMasterStock ?? '');
    setLowStockThreshold(p.lowStockThreshold ?? 5);
    setLowStockAlertEnabled(p.lowStockAlertEnabled ?? true);
    setCategoryAttrs((p.attributes as any) || {});
    setColors(p.colors || []);
    setSizes(p.sizes || []);
    setHasVariations(!!p.variations && p.variations.length > 0);
    setVariations(p.variations || []);
    setHasColorVariants(p.hasColorVariants ?? (p.colors && p.colors.length > 0 ? true : false));

    // Dynamic Attribute Toggles initialization for editing
    const hasSizes = (p.sizes && p.sizes.length > 0) || 
      Boolean(p.variations && p.variations.some(v => Boolean(v.combination['Size'] || v.combination['Waist Size'] || v.combination['Storage'])));
    
    const hasColors = (p.colors && p.colors.length > 0) || 
      p.hasColorVariants === true || 
      Boolean(p.variations && p.variations.some(v => Boolean(v.combination['Color'])));

    setEnableSizeVariant(Boolean(hasSizes));
    setEnableColorVariant(Boolean(hasColors));

    // Reconstruct variantQuantities matrix per color and size from variations
    const initialVarMap: Record<string, VariantData> = {};
    const prodColors = p.colors || [];
    const prodSizes = p.sizes || [];

    prodColors.forEach(col => {
      initialVarMap[col.name] = {
        autoCalculate: false,
        activeSizes: [],
        stock: {},
        lowStockAlert: p.lowStockThreshold ?? 5
      };
    });

    if (p.variations && p.variations.length > 0) {
      p.variations.forEach(v => {
        const col = v.combination['Color'];
        const sz = v.combination['Size'] || v.combination['Waist Size'] || v.combination['Storage'] || 'Standard';
        if (col) {
          if (!initialVarMap[col]) {
            initialVarMap[col] = { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: p.lowStockThreshold ?? 5 };
          }
          if (!initialVarMap[col].activeSizes.includes(sz)) {
            initialVarMap[col].activeSizes.push(sz);
          }
          initialVarMap[col].stock[sz] = v.stock ?? 0;
        }
      });
    } else {
      // If no variations array exists yet, initialize sizes or color-only 'Standard' stock
      prodColors.forEach(col => {
        if (initialVarMap[col.name]) {
          if (prodSizes.length > 0) {
            initialVarMap[col.name].activeSizes = prodSizes.map(s => s.size);
            prodSizes.forEach(s => {
              initialVarMap[col.name].stock[s.size] = s.stock ?? 10;
            });
          } else {
            initialVarMap[col.name].activeSizes = ['Standard'];
            initialVarMap[col.name].stock['Standard'] = col.stock ?? 10;
          }
        }
      });
    }
    setVariantQuantities(initialVarMap);

    setShippingWeight(p.shippingWeight || '');
    setShippingDimensions(p.shippingDimensions || '');
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setKeywords(p.keywords || []);
    setKeywordInput('');
    setProductCode(p.productCode || '');
    setTagline(p.tagline || '');
    const effectiveBase = p.baseSoldCount !== undefined && p.baseSoldCount !== null ? p.baseSoldCount : (p.soldCount !== undefined && p.soldCount !== null ? p.soldCount : '');
    setBaseSoldCount(effectiveBase);
    setSoldCount(p.soldCount !== undefined && p.soldCount !== null ? p.soldCount : '');
    setIsFreeShipping(!!p.isFreeShipping);
    setOrderWeight(p.position !== undefined && p.position !== null ? p.position : (p.order !== undefined && p.order !== null ? p.order : ''));
    setIsFormOpen(true);
    setActiveTab('basic');
  };

  // Add Color Variant
  const handleAddColor = () => {
    const trimmed = colorNameInput.trim();
    if (trimmed) {
      const newColor: ProductColorVariant = { 
        name: trimmed, 
        hex: colorHexInput,
        image: colorImageInput || undefined,
        gallery: [],
        enabled: colorEnabledInput
      };
      setColors([...colors, newColor]);

      // Initialize matrix for new color with all current sizes
      setVariantQuantities(prev => ({
        ...prev,
        [trimmed]: {
          autoCalculate: false,
          activeSizes: sizes.map(s => s.size),
          stock: sizes.reduce((acc, s) => ({ ...acc, [s.size]: s.stock || 10 }), {}),
          lowStockAlert: Number(lowStockThreshold) || 5
        }
      }));

      setColorNameInput('');
      setColorImageInput('');
      setColorEnabledInput(true);
    }
  };

  const handleRemoveColor = (index: number) => {
    const colName = colors[index]?.name;
    setColors(colors.filter((_, i) => i !== index));
    if (colName) {
      setVariantQuantities(prev => {
        const next = { ...prev };
        delete next[colName];
        return next;
      });
    }
  };

  // Add Size Variant
  const handleAddSize = () => {
    const trimmedSize = sizeInput.trim().toUpperCase();
    if (trimmedSize) {
      const newSize: ProductSizeStock = { size: trimmedSize, stock: sizeStockInput };
      setSizes([...sizes, newSize]);

      // Enable and populate this size across all existing colors in matrix
      setVariantQuantities(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(colName => {
          if (!next[colName].activeSizes.includes(trimmedSize)) {
            next[colName] = {
              ...next[colName],
              activeSizes: [...next[colName].activeSizes, trimmedSize],
              stock: { ...next[colName].stock, [trimmedSize]: sizeStockInput }
            };
          }
        });
        return next;
      });

      setSizeInput('');
    }
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Generate Variations Matrix automatically from Colors x Sizes
  const handleGenerateVariations = () => {
    const newVars: ProductVariation[] = [];

    const effectiveColors = enableColorVariant ? colors : [];
    const effectiveSizes = enableSizeVariant ? sizes : [];

    if (effectiveColors.length > 0 && effectiveSizes.length > 0) {
      effectiveColors.forEach(col => {
        effectiveSizes.forEach(sz => {
          newVars.push({
            id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            combination: { "Color": col.name, "Size": sz.size },
            price: price,
            salePrice: salePrice > 0 ? salePrice : undefined,
            stock: sz.stock || 5,
            sku: `${sku || 'RYC'}-${col.name.slice(0, 2).toUpperCase()}-${sz.size}`,
            inStock: true
          });
        });
      });
    } else if (effectiveColors.length > 0) {
      effectiveColors.forEach(col => {
        newVars.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          combination: { "Color": col.name },
          price: price,
          salePrice: salePrice > 0 ? salePrice : undefined,
          stock: 10,
          sku: `${sku || 'RYC'}-${col.name.slice(0, 3).toUpperCase()}`,
          inStock: true
        });
      });
    } else if (effectiveSizes.length > 0) {
      effectiveSizes.forEach(sz => {
        newVars.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          combination: { "Size": sz.size },
          price: price,
          salePrice: salePrice > 0 ? salePrice : undefined,
          stock: sz.stock || 10,
          sku: `${sku || 'RYC'}-${sz.size}`,
          inStock: true
        });
      });
    }

    if (newVars.length > 0) {
      setVariations(newVars);
      setHasVariations(true);
      showToast(`Generated ${newVars.length} variation combinations!`, 'success');
    } else {
      if (!enableSizeVariant && !enableColorVariant) {
        showToast("Both Size and Color attributes are excluded for this product (Simple Product mode).", 'info');
      } else {
        showToast("Please add at least one active option (Color or Size) to auto-generate variations!", 'error');
      }
    }
  };

  const handleAddSingleVariation = () => {
    setVariations([
      ...variations,
      {
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        combination: { "Option": `Variant ${variations.length + 1}` },
        price: price,
        salePrice: salePrice > 0 ? salePrice : undefined,
        stock: 10,
        sku: `${sku || 'RYC'}-V${variations.length + 1}`,
        inStock: true
      }
    ]);
  };

  const handleUpdateVariation = (index: number, field: keyof ProductVariation, val: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: val };
    setVariations(updated);
  };

  const handleRemoveVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting) {
      console.log("[ProductManager] Form submission locked to prevent duplicate product entry.");
      return;
    }
    submitLockRef.current = true;
    setIsSubmitting(true);

    if (!title.trim()) {
      showToast("Please enter Product Title!", 'error');
      setActiveTab('basic');
      submitLockRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!price || price <= 0) {
      showToast("Please enter a valid Regular Price!", 'error');
      setActiveTab('pricing');
      submitLockRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const rawImages = images.length > 0 ? images : [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800"
    ];
    const processedImages: string[] = await Promise.all(
      rawImages.map(async (img) => {
        if (img.startsWith('blob:') || img.startsWith('data:')) {
          try {
            const safeUrl = await uploadImageToStorage(img, 'products');
            return safeUrl || img;
          } catch {
            return img;
          }
        }
        return img;
      })
    );
    const finalImages = processedImages.length > 0 ? processedImages : [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800"
    ];

    const finalSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Dynamic Attribute Exclusions
    const finalSizes = enableSizeVariant ? sizes : [];

    // Variations logic: independent stock management per color and size
    const finalVariations: ProductVariation[] = [];
    if (enableColorVariant && enableSizeVariant) {
        colors.forEach(col => {
            const colData = variantQuantities[col.name];
            sizes.forEach(sz => {
                const isActive = colData?.activeSizes?.includes(sz.size);
                const stockVal = colData?.stock?.[sz.size] !== undefined ? colData.stock[sz.size] : 0;
                // If the size is active (ticked) for this color, include it as an available or out-of-stock variant
                if (isActive) {
                    const numStock = Math.max(0, Number(stockVal) || 0);
                    finalVariations.push({
                        id: `var-${col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sz.size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                        combination: { "Color": col.name, "Size": sz.size },
                        price: price,
                        salePrice: salePrice > 0 ? salePrice : undefined,
                        stock: numStock,
                        sku: `${sku || 'RYC'}-${col.name.slice(0, 2).toUpperCase()}-${sz.size}`,
                        inStock: numStock > 0
                    });
                }
            });
        });
    } else if (enableColorVariant) {
        colors.forEach(col => {
            const explicitStandard = variantQuantities[col.name]?.stock?.['Standard'];
            const sumMap = variantQuantities[col.name]
              ? Object.values(variantQuantities[col.name].stock || {}).reduce((s, v) => s + (Number(v) || 0), 0)
              : undefined;
            const stockVal = explicitStandard !== undefined
              ? explicitStandard
              : (col.stock !== undefined ? col.stock : (sumMap ?? 10));
            const numStock = Math.max(0, Number(stockVal) || 0);
            finalVariations.push({
                id: `var-${col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                combination: { "Color": col.name },
                price: price,
                salePrice: salePrice > 0 ? salePrice : undefined,
                stock: numStock,
                sku: `${sku || 'RYC'}-${col.name.slice(0, 3).toUpperCase()}`,
                inStock: numStock > 0
            });
        });
    } else if (enableSizeVariant) {
        sizes.forEach(sz => {
            const numStock = Math.max(0, Number(sz.stock) || 0);
            finalVariations.push({
                id: `var-${sz.size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                combination: { "Size": sz.size },
                price: price,
                salePrice: salePrice > 0 ? salePrice : undefined,
                stock: numStock,
                sku: `${sku || 'RYC'}-${sz.size}`,
                inStock: numStock > 0
            });
        });
    }

    // Colors with exact calculated stock per color and permanent Firebase Storage uploaded images
    let finalColors: ProductColorVariant[] | undefined = undefined;
    if (enableColorVariant && colors.length > 0) {
      finalColors = await Promise.all(colors.map(async (col) => {
        let colImg = col.image;
        if (colImg && (colImg.startsWith('blob:') || colImg.startsWith('data:'))) {
          try {
            colImg = await uploadImageToStorage(colImg, 'products/colors');
          } catch (err) {
            console.warn("[ProductManager] Color image upload fallback:", err);
          }
        }
        let colGallery = col.gallery;
        if (Array.isArray(colGallery) && colGallery.length > 0) {
          colGallery = await Promise.all(colGallery.map(async (gImg) => {
            if (gImg && (gImg.startsWith('blob:') || gImg.startsWith('data:'))) {
              try {
                return await uploadImageToStorage(gImg, 'products/colors');
              } catch {
                return gImg;
              }
            }
            return gImg;
          }));
        }

        const colVars = finalVariations.filter(v => v.combination['Color'] === col.name);
        const colTotalStock = colVars.length > 0
            ? colVars.reduce((sum, v) => sum + (v.stock || 0), 0)
            : (variantQuantities[col.name]
                ? Object.values(variantQuantities[col.name].stock || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)
                : 0);

        return {
            ...col,
            image: colImg && !colImg.startsWith('blob:') ? colImg : undefined,
            gallery: colGallery,
            stock: colTotalStock,
            inStock: colTotalStock > 0 && col.enabled !== false
        };
      }));
    }
    const finalHasColorVariants = enableColorVariant ? hasColorVariants : false;

    // Ensure all color photos and galleries are included in finalImages for seamless access
    if (finalColors && finalColors.length > 0) {
      finalColors.forEach(col => {
        if (col.image && !finalImages.includes(col.image)) {
          finalImages.push(col.image);
        }
        if (Array.isArray(col.gallery)) {
          col.gallery.forEach(g => {
            if (g && !finalImages.includes(g)) finalImages.push(g);
          });
        }
      });
    }

    const calculatedStock = finalVariations && finalVariations.length > 0
      ? finalVariations.reduce((sum, v) => sum + (v.stock || 0), 0)
      : (enableSizeVariant && finalSizes.length > 0
          ? finalSizes.reduce((sum, s) => sum + (s.stock || 0), 0)
          : (manualStockInputEnabled && typeof manualMasterStock === 'number' && !isNaN(manualMasterStock) ? manualMasterStock : Math.max(0, Number(stock || 0))));

    const parsedBaseSoldCount = typeof baseSoldCount === 'number' ? baseSoldCount : (baseSoldCount === '' ? undefined : parseInt(String(baseSoldCount), 10));
    const finalBaseSoldCount = typeof parsedBaseSoldCount === 'number' && !isNaN(parsedBaseSoldCount) && parsedBaseSoldCount >= 0 ? parsedBaseSoldCount : undefined;

    const realSalesCount = editingProduct?.realSalesCount || 0;
    const computedSoldCount = (finalBaseSoldCount ?? 0) + realSalesCount;
    const finalSoldCount = computedSoldCount > 0 ? computedSoldCount : undefined;

    const parsedOrder = typeof orderWeight === 'number' ? orderWeight : (orderWeight === '' ? (editingProduct ? undefined : 1) : parseInt(String(orderWeight), 10));
    const finalOrder = typeof parsedOrder === 'number' && !isNaN(parsedOrder) ? parsedOrder : (editingProduct ? undefined : 1);
    const finalPosition = finalOrder;

    const computedDiscountBadge = discountBadge.trim() || 
      (price > 0 && salePrice > 0 && salePrice < price ? `${Math.round(((price - salePrice) / price) * 100)}% OFF` : undefined);

    try {
      if (editingProduct) {
        console.log(`[ProductManager handleSave] Updating product: "${title.trim()}" (ID: ${editingProduct.id})`);
        const updatedPayload = {
          ...editingProduct,
          title: title.trim(),
          titleBn: titleBn.trim() || undefined,
          slug: finalSlug,
          category,
          subcategory: subcategory.trim() || undefined,
          brand: brand.trim() || 'RycreoShop',
          sku: sku.trim() || undefined,
          price,
          salePrice,
          wholesalePrice: wholesalePrice !== '' ? Number(wholesalePrice) : undefined,
          resellerPrice: resellerPrice !== '' ? Number(resellerPrice) : undefined,
          availability,
          isPreOrder: availability === 'preorder',
          preOrderDays: Number(preOrderDays) || 20,
          preOrderQuantityLimit: preOrderQuantityLimit !== '' ? Number(preOrderQuantityLimit) : undefined,
          images: finalImages,
          videoUrl: videoUrl.trim() || undefined,
          sizes: finalSizes,
          colors: finalColors,
          attributes: categoryAttrs,
          hasColorVariants: finalHasColorVariants,
          variations: finalVariations,
          description: description.trim(),
          descriptionBn: descriptionBn.trim() || undefined,
          isFestiveSpecial,
          isPujaSpecial: isFestiveSpecial,
          discountBadge: computedDiscountBadge,
          tag: tag.trim() || undefined,
          productCode: productCode.trim() || undefined,
          tagline: tagline.trim() || undefined,
          isFeatured,
          stock: calculatedStock,
          trackStock,
          keywords: keywords.length > 0 ? keywords : undefined,
          baseSoldCount: finalBaseSoldCount,
          realSalesCount,
          soldCount: finalSoldCount,
          isFreeShipping,
          order: finalOrder,
          position: finalPosition,
          autoStockManagementEnabled,
          manualStockInputEnabled,
          manualMasterStock: manualMasterStock !== '' ? Number(manualMasterStock) : undefined,
          lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : undefined,
          lowStockAlertEnabled,
          shippingWeight: shippingWeight.trim() || undefined,
          shippingDimensions: shippingDimensions.trim() || undefined,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined,
          rating: Number(Number(rating).toFixed(2))
        };

        const success = await updateProduct(updatedPayload);
        if (success !== false) {
          showToast(`Updated product "${title.trim()}" successfully!`, 'success');
          resetForm();
        } else {
          showToast("Failed to update product in Firestore. Check console logs for permission details.", 'error');
        }
      } else {
        console.log(`[ProductManager handleSave] Adding new product: "${title.trim()}"`);
        const newProductPayload = {
          title: title.trim(),
          titleBn: titleBn.trim() || undefined,
          slug: finalSlug,
          category,
          subcategory: subcategory.trim() || undefined,
          brand: brand.trim() || 'RycreoShop',
          sku: sku.trim() || undefined,
          price,
          salePrice,
          wholesalePrice: wholesalePrice !== '' ? Number(wholesalePrice) : undefined,
          resellerPrice: resellerPrice !== '' ? Number(resellerPrice) : undefined,
          availability,
          isPreOrder: availability === 'preorder',
          preOrderDays: Number(preOrderDays) || 20,
          preOrderQuantityLimit: preOrderQuantityLimit !== '' ? Number(preOrderQuantityLimit) : undefined,
          rating: Number(Number(rating).toFixed(2)),
          reviewCount: 0,
          images: finalImages,
          videoUrl: videoUrl.trim() || undefined,
          sizes: finalSizes,
          colors: finalColors,
          attributes: categoryAttrs,
          hasColorVariants: finalHasColorVariants,
          variations: finalVariations,
          description: description.trim(),
          descriptionBn: descriptionBn.trim() || undefined,
          isFestiveSpecial,
          isPujaSpecial: isFestiveSpecial,
          discountBadge: computedDiscountBadge,
          tag: tag.trim() || undefined,
          productCode: productCode.trim() || undefined,
          tagline: tagline.trim() || undefined,
          isFeatured,
          stock: calculatedStock,
          trackStock,
          keywords: keywords.length > 0 ? keywords : undefined,
          baseSoldCount: finalBaseSoldCount,
          realSalesCount: 0,
          soldCount: finalSoldCount,
          isFreeShipping,
          order: finalOrder,
          position: finalPosition,
          autoStockManagementEnabled,
          manualStockInputEnabled,
          manualMasterStock: manualMasterStock !== '' ? Number(manualMasterStock) : undefined,
          lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : undefined,
          lowStockAlertEnabled,
          shippingWeight: shippingWeight.trim() || undefined,
          shippingDimensions: shippingDimensions.trim() || undefined,
          seoTitle: seoTitle.trim() || undefined,
          seoDescription: seoDescription.trim() || undefined
        };

        const success = await addProduct(newProductPayload);
        if (success !== false) {
          showToast(`Published product "${title.trim()}" successfully!`, 'success');
          resetForm();
        } else {
          showToast("Failed to publish product to Firestore. Check console logs for permission details.", 'error');
        }
      }
    } catch (err: any) {
      console.error("[ProductManager handleSave: CRITICAL ERROR]", {
        action: editingProduct ? "updateProduct" : "addProduct",
        productTitle: title.trim(),
        productId: editingProduct?.id || "new",
        errorCode: err?.code || "unknown",
        errorMessage: err?.message || String(err),
        stack: err?.stack,
        rawError: err
      });
      showToast(err?.message || "Failed to save product. Check browser console for Firestore permission details.", 'error');
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const targetToDelete = productToDelete;
    // Dismiss confirmation popup immediately so UI is responsive and never hangs
    setProductToDelete(null);

    console.log(`[ProductManager confirmDeleteProduct] Initiating deletion for: "${targetToDelete.title}" (ID: ${targetToDelete.id})`);
    try {
      const success = await deleteProduct(targetToDelete.id);
      if (success) {
        showToast(`Deleted product "${targetToDelete.title}" permanently!`, 'success');
      } else {
        showToast("Failed to delete product from Firestore. Check console for details.", 'error');
      }
    } catch (err: any) {
      console.error("[ProductManager confirmDeleteProduct: CRITICAL ERROR]", {
        action: "deleteProduct",
        productId: targetToDelete.id,
        productTitle: targetToDelete.title,
        errorCode: err?.code || "unknown",
        errorMessage: err?.message || String(err),
        stack: err?.stack,
        rawError: err
      });
      showToast(err?.message || "Failed to delete product. Check browser console for details.", 'error');
    }
  };

  const toggleSelectAll = (itemsToSelect: Product[]) => {
    if (selectedProductIds.length === itemsToSelect.length && itemsToSelect.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(itemsToSelect.map(p => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const confirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleting(true);
    const count = selectedProductIds.length;
    try {
      const success = await deleteProducts(selectedProductIds);
      if (success) {
        showToast(`Successfully deleted ${count} selected products!`, 'success');
        setSelectedProductIds([]);
      } else {
        showToast("Failed to delete selected products. Check console for details.", 'error');
      }
    } catch (err: any) {
      showToast(err?.message || "Error during bulk deletion", 'error');
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (p.sku && p.sku.toLowerCase().includes(searchFilter.toLowerCase())) ||
                          (p.productCode && p.productCode.toLowerCase().includes(searchFilter.toLowerCase())) ||
                          p.price.toString().includes(searchFilter);
    if (!matchesSearch) return false;

    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    return true;
  }).sort((a, b) => {
    const posA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 1000);
    const posB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 1000);
    return posA - posB;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">WooCommerce Product Manager</h3>
          <p className="text-xs text-slate-400">Dynamic category forms, device image gallery, multi-attribute variations, and live stock tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search products or SKU..."
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#38BDF8]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          {!isFormOpen && (
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Storefront Grid Rows & Columns Settings (Our Products Section) */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Storefront Catalog Grid Rows &amp; Columns ("Curated Lifestyle Catalog")</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Control how many rows/lines display on Desktop &amp; Mobile, columns per row, and maximum items per row before horizontal scroll.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveGridLayout}
            className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-[#38BDF8] hover:text-slate-950 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Save Grid Layout
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-700/60">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Desktop Rows (সারি)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={layoutMaxRows}
              onChange={(e) => setLayoutMaxRows(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Desktop Columns / Row
            </label>
            <select
              value={layoutDesktopCols}
              onChange={(e) => setLayoutDesktopCols(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#38BDF8]"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
            />
          </div>
        </div>
      </div>

      {/* WooCommerce-Style Product Form Modal */}
      {isFormOpen && (
        <form id="product-edit-form" onSubmit={handleSave} className="bg-slate-800/98 border border-slate-700 p-5 sm:p-6 rounded-2xl space-y-5 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h4 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
                <span>{editingProduct ? 'Edit Product Item' : 'Add New WooCommerce Product'}</span>
                {category && (
                  <span className="text-xs bg-[#38BDF8]/20 text-[#38BDF8] font-bold px-2.5 py-0.5 rounded-full border border-[#38BDF8]/40">
                    Category: {category}
                  </span>
                )}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-600 shadow-sm"
                title="Close Shutter"
              >
                <span>🔼 Shutter Up (Close)</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-xl bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-700/80 scrollbar-none text-xs font-bold">
            {[
              { id: 'basic', label: '1. Basic Info', icon: Package },
              { id: 'images', label: '2. Images & Gallery', icon: ImageIcon },
              { id: 'pricing', label: '3. Pricing & Offers', icon: DollarSign },
              { id: 'variations_and_stock', label: '4. Variations & Stock', icon: Layers },
              { id: 'shipping', label: '5. Shipping', icon: Truck },
              { id: 'seo', label: '6. SEO & Keywords', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as FormTab)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Basic Information */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Product Title (English) *</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingProduct) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                        }
                      }}
                      placeholder="Royal Festive Edition Fusion Kurta Shirt"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#38BDF8] block mb-1">Product Title (বাংলা / Bengali)</label>
                    <input 
                      type="text"
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                      placeholder="যেমন: প্রিমিয়াম ফেসিভ ফিউশন পাঞ্জাবি কুর্তা"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8] font-bengali"
                    />
                  </div>

                  {/* Product Availability & Pre-Order System */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          Product Availability (প্রোডাক্ট প্রাপ্যতা):
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Choose between standard in-stock inventory or custom pre-order with arrival countdown.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAvailability('available')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            availability === 'available'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Available Now (ইন-স্টক)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvailability('preorder')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            availability === 'preorder'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Pre-Order (প্রি-অর্ডার)
                        </button>
                      </div>
                    </div>

                    {availability === 'preorder' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-900/40">
                        <div>
                          <label className="text-xs font-bold text-blue-300 block mb-1">
                            Expected Arrival Days (দিন) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="180"
                            value={preOrderDays}
                            onChange={(e) => setPreOrderDays(Math.max(1, parseInt(e.target.value) || 20))}
                            className="w-full bg-slate-900 border border-blue-500/50 rounded-xl p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                            placeholder="20"
                          />
                          <p className="text-[10px] text-blue-300/80 mt-1">
                            Customer sees: &quot;You will receive it in about {preOrderDays} days&quot; / &quot;আপনি এটি প্রায় {preOrderDays} দিনে হাতে পাবেন।&quot;
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Pre-Order Max Limit Per Order (ঐচ্ছিক)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={preOrderQuantityLimit}
                            onChange={(e) => setPreOrderQuantityLimit(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                            placeholder="e.g. 5 (Leave empty for no limit)"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Product Category *</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>

                  {/* Category Attribute Defaults & Quick Toggles */}
                  {(() => {
                    const defs = getCategoryAttributeDefaults(category);
                    return (
                      <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${defs.badgeColor}`}>
                            {defs.presetName}
                          </span>
                          <span className="text-slate-400 font-medium">Quick Attribute Toggles:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEnableSizeVariant(!enableSizeVariant)}
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              enableSizeVariant
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-xs'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            <span>Size:</span>
                            <span className={enableSizeVariant ? 'text-sky-300 font-black' : 'text-slate-500'}>
                              {enableSizeVariant ? '✓ ON' : '✕ OFF'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const next = !enableColorVariant;
                              setEnableColorVariant(next);
                              setHasColorVariants(next);
                            }}
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              enableColorVariant
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                            }`}
                          >
                            <span>Color:</span>
                            <span className={enableColorVariant ? 'text-emerald-300 font-black' : 'text-slate-500'}>
                              {enableColorVariant ? '✓ ON' : '✕ OFF'}
                            </span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {defs.note}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  >
                    <option value="">-- None / General --</option>
                    {currentCategoryObj?.subcategories?.map((sub, idx) => (
                      <option key={`${sub}-${idx}`} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Brand Name</label>
                  <input 
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="RycreoShop"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">SKU (Stock Keeping Unit)</label>
                  <input 
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="RS-CLO-001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sort Order / Priority (smaller numbers show first)</label>
                  <input 
                    type="number"
                    value={orderWeight}
                    onChange={(e) => setOrderWeight(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 1, 2, 3 (Default: 1000)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                    min={0}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#38BDF8] block mb-1">Unique Product Code/No *</label>
                  <input 
                    type="text"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="e.g. RYC-9921 (Manually Entered Code)"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-[#38BDF8] rounded-xl p-2.5 text-xs text-white outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#38BDF8] block mb-1">Product Tagline</label>
                  <input 
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. 100% Combed Compact Premium Cotton"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-[#38BDF8] rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Product Description (English)</label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a luxurious description highlighting craftsmanship, materials, styling tips..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#38BDF8] block mb-1">Product Description (বাংলা / Bengali)</label>
                    <textarea 
                      rows={3}
                      value={descriptionBn}
                      onChange={(e) => setDescriptionBn(e.target.value)}
                      placeholder="পণ্যের গুণমান, উপাদান, ব্যবহারের নিয়ম ও বিশেষ বৈশিষ্ট্য বাংলায় লিখুন..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8] font-bengali"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Images & Gallery */}
          {activeTab === 'images' && (
            <div className="space-y-4 animate-fade-in">
              <ImageGalleryUploader
                images={images}
                onChange={setImages}
                maxImages={12}
                label="Product Image Gallery & Main Photo"
                helperText="Upload photos directly from your device gallery. Click 'Set Main' on any image to set it as the primary display photo."
              />

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Product Showcase Video (Direct MP4 URL or YouTube Embed URL)
                </label>
                <input 
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://assets.mixkit.co/videos/preview/...mp4 or https://www.youtube.com/embed/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Pricing & Offers */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Regular Price (৳) *</label>
                  <input 
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sale / Discount Price (৳)</label>
                  <input 
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Discount / Promo Badge</label>
                    {price > 0 && salePrice > 0 && salePrice < price && (
                      <button
                        type="button"
                        onClick={() => {
                          const pct = Math.round(((price - salePrice) / price) * 100);
                          setDiscountBadge(`${pct}% OFF`);
                        }}
                        className="text-[10px] text-[#38BDF8] hover:underline font-bold cursor-pointer"
                        title="Auto-calculate percentage discount"
                      >
                        Auto: {Math.round(((price - salePrice) / price) * 100)}% OFF
                      </button>
                    )}
                  </div>
                  <input 
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    placeholder="50% OFF, 50% off, FESTIVE SPECIAL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                  {(discountBadge || (price > 0 && salePrice > 0 && salePrice < price)) && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Storefront Badge:</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        {discountBadge.trim() || `-${Math.round(((price - salePrice) / price) * 100)}% OFF`}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Product Tag</label>
                  <input 
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Bestseller, New Drop, Luxury"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-400 block mb-1">Wholesale Price (৳) (পাইকারি মূল্য)</label>
                  <input 
                    type="number"
                    min={0}
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Optional wholesale rate"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-400 block mb-1">Reseller Price (৳) (রিসেলার মূল্য)</label>
                  <input 
                    type="number"
                    min={0}
                    value={resellerPrice}
                    onChange={(e) => setResellerPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Optional reseller rate"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Product Rating (Precision Slider): <span className="text-amber-400 font-black text-sm ml-1">★ {Number(rating).toFixed(2)} / 5.00</span>
                  </label>
                  <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-inner">
                    <input 
                      type="range"
                      min="1"
                      max="5"
                      step="0.01"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex items-center gap-1 shrink-0 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-amber-400 font-mono font-black text-xs">
                      <span>★</span>
                      <span>{Number(rating).toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Smoothly drag slider to set precise fractional ratings (e.g. 4.8, 4.9, 4.95).</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                  <input 
                    type="checkbox"
                    checked={isFestiveSpecial}
                    onChange={(e) => setIsFestiveSpecial(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F59E0B]"
                  />
                  <span>Mark as Festive / Celebration Edition (Eid, Celebrations, Festivals)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-sky-400">
                  <input 
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#38BDF8]"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab: Variations & Stock Management */}
          {activeTab === 'variations_and_stock' && (
            <div className="space-y-6 animate-fade-in">
              {/* Attribute Toggles */}
              {(() => {
                const defs = getCategoryAttributeDefaults(category);
                return (
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-3 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                            Category: <span className="text-white font-extrabold">{category}</span>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${defs.badgeColor}`}>
                            {defs.presetName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      {/* Size Toggle */}
                      <div className={`p-3.5 rounded-xl border transition-all ${enableSizeVariant ? 'bg-sky-950/40 border-sky-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={enableSizeVariant} onChange={(e) => setEnableSizeVariant(e.target.checked)} className="w-4 h-4 rounded text-[#38BDF8] accent-[#38BDF8]" />
                          <span className="text-xs font-black text-white uppercase">Size Attribute</span>
                        </label>
                      </div>
                      {/* Color Toggle */}
                      <div className={`p-3.5 rounded-xl border transition-all ${enableColorVariant ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/60 border-slate-800'}`}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={enableColorVariant} onChange={(e) => { setEnableColorVariant(e.target.checked); setHasColorVariants(e.target.checked); }} className="w-4 h-4 rounded text-emerald-500 accent-emerald-500" />
                          <span className="text-xs font-black text-white uppercase">Color Attribute</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Attribute Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colors Management */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase">Manage Colors</h5>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input type="checkbox" checked={colorEnabledInput} onChange={(e) => setColorEnabledInput(e.target.checked)} className="w-5 h-5 rounded accent-[#38BDF8]" title="Enable Color" />
                        <input type="color" value={colorHexInput} onChange={(e) => setColorHexInput(e.target.value)} className="w-10 h-8 rounded cursor-pointer" title="Pick Color" />
                        <input type="text" value={colorNameInput} onChange={(e) => setColorNameInput(e.target.value)} placeholder="Color Name" className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" />
                    </div>
                    <div className="flex gap-2">
                        <input type="file" accept="image/*" className="hidden" ref={colorFileInputRef} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setIsUploadingColorPhoto(true);
                            const downloadUrl = await uploadImageToStorage(file, 'product-colors');
                            setColorImageInput(downloadUrl);
                            setIsUploadingColorPhoto(false);
                        }
                        }} />
                        <button type="button" onClick={() => colorFileInputRef.current?.click()} className="flex-1 p-2 bg-slate-700 rounded text-xs text-white">
                        {isUploadingColorPhoto ? '...' : (colorImageInput ? '✅ Image Selected' : '🖼️ Select Thumbnail')}
                        </button>
                        <button type="button" onClick={handleAddColor} className="px-4 bg-[#38BDF8] text-slate-900 rounded text-xs font-bold">+</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c, i) => (
                      <div key={i} className="flex flex-col gap-1 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 cursor-pointer" title="Toggle active status on storefront">
                                  <input 
                                    type="checkbox" 
                                    checked={c.enabled !== false} 
                                    onChange={(e) => {
                                      const updated = [...colors];
                                      updated[i].enabled = e.target.checked;
                                      setColors(updated);
                                    }} 
                                    className="w-4 h-4 rounded accent-[#38BDF8] cursor-pointer" 
                                  />
                                </label>
                                <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0 shadow-xs" style={{ backgroundColor: c.hex || '#000' }} title={`Tone: ${c.hex}`} />
                                {c.image ? (
                                  <img src={c.image} alt={c.name} className="w-6 h-6 rounded object-cover border border-slate-600 bg-slate-900 shrink-0" />
                                ) : null}
                                <span className={`text-xs font-bold ${c.enabled !== false ? 'text-white' : 'text-slate-500 line-through'}`}>{c.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] text-[#38BDF8] hover:text-sky-300 font-bold cursor-pointer px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 flex items-center gap-1 transition-colors" title="Upload / change photo for this color variant">
                                  <span>{c.image ? '📷 Edit Photo' : '+ Photo'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const downloadUrl = await uploadImageToStorage(file, 'product-colors');
                                        const updated = [...colors];
                                        updated[i].image = downloadUrl;
                                        setColors(updated);
                                      }
                                    }} 
                                  />
                                </label>
                                <button type="button" onClick={() => {
                                    const updated = [...colors];
                                    updated[i].gallery = updated[i].gallery || [];
                                    setColors(updated);
                                    setEditingColorGallery(i);
                                }} className="text-[#38BDF8] text-[10px] font-bold hover:underline cursor-pointer">Gallery ({c.gallery?.length || 0})</button>
                                <button type="button" onClick={() => handleRemoveColor(i)} className="text-rose-400 hover:text-rose-300 text-xs font-bold cursor-pointer px-1" title="Delete Color">✕</button>
                            </div>
                        </div>
                        {editingColorGallery === i && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-white font-bold text-xs uppercase">Manage Gallery for {c.name}</h5>
                                    <button onClick={() => setEditingColorGallery(null)} className="text-slate-400 font-bold">✕</button>
                                </div>
                                <ImageGalleryUploader images={c.gallery || []} onChange={(images) => {
                                    const updated = [...colors];
                                    updated[i].gallery = images;
                                    setColors(updated);
                                }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes Management */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-white uppercase">Manage Sizes</h5>
                  <div className="flex gap-2">
                    <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="Size (e.g. 30)" className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" />
                    <button type="button" onClick={handleAddSize} className="px-3 bg-[#38BDF8] text-slate-900 rounded text-xs font-bold">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-800 p-1 px-2 rounded border border-slate-700">
                        <span className="text-xs text-white">{s.size}</span>
                        <button onClick={() => handleRemoveSize(i)} className="text-rose-400 text-[10px]">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Standard vs Variant Inventory Control Section */}
              {!enableSizeVariant && !enableColorVariant ? (
                <div className="bg-slate-900/90 p-5 rounded-2xl border border-sky-500/40 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#38BDF8]" />
                        <span>Standard Product Stock & Inventory</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Single Item (No Variants)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Directly define master warehouse quantity and low-stock threshold for this standard item.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Available Stock (Pieces)</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input 
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setStock(val);
                          setManualMasterStock(val);
                        }}
                        placeholder="e.g. 50"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm outline-none focus:border-[#38BDF8]"
                      />
                      <p className="text-[10px] text-slate-400">Total units available for customer purchase.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-1.5">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Low Stock Alert Threshold</span>
                      </label>
                      <input 
                        type="number"
                        min={1}
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 5))}
                        placeholder="e.g. 5"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-mono font-bold text-sm outline-none focus:border-amber-400"
                      />
                      <p className="text-[10px] text-slate-400">Triggers admin dashboard alert when stock reaches this level or below.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        <span>Base Sold Count (Social Proof)</span>
                      </label>
                      <input 
                        type="number"
                        min={0}
                        value={baseSoldCount}
                        onChange={(e) => setBaseSoldCount(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="e.g. 10"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-sm outline-none focus:border-[#38BDF8]"
                      />
                      <p className="text-[10px] text-slate-400">Increases automatically by 1 piece whenever customers purchase.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Variant Stock Calculation Control */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${autoStockManagementEnabled ? 'bg-sky-950/30 border-sky-500' : 'bg-slate-900 border-slate-700'}`}>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-white mb-2">
                        <input type="checkbox" checked={autoStockManagementEnabled} onChange={(e) => {setAutoStockManagementEnabled(e.target.checked); if(e.target.checked) setManualStockInputEnabled(false);}} className="accent-sky-500"/>
                        Auto-Calculated Stock
                      </label>
                      <p className="text-[10px] text-slate-400">Master stock automatically sums all variant quantities.</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${manualStockInputEnabled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-900 border-slate-700'}`}>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-white mb-2">
                        <input type="checkbox" checked={manualStockInputEnabled} onChange={(e) => {setManualStockInputEnabled(e.target.checked); if(e.target.checked) setAutoStockManagementEnabled(false);}} className="accent-emerald-500"/>
                        Manual Stock Mode
                      </label>
                      <input type="number" value={manualMasterStock} onChange={(e) => setManualMasterStock(Number(e.target.value))} placeholder="Enter Master Stock" disabled={!manualStockInputEnabled} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white disabled:opacity-50" />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700">
                      <label className="flex items-center gap-2 font-bold text-xs text-white mb-2">
                        Base Sold Count (Social Proof)
                      </label>
                      <input type="number" value={baseSoldCount} onChange={(e) => setBaseSoldCount(Number(e.target.value))} placeholder="e.g. 20" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white" />
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-white">
                      <input type="checkbox" checked={lowStockAlertEnabled} onChange={(e) => setLowStockAlertEnabled(e.target.checked)} className="accent-rose-500"/>
                      Enable Low Stock Alert
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Alert at (Qty):</span>
                      <input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} disabled={!lowStockAlertEnabled} className="w-16 bg-slate-950 border border-slate-700 rounded p-1 text-xs text-center disabled:opacity-50" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Per-Variant Stock Matrix / Color / Size Editor */}
              {(() => {
                const liveAutoTotal = (enableColorVariant && enableSizeVariant)
                  ? colors.reduce((total, c) => {
                      const colData = variantQuantities[c.name] || { activeSizes: [], stock: {} };
                      const activeSizesList = colData.activeSizes || [];
                      return total + activeSizesList.reduce((sSum, sz) => sSum + Math.max(0, Number(colData.stock?.[sz] ?? 0)), 0);
                    }, 0)
                  : enableColorVariant
                    ? colors.reduce((total, c) => {
                        const colQty = variantQuantities[c.name]?.stock?.['Standard'] ?? c.stock ?? 0;
                        return total + Math.max(0, Number(colQty));
                      }, 0)
                    : enableSizeVariant
                      ? sizes.reduce((total, s) => total + Math.max(0, Number(s.stock ?? 0)), 0)
                      : computeAutoTotalStock({ stock });

                const displayTotal = manualStockInputEnabled && typeof manualMasterStock === 'number' && !isNaN(manualMasterStock)
                  ? Math.max(0, manualMasterStock)
                  : liveAutoTotal;

                return (
                  <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
                      <div>
                        <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>
                            {enableColorVariant && enableSizeVariant
                              ? 'Color × Size Stock Matrix'
                              : enableColorVariant
                                ? 'Per-Color Stock Allocation'
                                : enableSizeVariant
                                  ? 'Per-Size Stock Allocation'
                                  : 'Standard Inventory Summary'}
                          </span>
                          <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                            Independent Inventory
                          </span>
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {enableColorVariant && enableSizeVariant
                            ? 'Enable or disable specific sizes per color and define exact stock pieces. 0 = Out of Stock, 1–4 pcs = Low Stock.'
                            : enableColorVariant
                              ? 'Set exact piece count for each Color variant independently. Parent total stock auto-calculates.'
                              : enableSizeVariant
                                ? 'Set exact piece count for each Size independently. Parent total stock auto-calculates.'
                                : 'Master Stock above directly controls inventory for this simple product.'}
                        </p>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-black font-mono flex items-center gap-2 shrink-0 ${
                        displayTotal <= 0
                          ? 'bg-rose-950/80 border-rose-600/50 text-rose-300'
                          : displayTotal < 5
                            ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      }`}>
                        <span className="text-[10px] uppercase tracking-wider font-sans text-slate-300">Auto-Calculated Total Stock:</span>
                        <span>{displayTotal} pcs</span>
                      </div>
                    </div>

                    {/* Case A: Color x Size Matrix */}
                    {enableColorVariant && enableSizeVariant && (
                      colors.length === 0 || sizes.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/70 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                          Add at least one Color and one Size in the <strong>Attributes</strong> tab to manage the Color × Size piece matrix.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-slate-300 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-700 bg-slate-900/80">
                                <th className="p-2.5 text-left font-black uppercase text-[10px] text-slate-400">Color Variant</th>
                                <th className="p-2.5 text-center font-black uppercase text-[10px] text-slate-400">Quick Controls</th>
                                {sizes.map(s => (
                                  <th key={s.size} className="p-2.5 text-center font-black uppercase text-[10px] text-sky-400 bg-slate-900/40">
                                    Size {s.size}
                                  </th>
                                ))}
                                <th className="p-2.5 text-center font-black uppercase text-[10px] text-amber-400">Color Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {colors.map(c => {
                                const colData = variantQuantities[c.name] || { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: 5 };
                                const activeSizesList = colData.activeSizes || [];
                                const colorStockSum = activeSizesList.reduce((sum, sz) => sum + (colData.stock?.[sz] || 0), 0);

                                return (
                                  <tr key={c.name} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/60">
                                    <td className="p-2.5 font-bold flex items-center gap-2.5 min-w-[140px]">
                                      <div className="w-5 h-5 rounded-full border border-slate-500 shadow-xs shrink-0" style={{ backgroundColor: c.hex || '#000' }} />
                                      {c.image && <img src={c.image} alt={c.name} className="w-7 h-7 rounded object-cover border border-slate-700 bg-slate-900 shrink-0" />}
                                      <div>
                                        <p className="text-xs text-white font-extrabold leading-none">{c.name}</p>
                                        <span className={`text-[9px] font-bold ${c.enabled !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          {c.enabled !== false ? 'Active' : 'Disabled'}
                                        </span>
                                      </div>
                                    </td>

                                    <td className="p-2 text-center whitespace-nowrap">
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const allSizes = sizes.map(s => s.size);
                                            setVariantQuantities(prev => {
                                              const prevData = prev[c.name] || { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: 5 };
                                              const updatedStock = { ...prevData.stock };
                                              allSizes.forEach(sz => {
                                                if (updatedStock[sz] === undefined || updatedStock[sz] === 0) {
                                                  updatedStock[sz] = 10;
                                                }
                                              });
                                              return {
                                                ...prev,
                                                [c.name]: { ...prevData, activeSizes: allSizes, stock: updatedStock }
                                              };
                                            });
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/50 text-[9px] font-bold cursor-pointer"
                                          title="Enable all sizes for this color"
                                        >
                                          All On
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setVariantQuantities(prev => {
                                              const prevData = prev[c.name] || { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: 5 };
                                              return {
                                                ...prev,
                                                [c.name]: { ...prevData, activeSizes: [] }
                                              };
                                            });
                                          }}
                                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] font-bold cursor-pointer"
                                          title="Disable all sizes for this color"
                                        >
                                          All Off
                                        </button>
                                      </div>
                                    </td>

                                    {sizes.map(s => {
                                      const isActive = activeSizesList.includes(s.size);
                                      const currentStock = colData.stock?.[s.size] ?? 0;

                                      return (
                                        <td key={`${c.name}-${s.size}`} className={`p-2 text-center transition-colors ${isActive ? 'bg-sky-950/20' : 'bg-slate-950/40 opacity-50'}`}>
                                          <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => {
                                                  const active = e.target.checked;
                                                  setVariantQuantities(prev => {
                                                    const prevData = prev[c.name] || { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: 5 };
                                                    const prevActiveSizes = prevData.activeSizes || [];
                                                    const newActiveSizes = active
                                                      ? [...prevActiveSizes, s.size]
                                                      : prevActiveSizes.filter(sz => sz !== s.size);
                                                    const newStock = { ...prevData.stock };
                                                    if (active && newStock[s.size] === undefined) {
                                                      newStock[s.size] = 10;
                                                    }
                                                    return {
                                                      ...prev,
                                                      [c.name]: { ...prevData, activeSizes: newActiveSizes, stock: newStock }
                                                    };
                                                  });
                                                }}
                                                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                                              />
                                              <span className="text-[10px] font-bold text-slate-300">{isActive ? 'ON' : 'OFF'}</span>
                                            </label>

                                            {isActive ? (
                                              <div className="flex flex-col items-center gap-0.5">
                                                <input
                                                  type="number"
                                                  min={0}
                                                  className={`w-14 bg-slate-950 border rounded p-1 text-center font-mono font-bold text-xs text-white outline-none ${
                                                    currentStock <= 0
                                                      ? 'border-rose-600/70'
                                                      : currentStock < 5
                                                        ? 'border-amber-500/70'
                                                        : 'border-slate-700 focus:border-[#38BDF8]'
                                                  }`}
                                                  placeholder="0"
                                                  value={currentStock}
                                                  onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setVariantQuantities(prev => {
                                                      const prevData = prev[c.name] || { autoCalculate: false, activeSizes: [], stock: {}, lowStockAlert: 5 };
                                                      return {
                                                        ...prev,
                                                        [c.name]: {
                                                          ...prevData,
                                                          stock: { ...prevData.stock, [s.size]: val }
                                                        }
                                                      };
                                                    });
                                                  }}
                                                />
                                                {currentStock > 0 && currentStock < 5 && (
                                                  <span className="text-[8px] font-bold text-amber-400">Low Stock</span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-[9px] text-slate-500 italic py-1">Excluded</span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}

                                    <td className="p-2 text-center whitespace-nowrap">
                                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-black font-mono ${
                                        colorStockSum <= 0
                                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                                          : colorStockSum < 5
                                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                                      }`}>
                                        {colorStockSum > 0 ? `${colorStockSum} pcs` : 'Out of Stock'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )
                    )}

                    {/* Case B: Color-Only Stock Cards */}
                    {enableColorVariant && !enableSizeVariant && (
                      colors.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/70 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                          Add colors in the <strong>Attributes</strong> tab to assign per-color stock pieces.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {colors.map((c, idx) => {
                            const colQty = Math.max(0, Number(variantQuantities[c.name]?.stock?.['Standard'] ?? c.stock ?? 0));
                            return (
                              <div key={c.name} className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-6 h-6 rounded-full border border-slate-500 shrink-0" style={{ backgroundColor: c.hex || '#000' }} />
                                  {c.image && <img src={c.image} alt={c.name} className="w-8 h-8 rounded object-cover border border-slate-700 shrink-0" />}
                                  <div className="min-w-0">
                                    <p className="text-xs font-extrabold text-white truncate">{c.name}</p>
                                    <span className={`text-[9px] font-bold ${
                                      colQty <= 0 ? 'text-rose-400' : colQty < 5 ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>
                                      {colQty <= 0 ? 'Out of Stock' : colQty < 5 ? 'Low Stock (< 5)' : 'In Stock'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <input
                                    type="number"
                                    min={0}
                                    value={colQty}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setVariantQuantities(prev => {
                                        const prevData = prev[c.name] || { autoCalculate: false, activeSizes: ['Standard'], stock: {}, lowStockAlert: 5 };
                                        return {
                                          ...prev,
                                          [c.name]: {
                                            ...prevData,
                                            activeSizes: ['Standard'],
                                            stock: { ...prevData.stock, Standard: val }
                                          }
                                        };
                                      });
                                      setColors(prev => prev.map((item, i) => (i === idx ? { ...item, stock: val } : item)));
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 focus:border-[#38BDF8] rounded-lg p-1.5 text-center font-mono font-bold text-xs text-white outline-none"
                                  />
                                  <span className="text-[10px] font-bold text-slate-400">pcs</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}

                    {/* Case C: Size-Only Stock Cards */}
                    {!enableColorVariant && enableSizeVariant && (
                      sizes.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-900/70 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                          Add sizes in the <strong>Attributes</strong> tab to assign per-size stock pieces.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {sizes.map((s, idx) => {
                            const szQty = Math.max(0, Number(s.stock ?? 0));
                            return (
                              <div key={s.size} className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-xs font-extrabold text-white">Size {s.size}</p>
                                  <span className={`text-[9px] font-bold ${
                                    szQty <= 0 ? 'text-rose-400' : szQty < 5 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>
                                    {szQty <= 0 ? 'Out of Stock' : szQty < 5 ? 'Low Stock (< 5)' : 'In Stock'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={szQty}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setSizes(prev => prev.map((item, i) => (i === idx ? { ...item, stock: val } : item)));
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 focus:border-[#38BDF8] rounded-lg p-1.5 text-center font-mono font-bold text-xs text-white outline-none"
                                  />
                                  <span className="text-[10px] font-bold text-slate-400">pcs</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                );
              })()}

              {/* Inventory Settings */}
              <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3">
                <h5 className="text-xs font-bold text-white uppercase">Inventory Settings</h5>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input type="checkbox" checked={trackStock} onChange={(e) => setTrackStock(e.target.checked)} className="w-4 h-4 rounded text-[#38BDF8]" />
                    <span>Enable Automated Real-time Stock Deduction</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 7: Shipping */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Package Weight</label>
                  <input 
                    type="text"
                    value={shippingWeight}
                    onChange={(e) => setShippingWeight(e.target.value)}
                    placeholder="0.4 kg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Dimensions (L x W x H)</label>
                  <input 
                    type="text"
                    value={shippingDimensions}
                    onChange={(e) => setShippingDimensions(e.target.value)}
                    placeholder="30 x 25 x 4 cm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={isFreeShipping}
                      onChange={(e) => setIsFreeShipping(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${isFreeShipping ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isFreeShipping ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      Free Delivery
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle this to provide Free Delivery for this product. Badge will show next to price on website.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Tab 8: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Custom SEO Title</label>
                <input 
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Premium Cotton Kurta | RycreoShop"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Custom Meta Description</label>
                <textarea 
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Describe the product for search engine previews..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Product URL Slug</label>
                <input 
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="royal-festive-edition-fusion-kurta"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              {/* MODULE 1: Multi-Keyword Search Tagging */}
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#38BDF8]" />
                    Custom Search Keywords Tagging ({keywords.length}/15)
                  </label>
                  <span className="text-[10px] text-[#38BDF8] font-bold">10-15 recommended</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Input custom keywords supporting English, Banglish, synonyms, and common customer misspellings (e.g., "polo", "genji", "drop shoulder", "panjabi", "gorom dress", "chinos").
                </p>

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
                    placeholder="Type keyword and press Enter or click Add (supports comma-separated)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2.5 rounded-xl bg-[#38BDF8] text-slate-900 text-xs font-bold hover:bg-sky-400 transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Keyword Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[32px]">
                  {keywords.map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs font-medium"
                    >
                      <span>{kw}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveKeyword(idx)}
                        className="hover:text-rose-400 transition-colors text-[11px] font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {keywords.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No custom search keywords added yet.</span>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">Quick Add Common E-Commerce Terms:</span>
                  <div className="flex flex-wrap gap-1">
                    {["polo shirt", "genji", "t-shirt", "chino", "pant", "winter hoodie", "watch", "punjabi", "fotua", "casual wear", "formal"].map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          if (!keywords.includes(sug) && keywords.length < 15) {
                            setKeywords([...keywords, sug]);
                          }
                        }}
                        disabled={keywords.includes(sug) || keywords.length >= 15}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
            >
              ✕ Close Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-extrabold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{editingProduct ? 'Uploading & Updating...' : 'Uploading & Publishing...'}</span>
                </>
              ) : (
                editingProduct ? 'Update Product Item' : 'Publish Product to Store'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Catalog Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5 text-center w-28">Order / Position</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Shipping</th>
                <th className="p-3.5">Total Stock</th>
                <th className="p-3.5">Pcs Sold</th>
                <th className="p-3.5">Keywords & Tags</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredProducts.map(p => {
                const totalStock = p.variations && p.variations.length > 0
                  ? p.variations.reduce((sum, v) => sum + (v.stock || 0), 0)
                  : (p.sizes && p.sizes.length > 0
                      ? p.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
                      : (p.stock ?? 0));

                return (
                  <tr key={p.id} className="hover:bg-slate-700/40 transition-colors">
                    {/* Order / Priority Position Controls */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, 'up')}
                            className="p-1 rounded bg-slate-700/80 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-900 transition-colors cursor-pointer shadow-xs active:scale-90"
                            title="Move Up (Display Higher on Storefront)"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, 'down')}
                            className="p-1 rounded bg-slate-700/80 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-900 transition-colors cursor-pointer shadow-xs active:scale-90"
                            title="Move Down (Display Lower on Storefront)"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="1"
                            value={p.position !== undefined ? p.position : (p.order !== undefined ? p.order : '')}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0) {
                                updateProductPosition(p.id, val);
                              }
                            }}
                            className="w-12 text-center bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold rounded py-1 focus:border-[#38BDF8] outline-none"
                            title="Direct position on storefront (1 = Top of website)"
                          />
                          <span className="text-[8px] text-slate-400 font-mono font-bold mt-0.5">
                            #{p.position || p.order || 1}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 flex items-center gap-3">
                      <img 
                        src={p.images[0]} 
                        alt="" 
                        className="w-10 h-12 object-cover rounded-lg bg-slate-900 border border-slate-700 shrink-0" 
                      />
                      <div>
                        <p className="font-bold text-white text-xs leading-snug">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || p.id}</span>
                          {p.videoUrl && (
                            <span className="text-[9px] text-[#38BDF8] font-semibold flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-300">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-[#38BDF8]">
                      ৳{p.salePrice > 0 ? p.salePrice : p.price}
                    </td>

                    <td className="p-3.5">
                      {p.isFreeShipping ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black tracking-wide">
                          FREE
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Standard</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        totalStock > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {totalStock} pcs
                      </span>
                    </td>

                    <td className="p-3.5">
                      {(() => {
                        const effSold = (p.baseSoldCount ?? (p.soldCount ?? 0)) + (p.realSalesCount ?? 0);
                        if (effSold > 0) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-500/30">
                                <Flame className="w-3 h-3" /> {effSold} Sold
                              </span>
                              {p.baseSoldCount !== undefined && (
                                <span className="text-[9px] text-slate-400 font-mono">
                                  ({p.baseSoldCount} base + {p.realSalesCount || 0} real)
                                </span>
                              )}
                            </div>
                          );
                        }
                        return <span className="text-slate-500 text-[10px] italic">Hidden (0)</span>;
                      })()}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {(p.isFestiveSpecial || p.isPujaSpecial) && (
                            <span className="bg-amber-500/20 text-[#F59E0B] text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> FESTIVE
                            </span>
                          )}
                          {p.discountBadge && (
                            <span className="bg-rose-500/20 text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {p.discountBadge}
                            </span>
                          )}
                        </div>
                        {p.keywords && p.keywords.length > 0 ? (
                          <span className="text-[10px] text-sky-400 font-medium truncate" title={p.keywords.join(', ')}>
                            🏷️ {p.keywords.length} keywords ({p.keywords.slice(0, 2).join(', ')}...)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No keywords tagged</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-200 hover:text-white hover:bg-slate-600 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete({ id: p.id, title: p.title })}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete Product (Permanent)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${productToDelete?.title}"? This product will be immediately removed from the catalog and customer storefront.`}
        confirmLabel="Yes, Delete Product"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
