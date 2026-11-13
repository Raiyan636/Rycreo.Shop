import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Save, RefreshCw, CheckCircle, Store, Bell, Phone, Shield, Upload, Sparkles, Image as ImageIcon, Check, Clock, Mail, Send, Tag, LayoutGrid } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { INITIAL_STORE_CONFIG } from '../../data/initialData';
import { SectionGridLayoutConfig } from '../../types/store';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage } from '../../storageService';
import { StoreLogo } from '../common/StoreLogo';
import { getWorkingHoursStatus, formatMinutesTo12Hour, parseTimeToMinutes, formatTimeString } from '../../utils/workingHours';

const DEFAULT_SECTION_LAYOUTS = INITIAL_STORE_CONFIG.sectionLayouts!;

export const StoreSettingsManager: React.FC = () => {
  const { storeConfig, updateStoreConfig, resetToFactoryDefaults, categories, syncToCloudNow } = useStore();

  const [storeName, setStoreName] = useState(storeConfig.storeName || 'RycreoShop');
  const [logoUrl, setLogoUrl] = useState(storeConfig.logoUrl || '');
  const [logoBgColor, setLogoBgColor] = useState(storeConfig.logoBgColor || "#FFFFFF");
  const [logoPadding, setLogoPadding] = useState(storeConfig.logoPadding || 4);
  const [faviconUrl, setFaviconUrl] = useState(storeConfig.faviconUrl || '');
  const [contactEmail, setContactEmail] = useState(storeConfig.contactEmail || 'rycreoshop@gmail.com');
  const [orderAlertEmail, setOrderAlertEmail] = useState(storeConfig.emailjsReceiverEmail || 'rycreoshop@gmail.com');

  // Co-Founder & Partner Settings
  const [coFounderName, setCoFounderName] = useState(storeConfig.coFounderName || '');
  const [coFounderTitle, setCoFounderTitle] = useState(storeConfig.coFounderTitle || 'Co-Founder & Partner');
  const [isCoFounderActive, setIsCoFounderActive] = useState(storeConfig.isCoFounderActive || false);

  // 4 Custom Delivery Options
  const [customDeliveryOption1Name, setCustomDeliveryOption1Name] = useState(storeConfig.customDeliveryOption1Name || 'Express Same-Day Dhaka');
  const [customDeliveryOption1Fee, setCustomDeliveryOption1Fee] = useState(storeConfig.customDeliveryOption1Fee ?? 150);
  const [customDeliveryOption1Active, setCustomDeliveryOption1Active] = useState(storeConfig.customDeliveryOption1Active || false);

  const [customDeliveryOption2Name, setCustomDeliveryOption2Name] = useState(storeConfig.customDeliveryOption2Name || 'Urgent Courier Service');
  const [customDeliveryOption2Fee, setCustomDeliveryOption2Fee] = useState(storeConfig.customDeliveryOption2Fee ?? 180);
  const [customDeliveryOption2Active, setCustomDeliveryOption2Active] = useState(storeConfig.customDeliveryOption2Active || false);

  const [customDeliveryOption3Name, setCustomDeliveryOption3Name] = useState(storeConfig.customDeliveryOption3Name || 'VIP Hand Delivery');
  const [customDeliveryOption3Fee, setCustomDeliveryOption3Fee] = useState(storeConfig.customDeliveryOption3Fee ?? 250);
  const [customDeliveryOption3Active, setCustomDeliveryOption3Active] = useState(storeConfig.customDeliveryOption3Active || false);

  const [customDeliveryOption4Name, setCustomDeliveryOption4Name] = useState(storeConfig.customDeliveryOption4Name || 'Redx / Pathao Fast Express');
  const [customDeliveryOption4Fee, setCustomDeliveryOption4Fee] = useState(storeConfig.customDeliveryOption4Fee ?? 130);
  const [customDeliveryOption4Active, setCustomDeliveryOption4Active] = useState(storeConfig.customDeliveryOption4Active || false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: 'TEST-' + Math.floor(100000 + Math.random() * 900000),
          order_total: '1250',
          customer_name: 'Test Customer (Test Verification)',
          phone: '+8801700000000',
          customer_address: 'Dhanmondi, Dhaka, Bangladesh',
          delivery_area: 'Inside Dhaka',
          items_list: 'Premium Polo Shirt x 1, Chino Pant x 1',
          payment_method: 'Cash on Delivery',
          receiver_email: orderAlertEmail
        })
      });
      const data = await res.json();
      setTestEmailStatus('Test notification sent! Please check your Gmail (' + orderAlertEmail + ') inbox and spam folder.');
    } catch (err: any) {
      setTestEmailStatus('Notice: ' + err.message);
    } finally {
      setIsSendingTestEmail(false);
    }
  };
  const [contactPhone, setContactPhone] = useState(storeConfig.contactPhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(storeConfig.whatsappNumber || '');
  const [defaultInsideDhakaFee, setDefaultInsideDhakaFee] = useState(storeConfig.defaultInsideDhakaFee ?? 80);
  const [defaultOutsideDhakaFee, setDefaultOutsideDhakaFee] = useState(storeConfig.defaultOutsideDhakaFee ?? 150);
  const [freeDeliveryThresholdActive, setFreeDeliveryThresholdActive] = useState(storeConfig.freeDeliveryThresholdActive ?? true);
  const [freeDeliveryThresholdAmount, setFreeDeliveryThresholdAmount] = useState(storeConfig.freeDeliveryThresholdAmount ?? 1500);
  const [freeDeliveryNoticeText, setFreeDeliveryNoticeText] = useState(storeConfig.freeDeliveryNoticeText || "Free delivery on orders above ৳1,500!");
  const [topBarNotice, setTopBarNotice] = useState(storeConfig.topBarNotice || '');
  const [popularCollectionsTitle, setPopularCollectionsTitle] = useState(storeConfig.popularCollectionsTitle || "");
  const [popularCollectionsSubtitle, setPopularCollectionsSubtitle] = useState(storeConfig.popularCollectionsSubtitle || "");
  const [guarantees, setGuarantees] = useState(storeConfig.guarantees || []);
  const [isTopBarNoticeActive, setIsTopBarNoticeActive] = useState(storeConfig.isTopBarNoticeActive ?? true);
  const [creditsText, setCreditsText] = useState(storeConfig.creditsText || "Developed by RycreoShop Solutions");
  const [creditsLink, setCreditsLink] = useState(storeConfig.creditsLink || "https://rycreoshop.com");
  const [isCreditsActive, setIsCreditsActive] = useState(storeConfig.isCreditsActive ?? true);
  const [ownerName, setOwnerName] = useState(storeConfig.ownerName || "Raiyan");
  const [copyrightText, setCopyrightText] = useState(storeConfig.copyrightText || "");
  const [heroCtaButtonActive, setHeroCtaButtonActive] = useState<boolean>(storeConfig.heroCtaButtonActive ?? true);
  const [orderLockDurationHours, setOrderLockDurationHours] = useState<number>(storeConfig.orderLockDurationHours ?? 24);
  const [orderPolicyText, setOrderPolicyText] = useState<string>(storeConfig.orderPolicyText || "⚡ **24-HOUR ORDER MODIFICATION & CANCELLATION POLICY**:\n\n1. **Modification Window (24 Hours)**: After placing an order, customers have up to **24 hours** to edit delivery address/phone, cancel the order, or add more products with variant selectors.\n2. **Auto-Locking**: Once 24 hours have elapsed, the system automatically locks and disables all edits, cancellations, and product additions.\n3. **Consolidated Delivery**: Adding products within 24 hours merges them into your existing order with a single consolidated delivery charge (no double-charging).");

  // Working Hours Control State (Module 1) - Default 7:00 AM to 12:00 PM
  const [workingStartTime, setWorkingStartTime] = useState(storeConfig.workingHours?.startTime || "07:00");
  const [workingEndTime, setWorkingEndTime] = useState(storeConfig.workingHours?.endTime || "12:00");
  const [workingDisplayText, setWorkingDisplayText] = useState(storeConfig.workingHours?.displayText || "7:00 AM - 12:00 PM (Daily)");
  const [workingIsOpen, setWorkingIsOpen] = useState(storeConfig.workingHours?.isOpen ?? true);
  const [workingIsAlwaysOpen, setWorkingIsAlwaysOpen] = useState(storeConfig.workingHours?.isAlwaysOpen ?? false);

  // Synchronize local states whenever storeConfig updates from Firestore
  useEffect(() => {
    if (storeConfig) {
      setStoreName(storeConfig.storeName || 'RycreoShop');
      setLogoUrl(storeConfig.logoUrl || '');
      setLogoBgColor(storeConfig.logoBgColor || "#FFFFFF");
      setLogoPadding(storeConfig.logoPadding || 4);
      setFaviconUrl(storeConfig.faviconUrl || '');
      setContactEmail(storeConfig.contactEmail || 'rycreoshop@gmail.com');
      setOrderAlertEmail(storeConfig.emailjsReceiverEmail || 'rycreoshop@gmail.com');
      setContactPhone(storeConfig.contactPhone || '');
      setWhatsappNumber(storeConfig.whatsappNumber || '');
      setDefaultInsideDhakaFee(storeConfig.defaultInsideDhakaFee ?? 80);
      setDefaultOutsideDhakaFee(storeConfig.defaultOutsideDhakaFee ?? 150);
      setFreeDeliveryThresholdActive(storeConfig.freeDeliveryThresholdActive ?? true);
      setFreeDeliveryThresholdAmount(storeConfig.freeDeliveryThresholdAmount ?? 1500);
      setFreeDeliveryNoticeText(storeConfig.freeDeliveryNoticeText || "Free delivery on orders above ৳1,500!");
      setTopBarNotice(storeConfig.topBarNotice || '');
      setPopularCollectionsTitle(storeConfig.popularCollectionsTitle || "");
      setPopularCollectionsSubtitle(storeConfig.popularCollectionsSubtitle || "");
      if (storeConfig.guarantees) setGuarantees(storeConfig.guarantees);
      setIsTopBarNoticeActive(storeConfig.isTopBarNoticeActive ?? true);
      setCreditsText(storeConfig.creditsText || "Developed by RycreoShop Solutions");
      setCreditsLink(storeConfig.creditsLink || "https://rycreoshop.com");
      setIsCreditsActive(storeConfig.isCreditsActive ?? true);
      setOwnerName(storeConfig.ownerName || "Raiyan");
      setCopyrightText(storeConfig.copyrightText || "");
      setHeroCtaButtonActive(storeConfig.heroCtaButtonActive ?? true);
      setOrderLockDurationHours(storeConfig.orderLockDurationHours ?? 24);
      setOrderPolicyText(storeConfig.orderPolicyText || "");
      setCoFounderName(storeConfig.coFounderName || '');
      setCoFounderTitle(storeConfig.coFounderTitle || 'Co-Founder & Partner');
      setIsCoFounderActive(storeConfig.isCoFounderActive || false);
      setCustomDeliveryOption1Name(storeConfig.customDeliveryOption1Name || 'Express Same-Day Dhaka');
      setCustomDeliveryOption1Fee(storeConfig.customDeliveryOption1Fee ?? 150);
      setCustomDeliveryOption1Active(storeConfig.customDeliveryOption1Active || false);
      setCustomDeliveryOption2Name(storeConfig.customDeliveryOption2Name || 'Urgent Courier Service');
      setCustomDeliveryOption2Fee(storeConfig.customDeliveryOption2Fee ?? 180);
      setCustomDeliveryOption2Active(storeConfig.customDeliveryOption2Active || false);
      setCustomDeliveryOption3Name(storeConfig.customDeliveryOption3Name || 'VIP Hand Delivery');
      setCustomDeliveryOption3Fee(storeConfig.customDeliveryOption3Fee ?? 250);
      setCustomDeliveryOption3Active(storeConfig.customDeliveryOption3Active || false);
      setCustomDeliveryOption4Name(storeConfig.customDeliveryOption4Name || 'Redx / Pathao Fast Express');
      setCustomDeliveryOption4Fee(storeConfig.customDeliveryOption4Fee ?? 130);
      setCustomDeliveryOption4Active(storeConfig.customDeliveryOption4Active || false);
      setVoucherBannerTitle(storeConfig.voucherBannerTitle || 'Special Voucher Drop');
      setVoucherBannerSubtitle(storeConfig.voucherBannerSubtitle || 'Flat ৳50 OFF with code WELCOME50 on your first order!');
      setIsVouchersActive(storeConfig.isVouchersActive ?? true);
      setFestivalHighlightTitle(storeConfig.festivalHighlightTitle || "FESTIVAL HIGHLIGHT 2026");
      setFestivalHighlightSubtitle(storeConfig.festivalHighlightSubtitle || "Puja Special Traditional Fusion Collection");
      setFestivalHighlightDesc(storeConfig.festivalHighlightDesc || "");
      setFestivalHighlightCtaText(storeConfig.festivalHighlightCtaText || "EXPLORE FESTIVAL SPECIAL");
      setFestivalHighlightCategory(storeConfig.festivalHighlightCategory || "Festive & Premium");
      setFestivalHighlightImage(storeConfig.festivalHighlightImage || "");
      setIsFestivalHighlightActive(storeConfig.isFestivalHighlightActive ?? true);
      if (storeConfig.workingHours) {
        setWorkingStartTime(storeConfig.workingHours.startTime || "07:00");
        setWorkingEndTime(storeConfig.workingHours.endTime || "12:00");
        setWorkingDisplayText(storeConfig.workingHours.displayText || "7:00 AM - 12:00 PM (Daily)");
        setWorkingIsOpen(storeConfig.workingHours.isOpen ?? true);
        setWorkingIsAlwaysOpen(storeConfig.workingHours.isAlwaysOpen ?? false);
      }
      setSectionLayouts({
        ourProducts: {
          ...DEFAULT_SECTION_LAYOUTS.ourProducts,
          ...(storeConfig.sectionLayouts?.ourProducts || {}),
        },
        preOrder: {
          ...DEFAULT_SECTION_LAYOUTS.preOrder,
          ...(storeConfig.sectionLayouts?.preOrder || {}),
        },
        buyMore: {
          ...DEFAULT_SECTION_LAYOUTS.buyMore,
          ...(storeConfig.sectionLayouts?.buyMore || {}),
        },
      });
    }
  }, [storeConfig]);

  // Instant toggle handler that saves permanently to Firebase immediately
  const handleInstantToggle = (updates: Partial<typeof storeConfig>) => {
    updateStoreConfig(updates);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  // Auto-recalculate display text when Opening or Closing time inputs change
  const handleStartTimeChange = (newStart: string) => {
    setWorkingStartTime(newStart);
    const startM = parseTimeToMinutes(newStart) ?? 420;
    const endM = parseTimeToMinutes(workingEndTime) ?? 720;
    const autoText = `${formatMinutesTo12Hour(startM)} - ${formatMinutesTo12Hour(endM)} (Daily)`;
    setWorkingDisplayText(autoText);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setWorkingEndTime(newEnd);
    const startM = parseTimeToMinutes(workingStartTime) ?? 420;
    const endM = parseTimeToMinutes(newEnd) ?? 720;
    const autoText = `${formatMinutesTo12Hour(startM)} - ${formatMinutesTo12Hour(endM)} (Daily)`;
    setWorkingDisplayText(autoText);
  };

  // Live real-time calculation preview of current operating hours status
  const liveWorkingStatus = useMemo(() => {
    return getWorkingHoursStatus({
      startTime: workingStartTime,
      endTime: workingEndTime,
      displayText: workingDisplayText,
      isOpen: workingIsOpen,
      isAlwaysOpen: workingIsAlwaysOpen
    });
  }, [workingStartTime, workingEndTime, workingDisplayText, workingIsOpen, workingIsAlwaysOpen]);

  const handleToggleAlwaysOpen = (checked: boolean) => {
    setWorkingIsAlwaysOpen(checked);
    if (checked) {
      setWorkingStartTime("00:00");
      setWorkingEndTime("23:59");
      setWorkingDisplayText("12:00 AM - 11:59 PM (24/7 Always Open)");
      setWorkingIsOpen(true);
      handleInstantToggle({
        workingHours: {
          startTime: "00:00",
          endTime: "23:59",
          displayText: "12:00 AM - 11:59 PM (24/7 Always Open)",
          isOpen: true,
          isAlwaysOpen: true
        }
      });
    } else {
      const defaultDisplay = `${formatTimeString(workingStartTime || '07:00', '7:00 AM')} - ${formatTimeString(workingEndTime || '12:00', '12:00 PM')} (Daily)`;
      setWorkingDisplayText(defaultDisplay);
      handleInstantToggle({
        workingHours: {
          startTime: workingStartTime || "07:00",
          endTime: workingEndTime || "12:00",
          displayText: defaultDisplay,
          isOpen: workingIsOpen,
          isAlwaysOpen: false
        }
      });
    }
  };

  const handleToggleWorkingIsOpen = (checked: boolean) => {
    setWorkingIsOpen(checked);
    handleInstantToggle({
      workingHours: {
        startTime: workingStartTime,
        endTime: workingEndTime,
        displayText: workingDisplayText,
        isOpen: checked,
        isAlwaysOpen: workingIsAlwaysOpen
      }
    });
  };

  const [festivalHighlightTitle, setFestivalHighlightTitle] = useState(storeConfig.festivalHighlightTitle || "FESTIVAL HIGHLIGHT 2026");
  const [festivalHighlightSubtitle, setFestivalHighlightSubtitle] = useState(storeConfig.festivalHighlightSubtitle || "Puja Special Traditional Fusion Collection");
  const [festivalHighlightDesc, setFestivalHighlightDesc] = useState(storeConfig.festivalHighlightDesc || "Royal cotton-linen Kurtas and silk-touch button-downs crafted with mandarin collar embroidery for Durga Puja & Eid festivities.");
  const [festivalHighlightCtaText, setFestivalHighlightCtaText] = useState(storeConfig.festivalHighlightCtaText || "EXPLORE FESTIVAL SPECIAL");
  const [festivalHighlightCategory, setFestivalHighlightCategory] = useState(storeConfig.festivalHighlightCategory || "Festive & Premium");
  const [festivalHighlightImage, setFestivalHighlightImage] = useState(storeConfig.festivalHighlightImage || "");
  const [isFestivalHighlightActive, setIsFestivalHighlightActive] = useState(storeConfig.isFestivalHighlightActive ?? true);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const handleBannerUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingBanner(true);
    try {
      const url = await uploadImageToStorage(files[0], 'banners');
      setFestivalHighlightImage(url);
    } catch (err) {
      console.error("Banner upload error", err);
      try {
        const compressed = await compressImage(files[0], 1000, 0.80);
        setFestivalHighlightImage(compressed);
      } catch {}
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const [savedMsg, setSavedMsg] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const url = await uploadImageToStorage(files[0], 'branding');
      setLogoUrl(url);
    } catch (err) {
      console.error("Logo upload error", err);
      try {
        const compressed = await compressImage(files[0], 500, 0.85);
        setLogoUrl(compressed);
      } catch {}
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const [voucherBannerTitle, setVoucherBannerTitle] = useState(storeConfig.voucherBannerTitle || 'Special Voucher Drop');
  const [voucherBannerSubtitle, setVoucherBannerSubtitle] = useState(storeConfig.voucherBannerSubtitle || 'Flat ৳50 OFF with code WELCOME50 on your first order!');
  const [isVouchersActive, setIsVouchersActive] = useState(storeConfig.isVouchersActive ?? true);
  const [sectionLayouts, setSectionLayouts] = useState<{
    ourProducts: SectionGridLayoutConfig;
    preOrder: SectionGridLayoutConfig;
    buyMore: SectionGridLayoutConfig;
  }>(() => ({
    ourProducts: {
      ...DEFAULT_SECTION_LAYOUTS.ourProducts,
      ...(storeConfig.sectionLayouts?.ourProducts || {}),
    },
    preOrder: {
      ...DEFAULT_SECTION_LAYOUTS.preOrder,
      ...(storeConfig.sectionLayouts?.preOrder || {}),
    },
    buyMore: {
      ...DEFAULT_SECTION_LAYOUTS.buyMore,
      ...(storeConfig.sectionLayouts?.buyMore || {}),
    },
  }));

  const updateSectionLayoutField = (
    sectionKey: 'ourProducts' | 'preOrder' | 'buyMore',
    field: keyof SectionGridLayoutConfig,
    value: number
  ) => {
    setSectionLayouts((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreConfig({
      storeName,
      logoUrl,
      faviconUrl,
      contactEmail,
      emailjsReceiverEmail: orderAlertEmail,
      contactPhone,
      whatsappNumber,
      defaultInsideDhakaFee,
      defaultOutsideDhakaFee,
      freeDeliveryThresholdActive,
      freeDeliveryThresholdAmount,
      freeDeliveryNoticeText,
      topBarNotice,
      popularCollectionsTitle,
      popularCollectionsSubtitle,
      guarantees,
      isTopBarNoticeActive,
      creditsText,
      creditsLink,
      isCreditsActive,
      ownerName,
      copyrightText: copyrightText.trim() || undefined,
      coFounderName,
      coFounderTitle,
      isCoFounderActive,
      customDeliveryOption1Name,
      customDeliveryOption1Fee,
      customDeliveryOption1Active,
      customDeliveryOption2Name,
      customDeliveryOption2Fee,
      customDeliveryOption2Active,
      customDeliveryOption3Name,
      customDeliveryOption3Fee,
      customDeliveryOption3Active,
      customDeliveryOption4Name,
      customDeliveryOption4Fee,
      customDeliveryOption4Active,
      logoBgColor,
      logoPadding,
      festivalHighlightTitle,
      festivalHighlightSubtitle,
      festivalHighlightDesc,
      festivalHighlightCtaText,
      festivalHighlightCategory,
      festivalHighlightImage,
      isFestivalHighlightActive,
      heroCtaButtonActive,
      orderLockDurationHours,
      orderPolicyText,
      workingHours: {
        startTime: workingStartTime,
        endTime: workingEndTime,
        displayText: workingDisplayText,
        isOpen: workingIsOpen,
        isAlwaysOpen: workingIsAlwaysOpen
      },
      voucherBannerTitle,
      voucherBannerSubtitle,
      isVouchersActive,
      sectionLayouts
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);

    // Instant cloud sync
    try {
      syncToCloudNow();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Global Store Customizer</h3>
          <p className="text-xs text-slate-400">Dynamically update branding, favicon icon, WhatsApp number, shipping fees, and top notice bar.</p>
        </div>

        {savedMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg animate-bounce">
            <CheckCircle className="w-5 h-5 text-slate-950" />
            <span>Store Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6">
        
        {/* Store Brand Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Brand & Logo Configuration
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Store Name</label>
              <input 
                type="text" 
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Store Logo (Direct Gallery Upload)</label>
              <input 
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e.target.files)}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? 'Uploading...' : '📸 Upload Logo from Gallery'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Favicon URL (Dynamically bound)</label>
              <input 
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* Logo Background Customizer & Auto-White Fixer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎨 Logo Canvas & Background Styling</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Auto-White Active</span>
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ensure your logo background is solid white so that the original colors pop out perfectly.
                </p>
              </div>

              {/* Automatic White Background Button */}
              <button
                type="button"
                onClick={() => {
                  setLogoUrl('/logo.png');
                  setFaviconUrl('/logo.png');
                  setLogoBgColor('#FFFFFF');
                  setLogoPadding(4);
                  alert('Logo background has been automatically set to pure white (#FFFFFF) with original vector colors!');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Make Background White Automatically</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Background Color Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Logo Background Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={logoBgColor}
                    onChange={(e) => setLogoBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border border-slate-600 cursor-pointer p-0.5"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLogoBgColor('#FFFFFF')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${logoBgColor.toUpperCase() === '#FFFFFF' ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                    >
                      Pure White
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoBgColor('#F8FAFC')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${logoBgColor.toUpperCase() === '#F8FAFC' ? 'bg-slate-200 text-slate-900 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                    >
                      Soft White
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Padding */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Internal Padding (Canvas Border Gap)</label>
                <select
                  value={logoPadding}
                  onChange={(e) => setLogoPadding(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                >
                  <option value={0}>0px (Edge to Edge)</option>
                  <option value={2}>2px (Slight Padding)</option>
                  <option value={4}>4px (Recommended Balanced)</option>
                  <option value={8}>8px (Generous White Space)</option>
                </select>
              </div>

              {/* Live Preview Box */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-dashed border-[#38BDF8] flex items-center justify-center overflow-hidden shadow-lg shrink-0"
                  style={{ backgroundColor: logoBgColor, padding: `${logoPadding}px` }}
                >
                  {(!logoUrl || logoUrl === '/logo.svg') ? (
                    <StoreLogo className="w-full h-full object-contain" bgColor={logoBgColor} />
                  ) : (
                    <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Live Header Preview</p>
                  <p className="text-[10px] text-slate-400">White background with blue logo accent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Hotline */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> Customer Hotline & WhatsApp Direct
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Hotline Phone Number</label>
              <input 
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp Number</label>
              <input 
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Store Support Email</label>
              <input 
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Instant Order Email Alert Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-700 bg-slate-900/60 p-4 rounded-2xl border border-sky-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-sky-400" /> Instant Order Email Alert
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every time a customer places an order, all order details will be sent immediately to this email.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTestEmail}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email (Test Alert)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Order Alert Recipient Email
              </label>
              <input 
                type="email"
                required
                value={orderAlertEmail}
                onChange={(e) => setOrderAlertEmail(e.target.value)}
                placeholder="rycreoshop@gmail.com"
                className="w-full bg-slate-900 border border-sky-500/40 focus:border-sky-400 rounded-xl p-2.5 text-xs text-white font-mono font-bold outline-none"
              />
            </div>
            <div className="flex items-center text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <p className="text-[11px] leading-relaxed">
                💡 <span className="text-sky-300 font-bold">Email Delivery:</span> Customer orders are dispatched instantly using EmailJS to <span className="text-amber-300 font-mono font-bold">{orderAlertEmail}</span>.
              </p>
            </div>
          </div>

          {testEmailStatus && (
            <div className="p-3 bg-sky-950/80 border border-sky-400/30 rounded-xl text-xs text-sky-200 font-medium animate-fade-in">
              {testEmailStatus}
            </div>
          )}
        </div>

        {/* Working Hours Control (Module 1) - Auto Calculate Feature */}
        <div className="space-y-4 pt-4 border-t border-slate-700 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#38BDF8]" /> Store Working & Operating Hours (কাজের সময় নির্ধারণ)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bangladesh Standard Time (BST) অনুযায়ী স্বয়ংক্রিয়ভাবে Open / Closed নির্ধারণ হয়।
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <input 
                type="checkbox"
                checked={workingIsOpen}
                onChange={(e) => handleToggleWorkingIsOpen(e.target.checked)}
                className="w-4 h-4 rounded text-[#38BDF8]"
              />
              <span className={`text-xs font-bold ${workingIsOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {workingIsOpen ? 'Store Active (Open)' : 'Manual Close'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <input 
                type="checkbox"
                checked={workingIsAlwaysOpen}
                onChange={(e) => handleToggleAlwaysOpen(e.target.checked)}
                className="w-4 h-4 rounded text-amber-400"
              />
              <span className="text-xs font-bold text-amber-400">
                Always Open (24/7)
              </span>
            </label>
          </div>

          {/* Real-time live status indicator badge card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${liveWorkingStatus.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                <span className="text-xs font-extrabold text-white">Live Status:</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  liveWorkingStatus.isOpen 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {liveWorkingStatus.badgeText}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {liveWorkingStatus.statusText}
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Bangladesh Time (BST)</span>
              <span className="font-mono font-bold text-amber-400 text-xs">{liveWorkingStatus.currentBangladeshTime}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Opening Time (শুরুর সময়)
              </label>
              <input 
                type="time"
                value={workingStartTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
              <span className="text-[10px] text-slate-400 block mt-1">যেমন: 07:00 (সকাল ৭:০০ AM)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Closing Time (শেষের সময়)
              </label>
              <input 
                type="time"
                value={workingEndTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
              <span className="text-[10px] text-slate-400 block mt-1">যেমন: 12:00 (দুপুর ১২:০০ PM)</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Display Text on Website (ওয়েবসাইটে প্রদর্শিত লেখা)
              </label>
              <input 
                type="text"
                value={workingDisplayText}
                onChange={(e) => setWorkingDisplayText(e.target.value)}
                placeholder="7:00 AM - 12:00 PM (Daily)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
              <span className="text-[10px] text-emerald-400 block mt-1">স্বয়ংক্রিয়ভাবে আপডেট হয়</span>
            </div>
          </div>

          <div className="p-2.5 bg-sky-950/40 border border-sky-500/20 rounded-xl text-[11px] text-sky-300 font-medium flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              <strong>অটো টাইম ক্যালকুলেটর:</strong> আপনি যদি ৭:০০ AM থেকে ১২:০০ PM দেন, তাহলে ঠিক ১২:০১ বাজলেই ওয়েবসাইট এবং ফুটারের স্ট্যাটাস স্বয়ংক্রিয়ভাবে <strong>&quot;Closed Currently&quot;</strong> বা <strong>&quot;Closed Now&quot;</strong> হয়ে যাবে।
            </span>
          </div>
        </div>

        {/* Voucher Banner CMS Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4" /> Voucher Banner Settings
          </h4>
          <p className="text-[11px] text-slate-400">
            Configure the dynamic voucher banner shown on the homepage.
          </p>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isVouchersActive}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsVouchersActive(val);
                  handleInstantToggle({ isVouchersActive: val });
                }}
                className="w-4 h-4 rounded text-[#38BDF8]"
              />
              <span className="text-xs font-bold text-white">Enable Voucher Form & Homepage Banner (ভাউচার ও কুপন ফর্ম অন/অফ)</span>
            </label>
            
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Banner Title</label>
              <input 
                type="text" 
                value={voucherBannerTitle}
                onChange={(e) => setVoucherBannerTitle(e.target.value)}
                onBlur={() => handleInstantToggle({ voucherBannerTitle })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Banner Subtitle</label>
              <input 
                type="text" 
                value={voucherBannerSubtitle}
                onChange={(e) => setVoucherBannerSubtitle(e.target.value)}
                onBlur={() => handleInstantToggle({ voucherBannerSubtitle })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner CTA Button Customization */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Hero Banner 'Shop Now' CTA Button Settings
          </h4>
          <p className="text-[11px] text-slate-400">
            ওয়েবসাইটের হোমপেজের মূল ব্যানার বা স্লাইডারের উপর শপ নাও (Shop Now) বাটন এখান থেকে টিকমার্ক দিয়ে অন/অফ করতে পারেন।
          </p>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={heroCtaButtonActive}
                onChange={(e) => {
                  const val = e.target.checked;
                  setHeroCtaButtonActive(val);
                  handleInstantToggle({ heroCtaButtonActive: val });
                }}
                className="w-4 h-4 rounded text-[#38BDF8]"
              />
              <span className="text-xs font-bold text-white">Enable Hero 'Shop Now' CTA Button (শপ নাও বাটন দেখান)</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1">
              টিকমার্ক অন রাখলে মূল ব্যানার স্লাইডারে 'Shop Now' বাটন দৃশ্যমান হবে। অফ করলে শুধু কাস্টম ব্যানার ছবি থাকবে।
            </p>
          </div>
        </div>

        {/* Storefront Grid, Rows & Columns Control per Section */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4" /> Storefront Rows, Columns &amp; Per-Row Capacity (সারি ও কলাম নিয়ন্ত্রণ)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                প্রতিটি সেকশনের সারি (Rows), ডেস্কটপ কলাম, মোবাইল কলাম ও প্রতি সারিতে সর্বোচ্চ আইটেম সংখ্যা নিজের মতো নির্ধারণ করুন (যেমন: প্রি-অর্ডার বেশি হলে ১০ সারি)।
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInstantToggle({ sectionLayouts })}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              Save Grid Layout Now
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(
              [
                {
                  key: 'ourProducts' as const,
                  label: '1. Our Products (মূল প্রোডাক্ট)',
                  accent: 'border-emerald-500/30',
                  badge: 'text-emerald-300',
                },
                {
                  key: 'preOrder' as const,
                  label: '2. Upcoming / Pre-Order (আপকামিং)',
                  accent: 'border-amber-500/30',
                  badge: 'text-amber-300',
                },
                {
                  key: 'buyMore' as const,
                  label: '3. Buy One Get More (বাই ওয়ান গেট মোর)',
                  accent: 'border-indigo-500/30',
                  badge: 'text-indigo-300',
                },
              ]
            ).map(({ key, label, accent, badge }) => {
              const cfg = sectionLayouts[key];
              return (
                <div key={key} className={`p-4 rounded-2xl bg-slate-900 border ${accent} space-y-3`}>
                  <h5 className={`text-xs font-extrabold ${badge}`}>{label}</h5>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Desktop Max Rows (সারি)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={cfg.maxRows}
                        onChange={(e) =>
                          updateSectionLayoutField(key, 'maxRows', Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
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
                        value={cfg.mobileMaxRows ?? 4}
                        onChange={(e) =>
                          updateSectionLayoutField(key, 'mobileMaxRows', Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Desktop Columns (কলাম)
                      </label>
                      <select
                        value={cfg.desktopColumns}
                        onChange={(e) => updateSectionLayoutField(key, 'desktopColumns', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                      >
                        {[2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n} Columns / Row</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Mobile Columns
                      </label>
                      <select
                        value={cfg.mobileColumns}
                        onChange={(e) => updateSectionLayoutField(key, 'mobileColumns', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                      >
                        {[1, 2, 3].map((n) => (
                          <option key={n} value={n}>{n} Cols on Mobile</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Items / Row (সর্বোচ্চ পিস)
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={50}
                        value={cfg.maxItemsPerRow}
                        onChange={(e) =>
                          updateSectionLayoutField(key, 'maxItemsPerRow', Math.min(50, Math.max(4, Number(e.target.value) || 20)))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        1-Row Beauty Limit
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={cfg.autoSingleRowThreshold ?? 3}
                        onChange={(e) =>
                          updateSectionLayoutField(key, 'autoSingleRowThreshold', Math.min(12, Math.max(1, Number(e.target.value) || 3)))
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Policy & 24-Hour Modification Window CMS Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Order Policy & 24-Hour Modification Window CMS
          </h4>
          <p className="text-[11px] text-slate-400">
            Customize the "Must Read Order Policy" text and 24-hour modification/lock window duration. Admin email: rycreoshop@gmail.com
          </p>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Order Lock Duration (Hours) - Default: 24 Hours
              </label>
              <input 
                type="number"
                min={1}
                max={168}
                value={orderLockDurationHours}
                onChange={(e) => setOrderLockDurationHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-1">কত ঘণ্টা পর অর্ডার এডিট বা ক্যানসেল লক হয়ে যাবে (যেমন: ২৪ ঘণ্টা)।</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center justify-between">
                <span>Order Policy Rich Text & Highlighting Content</span>
                <span className="text-[10px] text-amber-400 font-mono">Supports Markdown, Bold, Warning Highlights</span>
              </label>
              <textarea 
                rows={6}
                value={orderPolicyText}
                onChange={(e) => setOrderPolicyText(e.target.value)}
                placeholder="Enter order policy terms..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none font-mono leading-relaxed focus:border-[#38BDF8]"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOrderPolicyText(prev => prev + "\n\n⚠️ **WARNING**: Critical policy notice.")}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold border border-amber-500/30 cursor-pointer"
                >
                  + Add Warning Highlight
                </button>
                <button
                  type="button"
                  onClick={() => setOrderPolicyText(prev => prev + "\n\n**24-Hour Rule**: Modifications allowed within 24 hours.")}
                  className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-[10px] font-bold border border-sky-500/30 cursor-pointer"
                >
                  + Add 24-Hour Rule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Costs & Notice */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> Shipping Rates & Announcement Notice
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Inside Dhaka Shipping Fee (৳)</label>
              <input 
                type="number"
                value={defaultInsideDhakaFee}
                onChange={(e) => setDefaultInsideDhakaFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Outside Dhaka Shipping Fee (৳)</label>
              <input 
                type="number"
                value={defaultOutsideDhakaFee}
                onChange={(e) => setDefaultOutsideDhakaFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            {/* 4 Custom Individual Delivery Options */}
            <div className="md:col-span-2 space-y-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <div>
                <h5 className="text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider">
                  🚚 Additional 4 Custom Delivery Options (Individually Configurable)
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure custom shipping methods with individual price tags and toggles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Custom Option 1 */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Delivery Option 1</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customDeliveryOption1Active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setCustomDeliveryOption1Active(val);
                          handleInstantToggle({ customDeliveryOption1Active: val });
                        }}
                        className="w-3.5 h-3.5 rounded text-[#38BDF8]"
                      />
                      <span className="text-[10px] font-extrabold text-slate-300">{customDeliveryOption1Active ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={customDeliveryOption1Name}
                    onChange={(e) => setCustomDeliveryOption1Name(e.target.value)}
                    onBlur={() => handleInstantToggle({ customDeliveryOption1Name })}
                    placeholder="Option Name (e.g. Express Same-Day)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Fee (৳):</span>
                    <input 
                      type="number" 
                      value={customDeliveryOption1Fee}
                      onChange={(e) => setCustomDeliveryOption1Fee(Number(e.target.value))}
                      onBlur={() => handleInstantToggle({ customDeliveryOption1Fee })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Custom Option 2 */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Delivery Option 2</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customDeliveryOption2Active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setCustomDeliveryOption2Active(val);
                          handleInstantToggle({ customDeliveryOption2Active: val });
                        }}
                        className="w-3.5 h-3.5 rounded text-[#38BDF8]"
                      />
                      <span className="text-[10px] font-extrabold text-slate-300">{customDeliveryOption2Active ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={customDeliveryOption2Name}
                    onChange={(e) => setCustomDeliveryOption2Name(e.target.value)}
                    onBlur={() => handleInstantToggle({ customDeliveryOption2Name })}
                    placeholder="Option Name (e.g. Urgent Courier)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Fee (৳):</span>
                    <input 
                      type="number" 
                      value={customDeliveryOption2Fee}
                      onChange={(e) => setCustomDeliveryOption2Fee(Number(e.target.value))}
                      onBlur={() => handleInstantToggle({ customDeliveryOption2Fee })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Custom Option 3 */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Delivery Option 3</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customDeliveryOption3Active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setCustomDeliveryOption3Active(val);
                          handleInstantToggle({ customDeliveryOption3Active: val });
                        }}
                        className="w-3.5 h-3.5 rounded text-[#38BDF8]"
                      />
                      <span className="text-[10px] font-extrabold text-slate-300">{customDeliveryOption3Active ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={customDeliveryOption3Name}
                    onChange={(e) => setCustomDeliveryOption3Name(e.target.value)}
                    onBlur={() => handleInstantToggle({ customDeliveryOption3Name })}
                    placeholder="Option Name (e.g. VIP Hand Delivery)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Fee (৳):</span>
                    <input 
                      type="number" 
                      value={customDeliveryOption3Fee}
                      onChange={(e) => setCustomDeliveryOption3Fee(Number(e.target.value))}
                      onBlur={() => handleInstantToggle({ customDeliveryOption3Fee })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Custom Option 4 */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Delivery Option 4</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customDeliveryOption4Active}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setCustomDeliveryOption4Active(val);
                          handleInstantToggle({ customDeliveryOption4Active: val });
                        }}
                        className="w-3.5 h-3.5 rounded text-[#38BDF8]"
                      />
                      <span className="text-[10px] font-extrabold text-slate-300">{customDeliveryOption4Active ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={customDeliveryOption4Name}
                    onChange={(e) => setCustomDeliveryOption4Name(e.target.value)}
                    onBlur={() => handleInstantToggle({ customDeliveryOption4Name })}
                    placeholder="Option Name (e.g. Redx / Pathao Fast Express)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Fee (৳):</span>
                    <input 
                      type="number" 
                      value={customDeliveryOption4Fee}
                      onChange={(e) => setCustomDeliveryOption4Fee(Number(e.target.value))}
                      onBlur={() => handleInstantToggle({ customDeliveryOption4Fee })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Free Delivery Threshold Offer Box */}
            <div className="md:col-span-2 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    🚚 Free Delivery on Minimum Order
                  </h5>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Enable this offer to automatically grant free shipping (৳0) when customers order above a specific amount.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input 
                    type="checkbox"
                    checked={freeDeliveryThresholdActive}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setFreeDeliveryThresholdActive(val);
                      handleInstantToggle({ freeDeliveryThresholdActive: val });
                    }}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className={`text-xs font-bold ${freeDeliveryThresholdActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {freeDeliveryThresholdActive ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>

              {freeDeliveryThresholdActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-900/60">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Minimum Order Amount for Free Delivery (৳)
                    </label>
                    <input 
                      type="number"
                      min={100}
                      value={freeDeliveryThresholdAmount}
                      onChange={(e) => setFreeDeliveryThresholdAmount(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Offer Announcement Banner Text
                    </label>
                    <input 
                      type="text"
                      value={freeDeliveryNoticeText}
                      onChange={(e) => setFreeDeliveryNoticeText(e.target.value)}
                      placeholder="Free shipping on orders above ৳1,500!"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">Top Announcement Notice Text</label>
              <textarea 
                rows={2}
                value={topBarNotice}
                onChange={(e) => setTopBarNotice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Popular Collections Title</label>
              <input 
                type="text"
                value={popularCollectionsTitle}
                onChange={(e) => setPopularCollectionsTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Popular Collections Subtitle</label>
              <input 
                type="text"
                value={popularCollectionsSubtitle}
                onChange={(e) => setPopularCollectionsSubtitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Announcement & Top Bar Notice Feature */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
            Top Bar Announcement Visibility
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-700">
              <input 
                type="checkbox" 
                checked={isTopBarNoticeActive}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsTopBarNoticeActive(val);
                  handleInstantToggle({ isTopBarNoticeActive: val });
                }}
                className="w-4 h-4 rounded border-slate-700 text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Show Top Bar Notice on Website</span>
            </label>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-700">
            <label className="text-xs font-bold text-slate-300 block">Store Guarantee Cards</label>
            {guarantees.map((g, idx) => (
              <div key={g.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                <input 
                  value={g.title}
                  onChange={(e) => setGuarantees(prev => prev.map((item, i) => i === idx ? {...item, title: e.target.value} : item))}
                  onBlur={() => handleInstantToggle({ guarantees })}
                  className="bg-transparent text-xs text-white outline-none"
                  placeholder="Title"
                />
                <input 
                  value={g.description}
                  onChange={(e) => setGuarantees(prev => prev.map((item, i) => i === idx ? {...item, description: e.target.value} : item))}
                  onBlur={() => handleInstantToggle({ guarantees })}
                  className="bg-transparent text-xs text-white outline-none"
                  placeholder="Description"
                />
                <label className="flex items-center justify-end gap-2 text-xs text-slate-400 cursor-pointer">
                  Active
                  <input 
                    type="checkbox"
                    checked={g.active}
                    onChange={(e) => {
                      const nextActive = e.target.checked;
                      const nextGuarantees = guarantees.map((item, i) => i === idx ? {...item, active: nextActive} : item);
                      setGuarantees(nextGuarantees);
                      handleInstantToggle({ guarantees: nextGuarantees });
                    }}
                    className="w-4 h-4 rounded accent-[#38BDF8]"
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Festival Highlight 2026 Spotlight Banner Customizer */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Festival Highlight Spotlight Customizer
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Spotlight Section Tag / Title</label>
                <input 
                  type="text"
                  value={festivalHighlightTitle}
                  onChange={(e) => setFestivalHighlightTitle(e.target.value)}
                  placeholder="FESTIVAL HIGHLIGHT 2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Spotlight Main Heading</label>
                <input 
                  type="text"
                  value={festivalHighlightSubtitle}
                  onChange={(e) => setFestivalHighlightSubtitle(e.target.value)}
                  placeholder="Puja Special Traditional Fusion Collection"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">Spotlight Paragraph Description</label>
                <textarea 
                  rows={2}
                  value={festivalHighlightDesc}
                  onChange={(e) => setFestivalHighlightDesc(e.target.value)}
                  placeholder="Describe your festival special items here..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">CTA Button Label Text</label>
                <input 
                  type="text"
                  value={festivalHighlightCtaText}
                  onChange={(e) => setFestivalHighlightCtaText(e.target.value)}
                  placeholder="EXPLORE FESTIVAL SPECIAL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Linked Collection/Category (Redirect Destination)</label>
                <select 
                  value={festivalHighlightCategory}
                  onChange={(e) => setFestivalHighlightCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                >
                  <option value="All">All Products</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">Custom Background Banner Image (Upload directly)</label>
                <input 
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerUpload(e.target.files)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBanner ? 'Uploading Banner...' : '📸 Upload Banner from Gallery'}</span>
                  </button>
                  {festivalHighlightImage ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-600 bg-slate-900 shrink-0">
                        <img src={festivalHighlightImage} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFestivalHighlightImage('')}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">No custom image. Falling back to default premium slate gradient background.</span>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-700 max-w-xs mt-3">
              <input 
                type="checkbox"
                checked={isFestivalHighlightActive}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsFestivalHighlightActive(val);
                  handleInstantToggle({ isFestivalHighlightActive: val });
                }}
                className="w-4 h-4 rounded border-slate-700 text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Show Festival Spotlight Banner on Home</span>
            </label>
          </div>

          {/* Dynamic Developed By Credits Setup */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
              Footer Development Credits Setup
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Developer Credit Text</label>
                <input 
                  type="text"
                  value={creditsText}
                  onChange={(e) => setCreditsText(e.target.value)}
                  onBlur={() => handleInstantToggle({ creditsText })}
                  placeholder="Developed by RycreoShop Solutions"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Developer Website URL</label>
                <input 
                  type="text"
                  value={creditsLink}
                  onChange={(e) => setCreditsLink(e.target.value)}
                  onBlur={() => handleInstantToggle({ creditsLink })}
                  placeholder="https://rycreoshop.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Founder & Owner Name</label>
                <input 
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  onBlur={() => handleInstantToggle({ ownerName })}
                  placeholder="Raiyan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Footer Copyright & Attribution Text (Global Storefront Footer)
                </label>
                <input 
                  type="text"
                  value={copyrightText}
                  onChange={(e) => setCopyrightText(e.target.value)}
                  onBlur={() => handleInstantToggle({ copyrightText: copyrightText.trim() || undefined })}
                  placeholder={`© ${new Date().getFullYear()} ${storeName || 'RycreoShop'}. All rights reserved.`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Leave empty to automatically display default copyright notice. Changes persist immediately to Firestore across all visitor sessions.
                </span>
              </div>
            </div>

            {/* Co-Founder & Partner Box */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-extrabold text-[#38BDF8] uppercase tracking-wider">
                    🤝 Co-Founder / Co-Owner / Partner Profile
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Optionally add a co-founder or business partner name to display in the website footer.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input 
                    type="checkbox"
                    checked={isCoFounderActive}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setIsCoFounderActive(val);
                      handleInstantToggle({ isCoFounderActive: val });
                    }}
                    className="w-4 h-4 rounded border-slate-700 text-[#38BDF8] focus:ring-[#38BDF8]"
                  />
                  <span className={`text-xs font-bold ${isCoFounderActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isCoFounderActive ? 'Visible (Show in Footer)' : 'Hidden (Unchecked)'}
                  </span>
                </label>
              </div>

              {isCoFounderActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800 animate-fade-in">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Co-Founder Name</label>
                    <input 
                      type="text"
                      value={coFounderName}
                      onChange={(e) => setCoFounderName(e.target.value)}
                      onBlur={() => handleInstantToggle({ coFounderName })}
                      placeholder="Co-Founder Name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Co-Founder Designation / Title</label>
                    <input 
                      type="text"
                      value={coFounderTitle}
                      onChange={(e) => setCoFounderTitle(e.target.value)}
                      onBlur={() => handleInstantToggle({ coFounderTitle })}
                      placeholder="Co-Founder & Director"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-700 max-w-xs mt-3">
              <input 
                type="checkbox"
                checked={isCreditsActive}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsCreditsActive(val);
                  handleInstantToggle({ isCreditsActive: val });
                }}
                className="w-4 h-4 rounded border-slate-700 text-[#38BDF8] focus:ring-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Show Development Credits in Footer</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset store to factory defaults? This will restore initial catalog products and settings.")) {
                resetToFactoryDefaults();
                alert("Store data reset to factory defaults!");
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Factory Default Store Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE STORE SETTINGS</span>
          </button>
        </div>
      </form>
    </div>
  );
};
