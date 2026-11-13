import React, { useState, useRef } from 'react';
import {
  Gift,
  Ticket,
  FolderOpen,
  Plus,
  Trash2,
  Edit,
  X,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  PackagePlus,
  Video,
  Globe,
  Tag,
  Truck,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getOfferCountdown } from '../../utils/stockHelper';
import {
  BuyMoreOffer,
  BuyMoreFreeItem,
  BuyMoreVoucher,
  ProductColorVariant,
  ProductSizeStock,
} from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { ImageGalleryUploader } from '../common/ImageGalleryUploader';
import { useToast } from '../common/Toast';
import { resolveStoreAssetUrl } from '../../utils/clientAssetResolver';
import { uploadImageToStorage } from '../../storageService';

type BuyMoreFolder = 'offers' | 'vouchers';

export const BuyMoreManager: React.FC = () => {
  const {
    products,
    buyMoreOffers,
    buyMoreVouchers,
    storeConfig,
    updateStoreConfig,
    addBuyMoreOffer,
    updateBuyMoreOffer,
    deleteBuyMoreOffer,
    addBuyMoreVoucher,
    updateBuyMoreVoucher,
    deleteBuyMoreVoucher,
  } = useStore();
  const { showToast } = useToast();

  // 2 Separate Admin Folders: Offer Products & Offer Vouchers
  const [activeFolder, setActiveFolder] = useState<BuyMoreFolder>('offers');

  const [sectionTitle, setSectionTitle] = useState(
    storeConfig.buyMoreSectionTitle || 'Buy One Get More'
  );
  const [sectionSubtitle, setSectionSubtitle] = useState(
    storeConfig.buyMoreSectionSubtitle ||
      'Buy qualifying items and get extra products free'
  );
  const [layoutMaxRows, setLayoutMaxRows] = useState<number>(
    storeConfig.sectionLayouts?.buyMore?.maxRows ?? 2
  );
  const [layoutDesktopCols, setLayoutDesktopCols] = useState<number>(
    storeConfig.sectionLayouts?.buyMore?.desktopColumns ?? 4
  );
  const [layoutMobileRows, setLayoutMobileRows] = useState<number>(
    storeConfig.sectionLayouts?.buyMore?.mobileMaxRows ?? 2
  );
  const [layoutMaxPerRow, setLayoutMaxPerRow] = useState<number>(
    storeConfig.sectionLayouts?.buyMore?.maxItemsPerRow ?? 20
  );

  // Offer Form State
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<BuyMoreOffer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<BuyMoreOffer | null>(null);

  const [offerTitle, setOfferTitle] = useState('');
  const [badgeText, setBadgeText] = useState('Buy 1 Get 1 Free');
  const [offerType, setOfferType] = useState<BuyMoreOffer['offerType']>('bogo');
  const [mainProductId, setMainProductId] = useState('');
  const [mainProductTitle, setMainProductTitle] = useState('');
  const [mainProductImage, setMainProductImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [productCode, setProductCode] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [price, setPrice] = useState(1450);
  const [regularValue, setRegularValue] = useState<string>('2400');
  const [voucherCode, setVoucherCode] = useState('');
  const [description, setDescription] = useState('');
  const [offerVisible, setOfferVisible] = useState(true);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [offerDurationDays, setOfferDurationDays] = useState<string>('');
  const [offerDurationHours, setOfferDurationHours] = useState<string>('');
  const [clearOfferTimer, setClearOfferTimer] = useState<boolean>(false);

  // Optional Variants
  const [colors, setColors] = useState<ProductColorVariant[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#0F172A');
  const [colorImageInput, setColorImageInput] = useState('');
  const [isUploadingColorPhoto, setIsUploadingColorPhoto] = useState(false);
  const [editingColorGallery, setEditingColorGallery] = useState<number | null>(null);
  const colorFileInputRef = useRef<HTMLInputElement | null>(null);
  const [sizes, setSizes] = useState<ProductSizeStock[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  // SEO & Keywords
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const [freeItems, setFreeItems] = useState<BuyMoreFreeItem[]>([
    { id: `free_${Date.now()}`, title: '', image: '', quantity: 1, value: 0 },
  ]);
  const [isUploadingOfferImg, setIsUploadingOfferImg] = useState(false);
  const [isSavingOffer, setIsSavingOffer] = useState(false);
  const offerFileRef = useRef<HTMLInputElement | null>(null);

  // Voucher Form State
  const [isVoucherFormOpen, setIsVoucherFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<BuyMoreVoucher | null>(null);
  const [voucherToDelete, setVoucherToDelete] = useState<BuyMoreVoucher | null>(null);

  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vMinBuyQty, setVMinBuyQty] = useState(1);
  const [vFreeQty, setVFreeQty] = useState(1);
  const [vFreeProductNote, setVFreeProductNote] = useState('');
  const [vDiscountPercent, setVDiscountPercent] = useState<string>('');
  const [vExpiryDate, setVExpiryDate] = useState('');
  const [vVisible, setVVisible] = useState(true);

  const isSectionVisible = storeConfig.isBuyMoreSectionVisible !== false;

  const handleToggleSectionVisible = (checked: boolean) => {
    updateStoreConfig({ isBuyMoreSectionVisible: checked });
    showToast(
      checked
        ? 'Buy One Get More section is now VISIBLE on website.'
        : 'Buy One Get More section is now HIDDEN from website.',
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
      buyMoreSectionTitle: sectionTitle.trim() || 'Buy One Get More',
      buyMoreSectionSubtitle: sectionSubtitle.trim(),
      sectionLayouts: {
        ...existingLayouts,
        buyMore: {
          ...existingLayouts.buyMore,
          maxRows: Math.min(20, Math.max(1, Number(layoutMaxRows) || 2)),
          mobileMaxRows: Math.min(20, Math.max(1, Number(layoutMobileRows) || 2)),
          desktopColumns: Math.min(6, Math.max(2, Number(layoutDesktopCols) || 4)),
          mobileColumns: existingLayouts.buyMore?.mobileColumns ?? 2,
          maxItemsPerRow: Math.min(50, Math.max(4, Number(layoutMaxPerRow) || 20)),
        },
      },
    });
    showToast('Buy One Get More heading & grid layout saved!', 'success');
  };

  const resetOfferForm = () => {
    setEditingOffer(null);
    setOfferTitle('');
    setBadgeText('Buy 1 Get 1 Free');
    setOfferType('bogo');
    setMainProductId('');
    setMainProductTitle('');
    setMainProductImage('');
    setGalleryImages([]);
    setVideoUrl('');
    setProductCode('');
    setBuyQuantity(1);
    setPrice(1450);
    setRegularValue('2400');
    setVoucherCode('');
    setDescription('');
    setOfferVisible(true);
    setIsFreeShipping(false);
    setOfferDurationDays('');
    setOfferDurationHours('');
    setClearOfferTimer(false);
    setColors([]);
    setColorNameInput('');
    setColorHexInput('#0F172A');
    setColorImageInput('');
    setEditingColorGallery(null);
    setSizes([]);
    setSizeInput('');
    setSeoTitle('');
    setSeoDescription('');
    setSlug('');
    setKeywords([]);
    setKeywordInput('');
    setFreeItems([
      { id: `free_${Date.now()}`, title: '', image: '', quantity: 1, value: 0 },
    ]);
    setIsOfferFormOpen(false);
  };

  const handleStartEditOffer = (offer: BuyMoreOffer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title || '');
    setBadgeText(offer.badgeText || 'Buy 1 Get 1 Free');
    setOfferType(offer.offerType || 'bogo');
    setMainProductId(offer.mainProductId || '');
    setMainProductTitle(offer.mainProductTitle || '');
    setMainProductImage(offer.mainProductImage || '');
    setGalleryImages(offer.images || (offer.mainProductImage ? [offer.mainProductImage] : []));
    setVideoUrl(offer.videoUrl || '');
    setProductCode(offer.productCode || '');
    setBuyQuantity(offer.buyQuantity || 1);
    setPrice(offer.price || 0);
    setRegularValue(offer.regularValue ? String(offer.regularValue) : '');
    setVoucherCode(offer.voucherCode || '');
    setDescription(offer.description || '');
    setOfferVisible(offer.isVisible !== false);
    setIsFreeShipping(Boolean(offer.isFreeShipping));
    setOfferDurationDays(offer.offerDurationDays !== undefined ? String(offer.offerDurationDays) : '');
    setOfferDurationHours(offer.offerDurationHours !== undefined ? String(offer.offerDurationHours) : '');
    setClearOfferTimer(false);
    setColors(
      (offer.colors || []).map((c) =>
        typeof c === 'string'
          ? { name: c, hex: '#1E293B', enabled: true, stock: 99 }
          : c
      )
    );
    setSizes(
      (offer.sizes || []).map((s) =>
        typeof s === 'string' ? { size: s, stock: 99 } : s
      )
    );
    setSeoTitle(offer.seoTitle || '');
    setSeoDescription(offer.seoDescription || '');
    setSlug(offer.slug || '');
    setKeywords(offer.keywords || []);
    setKeywordInput('');
    setFreeItems(
      offer.freeItems && offer.freeItems.length > 0
        ? offer.freeItems
        : [{ id: `free_${Date.now()}`, title: '', image: '', quantity: 1, value: 0 }]
    );
    setIsOfferFormOpen(true);
  };

  const handlePickCatalogMainProduct = (prodId: string) => {
    setMainProductId(prodId);
    const found = products.find((p) => p.id === prodId);
    if (found) {
      if (!mainProductTitle) setMainProductTitle(found.title);
      if (!offerTitle) setOfferTitle(`Buy 1 ${found.title} + Free Bonus`);
      setMainProductImage(found.images?.[0] || '');
      if (found.images?.length) setGalleryImages(found.images);
      const effectivePrice = found.salePrice > 0 ? found.salePrice : found.price;
      setPrice(effectivePrice);
    }
  };

  const handleOfferImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingOfferImg(true);
    try {
      const url = await uploadImageToStorage(file, 'buymore');
      if (url) {
        setMainProductImage(url);
        if (!galleryImages.includes(url)) {
          setGalleryImages((prev) => [url, ...prev]);
        }
        showToast('Offer image uploaded!', 'success');
      }
    } finally {
      setIsUploadingOfferImg(false);
      if (offerFileRef.current) offerFileRef.current.value = '';
    }
  };

  const addFreeItemRow = () => {
    setFreeItems((prev) => [
      ...prev,
      {
        id: `free_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: '',
        image: '',
        quantity: 1,
        value: 0,
      },
    ]);
  };

  const updateFreeItemRow = (index: number, updates: Partial<BuyMoreFreeItem>) => {
    setFreeItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handlePickCatalogFreeProduct = (index: number, prodId: string) => {
    const found = products.find((p) => p.id === prodId);
    if (found) {
      updateFreeItemRow(index, {
        productId: found.id,
        title: found.title,
        image: found.images?.[0] || '',
        value: found.salePrice > 0 ? found.salePrice : found.price,
      });
    } else {
      updateFreeItemRow(index, { productId: undefined });
    }
  };

  const removeFreeItemRow = (index: number) => {
    setFreeItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const handleAddColor = () => {
    const trimmed = colorNameInput.trim();
    if (!trimmed) return;
    setColors((prev) => [
      ...prev,
      {
        name: trimmed,
        hex: colorHexInput,
        image: colorImageInput.trim() || undefined,
        enabled: true,
        stock: 99,
      },
    ]);
    setColorNameInput('');
    setColorImageInput('');
  };

  const handleAddSize = () => {
    const trimmed = sizeInput.trim().toUpperCase();
    if (!trimmed) return;
    setSizes((prev) => [...prev, { size: trimmed, stock: 99 }]);
    setSizeInput('');
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

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedMainImg = mainProductImage.trim() || galleryImages[0] || '';
    const cleanFreeItems = freeItems
      .filter((f) => f.title.trim())
      .map((f) => ({
        ...f,
        title: f.title.trim(),
        image: f.image?.trim() || resolvedMainImg,
        quantity: Math.max(1, Number(f.quantity) || 1),
        value: f.value ? Number(f.value) : 0,
      }));

    if (!offerTitle.trim() || !mainProductTitle.trim() || !resolvedMainImg) {
      showToast(
        'Please enter Offer Title, Main Product Title, and at least one Image.',
        'error'
      );
      return;
    }
    if (cleanFreeItems.length === 0) {
      showToast(
        'Please add at least one Free Bonus Item included with this offer.',
        'error'
      );
      return;
    }

    setIsSavingOffer(true);
    try {
      const rawGallery = [
        resolvedMainImg,
        ...galleryImages.filter((g) => g && g !== resolvedMainImg),
      ];
      const uploadedGallery = await Promise.all(
        rawGallery.map(async (img) => {
          if (img.startsWith('blob:') || img.startsWith('data:')) {
            try {
              return (await uploadImageToStorage(img, 'buymore')) || img;
            } catch {
              return img;
            }
          }
          return img;
        })
      );

      const finalSlug =
        slug.trim() ||
        offerTitle
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const parsedDays = offerDurationDays.trim() !== '' ? Math.max(0, Number(offerDurationDays) || 0) : undefined;
      const parsedHours = offerDurationHours.trim() !== '' ? Math.max(0, Number(offerDurationHours) || 0) : undefined;
      const totalDurationMs = ((parsedDays || 0) * 86400 + (parsedHours || 0) * 3600) * 1000;
      const durationChanged =
        !editingOffer ||
        parsedDays !== editingOffer.offerDurationDays ||
        parsedHours !== editingOffer.offerDurationHours;

      let computedExpiresAt: string | undefined = editingOffer?.expiresAt;
      if (clearOfferTimer) {
        computedExpiresAt = undefined;
      } else if (durationChanged) {
        computedExpiresAt = totalDurationMs > 0 ? new Date(Date.now() + totalDurationMs).toISOString() : undefined;
      }

      const payload: Omit<BuyMoreOffer, 'id' | 'createdAt'> = {
        title: offerTitle.trim(),
        slug: finalSlug,
        productCode: productCode.trim() || undefined,
        badgeText: badgeText.trim() || 'Buy 1 Get 1 Free',
        offerType,
        mainProductId: mainProductId || undefined,
        mainProductTitle: mainProductTitle.trim(),
        mainProductImage: uploadedGallery[0] || resolvedMainImg,
        images: uploadedGallery,
        videoUrl: videoUrl.trim() || undefined,
        buyQuantity: Math.max(1, Number(buyQuantity) || 1),
        price: Number(price) || 0,
        regularValue: regularValue.trim() ? Number(regularValue) : undefined,
        freeItems: cleanFreeItems,
        colors: colors.length > 0 ? colors : undefined,
        sizes: sizes.length > 0 ? sizes : undefined,
        isFreeShipping,
        description:
          description.trim() || 'Exclusive Buy One Get More bundle offer.',
        voucherCode: voucherCode.trim().toUpperCase() || undefined,
        offerDurationDays: clearOfferTimer ? undefined : parsedDays,
        offerDurationHours: clearOfferTimer ? undefined : parsedHours,
        expiresAt: computedExpiresAt,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        isVisible: offerVisible,
        position: editingOffer?.position ?? buyMoreOffers.length + 1,
      };

      if (editingOffer) {
        await updateBuyMoreOffer({ ...editingOffer, ...payload });
        showToast(`Updated deal "${payload.title}"!`, 'success');
      } else {
        await addBuyMoreOffer(payload);
        showToast(`Added deal "${payload.title}"!`, 'success');
      }
      resetOfferForm();
    } finally {
      setIsSavingOffer(false);
    }
  };

  // Voucher helpers
  const resetVoucherForm = () => {
    setEditingVoucher(null);
    setVCode('');
    setVTitle('');
    setVDesc('');
    setVMinBuyQty(1);
    setVFreeQty(1);
    setVFreeProductNote('');
    setVDiscountPercent('');
    setVExpiryDate('');
    setVVisible(true);
    setIsVoucherFormOpen(false);
  };

  const handleStartEditVoucher = (v: BuyMoreVoucher) => {
    setEditingVoucher(v);
    setVCode(v.code || '');
    setVTitle(v.title || '');
    setVDesc(v.description || '');
    setVMinBuyQty(v.minBuyQty || 1);
    setVFreeQty(v.freeQty || 1);
    setVFreeProductNote(v.freeProductNote || '');
    setVDiscountPercent(v.discountPercent ? String(v.discountPercent) : '');
    setVExpiryDate(v.expiryDate || '');
    setVVisible(v.isVisible !== false);
    setIsVoucherFormOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim() || !vTitle.trim() || !vFreeProductNote.trim()) {
      showToast(
        'Please enter Voucher Code, Title, and Free Product Note.',
        'error'
      );
      return;
    }

    const payload = {
      code: vCode.trim().toUpperCase(),
      title: vTitle.trim(),
      description: vDesc.trim() || vFreeProductNote.trim(),
      minBuyQty: Math.max(1, Number(vMinBuyQty) || 1),
      freeQty: Math.max(1, Number(vFreeQty) || 1),
      freeProductNote: vFreeProductNote.trim(),
      discountPercent: vDiscountPercent.trim() ? Number(vDiscountPercent) : undefined,
      expiryDate: vExpiryDate.trim() || undefined,
      isVisible: vVisible,
    };

    if (editingVoucher) {
      await updateBuyMoreVoucher({ ...editingVoucher, ...payload });
      showToast(`Updated voucher "${payload.code}"!`, 'success');
    } else {
      await addBuyMoreVoucher(payload);
      showToast(`Created voucher "${payload.code}"!`, 'success');
    }
    resetVoucherForm();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Checkmark Visibility Toggle */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-['Outfit']">
                Buy One Get More (BOGO &amp; Combo Vouchers)
              </h3>
              <p className="text-xs text-slate-400">
                Two dedicated folders: Folder 1 (Offer Products with gallery, variants &amp; SEO) and Folder 2 (Offer Vouchers).
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-indigo-400/50 transition-colors self-start lg:self-auto">
            <input
              type="checkbox"
              checked={isSectionVisible}
              onChange={(e) => handleToggleSectionVisible(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-400 cursor-pointer"
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
              placeholder="Buy One Get More"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
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
              placeholder="Buy qualifying items and get extra products free"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-400"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="button"
              onClick={handleSaveHeading}
              className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-indigo-500 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              Save Heading &amp; Grid
            </button>
          </div>
        </div>

        {/* Section Grid Rows & Columns Control */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50">
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-indigo-400"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              Desktop Columns / Row
            </label>
            <select
              value={layoutDesktopCols}
              onChange={(e) => setLayoutDesktopCols(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-400"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* 2 Separate Admin Folders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveFolder('offers')}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              activeFolder === 'offers'
                ? 'bg-gradient-to-r from-indigo-600/30 to-sky-600/20 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold">Folder 1: Offer Products</p>
                <p className="text-[10px] text-slate-400">
                  Buy 1 Get 1 &amp; Paired Free Gift Deals
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-950/60 text-white">
              {buyMoreOffers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('vouchers')}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
              activeFolder === 'vouchers'
                ? 'bg-gradient-to-r from-amber-600/25 to-orange-600/20 border-amber-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold">Folder 2: Offer Vouchers</p>
                <p className="text-[10px] text-slate-400">
                  BOGO Codes, Rules &amp; Extra Discounts
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-950/60 text-white">
              {buyMoreVouchers.length}
            </span>
          </button>
        </div>
      </div>

      {/* FOLDER 1: OFFER PRODUCTS */}
      {activeFolder === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Buy 1 Get More Offer Products
              </h4>
              <p className="text-[11px] text-slate-400">
                Pair a qualifying product with free bonus products, bulk gallery photos, optional variants, and search keywords.
              </p>
            </div>
            {!isOfferFormOpen && (
              <button
                type="button"
                onClick={() => {
                  resetOfferForm();
                  setIsOfferFormOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add BOGO / Combo Deal</span>
              </button>
            )}
          </div>

          {isOfferFormOpen && (
            <form
              onSubmit={handleSaveOffer}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h4 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider">
                  {editingOffer
                    ? 'Edit Buy One Get More Deal'
                    : 'Create Buy One Get More Deal'}
                </h4>
                <button
                  type="button"
                  onClick={resetOfferForm}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Optional Pick from Store */}
              <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
                <label className="text-[11px] font-bold text-sky-300 block mb-1">
                  Quick Fill Main Product from Existing Catalog (Optional)
                </label>
                <select
                  value={mainProductId}
                  onChange={(e) => handlePickCatalogMainProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                >
                  <option value="">
                    -- Enter Custom Product or Choose From Store --
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (৳{p.salePrice > 0 ? p.salePrice : p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Offer Headline *
                  </label>
                  <input
                    type="text"
                    value={offerTitle}
                    onChange={(e) => {
                      setOfferTitle(e.target.value);
                      if (!editingOffer) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '')
                        );
                      }
                    }}
                    placeholder="Buy 1 Polo Shirt Get 1 Free"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Main Product Name *
                  </label>
                  <input
                    type="text"
                    value={mainProductTitle}
                    onChange={(e) => setMainProductTitle(e.target.value)}
                    placeholder="Premium Pique Cotton Polo"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Deal Code / SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="BOGO-101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Offer Type
                    </label>
                    <select
                      value={offerType}
                      onChange={(e) =>
                        setOfferType(e.target.value as BuyMoreOffer['offerType'])
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option value="bogo">Buy 1 Get 1</option>
                      <option value="buy_more_get_more">Buy More Get More</option>
                      <option value="free_gift">Free Gift Combo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="Buy 1 Get 1 Free"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Buy Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Offer Price ৳
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Total Value ৳
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={regularValue}
                      onChange={(e) => setRegularValue(e.target.value)}
                      placeholder="2400"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Linked Voucher Code (Optional)
                  </label>
                  <input
                    type="text"
                    list="buymore-voucher-codes"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="BOGO2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono outline-none"
                  />
                  <datalist id="buymore-voucher-codes">
                    {buyMoreVouchers.map((v) => (
                      <option key={v.id} value={v.code}>
                        {v.title}
                      </option>
                    ))}
                  </datalist>
                </div>

                {/* Live Offer Countdown Duration Controls */}
                <div className="lg:col-span-2 bg-slate-900/90 border border-rose-500/30 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Offer Countdown Timer Duration (Optional — Auto-Expires Offer When Ended)</span>
                    </span>
                    {editingOffer?.expiresAt && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfferDurationDays('');
                          setOfferDurationHours('');
                          setClearOfferTimer(true);
                          showToast('Timer will be removed on Save.', 'info');
                        }}
                        className="text-[10px] font-bold text-rose-300 hover:text-white underline cursor-pointer"
                      >
                        Remove Timer
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Days (দিন)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={365}
                        value={offerDurationDays}
                        onChange={(e) => {
                          setOfferDurationDays(e.target.value);
                          setClearOfferTimer(false);
                        }}
                        placeholder="e.g. 3"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Hours (ঘণ্টা)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={offerDurationHours}
                        onChange={(e) => {
                          setOfferDurationHours(e.target.value);
                          setClearOfferTimer(false);
                        }}
                        placeholder="e.g. 12"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-[10px] text-slate-400 font-medium">
                      {editingOffer?.expiresAt && !clearOfferTimer
                        ? `Current Status: ${getOfferCountdown(editingOffer).label}`
                        : 'Leave blank for no expiry timer'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Image Gallery Uploader & Primary Image */}
              <div className="space-y-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Main Image URL or Quick Upload *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mainProductImage}
                        onChange={(e) => setMainProductImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                      />
                      <input
                        ref={offerFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleOfferImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => offerFileRef.current?.click()}
                        disabled={isUploadingOfferImg}
                        className="px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {isUploadingOfferImg ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#38BDF8]" />
                      Offer Video URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/... or .mp4"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <ImageGalleryUploader
                  images={galleryImages}
                  onChange={setGalleryImages}
                  maxImages={10}
                  label="Bulk Offer Gallery Photos"
                  helperText="Upload multiple deal photos at once for the slider inside Offer Details."
                />
              </div>

              {/* Free Bonus Items Builder */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-extrabold">
                    <PackagePlus className="w-4 h-4" />
                    <span>Free Bonus Products Included With This Offer</span>
                  </div>
                  <button
                    type="button"
                    onClick={addFreeItemRow}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Free Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {freeItems.map((fi, idx) => (
                    <div
                      key={fi.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800"
                    >
                      <div className="md:col-span-3">
                        <select
                          value={fi.productId || ''}
                          onChange={(e) =>
                            handlePickCatalogFreeProduct(idx, e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[11px] text-slate-200 outline-none"
                        >
                          <option value="">Custom Free Item</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          value={fi.title}
                          onChange={(e) =>
                            updateFreeItemRow(idx, { title: e.target.value })
                          }
                          placeholder="Free Item Title *"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          value={fi.image || ''}
                          onChange={(e) =>
                            updateFreeItemRow(idx, { image: e.target.value })
                          }
                          placeholder="Image URL (optional)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <input
                          type="number"
                          min={1}
                          value={fi.quantity}
                          onChange={(e) =>
                            updateFreeItemRow(idx, {
                              quantity: Number(e.target.value),
                            })
                          }
                          title="Free Qty"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <input
                          type="number"
                          min={0}
                          value={fi.value || ''}
                          onChange={(e) =>
                            updateFreeItemRow(idx, {
                              value: Number(e.target.value),
                            })
                          }
                          placeholder="৳ Val"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFreeItemRow(idx)}
                          disabled={freeItems.length <= 1}
                          className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Colors & Sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-700">
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Optional Colors for Deal (With Per-Color Photo)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorHexInput}
                      onChange={(e) => setColorHexInput(e.target.value)}
                      className="w-9 h-8 rounded cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={colorNameInput}
                      onChange={(e) => setColorNameInput(e.target.value)}
                      placeholder="Color Name (optional)"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
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
                          const url = await uploadImageToStorage(file, 'buymore/colors');
                          setColorImageInput(url || '');
                          setIsUploadingColorPhoto(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => colorFileInputRef.current?.click()}
                      className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-white cursor-pointer"
                    >
                      {isUploadingColorPhoto
                        ? 'Uploading...'
                        : colorImageInput
                          ? '✅ Color Photo Selected'
                          : '🖼️ Select Color Photo (Optional)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-500 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.image && (
                            <img
                              src={resolveStoreAssetUrl(c.image)}
                              alt={c.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded object-cover border border-slate-600 shrink-0"
                            />
                          )}
                          <span className="font-bold truncate">{c.name}</span>
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
                                    'buymore/colors'
                                  );
                                  if (url) {
                                    setColors((prev) =>
                                      prev.map((col, i) =>
                                        i === idx ? { ...col, image: url } : col
                                      )
                                    );
                                  }
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setEditingColorGallery(idx)}
                            className="text-sky-400 text-[10px] font-bold hover:underline cursor-pointer"
                          >
                            Gallery ({c.gallery?.length || 0})
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setColors(colors.filter((_, i) => i !== idx))
                            }
                            className="text-rose-400 cursor-pointer px-1"
                          >
                            ✕
                          </button>
                        </div>

                        {editingColorGallery === idx && (
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
                                  setColors((prev) =>
                                    prev.map((col, i) =>
                                      i === idx ? { ...col, gallery: gal } : col
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Optional Sizes for Deal
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      placeholder="Size e.g. M, L, XL (optional)"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                      >
                        <span>{s.size}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSizes(sizes.filter((_, i) => i !== idx))
                          }
                          className="text-rose-400 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Offer Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the customer pays for and receives free..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* SEO & Keywords */}
              <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sky-300 text-xs font-extrabold">
                  <Globe className="w-4 h-4" />
                  <span>SEO &amp; Search Keywords (For Store Search &amp; Filters)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO Title (optional)"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="URL Slug (optional)"
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta Description (optional)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                />
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
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
                    placeholder="Add search keywords (e.g. bogo, buy 1 get 1, free gift)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    + Tag
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950 text-sky-200 border border-sky-500/40 text-[11px]"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setKeywords(keywords.filter((_, i) => i !== idx))
                          }
                          className="hover:text-rose-400 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offerVisible}
                      onChange={(e) => setOfferVisible(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-400"
                    />
                    <span className="text-xs font-bold text-white">
                      Visible on Website (টিকমার্ক থাকলে ওয়েবসাইটে শো করবে)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreeShipping}
                      onChange={(e) => setIsFreeShipping(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-400"
                    />
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Free Delivery
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetOfferForm}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingOffer}
                    className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingOffer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingOffer ? 'Update Deal' : 'Save Deal'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Offer Products List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyMoreOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 rounded-2xl border flex gap-3.5 items-start ${
                  offer.isVisible !== false
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-900/70 border-slate-800 opacity-75'
                }`}
              >
                <img
                  src={resolveStoreAssetUrl(offer.mainProductImage)}
                  alt={offer.mainProductTitle}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-indigo-300 uppercase">
                        {offer.badgeText}
                      </span>
                      <h5 className="text-sm font-extrabold text-white line-clamp-1">
                        {offer.title}
                      </h5>
                    </div>
                    <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={offer.isVisible !== false}
                        onChange={(e) =>
                          updateBuyMoreOffer({ ...offer, isVisible: e.target.checked })
                        }
                        className="w-3.5 h-3.5 accent-indigo-400 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-200">
                        Visible
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-black text-white tabular-nums">
                      ৳{offer.price.toLocaleString()}
                    </span>
                    {offer.regularValue && offer.regularValue > offer.price && (
                      <span className="text-slate-500 line-through tabular-nums">
                        ৳{offer.regularValue.toLocaleString()}
                      </span>
                    )}
                    {offer.voucherCode && (
                      <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                        {offer.voucherCode}
                      </span>
                    )}
                    {offer.images && offer.images.length > 1 && (
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded">
                        {offer.images.length} photos
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-emerald-300">
                    Free Bonus:{' '}
                    {offer.freeItems
                      .map((fi) => `${fi.quantity}× ${fi.title}`)
                      .join(', ')}
                  </div>

                  {offer.expiresAt && (() => {
                    const countdown = getOfferCountdown(offer);
                    return (
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        countdown.isExpired
                          ? 'bg-slate-900 text-slate-400 border border-slate-700'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{countdown.label}</span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditOffer(offer)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferToDelete(offer)}
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

      {/* FOLDER 2: OFFER VOUCHERS */}
      {activeFolder === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Buy More Offer Vouchers
              </h4>
              <p className="text-[11px] text-slate-400">
                Create voucher codes for Buy 1 Get 1 / bonus gifts that customers can copy and apply at checkout.
              </p>
            </div>
            {!isVoucherFormOpen && (
              <button
                type="button"
                onClick={() => {
                  resetVoucherForm();
                  setIsVoucherFormOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Offer Voucher</span>
              </button>
            )}
          </div>

          {isVoucherFormOpen && (
            <form
              onSubmit={handleSaveVoucher}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h4 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                  {editingVoucher ? 'Edit Offer Voucher' : 'Create Offer Voucher'}
                </h4>
                <button
                  type="button"
                  onClick={resetVoucherForm}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Voucher Code *
                  </label>
                  <input
                    type="text"
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    placeholder="BOGO2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Voucher Title *
                  </label>
                  <input
                    type="text"
                    value={vTitle}
                    onChange={(e) => setVTitle(e.target.value)}
                    placeholder="Buy 1 Get 1 Special"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Free Product Note *
                  </label>
                  <input
                    type="text"
                    value={vFreeProductNote}
                    onChange={(e) => setVFreeProductNote(e.target.value)}
                    placeholder="1 Extra Cotton Tee Free"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Min Buy Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={vMinBuyQty}
                      onChange={(e) => setVMinBuyQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Free Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={vFreeQty}
                      onChange={(e) => setVFreeQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Extra Discount % (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={vDiscountPercent}
                    onChange={(e) => setVDiscountPercent(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={vExpiryDate}
                    onChange={(e) => setVExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder="Conditions and offer highlight..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vVisible}
                    onChange={(e) => setVVisible(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                  <span className="text-xs font-bold text-white">
                    Visible on Website (টিকমার্ক থাকলে ওয়েবসাইটে শো করবে)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetVoucherForm}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    {editingVoucher ? 'Update Voucher' : 'Save Voucher'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Vouchers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyMoreVouchers.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  v.isVisible !== false
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-900/70 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                      {v.code}
                    </span>
                    <h5 className="text-sm font-extrabold text-white mt-1.5">
                      {v.title}
                    </h5>
                  </div>
                  <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={v.isVisible !== false}
                      onChange={(e) =>
                        updateBuyMoreVoucher({ ...v, isVisible: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-amber-400 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-200">
                      Visible
                    </span>
                  </label>
                </div>

                <p className="text-xs text-emerald-300 font-semibold">
                  Buy {v.minBuyQty} → Get {v.freeQty} Free ({v.freeProductNote})
                </p>
                {v.description && (
                  <p className="text-[11px] text-slate-400">{v.description}</p>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">
                    {v.discountPercent
                      ? `${v.discountPercent}% Extra Off`
                      : 'Free Item Voucher'}
                    {v.expiryDate ? ` • Exp: ${v.expiryDate}` : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEditVoucher(v)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoucherToDelete(v)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
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
        isOpen={!!offerToDelete}
        title="Delete Offer Deal?"
        message={`Delete "${offerToDelete?.title}" from Buy One Get More?`}
        confirmLabel="Yes, Delete"
        onConfirm={async () => {
          if (offerToDelete) {
            await deleteBuyMoreOffer(offerToDelete.id);
            showToast(`Deleted "${offerToDelete.title}"`, 'success');
            setOfferToDelete(null);
          }
        }}
        onCancel={() => setOfferToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!voucherToDelete}
        title="Delete Offer Voucher?"
        message={`Delete voucher "${voucherToDelete?.code}"?`}
        confirmLabel="Yes, Delete"
        onConfirm={async () => {
          if (voucherToDelete) {
            await deleteBuyMoreVoucher(voucherToDelete.id);
            showToast(`Deleted voucher "${voucherToDelete.code}"`, 'success');
            setVoucherToDelete(null);
          }
        }}
        onCancel={() => setVoucherToDelete(null)}
      />
    </div>
  );
};
