export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  subcategories: string[];
  active: boolean;
  order?: number;
}

export interface AttributeOption {
  id: string;
  name: string;
  value: string;
  colorHex?: string;
  image?: string;
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g. "Color", "Size", "Storage", "RAM", "Processor", "Strap Material", "Material", "Warranty"
  type: 'select' | 'color' | 'button' | 'text';
  values: string[]; // e.g. ["Black", "White", "Navy"] or ["S", "M", "L", "XL"]
  isVariation: boolean;
  assignedCategories: string[]; // ['all'] or specific category names e.g. ['Clothing', 'Shoes']
}

export interface ProductColorVariant {
  name: string;
  hex: string;
  image?: string;
  gallery?: string[];
  inStock?: boolean;
  stock?: number;
  enabled?: boolean;
}

export interface ProductVariation {
  id: string;
  combination: { [attributeName: string]: string }; // e.g. { "Color": "Black", "Size": "M" } or { "Color": "Space Gray", "Storage": "256GB" }
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  image?: string;
  inStock: boolean;
}

export interface ProductSizeStock {
  size: string; // e.g., 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string; // Category name (e.g., 'Clothing', 'Electronics', 'Watches', 'Shoes', 'Eid & Festive Special')
  subcategory?: string;
  brand?: string;
  sku?: string;
  price: number;
  salePrice: number; // if salePrice < price, display sale discount
  rating: number; // e.g. 4.9
  reviewCount: number;
  images: string[]; // images[0] is featured/main image
  videoUrl?: string; // YouTube embed or direct MP4 URL
  sizes: ProductSizeStock[]; // preserved for backward compatibility
  colors?: ProductColorVariant[];
  attributes?: { [key: string]: string | string[] }; // category-specific attributes (e.g. { fabric: 'Cotton', fit: 'Oversized', storage: '256GB', warranty: '1 Year' })
  variations?: ProductVariation[]; // multi-attribute variations (Size + Color, Color + Storage, etc.)
  description: string;
  fabricDetails?: string;
  careInstructions?: string;
  shippingWeight?: string;
  shippingDimensions?: string;
  isFeatured?: boolean;
  isPujaSpecial?: boolean; // legacy compatibility
  isFestiveSpecial?: boolean;
  discountBadge?: string; // e.g., "FESTIVE SPECIAL", "30% OFF", "NEW DROP"
  tag?: string;
  tagline?: string; // Short product tagline for display and WhatsApp sharing
  productCode?: string; // Unique manually entered product code
  stock: number; // total stock or standalone stock
  trackStock?: boolean;
  
  // New Inventory & Sold Count Tracking
  autoStockManagementEnabled?: boolean;
  manualStockInputEnabled?: boolean;
  manualMasterStock?: number;
  lowStockThreshold?: number;
  lowStockAlertEnabled?: boolean;
  
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[]; // 10-15 custom keywords: English, Banglish, native synonyms, misspellings
  hasColorVariants?: boolean; // Toggle for color variants; if false, display size table directly
  baseSoldCount?: number; // Base manual sold count set by admin
  realSalesCount?: number; // Real order sales count auto-incremented
  soldCount?: number; // Effective displayed sold = baseSoldCount + realSalesCount
  isFreeShipping?: boolean; // Admin-controlled Free Shipping badge and filter
  order?: number; // Custom sorting order (smaller = higher)
  position?: number; // 1-based display position (1 = top of website, 2 = second, etc.)
  createdAt: string;
}

export interface SearchTelemetryLog {
  id: string;
  query: string;
  ip: string;
  location: string;
  resultsCount: number;
  timestamp: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string; // e.g., "EID SPECIAL", "NEW STREETWEAR DROP"
  ctaText: string;
  ctaLink: string;
  mediaType: 'image' | 'video';
  mediaUrl: string; // image URL or direct MP4/YouTube video URL or base64 data URL
  overlayOpacity?: number; // 0.1 to 0.8
  order: number;
  active: boolean;
  categoryLink?: string;
  durationSeconds?: number; // Duration in seconds for this specific slide
  isFirstSlide?: boolean; // Set as primary/first banner on website load
  showCta?: boolean;
  hideTextOverlay?: boolean; // When true, hide title, subtitle, and badge on website
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  selectedVariation?: ProductVariation;
  quantity: number;
  price: number; // salePrice or regular price or variation price
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'custom';
  accountNumber: string;
  accountType?: string; // e.g. 'Personal', 'Merchant', 'Agent', 'Bank Account'
  instructions?: string;
  active: boolean;
  hasDiscount?: boolean; // Toggle discount on/off per individual gateway
  discountPercent?: number; // Custom percentage (e.g. 5%, 10%)
  prepaymentDiscountPercent?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "RYC-2026-8492"
  customerName: string;
  phone: string;
  altPhone?: string;
  address: string;
  division?: string;
  district?: string;
  upazila?: string;
  cityRegion: 'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka' | string;
  deliveryFee: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  prepaymentDiscount?: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: string; // e.g. 'Cash on Delivery', 'bKash', 'Nagad', 'Rocket', etc.
  paymentTrxId?: string;
  senderPhone?: string; // Number from which customer sent the payment
  paymentReceiptImage?: string; // compressed Base64 screenshot of payment receipt
  isPaid?: boolean;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Partial';
  advancePaymentAmount?: number; // Advance paid (e.g. ৳100 advance delivery charge)
  dueAmount?: number; // Remaining due to pay upon delivery (COD)
  isAddressChanged?: boolean;
  oldAddress?: string;
  canceledByCustomer?: boolean;
  cancelReason?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Canceled';
  createdAt: string;
  orderTimeFormatted?: string;
  orderTimestamp?: number;
  notes?: string;
  isSeen?: boolean;
}

export interface Coupon {
  id: string;
  code: string; // e.g. "SAVE10"
  title?: string; // e.g. "10% Off Eid Storewide"
  description?: string; // e.g. "Min spend ৳1,000. Valid on all fashion & lifestyle."
  discountType: 'percent' | 'fixed'; // 'percent' (e.g. 10%) or 'fixed' (e.g. ৳200)
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isFreeDelivery?: boolean; // When true, provides ৳0 free shipping
  usageLimit: number; // max times it can be used overall
  usedCount: number; // times used so far
  expiryDate?: string;
  active: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  customerName: string;
  customerPhone?: string;
  verifiedPurchase?: boolean;
  rating: number; // 1 to 5
  comment: string;
  images?: string[];
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  order?: number;
  position?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  cityRegion: 'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka' | string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface QuickCategoryShortcut {
  id: string;
  name: string;
  label: string;
  icon?: string;
  image?: string;
  tag?: string;
  colorGradient?: string;
  targetCategory: string;
  active: boolean;
  order: number;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  active: boolean;
  order: number;
}

export interface StoreGuarantee {
  id: string;
  title: string;
  description: string;
  icon: 'truck' | 'shield' | 'refresh' | 'check' | 'package' | 'clock';
  active: boolean;
}

export interface ProductAdvanceRule {
  id: string;
  productId?: string;
  productTitle?: string;
  includedProductIds?: string[]; // Array of product IDs included in this advance rule
  ruleName?: string;
  advanceType: 'fixed' | 'percent';
  advanceValue: number; // e.g. 100 for BDT 100, or 20 for 20%
  discountPercent?: number; // Optional discount percentage
  freeDelivery?: boolean; // Optional free delivery
}

export interface StoreConfig {
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  defaultInsideDhakaFee: number;
  defaultSuburbsFee?: number;
  defaultOutsideDhakaFee: number;
  topBarNotice: string;
  popularCollectionsTitle?: string;
  popularCollectionsSubtitle?: string;
  currencySymbol: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  promoCode: string;
  promoDiscountPercent: number;
  guarantees?: StoreGuarantee[];
  isTopBarNoticeActive: boolean;
  isVouchersActive: boolean;
  copyrightText?: string;
  creditsText?: string;
  creditsLink?: string;
  isCreditsActive?: boolean;
  festivalHighlightTitle?: string;
  festivalHighlightSubtitle?: string;
  festivalHighlightDesc?: string;
  festivalHighlightCtaText?: string;
  festivalHighlightCategory?: string;
  festivalHighlightImage?: string;
  isFestivalHighlightActive?: boolean;
  ownerName?: string;
  coFounderName?: string;
  coFounderTitle?: string;
  isCoFounderActive?: boolean;
  customDeliveryOption1Name?: string;
  customDeliveryOption1Fee?: number;
  customDeliveryOption1Active?: boolean;
  customDeliveryOption2Name?: string;
  customDeliveryOption2Fee?: number;
  customDeliveryOption2Active?: boolean;
  customDeliveryOption3Name?: string;
  customDeliveryOption3Fee?: number;
  customDeliveryOption3Active?: boolean;
  customDeliveryOption4Name?: string;
  customDeliveryOption4Fee?: number;
  customDeliveryOption4Active?: boolean;
  logoBgColor?: string;
  logoPadding?: number;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
  };
  workingHours?: {
    startTime: string;
    endTime: string;
    displayText: string;
    isOpen: boolean;
    isAlwaysOpen?: boolean; // Added
  };
  heroAutoplaySpeedSeconds?: number;
  advanceDeliveryChargeActive?: boolean;
  advanceDeliveryChargeAmount?: number;
  advanceDeliveryChargeNumber?: string;
  advanceDeliveryChargeNotice?: string;
  advanceMinOrderThresholdActive?: boolean; // When true, advance charge is enforced only if subtotal >= threshold
  advanceMinOrderThresholdAmount?: number; // e.g. 2000 BDT
  advanceMinOrderThresholdValue?: number; // Advance required for high value threshold (e.g. 100 BDT)
  advanceMinOrderDisableCod?: boolean; // When true, COD is disabled for high value orders above threshold
  advanceMinOrderNotice?: string;
  freeDeliveryThresholdActive?: boolean;
  freeDeliveryThresholdAmount?: number;
  freeDeliveryNoticeText?: string;
  // New Payment Settings
  isCodEnabled?: boolean;
  securityAdvanceActive?: boolean;
  securityAdvanceLabel?: string;
  securityAdvanceType?: 'fixed' | 'percent';
  securityAdvanceValue?: number; // amount or percentage
  securityAdvanceDiscountPercent?: number;
  securityAdvanceFreeDeliveryActive?: boolean;
  fullPaymentActive?: boolean;
  fullPaymentDiscountPercent?: number;
  // Product-wise and Percentage config options
  productAdvanceRules?: ProductAdvanceRule[];
  advancePercentageActive?: boolean;
  // Dashboard and Menu Toggles
  showLowStockPanel?: boolean;
  showSearchQueriesPanel?: boolean;
  isMenuWorkingHoursActive?: boolean;
  isMenuOrderTrackingActive?: boolean;
  heroVoucherBadgeActive?: boolean;
  heroVoucherBadgeText?: string;
  heroCtaButtonActive?: boolean;
  heroDotsActive?: boolean; // Global toggle to show/hide carousel pagination dots
  voucherBannerTitle?: string;
  voucherBannerSubtitle?: string;
  // Existing fields
  paymentGateways?: PaymentGateway[];
  prepaymentDiscountActive?: boolean;
  prepaymentDiscountPercent?: number;
  prepaymentFreeDeliveryActive?: boolean; // When true, delivery fee is 0 if user chooses Pay Now / online payment
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  emailjsPublicKey?: string;
  emailjsReceiverEmail?: string;
  orderLockDurationHours?: number;
  orderPolicyText?: string;
  lastViewedOrderTimestamp?: number;
}

export type AdminPermissionKey = 
  | 'dashboard'
  | 'add_edit_products'
  | 'delete_products'
  | 'view_orders'
  | 'update_order_status'
  | 'working_hours'
  | 'telemetry'
  | 'settings';

export interface UnifiedStockStatus {
  totalStock: number;
  effectiveStock: number;
  threshold: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  isInStock: boolean;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  badgeText: 'In Stock' | 'Low Stock' | 'Out of Stock';
  badgeClass: string;
  textColor: string;
  pillClass: string;
  getColorStock: (colorName: string) => number;
  hasOutOfStockVariant?: boolean;
  hasLowStockVariant?: boolean;
  outOfStockVariantsCount?: number;
  lowStockVariantsCount?: number;
}
