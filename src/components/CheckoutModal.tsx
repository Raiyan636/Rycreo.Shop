import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  Truck, 
  Package,
  CreditCard, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  Sparkles, 
  Copy, 
  Check, 
  Smartphone,
  PartyPopper,
  Upload,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Percent,
  BadgePercent,
  Flame,
  Lock,
  MessageSquare,
  Download,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentGateway, CartItem } from '../types/store';
import { BangladeshGeoData } from '../data/bangladeshGeo';
import emailjs from '@emailjs/browser';
import { downloadOrderMemo } from '../utils/memoGenerator';
import { compressImage } from '../utils/imageCompressor';
import { useToast } from './common/Toast';
import { formatBangladeshDateTime } from '../utils/dateFormatter';
import { resolveStoreAssetUrl } from '../utils/clientAssetResolver';
import { PhoneInput88, isValidBdPhone } from './common/PhoneInput88';
import { getPreOrderQuotaStatus, getVariationStockForSelection } from '../utils/stockHelper';

// 3-Stage Order Completion Delivery Truck Animation
const CompletedOrderTruckAnimation: React.FC = () => {
  const [animStep, setAnimStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // Step 1 -> Step 2 after 1.5s (Courier drops package, truck starts moving)
    const t1 = setTimeout(() => setAnimStep(2), 1500);
    // Step 2 -> Step 3 after 3.5s (Truck drives off, delivery status text banner slides UP from behind)
    const t2 = setTimeout(() => setAnimStep(3), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative py-3 sm:py-3.5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl border border-amber-500/30 text-white p-3.5 sm:p-5 shadow-xl overflow-hidden text-center space-y-2.5 sm:space-y-3">
      
      {/* Confetti Particle Burst Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-2 left-6 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
        <div className="absolute top-8 right-10 w-4 h-4 bg-[#38BDF8] rotate-45 animate-bounce" />
        <div className="absolute bottom-4 left-12 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        <div className="absolute bottom-6 right-8 w-4 h-4 bg-rose-400 rotate-12 animate-spin" />
      </div>

      {/* Main Checkmark Badge */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl ring-4 sm:ring-6 ring-emerald-400/30 animate-bounce relative z-10">
        <CheckCircle className="w-7 h-7 sm:w-9 sm:h-9 text-slate-950 stroke-[2.5]" />
      </div>

      <div className="relative z-10 space-y-0.5 sm:space-y-1">
        <span className="px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
          <PartyPopper className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>🎉 Order Placed Successfully!</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-wide">
          Your Order Has Been Placed Successfully!
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-300 font-medium max-w-md mx-auto">
          We have received your order and will contact you shortly to confirm delivery.
        </p>
      </div>

      {/* ANIMATED TRUCK ROAD CONTAINER */}
      <div className="relative z-10 w-full h-22 sm:h-24 bg-slate-900/90 rounded-xl border border-sky-400/30 overflow-hidden flex items-center justify-center p-2.5 shadow-inner">
        
        {/* Road Track Lines */}
        <div className="absolute bottom-2 left-0 right-0 h-1.5 bg-slate-700 flex justify-between px-3">
          <div className="w-10 h-full bg-amber-400/70 animate-pulse" />
          <div className="w-10 h-full bg-[#38BDF8]/70 animate-pulse" />
          <div className="w-10 h-full bg-emerald-400/70 animate-pulse" />
        </div>

        {/* STEP 1: Courier Person Carrying Box & Dropping into Back of Truck */}
        {animStep === 1 && (
          <div className="relative flex items-end gap-3 animate-fade-in">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-lg">🏃‍♂️</span>
              <div className="w-5 h-5 bg-amber-400 rounded-md text-slate-950 font-black flex items-center justify-center -mt-1 shadow-md">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="flex items-end gap-0.5">
              <div className="w-20 h-12 bg-gradient-to-r from-sky-600 to-indigo-700 rounded-l-xl border-2 border-dashed border-sky-300 flex items-center justify-center relative">
                <span className="text-[9px] font-black text-amber-300 uppercase animate-pulse">Loading...</span>
              </div>
              <div className="w-9 h-9 bg-amber-400 rounded-r-xl border-2 border-amber-300 flex items-center justify-center relative shadow-md">
                <Truck className="w-5 h-5 text-slate-950" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 & 3: Truck Revving Engine & Driving Off Across Screen */}
        {animStep >= 2 && (
          <div 
            className={`relative flex items-center gap-1 transition-all duration-[2000ms] ease-in-out ${
              animStep === 2 ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-[280px] sm:translate-x-[420px] opacity-0 scale-90'
            }`}
          >
            <div className="flex items-end gap-0.5 animate-bounce">
              <div className="w-24 h-14 bg-gradient-to-r from-[#38BDF8] via-sky-600 to-indigo-700 rounded-l-2xl border-2 border-sky-300 flex items-center justify-around px-2 shadow-2xl relative">
                <span className="text-[10px] font-mono font-black text-white tracking-widest uppercase">DELIVERY</span>
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-400 rounded-r-2xl border-2 border-amber-300 flex items-center justify-center relative shadow-lg">
                <Truck className="w-6 h-6 text-slate-950" />
                <div className="absolute -right-3 top-2 w-4 h-4 bg-amber-200 blur-xs rounded-full animate-ping" />
              </div>
            </div>
            <div className="flex gap-1 -ml-2">
              <div className="w-2 h-2 rounded-full bg-slate-400/80 animate-ping" />
              <div className="w-3 h-3 rounded-full bg-slate-500/60 animate-ping delay-100" />
            </div>
          </div>
        )}

      </div>

      {/* STEP 3: Delivery Confirmation Text Banner Sliding UP from behind ("পিছন থেকে লেখাটি উঠবে") */}
      <div 
        className={`relative z-10 transition-all duration-700 ease-out transform ${
          animStep === 3 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/80 p-2.5 sm:p-3 rounded-xl shadow-lg flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Truck className="w-5 h-5 text-slate-950 animate-bounce" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-black text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Order Received Successfully!</span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">
              Your order has been recorded. Our verification team will review your order details and confirm dispatch.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    storeConfig, 
    placeOrder,
    validateCoupon,
    updateCartItem,
    removeCartItemByIndex,
    products,
    directCheckoutItem,
    setDirectCheckoutItem,
    directCheckoutItems,
    setDirectCheckoutItems,
    openVariantModal,
    modificationWindowHours,
    openOrderPolicyModal,
    preOrderProducts,
    buyMoreOffers,
    setSelectedPreOrderProduct,
    setSelectedBuyMoreOffer
  } = useStore();

  const checkoutItems = directCheckoutItems && directCheckoutItems.length > 0
    ? directCheckoutItems 
    : (directCheckoutItem ? [directCheckoutItem] : cart);
  const isDirectCheckout = (directCheckoutItems && directCheckoutItems.length > 0) || !!directCheckoutItem;
  const hasPreOrderItem = useMemo(() => {
    return checkoutItems.some(
      it => it.isPreOrder || it.product?.isPreOrder || it.product?.availability === 'preorder'
    );
  }, [checkoutItems]);
  const preOrderAdvanceTotal = useMemo(() => {
    return checkoutItems.reduce((sum, it) => {
      if (!(it.isPreOrder || it.product?.isPreOrder || it.product?.availability === 'preorder')) {
        return sum;
      }
      const lineTotal = it.price * it.quantity;
      const advType = it.preOrderAdvanceType || it.product?.preOrderAdvanceType || 'fixed';
      const advVal = it.preOrderAdvanceValue ?? it.product?.preOrderAdvanceValue ?? 0;
      if (advVal > 0) {
        return sum + (advType === 'percent'
          ? Math.round((lineTotal * Math.min(100, advVal)) / 100)
          : Math.min(lineTotal, advVal * it.quantity));
      }
      return sum + lineTotal;
    }, 0);
  }, [checkoutItems]);
  const { showToast } = useToast();
  const lockHours = modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24;

  const handleUpdateCheckoutItem = (index: number, updates: Partial<CartItem>) => {
    if (directCheckoutItems && directCheckoutItems.length > 0) {
      setDirectCheckoutItems(prev => {
        const next = prev.map((it, idx) => idx === index ? { ...it, ...updates } : it);
        if (index === 0 && next[0]) {
          setDirectCheckoutItem(next[0]);
        }
        return next;
      });
    } else if (directCheckoutItem) {
      const updated = { ...directCheckoutItem, ...updates };
      setDirectCheckoutItem(updated);
      setDirectCheckoutItems([updated]);
    } else {
      updateCartItem(index, updates);
    }
  };

  const handleRemoveCheckoutItem = (index: number) => {
    if (directCheckoutItems && directCheckoutItems.length > 0) {
      const next = directCheckoutItems.filter((_, idx) => idx !== index);
      setDirectCheckoutItems(next);
      setDirectCheckoutItem(next[0] || null);
      if (next.length === 0) {
        setIsCheckoutOpen(false);
      }
    } else if (directCheckoutItem) {
      setDirectCheckoutItem(null);
      setDirectCheckoutItems([]);
      setIsCheckoutOpen(false);
    } else {
      removeCartItemByIndex(index);
    }
  };

  // Multi-Step State (Step 1: Details & Method, Step 2: Payment Verification for Pay Now)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Initialize EmailJS once on mount
  useEffect(() => {
    try {
      emailjs.init({ publicKey: 'Qi5oXZpEMJkG2utos' });
    } catch (e) {
      console.warn("EmailJS init notice:", e);
    }
  }, []);

  // Lock body scroll and reset state when CheckoutModal opens
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
      setCompletedOrder(null);
      setCurrentStep(1);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  // Customer Contact Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Bangladesh Geography Selection
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [cityRegion, setCityRegion] = useState<string>('Inside Dhaka');

  // Individually Configurable Custom Delivery Options
  const activeCustomDeliveryOptions = useMemo(() => {
    const list: { id: string; name: string; fee: number }[] = [];
    if (storeConfig.customDeliveryOption1Active && storeConfig.customDeliveryOption1Name?.trim()) {
      list.push({ id: 'custom-1', name: storeConfig.customDeliveryOption1Name.trim(), fee: Number(storeConfig.customDeliveryOption1Fee) || 150 });
    }
    if (storeConfig.customDeliveryOption2Active && storeConfig.customDeliveryOption2Name?.trim()) {
      list.push({ id: 'custom-2', name: storeConfig.customDeliveryOption2Name.trim(), fee: Number(storeConfig.customDeliveryOption2Fee) || 180 });
    }
    if (storeConfig.customDeliveryOption3Active && storeConfig.customDeliveryOption3Name?.trim()) {
      list.push({ id: 'custom-3', name: storeConfig.customDeliveryOption3Name.trim(), fee: Number(storeConfig.customDeliveryOption3Fee) || 250 });
    }
    if (storeConfig.customDeliveryOption4Active && storeConfig.customDeliveryOption4Name?.trim()) {
      list.push({ id: 'custom-4', name: storeConfig.customDeliveryOption4Name.trim(), fee: Number(storeConfig.customDeliveryOption4Fee) || 130 });
    }
    return list;
  }, [
    storeConfig.customDeliveryOption1Active,
    storeConfig.customDeliveryOption1Name,
    storeConfig.customDeliveryOption1Fee,
    storeConfig.customDeliveryOption2Active,
    storeConfig.customDeliveryOption2Name,
    storeConfig.customDeliveryOption2Fee,
    storeConfig.customDeliveryOption3Active,
    storeConfig.customDeliveryOption3Name,
    storeConfig.customDeliveryOption3Fee,
    storeConfig.customDeliveryOption4Active,
    storeConfig.customDeliveryOption4Name,
    storeConfig.customDeliveryOption4Fee,
  ]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [isCouponFreeDelivery, setIsCouponFreeDelivery] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Payment Selection: 'cod' | 'security_advance' | 'full_payment'
  const [paymentType, setPaymentType] = useState<'cod' | 'security_advance' | 'full_payment'>('cod');
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState<boolean>(false);
  const paymentMode = paymentType === 'cod' ? 'cod' : 'pay_now';
  
  // Payment Gateways from Config
  const activeGateways = useMemo(() => {
    return (storeConfig.paymentGateways || []).filter(gw => gw.active);
  }, [storeConfig.paymentGateways]);

  const onlineGateways = useMemo(() => {
    return activeGateways.filter(gw => gw.type !== 'cod');
  }, [activeGateways]);

  const [selectedOnlineGatewayId, setSelectedOnlineGatewayId] = useState<string>(() => {
    return onlineGateways[0]?.id || 'bkash';
  });

  // Payment Verification Fields
  const [senderPhone, setSenderPhone] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentReceiptImage, setPaymentReceiptImage] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  
  // Order Completion State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedGatewayNumber, setCopiedGatewayNumber] = useState(false);

  // Region determination logic
  const determineRegion = (division: string, district: string, upazila: string): 'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka' => {
    const divClean = division.toLowerCase();
    const distClean = district.toLowerCase();
    const upClean = upazila.toLowerCase();

    if (!divClean.includes('dhaka')) {
      return 'Outside Dhaka';
    }

    if (distClean.includes('dhaka')) {
      const suburbUpazilas = ['savar', 'keraniganj', 'dhamrai', 'nawabganj', 'dohar', 'ashulia'];
      const isSuburb = suburbUpazilas.some(sub => upClean.includes(sub));
      if (isSuburb) return 'Dhaka Suburbs';
      return 'Inside Dhaka';
    }

    const suburbDistricts = ['gazipur', 'narayanganj', 'manikganj', 'munshiganj', 'narsingdi'];
    const isSuburbDist = suburbDistricts.some(sub => distClean.includes(sub));
    if (isSuburbDist) return 'Dhaka Suburbs';

    return 'Outside Dhaka';
  };

  // Division / District / Upazila lookups
  const currentDivisionObj = useMemo(() => {
    return BangladeshGeoData.divisions.find(d => d.name === selectedDivision);
  }, [selectedDivision]);

  const currentDistricts = useMemo(() => {
    return currentDivisionObj ? currentDivisionObj.districts : [];
  }, [currentDivisionObj]);

  const currentDistrictObj = useMemo(() => {
    return currentDistricts.find(d => d.name === selectedDistrict);
  }, [currentDistricts, selectedDistrict]);

  const currentUpazilas = useMemo(() => {
    return currentDistrictObj ? Array.from(new Set(currentDistrictObj.upazilas)) : [];
  }, [currentDistrictObj]);

  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    const divObj = BangladeshGeoData.divisions.find(d => d.name === divName);
    if (divObj && divObj.districts.length > 0) {
      setSelectedDistrict(divObj.districts[0].name);
    } else {
      setSelectedDistrict('');
    }
    setSelectedUpazila('');
    setCityRegion(divName.includes('Dhaka') ? 'Inside Dhaka' : 'Outside Dhaka');
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    setSelectedUpazila('');
    setCityRegion(determineRegion(selectedDivision, distName, ''));
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingReceipt(true);
      const base64 = await compressImage(file, 800, 0.75);
      setPaymentReceiptImage(base64);
    } catch (err) {
      console.error("Receipt compression failed:", err);
      showToast("Failed to upload screenshot. Please try another image.", "error");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleCopyGatewayNumber = (num: string) => {
    if (!num || num === 'N/A') return;
    // Extract strictly numbers and hyphen/plus, removing any parenthetical text like (bKash Personal)
    const cleanNumber = num
      .replace(/\(.*?\)/g, '')
      .replace(/[^\d+-]/g, '')
      .trim();
    const finalCopy = cleanNumber.length >= 8 ? cleanNumber : num.trim();
    navigator.clipboard.writeText(finalCopy);
    setCopiedGatewayNumber(true);
    setTimeout(() => setCopiedGatewayNumber(false), 2500);
  };

  const handleApplyCoupon = () => {
    setCouponMsg('');
    const res = validateCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedDiscount(res.discount);
      setIsCouponFreeDelivery(!!res.isFreeDelivery);
      setCouponMsg(res.message);
    } else {
      setAppliedDiscount(0);
      setIsCouponFreeDelivery(false);
      setCouponMsg(res.message);
    }
  };

  // Calculations
  const hasFreeShippingItem = useMemo(() => {
    return checkoutItems.some(item => !!item.product.isFreeShipping);
  }, [checkoutItems]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Selected Online Gateway resolution
  const selectedOnlineGateway: PaymentGateway = onlineGateways.find(g => g.id === selectedOnlineGatewayId) || onlineGateways[0] || {
    id: 'bkash',
    name: 'bKash',
    type: 'bkash',
    accountNumber: storeConfig.advanceDeliveryChargeNumber || '01700000000',
    accountType: 'Personal',
    active: true,
    hasDiscount: true,
    discountPercent: 10
  };

  // Find active product-specific rule
  const activeProductAdvanceRule = useMemo(() => {
    if (!storeConfig.productAdvanceRules || storeConfig.productAdvanceRules.length === 0) return null;
    const matched = checkoutItems.map(item => {
      const rule = storeConfig.productAdvanceRules?.find(r => 
        (r.productId && r.productId === item.product.id) || 
        (r.includedProductIds && r.includedProductIds.includes(item.product.id))
      );
      return rule ? { rule, item } : null;
    }).filter(Boolean) as { rule: any; item: any }[];

    if (matched.length === 0) return null;

    // Prioritize 100% full payment, then highest calculated advance amount
    matched.sort((a, b) => {
      if (a.rule.advanceType === 'percent' && a.rule.advanceValue === 100) return -1;
      if (b.rule.advanceType === 'percent' && b.rule.advanceValue === 100) return 1;
      const aVal = a.rule.advanceType === 'percent' ? (a.item.price * a.item.quantity * a.rule.advanceValue / 100) : a.rule.advanceValue;
      const bVal = b.rule.advanceType === 'percent' ? (b.item.price * b.item.quantity * b.rule.advanceValue / 100) : b.rule.advanceValue;
      return bVal - aVal;
    });
    return matched[0].rule;
  }, [checkoutItems, storeConfig.productAdvanceRules]);

  // High-Value Order Threshold Trigger Check
  const isHighValueThresholdTriggered = useMemo(() => {
    return !!(
      storeConfig.advanceMinOrderThresholdActive && 
      subtotal >= (storeConfig.advanceMinOrderThresholdAmount || 2000)
    );
  }, [storeConfig.advanceMinOrderThresholdActive, storeConfig.advanceMinOrderThresholdAmount, subtotal]);

  // Determine if cash on delivery is allowed (disabled whenever any Pre-Order item is present)
  const isCodAllowed = useMemo(() => {
    if (hasPreOrderItem) return false;
    return storeConfig.isCodEnabled !== false;
  }, [storeConfig.isCodEnabled, hasPreOrderItem]);

  // Auto-correct state to ensure selected paymentType is valid & enforce Pre-Order Advance
  useEffect(() => {
    if (hasPreOrderItem) {
      setIsPaymentMethodSelected(true);
      if (preOrderAdvanceTotal >= subtotal && subtotal > 0) {
        setPaymentType('full_payment');
      } else {
        setPaymentType('security_advance');
      }
      return;
    }
    if (!isCodAllowed && paymentType === 'cod') {
      if (activeProductAdvanceRule && activeProductAdvanceRule.advanceType === 'percent' && activeProductAdvanceRule.advanceValue === 100) {
        setPaymentType('full_payment');
      } else {
        setPaymentType('security_advance');
      }
    }
  }, [isCodAllowed, paymentType, activeProductAdvanceRule, hasPreOrderItem, preOrderAdvanceTotal, subtotal]);

  // Comprehensive calculations solver
  const calculations = useMemo(() => {
    let baseDeliveryFee = storeConfig.defaultOutsideDhakaFee;
    const matchedCustom = activeCustomDeliveryOptions.find(opt => opt.name === cityRegion);
    if (matchedCustom) {
      baseDeliveryFee = matchedCustom.fee;
    } else if (cityRegion === 'Inside Dhaka') {
      baseDeliveryFee = storeConfig.defaultInsideDhakaFee;
    } else if (cityRegion === 'Dhaka Suburbs') {
      baseDeliveryFee = storeConfig.defaultSuburbsFee ?? 100;
    } else {
      baseDeliveryFee = storeConfig.defaultOutsideDhakaFee;
    }

    const isThresholdFreeDelivery = !!(storeConfig.freeDeliveryThresholdActive && subtotal >= (storeConfig.freeDeliveryThresholdAmount || 1500));
    const isFreeByCouponOrItem = hasFreeShippingItem || isCouponFreeDelivery || isThresholdFreeDelivery;

    // 1. CASH ON DELIVERY
    const codDiscountPct = 0;
    const codDiscountAmt = appliedDiscount;
    const codDeliveryFee = isFreeByCouponOrItem ? 0 : baseDeliveryFee;
    const codTotal = Math.max(0, subtotal - codDiscountAmt + codDeliveryFee);
    
    let codAdvance = 0;
    if (storeConfig.isCodEnabled && storeConfig.advanceMinOrderThresholdActive) {
      if (subtotal >= (storeConfig.advanceMinOrderThresholdAmount || 2000)) {
        codAdvance = Math.min(codTotal, storeConfig.advanceMinOrderThresholdValue || 100);
      }
    }
    const codDue = Math.max(0, codTotal - codAdvance);

    // 2. PARTIAL / SECURITY ADVANCE
    let partialDiscountPct = 0;
    let partialAdvanceAmt = 0;
    let partialFreeDelivery = false;
    let advancePctDisplay = 0;

    if (hasPreOrderItem && preOrderAdvanceTotal > 0) {
      partialDiscountPct = 0;
      partialFreeDelivery = false;
      partialAdvanceAmt = preOrderAdvanceTotal;
      advancePctDisplay = subtotal > 0 ? Math.min(100, Math.round((preOrderAdvanceTotal / subtotal) * 100)) : 0;
    } else if (activeProductAdvanceRule) {
      partialDiscountPct = activeProductAdvanceRule.discountPercent ?? storeConfig.securityAdvanceDiscountPercent ?? 5;
      partialFreeDelivery = !!activeProductAdvanceRule.freeDelivery || !!storeConfig.securityAdvanceFreeDeliveryActive;
      if (activeProductAdvanceRule.advanceType === 'percent') {
        partialAdvanceAmt = Math.round((subtotal * activeProductAdvanceRule.advanceValue) / 100);
        advancePctDisplay = activeProductAdvanceRule.advanceValue;
      } else {
        partialAdvanceAmt = activeProductAdvanceRule.advanceValue;
      }
    } else if (isHighValueThresholdTriggered) {
      // High-Value Order Rule Triggered (e.g. Orders above ৳2000 require ৳100 advance)
      partialDiscountPct = storeConfig.securityAdvanceDiscountPercent ?? 5;
      partialFreeDelivery = !!storeConfig.securityAdvanceFreeDeliveryActive;
      partialAdvanceAmt = storeConfig.advanceMinOrderThresholdValue || 100;
      advancePctDisplay = 0;
    } else {
      // Global settings
      partialDiscountPct = storeConfig.securityAdvanceDiscountPercent ?? 5;
      partialFreeDelivery = !!storeConfig.securityAdvanceFreeDeliveryActive;
      const isPercentActive = !!storeConfig.advancePercentageActive && storeConfig.securityAdvanceType === 'percent';
      if (isPercentActive) {
        advancePctDisplay = storeConfig.securityAdvanceValue || 10;
        partialAdvanceAmt = Math.round((subtotal * advancePctDisplay) / 100);
      } else {
        partialAdvanceAmt = storeConfig.securityAdvanceValue || 100;
      }
    }

    const partialDiscountAmt = Math.round((subtotal * partialDiscountPct) / 100) + appliedDiscount;
    const partialDelFee = (isFreeByCouponOrItem || partialFreeDelivery) ? 0 : baseDeliveryFee;
    const partialTotal = Math.max(0, subtotal - partialDiscountAmt + partialDelFee);
    const partialAdvance = Math.min(partialTotal, partialAdvanceAmt);
    const partialDue = Math.max(0, partialTotal - partialAdvance);

    // 3. FULL ADVANCE
    const fullPaymentBaseDiscountPct = hasPreOrderItem ? 0 : (storeConfig.fullPaymentDiscountPercent ?? 20);
    const fullGatewayDiscountPct = hasPreOrderItem
      ? 0
      : ((selectedOnlineGateway.hasDiscount !== false)
          ? (selectedOnlineGateway.discountPercent ?? selectedOnlineGateway.prepaymentDiscountPercent ?? storeConfig.prepaymentDiscountPercent ?? 10)
          : 0);
    const fullDiscountPct = fullPaymentBaseDiscountPct + fullGatewayDiscountPct;
    const fullDiscountAmt = Math.round((subtotal * fullDiscountPct) / 100) + appliedDiscount;
    const fullFreeDelivery = !!storeConfig.prepaymentFreeDeliveryActive;
    const fullDelFee = (isFreeByCouponOrItem || fullFreeDelivery) ? 0 : baseDeliveryFee;
    const fullTotal = Math.max(0, subtotal - fullDiscountAmt + fullDelFee);
    const fullAdvance = fullTotal;
    const fullDue = 0;

    return {
      cod: {
        advance: codAdvance,
        due: codDue,
        total: codTotal,
        discountPct: codDiscountPct,
        discountAmt: codDiscountAmt,
        deliveryFee: codDeliveryFee,
        percentageDisplay: 0,
        originalDeliveryFee: baseDeliveryFee,
        isFreeDelivery: isFreeByCouponOrItem
      },
      partial: {
        advance: partialAdvance,
        due: partialDue,
        total: partialTotal,
        discountPct: partialDiscountPct,
        discountAmt: partialDiscountAmt,
        deliveryFee: partialDelFee,
        percentageDisplay: advancePctDisplay,
        originalDeliveryFee: baseDeliveryFee,
        isFreeDelivery: isFreeByCouponOrItem || partialFreeDelivery
      },
      full: {
        advance: fullAdvance,
        due: fullDue,
        total: fullTotal,
        discountPct: fullDiscountPct,
        discountAmt: fullDiscountAmt,
        deliveryFee: fullDelFee,
        percentageDisplay: 100,
        originalDeliveryFee: baseDeliveryFee,
        isFreeDelivery: isFreeByCouponOrItem || fullFreeDelivery
      }
    };
  }, [subtotal, cityRegion, storeConfig, activeProductAdvanceRule, appliedDiscount, hasFreeShippingItem, isCouponFreeDelivery, selectedOnlineGateway, hasPreOrderItem, preOrderAdvanceTotal]);

  const currentCalc = useMemo(() => {
    if (paymentType === 'full_payment') return calculations.full;
    if (paymentType === 'security_advance') return calculations.partial;
    return calculations.cod;
  }, [paymentType, calculations]);

  const advancePaidAmount = currentCalc.advance;
  const remainingDueAmount = currentCalc.due;
  const totalAmount = currentCalc.total;
  const deliveryFee = currentCalc.deliveryFee;
  const totalDiscountAmount = currentCalc.discountAmt;

  const isAdvancePaymentMode = paymentType === 'security_advance' || paymentType === 'full_payment';

  const totalDiscountPct = currentCalc.discountPct;
  const isFreeDeliveryQualified = currentCalc.isFreeDelivery;
  const freeDeliveryThreshold = storeConfig.freeDeliveryThresholdAmount || 1500;
  const isThresholdFreeDelivery = !!(storeConfig.freeDeliveryThresholdActive && subtotal >= freeDeliveryThreshold);
  const isPrepaymentFreeDeliveryActive = (paymentType === 'full_payment' && !!storeConfig.prepaymentFreeDeliveryActive) || 
                                       (paymentType === 'security_advance' && !!storeConfig.securityAdvanceFreeDeliveryActive);
  const isFixedAdvanceMode = paymentType === 'security_advance' || (paymentType === 'cod' && calculations.cod.advance > 0);

  // Check available stock for any cart item (variation/color/size/pre-order/standalone)
  const getCartItemMaxStock = (item: CartItem): { maxStock: number; label: string; isOutOfStock: boolean } => {
    if (item.isBuyMoreOffer || item.product?.isBuyMoreOffer) {
      return {
        maxStock: 99,
        label: 'Available for Order',
        isOutOfStock: false
      };
    }

    if (item.isPreOrder || item.product?.isPreOrder || item.product?.availability === 'preorder') {
      const livePre = preOrderProducts.find(p => p.id === item.productId);
      if (livePre) {
        const quota = getPreOrderQuotaStatus(livePre);
        const hasVariants = (Array.isArray(livePre.variations) && livePre.variations.length > 0)
          || (Array.isArray(livePre.sizes) && livePre.sizes.length > 0)
          || (Array.isArray(livePre.colors) && livePre.colors.some(c => typeof c !== 'string' && c.stock !== undefined));
        const varCap = hasVariants
          ? getVariationStockForSelection(livePre as any, item.selectedColor, item.selectedSize)
          : quota.remaining;
        const cap = Math.max(0, quota.tracksQuota ? Math.min(quota.remaining, varCap) : varCap);
        return {
          maxStock: cap,
          label: cap <= 0
            ? `Pre-Order Fulfilled — All ${quota.totalQuotaDisplay} pcs Sold!`
            : `Only ${cap} pre-order slot(s) remaining`,
          isOutOfStock: (quota.tracksQuota || hasVariants) ? (cap <= 0 || item.quantity > cap) : false
        };
      }
      const fallbackProd = products.find(p => p.id === item.productId) || item.product;
      const resolved = getVariationStockForSelection(fallbackProd, item.selectedColor, item.selectedSize);
      return {
        maxStock: resolved,
        label: resolved <= 0 ? 'Pre-Order Fulfilled' : `Only ${resolved} pcs remaining`,
        isOutOfStock: resolved <= 0 || item.quantity > resolved
      };
    }

    const liveProd = products.find(p => p.id === item.productId) || item.product;
    const resolvedStock = getVariationStockForSelection(liveProd, item.selectedColor, item.selectedSize);
    return {
      maxStock: resolvedStock,
      label: resolvedStock <= 0 ? 'Out of Stock' : `We have only ${resolvedStock} pcs left in stock`,
      isOutOfStock: resolvedStock <= 0 || item.quantity > resolvedStock
    };
  };

  // Validate Step 1 (Delivery & Contact Details ONLY) before proceeding to Step 2
  const validateStep1 = (): boolean => {
    if (!customerName.trim()) {
      showToast("Please enter your Full Name.", "error");
      return false;
    }
    if (!phone.trim()) {
      setPhoneError(true);
      showToast("Please enter your Phone Number.", "error");
      return false;
    }
    if (!isValidBdPhone(phone)) {
      setPhoneError(true);
      showToast("ফোন নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 0 দিয়ে শুরু হতে হবে! (e.g. 017XXXXXXXX)", "error");
      return false;
    }
    setPhoneError(false);

    if (altPhone.trim() && !isValidBdPhone(altPhone)) {
      showToast("বিকল্প ফোন নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে এবং 0 দিয়ে শুরু হতে হবে! (e.g. 018XXXXXXXX)", "error");
      return false;
    }

    if (!selectedDivision) {
      showToast("Please select your Division (বিভাগ নির্বাচন করুন).", "error");
      return false;
    }
    if (!selectedDistrict) {
      showToast("Please select your District (জেলা নির্বাচন করুন).", "error");
      return false;
    }
    if (!selectedUpazila) {
      showToast("Please select your Upazila / Thana (উপজেলা নির্বাচন করুন).", "error");
      return false;
    }
    if (!address.trim()) {
      showToast("Please enter your complete Delivery Address.", "error");
      return false;
    }
    if (checkoutItems.length === 0) {
      showToast("Your shopping cart is empty.", "error");
      return false;
    }

    // Check stock for all items
    for (let i = 0; i < checkoutItems.length; i++) {
      const item = checkoutItems[i];
      const { maxStock, isOutOfStock } = getCartItemMaxStock(item);
      if (isOutOfStock) {
        showToast(`Out of Stock! Only ${maxStock} pcs of "${item.product.title}" available. Please adjust your order quantity.`, "error");
        return false;
      }
    }

    // Strict Delivery Zone validation (prevent forcing Inside Dhaka for Outside Dhaka addresses)
    const validRequiredRegion = determineRegion(selectedDivision, selectedDistrict, selectedUpazila);
    if (validRequiredRegion === 'Outside Dhaka' && cityRegion !== 'Outside Dhaka') {
      setCityRegion('Outside Dhaka');
      showToast(`Your delivery address (${selectedDistrict}, ${selectedDivision}) is Outside Dhaka. Shipping fee updated to Outside Dhaka (৳${storeConfig.defaultOutsideDhakaFee}).`, 'info');
      return false;
    }
    if (validRequiredRegion === 'Dhaka Suburbs' && cityRegion === 'Inside Dhaka') {
      setCityRegion('Dhaka Suburbs');
      showToast(`Your delivery address is in Dhaka Suburbs. Shipping fee updated to Dhaka Suburbs (৳${storeConfig.defaultSuburbsFee ?? 100}).`, 'info');
      return false;
    }

    return true;
  };

  // Step 1 ONLY moves forward to Step 2 (Payment Method & Confirmation)
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setCurrentStep(2);
  };

  // Step 2: Validate Payment Method + Online Verification & Trigger Order Policy Confirmation
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPaymentMethodSelected) {
      showToast("অনুগ্রহ করে একটি পেমেন্ট মেথড নির্বাচন করুন (Select a Payment Method).", "error");
      return;
    }

    if (paymentType === 'cod') {
      openOrderPolicyModal(async () => {
        await executeOrderSubmission(
          'Cash on Delivery',
          undefined,
          undefined,
          calculations.cod.advance,
          calculations.cod.due
        );
      });
      return;
    }

    if (!senderPhone.trim()) {
      showToast("Please provide the Sender Phone Number used for payment.", "error");
      return;
    }
    if (!isValidBdPhone(senderPhone)) {
      showToast("Sender phone number must be 11 digits starting with 0 (e.g. 017XXXXXXXX).", "error");
      return;
    }
    if (!paymentTrxId.trim()) {
      showToast("Please provide the Transaction ID (TrxID).", "error");
      return;
    }

    const gatewayName = selectedOnlineGateway.name || 'Online Payment';
    const methodTitle = paymentType === 'security_advance'
      ? `Security Advance (${gatewayName})`
      : `Full Payment (${gatewayName})`;
    
    // Open Order Policy & Confirmation Popup with the order execution callback
    openOrderPolicyModal(async () => {
      await executeOrderSubmission(methodTitle, paymentTrxId.trim(), senderPhone.trim(), advancePaidAmount, remainingDueAmount);
    });
  };

  // Common Order Execution Function
  const executeOrderSubmission = async (
    methodName: string,
    trxId?: string,
    senderNum?: string,
    paidAmount: number = 0,
    dueAmt: number = 0
  ) => {
    const createdOrder = await placeOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      address: address.trim(),
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      cityRegion,
      deliveryFee,
      items: checkoutItems,
      subtotal,
      discount: appliedDiscount,
      prepaymentDiscount: totalDiscountAmount,
      couponCode: appliedDiscount > 0 ? couponCode.trim().toUpperCase() : undefined,
      totalAmount,
      advancePaymentAmount: paidAmount,
      dueAmount: dueAmt,
      paymentMethod: methodName,
      paymentTrxId: trxId || undefined,
      senderPhone: senderNum || undefined,
      paymentReceiptImage: paymentReceiptImage || undefined,
      isPaid: paidAmount >= totalAmount,
      paymentStatus: paidAmount >= totalAmount ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid'),
      notes: notes.trim() || undefined
    });

    try {
      setCompletedOrder(createdOrder);
    } catch (e) {
      console.error("Critical error setting completed order:", e);
      showToast('অর্ডারের কনফার্মেশন দেখাতে সমস্যা হচ্ছে, কিন্তু অর্ডারটি সাকসেসফুলি প্লেস হয়েছে।', 'error');
    }


    // EmailJS Dispatch to Store Owner
    const emailServiceId = 'service_1tvp2rk';
    const emailTemplateId = 'Template_0vqd26h';
    const emailPublicKey = 'Qi5oXZpEMJkG2utos';

    const itemsListText = checkoutItems.map(it => 
      `${it.product.title} (Size: ${it.selectedSize || 'N/A'}, Color: ${it.selectedColor || 'N/A'}) x ${it.quantity} = ৳${it.price * it.quantity}`
    ).join('\n');

    const formattedOrderTime = formatBangladeshDateTime(createdOrder.createdAt);

    const templateParams = {
      order_id: createdOrder.orderNumber,
      order_date: formattedOrderTime,
      full_name: customerName.trim(),
      phone_number: phone.trim(),
      alt_phone: altPhone.trim() || 'N/A',
      location: `${selectedDivision}, ${selectedDistrict}, ${selectedUpazila}`,
      full_address: address.trim(),
      delivery_zone: cityRegion,
      coupon_code: appliedDiscount > 0 ? couponCode.trim().toUpperCase() : 'None',
      order_notes: notes.trim() || 'None',
      product_name: checkoutItems.map(it => it.product.title).join(', '),
      color_variant: checkoutItems.map(it => it.selectedColor || 'N/A').join(', '),
      size_variant: checkoutItems.map(it => it.selectedSize || 'N/A').join(', '),
      quantity: checkoutItems.reduce((s, i) => s + i.quantity, 0),
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total_bill: totalAmount,
      payment_method: methodName,
      security_discount: appliedDiscount,
      pay_now_amount: paidAmount,
      due_on_delivery: dueAmt,
      sender_phone: senderNum || 'N/A',
      trx_id: trxId || 'N/A',
      receipt_attached: paymentReceiptImage ? 'Uploaded' : 'Not Provided'
    };

    // Pure JavaScript EmailJS SDK Dispatch (Client-Side, zero form reload)
    try {
      emailjs.send(emailServiceId, 'template_0vqd26h', templateParams, { publicKey: emailPublicKey })
        .then(
          (response: any) => {
            console.log('✅ EmailJS Order Email Sent Successfully!', response.status, response.text);
            showToast('অর্ডার সফলভাবে সম্পন্ন হয়েছে! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।', 'success');
          },
          (error: any) => {
            console.warn('Primary template_0vqd26h attempt notice:', error);
            // Fallback attempt with capital T Template_0vqd26h
            emailjs.send(emailServiceId, 'Template_0vqd26h', templateParams, { publicKey: emailPublicKey })
              .then(
                (fallbackRes: any) => {
                  console.log('✅ EmailJS Fallback Order Email Sent Successfully!', fallbackRes.status);
                  showToast('অর্ডার সফলভাবে সম্পন্ন হয়েছে! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।', 'success');
                },
                (fallbackErr: any) => {
                  console.warn('EmailJS delivery notice:', fallbackErr);
                }
              );
          }
        )
        .catch((err: any) => {
          console.warn('EmailJS error:', err);
        });
    } catch (e) {
      console.warn('EmailJS dispatch warning:', e);
    }
  };

  const handleCopyOrderId = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderNumber);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 3000);
  };

  if (!isCheckoutOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[180] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-start justify-center p-0 sm:p-3 sm:pt-4 md:pt-6 animate-fade-in"
      onClick={() => {
        setIsCheckoutOpen(false);
        setCompletedOrder(null);
        setCurrentStep(1);
        setDirectCheckoutItem(null);
        setDirectCheckoutItems([]);
      }}
    >
      <div 
        className="bg-white w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-2.5rem)] rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-slate-200 relative flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header with Back & Close Buttons */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            {/* Prominent Back Button */}
            {!completedOrder && (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 2) {
                    setCurrentStep(1);
                  } else if (isDirectCheckout && checkoutItems.length > 0) {
                    const firstItem = checkoutItems[0];
                    setIsCheckoutOpen(false);
                    if (firstItem.isPreOrder || firstItem.product?.isPreOrder) {
                      const matchedPre = preOrderProducts.find(p => p.id === firstItem.productId);
                      if (matchedPre) {
                        setSelectedPreOrderProduct(matchedPre);
                        return;
                      }
                    }
                    if (firstItem.isBuyMoreOffer || firstItem.product?.isBuyMoreOffer) {
                      const rawOfferId = firstItem.productId.replace(/^offer-/, '');
                      const matchedOffer = buyMoreOffers.find(o => o.id === rawOfferId);
                      if (matchedOffer) {
                        setSelectedBuyMoreOffer(matchedOffer);
                        return;
                      }
                    }
                    openVariantModal(firstItem.product);
                  } else {
                    setIsCheckoutOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer text-xs font-black shadow-2xs"
                title={currentStep === 2 ? "Back to Step 1" : (isDirectCheckout ? "Back to Variant Selection" : "Back to Store")}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentStep === 2 ? 'Back' : (isDirectCheckout ? 'Back to Variants' : 'Back')}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                {completedOrder ? 'Order Confirmed' : (currentStep === 1 ? 'Direct Checkout' : 'Payment Method & Confirm')}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setCompletedOrder(null);
              setCurrentStep(1);
              setDirectCheckoutItem(null);
              setDirectCheckoutItems([]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

        {/* Scrollable Content Body (Starts directly at top, fully scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3.5 sm:px-6 sm:py-4 overscroll-contain">
          {/* ======================================================== */}
          {/* CASE 1: Successful Order Confirmation Screen */}
          {/* ======================================================== */}
          {completedOrder ? (
            <div className="space-y-3 sm:space-y-3.5 text-center animate-fade-in pb-3">
            
            {/* 3-Stage Animated Delivery Truck Scene */}
            <CompletedOrderTruckAnimation />

            {/* Helpful Security Notice for Order ID & Memo */}
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-950 p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-bold max-w-md mx-auto space-y-1.5 shadow-xs text-left">
              <p className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>অর্ডার নিরাপত্তা ও সতর্কতা নোটিশ:</span>
              </p>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-black">
                নিরাপত্তার স্বার্থে এবং পরবর্তীতে আপনার অর্ডার ট্র্যাক বা ক্যানসেল করার জন্য অবশ্যই অর্ডার আইডি (Order ID) এবং ফোন নম্বরটি কপি বা মনে রাখুন।
              </p>
            </div>

            {/* Order ID Copy Box */}
            <div className="bg-slate-900 text-white p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 max-w-md mx-auto text-xs">
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400">Order ID:</p>
                <p className="text-base sm:text-lg font-black text-[#38BDF8] font-mono">{completedOrder.orderNumber}</p>
              </div>
              <button
                onClick={handleCopyOrderId}
                className="px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedOrderId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Modification Window Notice */}
            <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-left space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚡ {lockHours}-Hour Order Modification Window Active</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                You have <strong>{lockHours} hours</strong> from now to change delivery address, contact phone, cancel order, or add extra products through <strong>Track My Order</strong> with a single delivery charge.
              </p>
            </div>

            {/* Order Summary Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-3.5 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-600">Customer Name:</span>
                <span className="text-slate-900 font-bold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-600">Phone Number:</span>
                <span className="text-slate-900 font-mono font-bold">{completedOrder.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-600">Delivery Address:</span>
                <span className="text-slate-900 font-medium text-right max-w-[220px] sm:max-w-xs">
                  {completedOrder.address}, {completedOrder.upazila}, {completedOrder.district}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-600">Payment Method:</span>
                <span className="text-slate-900 font-bold">{completedOrder.paymentMethod}</span>
              </div>
              {completedOrder.paymentTrxId && (
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-600">Transaction ID (TrxID):</span>
                  <span className="text-indigo-600 font-mono font-bold">{completedOrder.paymentTrxId}</span>
                </div>
              )}
              {completedOrder.senderPhone && (
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-600">Sender Phone:</span>
                  <span className="text-indigo-600 font-mono font-bold">{completedOrder.senderPhone}</span>
                </div>
              )}

              {/* Billing Summary on Success */}
              <div className="border-t border-slate-200 pt-2 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Total Order Bill:</span>
                  <span className="font-mono text-slate-900 font-extrabold">৳{completedOrder.totalAmount}</span>
                </div>

                {(completedOrder.advancePaymentAmount ?? 0) > 0 && (
                  <div className="flex justify-between font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    <span>{completedOrder.dueAmount && completedOrder.dueAmount > 0 ? 'Advance Paid:' : 'Paid Online:'}</span>
                    <span className="font-mono font-black">৳{completedOrder.advancePaymentAmount}</span>
                  </div>
                )}

                <div className="flex justify-between font-black text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-300 text-xs sm:text-sm">
                  <span>{completedOrder.dueAmount && completedOrder.dueAmount > 0 ? 'Payable Due on Delivery (COD Due):' : 'Payment Status:'}</span>
                  <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                    {completedOrder.dueAmount && completedOrder.dueAmount > 0 ? `৳${completedOrder.dueAmount}` : '100% Paid in Full'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => downloadOrderMemo(completedOrder, storeConfig)}
                className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Cash Memo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCompletedOrder(null);
                  setCurrentStep(1);
                  setDirectCheckoutItem(null);
                  setDirectCheckoutItems([]);
                }}
                className="w-full py-3 sm:py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs sm:text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-lg"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: Multi-Step Checkout Form */
          /* ======================================================== */
          <div className="space-y-4 sm:space-y-5">
            {/* Header with Step Progress Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-[#0284C7] tracking-widest block">
                  RycreoShop Direct Checkout
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Step {currentStep} of 2
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#0284C7]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep === 2 ? 'bg-[#0284C7]' : 'bg-slate-200'}`} />
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-900 font-['Outfit']">
                {currentStep === 1 ? 'Delivery & Order Details' : 'Complete Payment & Confirm'}
              </h2>
            </div>

            {/* ---------------------------------------------------- */}
            {/* STEP 1: Delivery Details, Item Memo & Method Selection */}
            {/* ---------------------------------------------------- */}
            {currentStep === 1 && (
              <form onSubmit={handleStep1Continue} className="space-y-4 sm:space-y-5">
                {/* Customer Contact Details */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      name="name"
                      autoComplete="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0284C7] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <PhoneInput88
                        id="checkout-phone"
                        name="phone"
                        required
                        value={phone}
                        onChange={(val) => {
                          setPhone(val);
                          if (phoneError && isValidBdPhone(val)) setPhoneError(false);
                        }}
                        error={phoneError ? '১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)' : undefined}
                        placeholder="017XXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">
                        Alternative Phone (Optional)
                      </label>
                      <PhoneInput88
                        id="checkout-alt-phone"
                        name="altPhone"
                        value={altPhone}
                        onChange={setAltPhone}
                        placeholder="018XXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Bangladesh Divisions, Districts, Upazilas Cascading Selection */}
                  <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-300 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                      <span>Select Location (Division, District & Upazila):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                       {/* Division */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">Division *</label>
                        <select
                          value={selectedDivision}
                          onChange={(e) => handleDivisionChange(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 sm:py-2 font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                        >
                          <option value="">-- Select Here (বিভাগ নির্বাচন করুন) --</option>
                          {BangladeshGeoData.divisions.map((div) => (
                            <option key={div.name} value={div.name}>
                              {div.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* District */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">District *</label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 sm:py-2 font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                        >
                          <option value="">-- Select Here (জেলা নির্বাচন করুন) --</option>
                          {currentDistricts.map((dist) => (
                            <option key={dist.name} value={dist.name}>
                              {dist.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Upazila */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">Upazila / Thana *</label>
                        <select
                          value={selectedUpazila}
                          required
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedUpazila(val);
                            if (val) {
                              setCityRegion(determineRegion(selectedDivision, selectedDistrict, val));
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 sm:py-2 font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                        >
                          <option value="">-- Select Here (উপজেলা নির্বাচন করুন) --</option>
                          {currentUpazilas.map((up, idx) => (
                            <option key={`${up}-${idx}`} value={up}>
                              {up}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1">
                      Complete Delivery Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      required
                      name="address"
                      autoComplete="street-address"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Road No, Area / Village name"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 sm:py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0284C7] focus:bg-white"
                    />
                  </div>

                  {/* Delivery Zone Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-900 block mb-1 flex items-center justify-between">
                      <span>Delivery Zone:</span>
                      {determineRegion(selectedDivision, selectedDistrict, selectedUpazila) === 'Outside Dhaka' && (
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          📍 Outside Dhaka Area
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const validRegion = determineRegion(selectedDivision, selectedDistrict, selectedUpazila);
                          if (validRegion === 'Outside Dhaka') {
                            showToast(`Your selected address (${selectedDistrict}, ${selectedDivision}) is Outside Dhaka. Outside Dhaka shipping (৳${storeConfig.defaultOutsideDhakaFee}) applies.`, 'info');
                            setCityRegion('Outside Dhaka');
                          } else if (validRegion === 'Dhaka Suburbs') {
                            showToast(`Your selected address (${selectedUpazila}, ${selectedDistrict}) is in Dhaka Suburbs. Dhaka Suburbs shipping (৳${storeConfig.defaultSuburbsFee ?? 100}) applies.`, 'info');
                            setCityRegion('Dhaka Suburbs');
                          } else {
                            setCityRegion('Inside Dhaka');
                          }
                        }}
                        className={`py-2 px-1.5 sm:px-2 rounded-xl border text-[10px] sm:text-[11px] font-black tracking-tight transition-all cursor-pointer text-center ${
                          cityRegion === 'Inside Dhaka'
                            ? 'bg-[#1E293B] text-white border-slate-900 shadow-md ring-2 ring-sky-400'
                            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        Inside Dhaka (৳{storeConfig.defaultInsideDhakaFee})
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const validRegion = determineRegion(selectedDivision, selectedDistrict, selectedUpazila);
                          if (validRegion === 'Outside Dhaka') {
                            showToast(`Your selected address (${selectedDistrict}, ${selectedDivision}) is Outside Dhaka. Outside Dhaka shipping (৳${storeConfig.defaultOutsideDhakaFee}) applies.`, 'info');
                            setCityRegion('Outside Dhaka');
                          } else {
                            setCityRegion('Dhaka Suburbs');
                          }
                        }}
                        className={`py-2 px-1.5 sm:px-2 rounded-xl border text-[10px] sm:text-[11px] font-black tracking-tight transition-all cursor-pointer text-center ${
                          cityRegion === 'Dhaka Suburbs'
                            ? 'bg-[#1E293B] text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        Dhaka Suburbs (৳{storeConfig.defaultSuburbsFee ?? 100})
                      </button>

                      <button
                        type="button"
                        onClick={() => setCityRegion('Outside Dhaka')}
                        className={`py-2 px-1.5 sm:px-2 rounded-xl border text-[10px] sm:text-[11px] font-black tracking-tight transition-all cursor-pointer text-center ${
                          cityRegion === 'Outside Dhaka'
                            ? 'bg-[#1E293B] text-white border-slate-900 shadow-md ring-2 ring-indigo-400'
                            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        Outside Dhaka (৳{storeConfig.defaultOutsideDhakaFee})
                      </button>
                    </div>

                    {/* Individually Configurable Custom Delivery Options */}
                    {activeCustomDeliveryOptions.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-200 space-y-1.5 mt-2">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                          🚀 Additional Custom Delivery Options:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeCustomDeliveryOptions.map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCityRegion(opt.name)}
                              className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-between text-left ${
                                cityRegion === opt.name
                                  ? 'bg-[#1E293B] text-white border-slate-900 shadow-md ring-2 ring-[#0284C7]'
                                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate pr-2">{opt.name}</span>
                              <span className={`font-mono shrink-0 ${cityRegion === opt.name ? 'text-[#38BDF8]' : 'text-slate-600'}`}>৳{opt.fee}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coupon / Voucher input */}
                  {(storeConfig.isVouchersActive !== false) && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text" 
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Coupon Code"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 sm:py-2 text-xs font-mono font-bold uppercase outline-none focus:border-[#0284C7]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-3.5 py-1.5 sm:py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {couponMsg && (
                        <p className={`text-[10px] sm:text-[11px] font-bold mt-1 ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {couponMsg}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Order Note Field - Redesigned for high visibility */}
                  <div className="mt-3 p-3.5 bg-sky-50/70 border-2 border-sky-200 rounded-2xl space-y-1.5 shadow-2xs">
                    <label className="text-xs font-extrabold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sky-900">
                        <MessageSquare className="w-4 h-4 text-sky-600" />
                        <span>Order Notes / Delivery Instructions</span>
                      </span>
                      <span className="text-[10px] text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full uppercase">Optional</span>
                    </label>
                    <textarea 
                      rows={2.5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write any special delivery notes here (e.g., please call before delivery, fragile item)..."
                      className="w-full bg-white border border-sky-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Professional Order Memo / Cash Memo */}
                <div className="bg-white rounded-2xl p-3.5 sm:p-5 border-2 border-dashed border-slate-200 space-y-3 shadow-xs text-xs text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      📝 Order Memo & Cash Memo
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {checkoutItems.reduce((s, i) => s + i.quantity, 0)} Items
                    </span>
                  </div>

                  {/* Cart / Direct Checkout Items List (Displays all independent variants cleanly) */}
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 space-y-2">
                    {checkoutItems.map((item, idx) => {
                      const itemSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                      const rawColors = Array.isArray(item.product?.colors) ? item.product.colors : [];
                      const availableColors = rawColors
                        .map((c: any) => typeof c === 'string' ? { name: c.trim(), hex: '#1E293B', enabled: true } : c)
                        .filter((c: any) => Boolean(c?.name) && c?.enabled !== false && item.product?.hasColorVariants !== false);

                      const rawSizes = Array.isArray(item.product?.sizes) ? item.product.sizes : [];
                      const availableSizes = rawSizes
                        .map((s: any) => typeof s === 'string' ? { size: s.trim(), stock: 99 } : s)
                        .filter((s: any) => {
                          const label = (s?.size || '').trim();
                          return Boolean(label) && label.toLowerCase() !== 'standard' && label.toLowerCase() !== 'standard / free size';
                        });

                      const fallbackImg = item.product?.images?.[0] || '';
                      const matchedColorObj = item.selectedColor
                        ? availableColors.find((c: any) => c.name?.toLowerCase() === item.selectedColor?.toLowerCase())
                        : undefined;
                      const activeImage = matchedColorObj?.image || matchedColorObj?.gallery?.[0] || fallbackImg;

                      const resolveUpdatedVariant = (nextColor?: string, nextSize?: string): Partial<CartItem> => {
                        const vars = item.product?.variations || [];
                        if (vars.length > 0) {
                          const foundVar = vars.find(v => {
                            const vc = v.combination?.['Color'] || v.combination?.['Colour'] || v.combination?.['color'];
                            const vs = v.combination?.['Size'] || v.combination?.['Waist Size'] || v.combination?.['size'];
                            const colOk = !nextColor || !vc || vc === nextColor;
                            const szOk = !nextSize || !vs || vs === nextSize;
                            return colOk && szOk;
                          });
                          if (foundVar) {
                            const varPrice = Number(foundVar.salePrice) > 0 ? Number(foundVar.salePrice) : Number(foundVar.price);
                            return {
                              selectedColor: nextColor,
                              selectedSize: nextSize,
                              selectedVariation: foundVar,
                              ...(varPrice > 0 ? { price: varPrice } : {})
                            };
                          }
                        }
                        return { selectedColor: nextColor, selectedSize: nextSize };
                      };

                      return (
                        <div key={`${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img 
                              src={resolveStoreAssetUrl(activeImage)} 
                              alt={item.product?.title || 'Product'} 
                              className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-white" 
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold text-slate-800 text-xs line-clamp-1">{item.product?.title || 'Item'}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-bold text-[#0284C7] font-mono">
                                  ৳{Number(item.price || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/ unit</span>
                                </span>
                                {item.selectedColor && (
                                  <span className="bg-slate-200 text-slate-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                    Color: {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedSize && (
                                  <span className="bg-slate-200 text-slate-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                              </div>

                              {/* Live Color & Size Selectors inside Checkout Memo if user wants to swap variant */}
                              {(availableColors.length > 0 || availableSizes.length > 0) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {availableColors.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-slate-500">Color:</span>
                                      <select
                                        value={item.selectedColor || availableColors[0]?.name}
                                        onChange={(e) => handleUpdateCheckoutItem(idx, resolveUpdatedVariant(e.target.value, item.selectedSize))}
                                        className="bg-white border border-slate-300 text-slate-900 text-[10px] font-extrabold rounded-md px-1.5 py-0.5 outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                                      >
                                        {availableColors.map((col: any, cIdx: number) => (
                                          <option key={cIdx} value={col.name}>
                                            {col.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {availableSizes.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-slate-500">Size:</span>
                                      <select
                                        value={item.selectedSize || availableSizes[0]?.size}
                                        onChange={(e) => handleUpdateCheckoutItem(idx, resolveUpdatedVariant(item.selectedColor, e.target.value))}
                                        className="bg-white border border-slate-300 text-slate-900 text-[10px] font-extrabold rounded-md px-1.5 py-0.5 outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                                      >
                                        {availableSizes.map((sz: any, sIdx: number) => (
                                          <option key={sIdx} value={sz.size} disabled={sz.stock === 0}>
                                            {sz.size} {sz.stock === 0 ? '(Out of stock)' : ''}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Stock warning status inside checkout item card */}
                              {(() => {
                                const { maxStock, isOutOfStock } = getCartItemMaxStock(item);
                                if (isOutOfStock) {
                                  return (
                                    <div className="text-rose-600 font-extrabold text-[10px] sm:text-[11px] mt-1.5 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 inline-block">
                                      ⚠️ Out of Stock! We have only {maxStock} pcs left.
                                    </div>
                                  );
                                } else if (maxStock <= 5) {
                                  return (
                                    <div className="text-amber-600 font-extrabold text-[10px] sm:text-[11px] mt-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 inline-block">
                                      ⚠️ Only {maxStock} pcs left in stock.
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>

                          {/* Quantity Stepper & Line Subtotal */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    handleUpdateCheckoutItem(idx, { quantity: item.quantity - 1 });
                                  } else {
                                    handleRemoveCheckoutItem(idx);
                                  }
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Reduce quantity"
                              >
                                {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3 h-3" />}
                              </button>
                              
                              <span className="w-7 text-center font-black font-mono text-xs text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  const { maxStock } = getCartItemMaxStock(item);
                                  if (item.quantity >= maxStock) {
                                    showToast(`Stock limit reached! Maximum ${maxStock} pcs available for this variant.`, "error");
                                    return;
                                  }
                                  handleUpdateCheckoutItem(idx, { quantity: item.quantity + 1 });
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded bg-[#38BDF8] text-slate-950 hover:bg-sky-400 font-black transition-colors cursor-pointer"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div className="font-black text-slate-900 font-mono text-right text-xs min-w-[55px]">
                                ৳{itemSubtotal}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCheckoutItem(idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Invoice Calculations */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100 font-bold text-slate-700 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-900">৳{subtotal}</span>
                    </div>
                    
                    <div className="flex justify-between items-start border-b border-slate-100 pb-1.5 pt-0.5">
                      <span>Delivery Fee:</span>
                      {deliveryFee === 0 ? (
                        <div className="text-right">
                          <span className="font-mono text-slate-400 line-through text-[10px] block">৳{currentCalc.originalDeliveryFee || 120}</span>
                          <span className="text-emerald-700 font-extrabold text-[10px] uppercase bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 inline-block mt-0.5">
                            FREE DELIVERY — Save ৳{currentCalc.originalDeliveryFee || 120}!
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono text-slate-900 font-black">+৳{deliveryFee}</span>
                      )}
                    </div>

                    {/* Free Delivery Notices */}
                    {isFreeDeliveryQualified ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {isPrepaymentFreeDeliveryActive
                            ? '🎉 Prepayment Special: Delivery Fee is 100% FREE (৳0) with Pay Now!'
                            : isCouponFreeDelivery 
                              ? '🎉 Coupon Applied: Free Delivery (৳0)!' 
                              : isThresholdFreeDelivery 
                                ? `🎉 Special Offer: Free Delivery on orders over ৳${freeDeliveryThreshold}!`
                                : '🎉 Free Delivery Applied!'}
                        </span>
                      </div>
                    ) : storeConfig.freeDeliveryThresholdActive && subtotal < freeDeliveryThreshold ? (
                      <div className="p-2 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-[11px] font-medium flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>
                          Add <span className="font-bold text-sky-950 font-mono">৳{freeDeliveryThreshold - subtotal}</span> more to unlock Free Delivery!
                        </span>
                      </div>
                    ) : null}

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-rose-600 font-extrabold">
                        <span>Coupon Discount:</span>
                        <span className="font-mono">-৳{appliedDiscount}</span>
                      </div>
                    )}

                    {totalDiscountAmount - appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-extrabold">
                        <span>
                          {paymentType === 'security_advance' 
                            ? `${storeConfig.securityAdvanceLabel || 'Security Advance'} Discount`
                            : 'Full Payment Discount'
                          } ({totalDiscountPct}%):
                        </span>
                        <span className="font-mono">-৳{totalDiscountAmount - appliedDiscount}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-xs sm:text-sm">
                      <span>Total Order Bill:</span>
                      <span className="font-mono text-slate-900 text-sm sm:text-base">৳{totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Step 1 Summary & Clean Continue Button ONLY (Payment Options Moved Exclusively to Step 2) */}
                <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl border border-slate-800 mt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Estimated Order Total:
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black text-[#38BDF8] font-mono">
                        ৳{calculations.cod.total}
                      </span>
                      <span className="text-[11px] text-slate-300 font-semibold">
                        (Incl. Delivery Fee)
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Payment Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ---------------------------------------------------- */}
            {/* STEP 2: Payment Method Selection, Breakdown & Confirmation */}
            {/* ---------------------------------------------------- */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4 sm:space-y-5 animate-fade-in">
                {/* Back to Step 1 Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-extrabold text-[#0284C7] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Delivery Details & Address</span>
                </button>

                {/* Payment Method Selection Options */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      Choose Payment Method:
                    </label>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                      Select Pay on Delivery or Pay Now (bKash / Nagad / Rocket) to confirm your order.
                    </p>
                  </div>

                  {/* Pre-Order Required Advance Payment Notice Banner */}
                  {hasPreOrderItem && (
                    <div className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-2 border-blue-300 rounded-2xl text-[11px] sm:text-xs text-blue-950 font-semibold space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2 font-black text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Pre-Order Advance Payment Required</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">
                          COD Disabled
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        This order contains Pre-Order item(s). Cash on Delivery (0% advance) is unavailable — please pay the required advance of{' '}
                        <strong className="font-mono font-black text-blue-700">৳{advancePaidAmount.toLocaleString()}</strong> now via mobile banking, and pay the remaining{' '}
                        <strong className="font-mono font-black text-slate-900">৳{remainingDueAmount.toLocaleString()}</strong> on delivery.
                      </p>
                    </div>
                  )}

                  {/* Active Product Specific Rule Warning Badge */}
                  {activeProductAdvanceRule && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] sm:text-xs text-indigo-900 font-medium space-y-1 animate-pulse">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Product Specific Payment Policy Active</span>
                      </div>
                      <p>
                        Your cart contains <span className="font-extrabold">{activeProductAdvanceRule.productTitle || 'a specialty product'}</span> which requires a custom advance payment of{' '}
                        <span className="font-black text-indigo-900">
                          {activeProductAdvanceRule.advanceType === 'percent' ? `${activeProductAdvanceRule.advanceValue}%` : `৳${activeProductAdvanceRule.advanceValue}`}
                        </span>{' '}
                        to confirm your shipment. Pure Cash on Delivery (0% advance) is currently unavailable.
                      </p>
                    </div>
                  )}

                  {/* High-Value Order Security Policy Banner */}
                  {isHighValueThresholdTriggered && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border-2 border-amber-300/80 flex items-start gap-3 shadow-xs animate-fade-in">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <ShieldAlert className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                            High-Value Order Security Policy
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                            ৳{storeConfig.advanceMinOrderThresholdAmount || 2000}+ Order
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-bold leading-relaxed">
                          For high-value orders over <strong className="text-amber-900 font-black font-mono">৳{storeConfig.advanceMinOrderThresholdAmount || 2000}</strong>, a small security deposit of <strong className="text-amber-900 font-black font-mono">৳{storeConfig.advanceMinOrderThresholdValue || 100}</strong> is required to confirm parcel handover.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3 Payment Options */}
                  <div className="space-y-2.5">
                    {isCodAllowed && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentType('cod');
                          setIsPaymentMethodSelected(true);
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                          isPaymentMethodSelected && paymentType === 'cod'
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPaymentMethodSelected && paymentType === 'cod' ? 'bg-indigo-600/10' : 'bg-slate-100'}`}>
                            <Truck className={`w-4 h-4 ${isPaymentMethodSelected && paymentType === 'cod' ? 'text-indigo-600' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Pay on Delivery (Cash on Delivery)</span>
                            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                              {calculations.cod.advance > 0
                                ? `Advance Confirmation: ৳${calculations.cod.advance} • Remaining ৳${calculations.cod.due} payable on delivery`
                                : 'Advance: ৳0 • Pay 100% on courier arrival'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isPaymentMethodSelected && paymentType === 'cod' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                          {isPaymentMethodSelected && paymentType === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    )}

                    {(storeConfig.securityAdvanceActive !== false || activeProductAdvanceRule || isHighValueThresholdTriggered) && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentType('security_advance');
                          setIsPaymentMethodSelected(true);
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                          isPaymentMethodSelected && paymentType === 'security_advance'
                            ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPaymentMethodSelected && paymentType === 'security_advance' ? 'bg-amber-600/10' : 'bg-slate-100'}`}>
                            <ShieldCheck className={`w-4 h-4 ${isPaymentMethodSelected && paymentType === 'security_advance' ? 'text-amber-600' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">
                              {activeProductAdvanceRule ? 'Pay Custom Partial Advance' : (isHighValueThresholdTriggered ? 'High-Value Security Advance' : (storeConfig.securityAdvanceLabel || 'Security Advance'))}
                            </span>
                            <span className="text-[10px] text-amber-700 font-extrabold block mt-0.5">
                              Advance: {calculations.partial.percentageDisplay > 0 ? `${calculations.partial.percentageDisplay}% (` : ''}৳{calculations.partial.advance}{calculations.partial.percentageDisplay > 0 ? ')' : ''}{calculations.partial.discountPct > 0 ? ` • Get ${calculations.partial.discountPct}% OFF` : ''}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isPaymentMethodSelected && paymentType === 'security_advance' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'}`}>
                          {isPaymentMethodSelected && paymentType === 'security_advance' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    )}

                    {storeConfig.fullPaymentActive !== false && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentType('full_payment');
                          setIsPaymentMethodSelected(true);
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all cursor-pointer text-left ${
                          isPaymentMethodSelected && paymentType === 'full_payment'
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPaymentMethodSelected && paymentType === 'full_payment' ? 'bg-emerald-600/10' : 'bg-slate-100'}`}>
                            <CreditCard className={`w-4 h-4 ${isPaymentMethodSelected && paymentType === 'full_payment' ? 'text-emerald-600' : 'text-slate-500'}`} />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Pay Full Payment (100% Advance)</span>
                            <span className="text-[10px] text-emerald-700 font-extrabold block mt-0.5">
                              Advance: 100% (৳{calculations.full.advance}){calculations.full.discountPct > 0 ? ` • Get ${calculations.full.discountPct}% OFF` : ''}
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isPaymentMethodSelected && paymentType === 'full_payment' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                          {isPaymentMethodSelected && paymentType === 'full_payment' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {!isPaymentMethodSelected ? (
                  <div className="p-4 bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-2xl text-center space-y-1.5 animate-fade-in shadow-xs">
                    <p className="text-xs sm:text-sm font-black text-slate-900 font-['Outfit']">
                      👇 Please Select Your Payment Method Above
                    </p>
                    <p className="text-[11px] font-bold text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Choose Cash on Delivery, Security Advance, or Full Payment to see the breakdown and finalize your order.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Live Deduction & Billing Card */}
                    <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border-2 border-emerald-500/80 space-y-3 shadow-xl text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                        <span className="font-extrabold text-emerald-200">Total Order Bill:</span>
                        <span className="text-sm sm:text-base font-black font-mono text-white">৳{totalAmount}</span>
                      </div>

                      {totalDiscountPct > 0 && (
                        <div className="flex items-center justify-between text-amber-300 font-bold border-b border-emerald-800/80 pb-1.5">
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3 text-amber-400" />
                            {paymentType === 'security_advance' 
                              ? `${storeConfig.securityAdvanceLabel || 'Security Advance'} Discount`
                              : 'Full Payment Discount'
                            } ({totalDiscountPct}%):
                          </span>
                          <span className="font-mono font-black text-amber-400">-৳{totalDiscountAmount - appliedDiscount}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-emerald-950/90 p-2.5 rounded-xl border border-emerald-500/50 text-center shadow-inner">
                          <span className="text-emerald-300 block text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Pay Now</span>
                          <span className="font-mono font-black text-emerald-300 text-base sm:text-lg">৳{advancePaidAmount}</span>
                        </div>
                        <div className="bg-slate-950/90 p-2.5 rounded-xl border border-amber-500/50 text-center shadow-inner">
                          <span className="text-amber-300 block text-[10px] sm:text-[11px] font-black uppercase tracking-wider">Pay On Delivery</span>
                          <span className="font-mono font-black text-amber-300 text-base sm:text-lg">৳{remainingDueAmount}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-200 border-t border-emerald-800/80 pt-2 font-bold">
                        <span>
                          ⚡ Pay Now: <strong className="text-emerald-300 font-mono">৳{advancePaidAmount}</strong> • Due on Delivery: <strong className="text-amber-300 font-mono">৳{remainingDueAmount}</strong>
                        </span>
                        {currentCalc.isFreeDelivery && (
                          <span className="text-emerald-300 font-black uppercase bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-400/60">🚚 Free Delivery!</span>
                        )}
                      </div>
                    </div>

                    {/* Conditional Online Banking Details ONLY when Pay Now mode is chosen */}
                    {paymentMode === 'pay_now' && (
                      <div className="p-3.5 sm:p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-xs space-y-3 animate-fade-in">
                        <div className="space-y-2">
                          <p className="text-[11px] font-black text-[#38BDF8] flex items-center gap-1.5 uppercase tracking-wider">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Select Mobile Banking Gateway:</span>
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {onlineGateways.map((gw) => (
                              <button
                                key={gw.id}
                                type="button"
                                onClick={() => setSelectedOnlineGatewayId(gw.id)}
                                className={`p-2 rounded-xl border text-[11px] font-black tracking-tight text-center transition-all cursor-pointer ${
                                  selectedOnlineGatewayId === gw.id 
                                    ? 'border-[#38BDF8] bg-[#38BDF8] text-slate-950 shadow-xs' 
                                    : 'border-slate-700 bg-slate-800 hover:border-slate-600 text-slate-200'
                                }`}
                              >
                                {gw.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-extrabold text-amber-400 text-xs">
                            {selectedOnlineGateway.name} Account Information:
                          </p>
                          <p className="text-slate-100 font-bold mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="text-slate-400">Number:</span>
                            <span className="font-mono font-black text-[#38BDF8] text-sm sm:text-base">{(selectedOnlineGateway.accountNumber || '').replace(/\(.*?\)/g, '').trim()}</span>
                            {selectedOnlineGateway.accountType && (
                              <span className="text-slate-400 text-[11px] font-medium">({selectedOnlineGateway.accountType})</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyGatewayNumber(selectedOnlineGateway.accountNumber)}
                              className="px-2.5 py-1 rounded-lg bg-[#38BDF8] hover:bg-sky-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                              {copiedGatewayNumber ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-950" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Number</span>
                                </>
                              )}
                            </button>
                          </p>

                          <div className="p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-bold flex items-start gap-2 mt-2">
                            <span className="text-amber-400 font-black text-sm shrink-0">⚠️</span>
                            <p className="leading-relaxed">
                              Please send <strong className="text-amber-300 font-mono font-black text-sm">৳{advancePaidAmount}</strong> to the {selectedOnlineGateway.name} number above, then enter your Sender Phone and Transaction ID below.
                            </p>
                          </div>
                        </div>

                        {/* Payment Verification Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-bold uppercase text-amber-300 mb-1">
                              Sender Phone Number <span className="text-rose-400">*</span>
                            </label>
                            <PhoneInput88
                              id="checkout-sender-phone"
                              name="senderPhone"
                              required
                              dark
                              value={senderPhone}
                              onChange={setSenderPhone}
                              placeholder="017XXXXXXXX"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-[11px] font-bold uppercase text-slate-300 mb-1">
                              Transaction ID (TrxID) <span className="text-rose-400">*</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              value={paymentTrxId}
                              onChange={(e) => setPaymentTrxId(e.target.value)}
                              placeholder="e.g. 9J28DA..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 sm:p-2.5 text-xs font-mono font-bold text-white outline-none focus:border-[#38BDF8]"
                            />
                          </div>

                          {/* Screenshot Upload Field (Completely Optional) */}
                          <div className="sm:col-span-2 pt-1.5 border-t border-slate-800/60 mt-1">
                            <label className="block text-[10px] sm:text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center justify-between">
                              <span>Payment Receipt Screenshot</span>
                              <span className="text-slate-400 font-normal lowercase bg-slate-800 px-2 py-0.5 rounded-full">Optional</span>
                            </label>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-xl p-2.5 sm:p-3 bg-slate-800/60 hover:bg-slate-800 transition-all relative">
                              {paymentReceiptImage ? (
                                <div className="relative w-full max-h-36 overflow-hidden rounded-lg">
                                  <img src={paymentReceiptImage} alt="Receipt Preview" className="max-h-32 object-contain mx-auto" />
                                  <button
                                    type="button"
                                    onClick={() => setPaymentReceiptImage('')}
                                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
                                    title="Remove Screenshot"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-1 text-slate-400 hover:text-white w-full py-1">
                                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#38BDF8]" />
                                  <span className="font-semibold text-[11px]">Upload Screenshot (Optional)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleReceiptUpload}
                                    className="hidden"
                                  />
                                </label>
                              )}
                              {isUploadingReceipt && (
                                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center rounded-xl">
                                  <p className="text-[#38BDF8] font-bold text-xs animate-pulse">Uploading...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Order Policy & Modification Guarantee Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-[11px] sm:text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>⚡ {lockHours}-Hour Order Modification Guarantee</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openOrderPolicyModal()}
                    className="text-[11px] font-black text-amber-800 underline hover:text-amber-950 shrink-0 cursor-pointer"
                  >
                    Read Policy
                  </button>
                </div>

                {/* Step 2 Final Confirm Bar */}
                <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl border border-slate-800 mt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                      {!isPaymentMethodSelected
                        ? 'Select Payment Method:'
                        : paymentType === 'cod'
                          ? 'Cash on Delivery Total:'
                          : paymentType === 'security_advance'
                            ? 'Payable Due on Delivery:'
                            : 'Total Payment Amount:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                        ৳{!isPaymentMethodSelected
                          ? totalAmount
                          : paymentType === 'cod'
                            ? totalAmount
                            : paymentType === 'security_advance'
                              ? remainingDueAmount
                              : advancePaidAmount}
                      </span>
                      {isPaymentMethodSelected && paymentType === 'security_advance' && (
                        <span className="text-xs text-slate-300 font-semibold">
                          (Pay Now Advance: ৳{advancePaidAmount})
                        </span>
                      )}
                      {isPaymentMethodSelected && paymentType === 'full_payment' && (
                        <span className="text-xs text-emerald-300 font-semibold">
                          (Full Payment with Discount)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isPaymentMethodSelected}
                    className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                      !isPaymentMethodSelected
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-[#38BDF8] text-slate-950 hover:scale-105 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {!isPaymentMethodSelected ? (
                      <>
                        <span>Select Payment Method First</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : paymentType === 'cod' ? (
                      <>
                        <span>Place Order (৳{totalAmount})</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    ) : paymentType === 'security_advance' ? (
                      <>
                        <span>Confirm Order & Pay ৳{advancePaidAmount} Advance</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Confirm & Place Order (৳{advancePaidAmount})</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
