import { Product, HeroSlide, StoreConfig, Category, ProductAttribute, Coupon, Review, QuickCategoryShortcut, StoreGuarantee, StaticPage, PreOrderProduct, BuyMoreOffer, BuyMoreVoucher } from '../types/store';

export const INITIAL_STATIC_PAGES: StaticPage[] = [
  {
    id: 'page-about',
    title: 'About Us',
    slug: 'about-us',
    content: `Welcome to RycreoShop — Bangladesh's trusted multi-category e-commerce and curated lifestyle shopping destination.\n\nFounded with an unwavering focus on genuine quality, transparent pricing, and stellar customer support, we bring you an expansive catalog ranging from cutting-edge smart gadgets and high-fidelity acoustics to contemporary fashion, royal festive wear, fine jewelry, and daily lifestyle essentials.\n\nOur Customer Promise:\n• 100% Genuine, Verified Authentic Products\n• Hassle-Free 7-Day Size and Product Exchange\n• Doorstep Parcel Inspection with Cash on Delivery across Bangladesh\n• Express Nationwide Courier Delivery (24-48 hrs Dhaka, 2-4 days Nationwide)\n• Direct WhatsApp Hotline & Telephone Assistance 7 Days a Week`,
    active: true,
    order: 1
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `At RycreoShop, protecting your privacy and personal data is our foundational commitment.\n\n1. Information Collection:\nWe collect necessary delivery details (recipient name, verified phone number, and physical delivery address) exclusively for order verification, dispatch, and courier handover.\n\n2. Data Security & Confidentiality:\nYour personal information is strictly safeguarded. We never sell, lease, rent, or distribute your private data to unauthorized third parties or marketing brokers.\n\n3. Communications:\nWe communicate with you solely regarding order confirmation, shipment dispatch updates, tracking notifications, and essential customer service queries.`,
    active: true,
    order: 2
  },
  {
    id: 'page-terms',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `By browsing and purchasing on RycreoShop, you agree to our fair terms of service:\n\n1. Order Verification:\nCash on Delivery orders are subject to telephone or WhatsApp confirmation before parcel dispatch from our hub.\n\n2. Pricing & Currency:\nAll product prices are quoted in Bangladeshi Taka (৳ BDT). Prices include high-grade tamper-proof safety packaging.\n\n3. Doorstep Parcel Inspection:\nCustomers are welcome to inspect parcels at the doorstep in front of the delivery agent before completing payment.\n\n4. 7-Day Exchange Policy:\nUnused, unwashed items with tags and original packaging intact qualify for a hassle-free exchange within 7 days.`,
    active: true,
    order: 3
  },
  {
    id: 'page-shipping',
    title: 'Our Shipping Policy',
    slug: 'shipping-policy',
    content: `Fast, reliable, and insured nationwide delivery covering all 64 districts of Bangladesh.\n\nInside Dhaka Metropolitan Area:\n• Standard Delivery Fee: ৳60\n• Delivery Timeframe: 24 to 48 Hours\n• Full Cash on Delivery available at your doorstep.\n\nOutside Dhaka (Suburbs & All Districts):\n• Standard Delivery Fee: ৳120\n• Delivery Timeframe: 2 to 4 Business Days\n• Shipped via top-tier courier partners: Steadfast, Pathao, and RedX.\n\nDoorstep Inspection Guarantee:\nEvery parcel is sealed in tamper-proof security packaging. You are entitled to verify the parcel upon arrival.`,
    active: true,
    order: 4
  },
  {
    id: 'page-contact',
    title: 'Contact Us',
    slug: 'contact-us',
    content: `We are here to assist you 7 days a week with any product questions or order inquiries!\n\n• Hotline Telephone: +880 1312-556660\n• WhatsApp Live Support: +8801312556660 (Instant Chat Support)\n• Official Email: rycreoshop@gmail.com\n• Corporate HQ: Banani, Dhaka, Bangladesh\n\nSupport Hours:\n9:00 AM – 10:00 PM Daily`,
    active: true,
    order: 5
  },
  {
    id: 'page-about-store',
    title: 'About Our Store',
    slug: 'about-our-store',
    content: `RycreoShop is an authentic Bangladeshi multi-product e-commerce hub built to deliver world-class shopping convenience right to your home.\n\nWhat We Offer:\n• Smart Gadgets & Electronics (ANC Earbuds, Smartwatches, Audio Equipment)\n• Contemporary Fashion & Casual Wear (Heavyweight Drop-Shoulder Tees, Chinos, Festive Kurtas)\n• Exquisite Fashion Jewelry & Curated Accessories\n• Everyday Home, Travel & Lifestyle Essentials\n\nOur Philosophy:\nWe believe quality and trust should never be compromised. Every item in our catalog is rigorously checked for durability, authenticity, and finish before it reaches your hands.`,
    active: true,
    order: 6
  }
];

export const INITIAL_GUARANTEES: StoreGuarantee[] = [
  {
    id: "g-1",
    title: "Express Delivery",
    description: "Inside Dhaka ৳60. Nationwide ৳120",
    icon: "truck",
    active: true
  },
  {
    id: "g-2",
    title: "100% Authentic Quality",
    description: "Verified Authentic & Premium Quality",
    icon: "shield",
    active: true
  },
  {
    id: "g-3",
    title: "Cash on Delivery",
    description: "Inspect parcel at doorstep before payment",
    icon: "check",
    active: true
  },
  {
    id: "g-4",
    title: "7-Day Hassle-Free Swap",
    description: "Instant size exchange via WhatsApp",
    icon: "refresh",
    active: true
  }
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: "RycreoShop",
  logoUrl: "/logo.png",
  faviconUrl: "/logo.png",
  contactEmail: "rycreoshop@gmail.com",
  contactPhone: "+880 1312-556660",
  whatsappNumber: "8801312556660",
  defaultInsideDhakaFee: 60,
  defaultSuburbsFee: 100,
  defaultOutsideDhakaFee: 120,
  topBarNotice: "✨ WELCOME TO RYCREOSHOP: Trusted Shopping for Smart Gadgets, Fashion, Jewelry & Lifestyle! Fast Delivery Inside Dhaka ৳60, Nationwide ৳120",
  popularCollectionsTitle: "Popular Collections & Fast Categories",
  popularCollectionsSubtitle: "",
  currencySymbol: "৳",
  metaTitle: "RycreoShop | Trusted Multi-Category E-Commerce Store in Bangladesh",
  metaDescription: "Shop at RycreoShop - Bangladesh's most trusted online shopping destination. Discover premium smart gadgets, trending fashion, fine jewelry, lifestyle accessories, and daily essentials with fast express nationwide delivery and cash on delivery.",
  metaKeywords: "RycreoShop, Rycreo, trusted online shopping Bangladesh, smart gadgets BD, wireless earbuds, smart watches, fashion apparel, jewelry BD, ladies jewelry, gold plated jewelry, mens fashion, premium lifestyle, home electronics, cash on delivery Bangladesh, fast delivery Dhaka, Chittagong, Sylhet, best online shop BD, multi product e-commerce",
  promoCode: "WELCOME10",
  promoDiscountPercent: 10,
  guarantees: INITIAL_GUARANTEES,
  isTopBarNoticeActive: false,
  isVouchersActive: true,
  showLowStockPanel: true,
  showSearchQueriesPanel: true,
  isMenuWorkingHoursActive: true,
  isMenuOrderTrackingActive: true,
  heroVoucherBadgeActive: true,
  heroVoucherBadgeText: "Collect ৳100 Voucher",
  heroCtaButtonActive: true,
  creditsText: "Developed by RycreoShop Solutions",
  creditsLink: "https://rycreoshop.com",
  isCreditsActive: true,
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com',
    instagram: 'https://instagram.com'
  },
  workingHours: {
    startTime: "09:00",
    endTime: "22:00",
    displayText: "9:00 AM - 10:00 PM (Daily)",
    isOpen: true
  },
  festivalHighlightTitle: "FESTIVAL HIGHLIGHT 2026",
  festivalHighlightSubtitle: "Puja Special Traditional Fusion Collection",
  festivalHighlightDesc: "Royal cotton-linen Kurtas and silk-touch button-downs crafted with mandarin collar embroidery for Durga Puja & Eid festivities.",
  festivalHighlightCtaText: "EXPLORE FESTIVAL SPECIAL",
  festivalHighlightCategory: "Festive & Premium",
  festivalHighlightImage: "",
  isFestivalHighlightActive: true,
  ownerName: "Raiyan",
  coFounderName: "",
  coFounderTitle: "Co-Founder & Partner",
  isCoFounderActive: false,
  customDeliveryOption1Name: "Express Same-Day Dhaka",
  customDeliveryOption1Fee: 150,
  customDeliveryOption1Active: false,
  customDeliveryOption2Name: "Urgent Courier Service",
  customDeliveryOption2Fee: 180,
  customDeliveryOption2Active: false,
  customDeliveryOption3Name: "VIP Hand Delivery",
  customDeliveryOption3Fee: 250,
  customDeliveryOption3Active: false,
  customDeliveryOption4Name: "Redx / Pathao Fast Express",
  customDeliveryOption4Fee: 130,
  customDeliveryOption4Active: false,
  logoBgColor: "#FFFFFF",
  logoPadding: 4,
  heroAutoplaySpeedSeconds: 5,
  advanceDeliveryChargeActive: false,
  advanceDeliveryChargeAmount: 100,
  advanceDeliveryChargeNumber: "01312556660",
  advanceDeliveryChargeNotice: "To verify delivery details and prevent fake orders, please pay the delivery charge of ৳100 in advance via mobile banking. The rest of the amount can be paid on courier delivery.",
  advanceMinOrderThresholdActive: false,
  advanceMinOrderThresholdAmount: 2000,
  advanceMinOrderThresholdValue: 100,
  advanceMinOrderDisableCod: false,
  advanceMinOrderNotice: "A security advance payment of ৳100 is mandatory for high-value orders above ৳2,000 to verify shipping details.",
  freeDeliveryThresholdActive: true,
  freeDeliveryThresholdAmount: 1500,
  freeDeliveryNoticeText: "Enjoy FREE delivery on all orders of ৳1,500 or more!",
  prepaymentDiscountActive: true,
  prepaymentDiscountPercent: 10,
  prepaymentFreeDeliveryActive: true,
  orderLockDurationHours: 6,
  orderPolicyText: "⚡ **6-HOUR ORDER MODIFICATION & CANCELLATION POLICY**:\n\n1. **Modification Window (6 Hours)**: After placing an order, customers have up to **6 hours** to edit delivery address/phone, cancel the order, or add more products with variant selectors.\n2. **Auto-Locking**: Once 6 hours have elapsed, the system automatically locks and disables all edits, cancellations, and product additions.\n3. **Consolidated Delivery**: Adding products within 6 hours merges them into your existing order with a single consolidated delivery charge (no double-charging).",
  // New Payment Settings Defaults
  isCodEnabled: true,
  securityAdvanceLabel: "Security Advance",
  securityAdvanceType: "fixed",
  securityAdvanceValue: 100,
  securityAdvanceDiscountPercent: 5,
  securityAdvanceFreeDeliveryActive: false,
  fullPaymentDiscountPercent: 20,
  productAdvanceRules: [],
  advancePercentageActive: true,
  emailjsServiceId: "service_1tvp2rk",
  emailjsTemplateId: "Template_0vqd26h",
  emailjsPublicKey: "Qi5oXZpEMJkG2utos",
  emailjsReceiverEmail: "rycreoshop@gmail.com",
  isPreOrderSectionVisible: true,
  isBuyMoreSectionVisible: true,
  ourProductsSectionTitle: "Our Products",
  preOrderSectionTitle: "Upcoming Products",
  preOrderSectionSubtitle: "Reserve upcoming global drops before they arrive in stock.",
  buyMoreSectionTitle: "Buy One Get More",
  buyMoreSectionSubtitle: "Exclusive combo bundles, free bonus gifts & offer vouchers.",
  upcomingBanner: {
    active: true,
    badge: "UPCOMING DROPS • PRE-ORDER",
    title: "NEXT-GEN ARRIVALS & EXCLUSIVE PRE-ORDER",
    subtitle: "Reserve upcoming international drops with priority dispatch before public release.",
    ctaText: "RESERVE UPCOMING DROPS",
    ctaLink: "#upcoming-products",
    categoryLink: "",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.35,
    showCta: true,
    hideTextOverlay: false,
  },
  buyMoreBanner: {
    active: true,
    badge: "BUY ONE GET MORE • COMBO OFFERS",
    title: "DOUBLE THE VALUE WITH BONUS GIFTS",
    subtitle: "Grab Buy 1 Get 1 & Multi-Buy bundles with complimentary surprise accessories included.",
    ctaText: "EXPLORE COMBO OFFERS",
    ctaLink: "#buy-more-offers",
    categoryLink: "",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.38,
    showCta: true,
    hideTextOverlay: false,
  },
  sectionLayouts: {
    ourProducts: {
      maxRows: 4,
      mobileMaxRows: 4,
      desktopColumns: 4,
      mobileColumns: 2,
      maxItemsPerRow: 20,
      autoSingleRowThreshold: 3,
    },
    preOrder: {
      maxRows: 3,
      mobileMaxRows: 4,
      desktopColumns: 4,
      mobileColumns: 2,
      maxItemsPerRow: 20,
      autoSingleRowThreshold: 3,
    },
    buyMore: {
      maxRows: 2,
      mobileMaxRows: 2,
      desktopColumns: 4,
      mobileColumns: 2,
      maxItemsPerRow: 20,
      autoSingleRowThreshold: 4,
    },
  },
  paymentGateways: [
    {
      id: "cod",
      name: "Cash on Delivery",
      type: "cod",
      accountNumber: "N/A",
      instructions: "Pay in cash to the courier delivery agent when receiving your package.",
      active: true
    },
    {
      id: "bkash",
      name: "bKash",
      type: "bkash",
      accountNumber: "01312556660",
      accountType: "Personal / Send Money",
      instructions: "Send Money or Cash Out to 01312556660 and provide your Transaction ID.",
      active: true,
      hasDiscount: true,
      discountPercent: 10,
      prepaymentDiscountPercent: 10
    },
    {
      id: "nagad",
      name: "Nagad",
      type: "nagad",
      accountNumber: "01312556660",
      accountType: "Personal / Send Money",
      instructions: "Send Money or Cash Out to 01312556660 and provide your Transaction ID.",
      active: true,
      hasDiscount: false,
      discountPercent: 0,
      prepaymentDiscountPercent: 0
    },
    {
      id: "rocket",
      name: "Rocket",
      type: "rocket",
      accountNumber: "01312556660-7",
      accountType: "Personal / Send Money",
      instructions: "Send Money to 01312556660-7 and enter your Transaction ID below.",
      active: true,
      hasDiscount: true,
      discountPercent: 5,
      prepaymentDiscountPercent: 5
    },
    {
      id: "upay",
      name: "Upay",
      type: "upay",
      accountNumber: "01312556660",
      accountType: "Personal",
      instructions: "Send Money to 01312556660 and enter your Transaction ID.",
      active: true,
      prepaymentDiscountPercent: 10
    },
    {
      id: "bank",
      name: "Bank Transfer",
      type: "bank",
      accountNumber: "1234567890 (Dutch-Bangla Bank / Islami Bank)",
      accountType: "Bank Account",
      instructions: "Transfer to Dutch-Bangla Bank AC: 1234567890, Branch: Dhaka Main, A/C Name: RycreoShop.",
      active: true,
      prepaymentDiscountPercent: 10
    }
  ]
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-clothing",
    name: "Clothing",
    slug: "clothing",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Drop-Shoulder Tees", "Polo T-Shirts", "Pants & Chinos", "Sweaters & Hoodies", "Casual Shirts", "Jackets"],
    active: true,
    order: 1
  },
  {
    id: "cat-festive",
    name: "Festive & Premium",
    slug: "festive-premium",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Eid Collection", "Royal Fusion Kurtas", "Silk Touch Shirts", "Traditional Royal", "Wedding Special"],
    active: true,
    order: 2
  },
  {
    id: "cat-pants",
    name: "Pants",
    slug: "pants",
    icon: "Layers",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Chino Cargo", "Slim Fit Chinos", "Denim Jeans", "Tactical Cargo"],
    active: true,
    order: 3
  },
  {
    id: "cat-polo",
    name: "Polo T-Shirts",
    slug: "polo-t-shirts",
    icon: "Tag",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Luxe Pique", "Solid Collar", "Textured Knit", "Contrast Ribbed"],
    active: true,
    order: 4
  },
  {
    id: "cat-drop",
    name: "Drop-Shoulder",
    slug: "drop-shoulder",
    icon: "Zap",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Graphic Streetwear", "Heavyweight 240 GSM", "Acid Wash", "Minimal Boxy"],
    active: true,
    order: 5
  },
  {
    id: "cat-sweaters",
    name: "Sweaters & Hoodies",
    slug: "sweaters-hoodies",
    icon: "Flame",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Fleece Hoodies", "Winter Pullovers", "Zip Sweatshirts", "Cardigans"],
    active: true,
    order: 6
  },
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Audio & Headphones", "Smart Gadgets", "Power Banks", "Wearables"],
    active: true,
    order: 7
  },
  {
    id: "cat-watches",
    name: "Watches",
    slug: "watches",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Luxury Chronograph", "Minimal Quartz", "Automatic", "Smartwatches"],
    active: true,
    order: 8
  },
  {
    id: "cat-shoes",
    name: "Shoes",
    slug: "shoes",
    icon: "Footprints",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Sneakers", "Leather Loafers", "Casual Slip-Ons", "Boots"],
    active: true,
    order: 9
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    icon: "Glasses",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Leather Wallets", "Belts", "Sunglasses", "Caps"],
    active: true,
    order: 10
  },
  {
    id: "cat-home",
    name: "Home & Living",
    slug: "home-living",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600",
    subcategories: ["Decor", "Diffusers & Candles", "Desk Organization"],
    active: true,
    order: 11
  }
];

export const INITIAL_ATTRIBUTES: ProductAttribute[] = [
  {
    id: "attr-color",
    name: "Color",
    type: "color",
    values: ["Jet Black", "Crisp White", "Royal Maroon", "Navy Blue", "Olive Green", "Charcoal Gray", "Midnight Blue", "Gold Sunset", "Silver"],
    isVariation: true,
    assignedCategories: ["all"]
  },
  {
    id: "attr-clothing-size",
    name: "Size",
    type: "button",
    values: ["S", "M", "L", "XL", "XXL"],
    isVariation: true,
    assignedCategories: ["Clothing", "Festive & Premium", "Polo T-Shirts", "Drop-Shoulder", "Sweaters & Hoodies"]
  },
  {
    id: "attr-pants-size",
    name: "Waist Size",
    type: "button",
    values: ["28", "30", "32", "34", "36", "38"],
    isVariation: true,
    assignedCategories: ["Pants", "Clothing"]
  },
  {
    id: "attr-fabric",
    name: "Fabric / Material",
    type: "text",
    values: ["100% Combed Cotton", "Mulberry Silk Linen", "Fleece", "Denim Cotton Spandex"],
    isVariation: false,
    assignedCategories: ["Clothing", "Festive & Premium", "Pants"]
  },
  {
    id: "attr-shoe-size",
    name: "Shoe Size (EU)",
    type: "button",
    values: ["39", "40", "41", "42", "43", "44", "45"],
    isVariation: true,
    assignedCategories: ["Shoes"]
  },
  {
    id: "attr-storage",
    name: "Storage",
    type: "button",
    values: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    isVariation: true,
    assignedCategories: ["Electronics"]
  },
  {
    id: "attr-ram",
    name: "RAM",
    type: "button",
    values: ["4GB", "8GB", "16GB", "32GB"],
    isVariation: false,
    assignedCategories: ["Electronics"]
  },
  {
    id: "attr-processor",
    name: "Processor / Chip",
    type: "text",
    values: ["Octa-Core High Performance", "Quad-Core", "ANC Titanium Chip"],
    isVariation: false,
    assignedCategories: ["Electronics"]
  },
  {
    id: "attr-strap",
    name: "Strap Material",
    type: "select",
    values: ["Italian Leather", "Stainless Steel", "Silicone Sport", "Milanese Mesh"],
    isVariation: true,
    assignedCategories: ["Watches"]
  }
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-1",
    title: "ROYAL FESTIVE & EID SPECIAL DROPS",
    subtitle: "Celebrate in Royal Traditional Fusion Kurtas & Pure Cotton Silk Apparel",
    badge: "FESTIVE EXCLUSIVE • 35% OFF",
    ctaText: "EXPLORE FESTIVE DROPS",
    ctaLink: "#products",
    categoryLink: "Festive & Premium",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.35,
    order: 1,
    active: true,
  },
  {
    id: "hero-2",
    title: "OVERSIZED STREETWEAR DROP-SHOULDER TEES",
    subtitle: "Heavyweight 240 GSM Pure Combed Cotton • Engineered Boxy Fit",
    badge: "NEW STREETWEAR DROP",
    ctaText: "EXPLORE DROP-SHOULDER",
    ctaLink: "#products",
    categoryLink: "Drop-Shoulder",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.35,
    order: 2,
    active: true,
  },
  {
    id: "hero-3",
    title: "PREMIUM COTTON CHINO CARGO DENIM",
    subtitle: "Tailored Slim & Tapered Fit • Maximum Stretch Comfort for Daily Luxury",
    badge: "BESTSELLER DENIM & PANTS",
    ctaText: "SHOP CHINO PANTS",
    ctaLink: "#products",
    categoryLink: "Pants",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.3,
    order: 3,
    active: true,
  },
  {
    id: "hero-4",
    title: "LUXE TIMEPIECES & SMART AUDIO LIFESTYLE",
    subtitle: "Sapphire Crystal Chronographs & Spatial Audio Noise-Canceling Acoustics",
    badge: "LUXURY LIFESTYLE",
    ctaText: "VIEW TIMEPIECES",
    ctaLink: "#products",
    categoryLink: "Watches",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1600",
    overlayOpacity: 0.35,
    order: 4,
    active: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Royal Festive Edition Fusion Mandarin Kurta Shirt",
    slug: "royal-festive-edition-fusion-kurta",
    category: "Festive & Premium",
    subcategory: "Eid Collection",
    brand: "Rycreo Atelier",
    sku: "RYC-FS-001",
    price: 2450,
    salePrice: 1790,
    rating: 4.95,
    reviewCount: 128,
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-golden-dress-40915-large.mp4",
    sizes: [
      { size: "S", stock: 8 },
      { size: "M", stock: 15 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 5 },
      { size: "XXL", stock: 2 }
    ],
    colors: [
      { name: "Royal Maroon", hex: "#800000", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800" },
      { name: "Gold Sunset", hex: "#D97706", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800" },
      { name: "Jet Black", hex: "#0F172A", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-1-1", combination: { "Color": "Royal Maroon", "Size": "M" }, price: 2450, salePrice: 1790, stock: 10, inStock: true, sku: "RYC-FS-RM-M" },
      { id: "var-1-2", combination: { "Color": "Royal Maroon", "Size": "L" }, price: 2450, salePrice: 1790, stock: 8, inStock: true, sku: "RYC-FS-RM-L" },
      { id: "var-1-3", combination: { "Color": "Gold Sunset", "Size": "M" }, price: 2450, salePrice: 1790, stock: 6, inStock: true, sku: "RYC-FS-GS-M" },
      { id: "var-1-4", combination: { "Color": "Jet Black", "Size": "L" }, price: 2450, salePrice: 1790, stock: 4, inStock: true, sku: "RYC-FS-JB-L" }
    ],
    attributes: {
      fabric: "85% Royal Egyptian Cotton, 15% Mulberry Silk Linen",
      fit: "Traditional Modern Fusion Fit",
      gender: "Men",
      pattern: "Mandarin Collar Handcrafted Embroidery"
    },
    description: "Handcrafted Luxury Traditional Fusion Kurta Shirt designed for Eid and festive gatherings. Made from breathable royal cotton-linen blend with detailed mandarin collar embroidery and wooden buttons.",
    fabricDetails: "85% Royal Egyptian Cotton, 15% Mulberry Silk Linen Blend",
    careInstructions: "Dry clean recommended or Gentle Hand Wash in cold water. Do not bleach.",
    isFeatured: true,
    isFestiveSpecial: true,
    discountBadge: "FESTIVE • 27% OFF",
    tag: "Festive Bestseller",
    stock: 42,
    trackStock: true,
    soldCount: 48,
    isFreeShipping: true,
    keywords: ["kurta", "panjabi", "punjabi", "eid kurta", "festive shirt", "mandarin collar", "panjabi kurta", "cotton panjabi", "eid drop", "bangladeshi kurta", "kurta shart", "fusion kurta", "punjabi drop"],
    createdAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "prod-2",
    title: "Premium Cotton Chino Pants & Cargo Denim",
    slug: "premium-cotton-chino-pants-cargo-denim",
    category: "Pants",
    subcategory: "Chino Cargo",
    brand: "Rycreo Denim Co.",
    sku: "RYC-PNT-002",
    price: 1950,
    salePrice: 1450,
    rating: 4.88,
    reviewCount: 94,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    sizes: [
      { size: "28", stock: 6 },
      { size: "30", stock: 14 },
      { size: "32", stock: 20 },
      { size: "34", stock: 11 },
      { size: "36", stock: 4 }
    ],
    colors: [
      { name: "Olive Green", hex: "#556B2F", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800" },
      { name: "Khaki Tan", hex: "#C3B091", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800" },
      { name: "Charcoal Gray", hex: "#36454F", image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-2-1", combination: { "Color": "Olive Green", "Waist Size": "30" }, price: 1950, salePrice: 1450, stock: 12, inStock: true, sku: "RYC-PNT-OG-30" },
      { id: "var-2-2", combination: { "Color": "Olive Green", "Waist Size": "32" }, price: 1950, salePrice: 1450, stock: 15, inStock: true, sku: "RYC-PNT-OG-32" },
      { id: "var-2-3", combination: { "Color": "Khaki Tan", "Waist Size": "32" }, price: 1950, salePrice: 1450, stock: 8, inStock: true, sku: "RYC-PNT-KT-32" }
    ],
    attributes: {
      fabric: "97% Long-Staple Cotton, 3% Elastane",
      fit: "Engineered Tapered Fit",
      gender: "Men"
    },
    description: "Engineered 4-way stretch chino trousers with tactical cargo utility pockets. Ideal for formal, smart-casual, and urban streetwear looks.",
    fabricDetails: "97% Long-Staple Cotton, 3% Elastane",
    careInstructions: "Machine wash cold with like colors. Line dry inside out.",
    isFeatured: true,
    discountBadge: "25% OFF",
    tag: "Essential",
    stock: 55,
    trackStock: true,
    soldCount: 35,
    keywords: ["chino", "chino pants", "cargo pants", "denim jeans", "chino pant", "pant", "formal pant", "gabardine pant", "pant for men", "cargos", "black chino", "trousers", "stretch pant"],
    createdAt: "2026-09-05T10:00:00.000Z"
  },
  {
    id: "prod-3",
    title: "Luxe Pique Cotton Collar Polo Shirt",
    slug: "luxe-pique-cotton-collar-polo-shirt",
    category: "Polo T-Shirts",
    subcategory: "Luxe Pique",
    brand: "Rycreo Prestige",
    sku: "RYC-POLO-003",
    price: 1250,
    salePrice: 890,
    rating: 4.92,
    reviewCount: 156,
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1625910513413-73132204738a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 22 },
      { size: "L", stock: 18 },
      { size: "XL", stock: 9 },
      { size: "XXL", stock: 3 }
    ],
    colors: [
      { name: "Navy Blue", hex: "#000080", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=800" },
      { name: "Crisp White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1625910513413-73132204738a?auto=format&fit=crop&q=80&w=800" },
      { name: "Jet Black", hex: "#0F172A", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-3-1", combination: { "Color": "Navy Blue", "Size": "M" }, price: 1250, salePrice: 890, stock: 15, inStock: true, sku: "RYC-POL-NB-M" },
      { id: "var-3-2", combination: { "Color": "Crisp White", "Size": "L" }, price: 1250, salePrice: 890, stock: 12, inStock: true, sku: "RYC-POL-CW-L" }
    ],
    attributes: {
      fabric: "100% Super Combed Pique Cotton 220 GSM",
      fit: "Classic Tailored Fit"
    },
    description: "Ultra-soft 220 GSM pique knit polo with ribbed cuffs and signature gold-plated metallic chest badge. Maintains color brilliance after 50+ washes.",
    fabricDetails: "100% Super Combed Pique Cotton",
    careInstructions: "Machine wash gentle cycle. Do not tumble dry.",
    isFeatured: true,
    discountBadge: "28% OFF",
    tag: "Top Rated",
    stock: 62,
    trackStock: true,
    soldCount: 82,
    isFreeShipping: true,
    keywords: ["polo", "polo t-shirt", "t shirt", "polo genji", "collar t shirt", "polo shart", "polo tate", "cotton polo", "luxe polo", "polo shirt for men", "navy polo", "collar shirt"],
    createdAt: "2026-09-10T10:00:00.000Z"
  },
  {
    id: "prod-4",
    title: "Oversized Graphic Streetwear Drop-Shoulder T-Shirt",
    slug: "oversized-graphic-streetwear-drop-shoulder-t-shirt",
    category: "Drop-Shoulder",
    subcategory: "Graphic Streetwear",
    brand: "Rycreo Street Division",
    sku: "RYC-DRP-004",
    price: 1100,
    salePrice: 750,
    rating: 4.97,
    reviewCount: 210,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800"
    ],
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-the-street-lights-41006-large.mp4",
    sizes: [
      { size: "M", stock: 25 },
      { size: "L", stock: 30 },
      { size: "XL", stock: 12 }
    ],
    colors: [
      { name: "Jet Black", hex: "#000000" },
      { name: "Vintage White", hex: "#F5F5DC" },
      { name: "Acid Wash Charcoal", hex: "#333333" }
    ],
    variations: [
      { id: "var-4-1", combination: { "Color": "Jet Black", "Size": "M" }, price: 1100, salePrice: 750, stock: 20, inStock: true, sku: "RYC-DRP-JB-M" },
      { id: "var-4-2", combination: { "Color": "Jet Black", "Size": "L" }, price: 1100, salePrice: 750, stock: 25, inStock: true, sku: "RYC-DRP-JB-L" }
    ],
    attributes: {
      fabric: "240 GSM Heavyweight Organic Cotton",
      fit: "Boxy Drop-Shoulder Oversized"
    },
    description: "Trendy 240 GSM heavy boxy fit drop-shoulder tee featuring high-density puff screen print typography. Breathable street couture for all seasons.",
    fabricDetails: "100% Heavyweight Organic Cotton",
    careInstructions: "Wash inside out with cold water. Warm iron on reverse side.",
    isFeatured: true,
    soldCount: 115,
    keywords: ["drop shoulder", "oversized", "oversized t shirt", "graphic tee", "streetwear", "genji", "drop sholder", "loose fit", "black tee", "boxy tee", "t shirt oversized"],
    discountBadge: "32% OFF",
    tag: "Trending Now",
    stock: 67,
    trackStock: true,
    createdAt: "2026-09-15T10:00:00.000Z"
  },
  {
    id: "prod-5",
    title: "Fleece Winter Pullover Sweater & Hoodie",
    slug: "fleece-winter-pullover-sweater-hoodie",
    category: "Sweaters & Hoodies",
    subcategory: "Fleece Hoodies",
    brand: "Rycreo Winterwear",
    sku: "RYC-SWT-005",
    price: 2200,
    salePrice: 1650,
    rating: 4.90,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "M", stock: 10 },
      { size: "L", stock: 16 },
      { size: "XL", stock: 8 },
      { size: "XXL", stock: 3 }
    ],
    colors: [
      { name: "Slate Heather", hex: "#475569" },
      { name: "Onyx Black", hex: "#0F172A" }
    ],
    attributes: {
      fabric: "320 GSM Brushed Inner Fleece",
      fit: "Relaxed Winter Fit"
    },
    description: "320 GSM brushed inner-fleece heavyweight pullover hoodie with double-lined drawstring hood and kangaroo hand warmer pockets.",
    fabricDetails: "80% Combed Cotton Fleece, 20% Polyester Structure",
    careInstructions: "Cool machine wash. Lay flat to dry.",
    isFeatured: true,
    discountBadge: "25% OFF",
    tag: "Winter Drop",
    stock: 37,
    trackStock: true,
    createdAt: "2026-09-20T10:00:00.000Z"
  },
  {
    id: "prod-6",
    title: "Rycreo Elite Chronograph Sapphire Leather Watch",
    slug: "rycreo-elite-chronograph-sapphire-watch",
    category: "Watches",
    subcategory: "Luxury Chronograph",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-006",
    price: 4500,
    salePrice: 3490,
    rating: 4.96,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "42mm Case", stock: 15 }
    ],
    colors: [
      { name: "Midnight Black", hex: "#0F172A" },
      { name: "Cognac Brown", hex: "#8B4513" }
    ],
    variations: [
      { id: "var-6-1", combination: { "Color": "Midnight Black", "Strap Material": "Italian Leather" }, price: 4500, salePrice: 3490, stock: 10, inStock: true, sku: "RYC-WTC-MB" },
      { id: "var-6-2", combination: { "Color": "Cognac Brown", "Strap Material": "Italian Leather" }, price: 4500, salePrice: 3490, stock: 5, inStock: true, sku: "RYC-WTC-CB" }
    ],
    attributes: {
      brand: "Rycreo Horology",
      model: "Chrono-Grand 2026",
      watchType: "Chronograph",
      strapMaterial: "Italian Full-Grain Leather",
      caseSize: "42mm Stainless Steel",
      dialColor: "Sunburst Blue / Black",
      movement: "Japanese Miyota Quartz Precision",
      waterResistance: "5ATM (50 Meters)",
      warranty: "2 Years Official Warranty"
    },
    description: "Architectural masterpiece crafted with aerospace-grade 316L stainless steel, anti-scratch sapphire crystal lens, and genuine hand-stitched Italian leather strap.",
    isFeatured: true,
    discountBadge: "22% OFF",
    tag: "Luxury Edition",
    stock: 15,
    trackStock: true,
    createdAt: "2026-09-25T10:00:00.000Z"
  },
  {
    id: "prod-7",
    title: "Rycreo BassPro ANC Wireless Spatial Headphones",
    slug: "rycreo-basspro-anc-wireless-headphones",
    category: "Electronics",
    subcategory: "Audio & Headphones",
    brand: "Rycreo Acoustics",
    sku: "RYC-ELC-007",
    price: 3800,
    salePrice: 2890,
    rating: 4.93,
    reviewCount: 65,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "Universal Over-Ear", stock: 20 }
    ],
    colors: [
      { name: "Matte Black", hex: "#1E293B" },
      { name: "Silver Pearl", hex: "#E2E8F0" }
    ],
    attributes: {
      brand: "Rycreo Acoustics",
      model: "BassPro Max ANC",
      battery: "60 Hours Playtime (800mAh)",
      connectivity: "Bluetooth 5.3 + 3.5mm Aux",
      warranty: "1 Year Replacement Warranty",
      weight: "245g Ultralight Comfort",
      processor: "Dual-Core Audio DSP"
    },
    description: "Hybrid Active Noise Cancellation (-38dB) with 40mm titanium diaphragm drivers delivering studio bass and crystal-clear high fidelities.",
    isFeatured: false,
    discountBadge: "24% OFF",
    tag: "Smart Audio",
    stock: 20,
    trackStock: true,
    createdAt: "2026-09-26T10:00:00.000Z"
  },
  {
    id: "prod-8",
    title: "Rycreo Royal Skeleton Automatic Mechanical Watch",
    slug: "rycreo-royal-skeleton-automatic-watch",
    category: "Watches",
    subcategory: "Automatic",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-008",
    price: 4900,
    salePrice: 3850,
    rating: 4.97,
    reviewCount: 58,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "41mm Case", stock: 24 }
    ],
    colors: [
      { name: "Obsidian Black", hex: "#0F172A", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" },
      { name: "Imperial Rose Gold", hex: "#B76E79", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800" },
      { name: "Sterling Silver Steel", hex: "#C0C0C0", image: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-8-1", combination: { "Color": "Obsidian Black" }, price: 4900, salePrice: 3850, stock: 8, inStock: true, sku: "RYC-WTC-OB" },
      { id: "var-8-2", combination: { "Color": "Imperial Rose Gold" }, price: 4900, salePrice: 3850, stock: 9, inStock: true, sku: "RYC-WTC-RG" },
      { id: "var-8-3", combination: { "Color": "Sterling Silver Steel" }, price: 4900, salePrice: 3850, stock: 7, inStock: true, sku: "RYC-WTC-SS" }
    ],
    attributes: {
      brand: "Rycreo Horology",
      movement: "Self-Winding Automatic 24 Jewels",
      caseMaterial: "316L Solid Stainless Steel",
      glass: "Anti-Scratch Sapphire Crystal",
      waterResistance: "50M (5 ATM)",
      warranty: "2 Years Comprehensive Warranty"
    },
    description: "Exquisite see-through skeleton dial showcasing the rhythmic heartbeat of a 24-jewel automatic movement. Designed for connoisseurs of luxury and refined horology.",
    isFeatured: true,
    discountBadge: "21% OFF",
    tag: "Luxury Automatic",
    stock: 24,
    trackStock: true,
    isFreeShipping: true,
    keywords: ["watch", "ghori", "gori", "automatic watch", "skeleton watch", "men watch", "luxury watch", "leather watch", "steel watch"],
    createdAt: "2026-09-28T10:00:00.000Z"
  },
  {
    id: "prod-9",
    title: "Rycreo Minimalist Ultra-Slim Quartz Dress Watch",
    slug: "rycreo-minimalist-ultra-slim-quartz-watch",
    category: "Watches",
    subcategory: "Minimal Quartz",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-009",
    price: 2600,
    salePrice: 1950,
    rating: 4.91,
    reviewCount: 72,
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "40mm Case", stock: 35 }
    ],
    colors: [
      { name: "Classic Pitch Black", hex: "#000000", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800" },
      { name: "Chestnut Brown Leather", hex: "#8B4513", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800" },
      { name: "Sunburst Emerald Green", hex: "#046307", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-9-1", combination: { "Color": "Classic Pitch Black" }, price: 2600, salePrice: 1950, stock: 12, inStock: true, sku: "RYC-WTC-CPB" },
      { id: "var-9-2", combination: { "Color": "Chestnut Brown Leather" }, price: 2600, salePrice: 1950, stock: 15, inStock: true, sku: "RYC-WTC-CBL" },
      { id: "var-9-3", combination: { "Color": "Sunburst Emerald Green" }, price: 2600, salePrice: 1950, stock: 8, inStock: true, sku: "RYC-WTC-SEG" }
    ],
    attributes: {
      brand: "Rycreo Horology",
      thickness: "6.8mm Ultra Slim Profile",
      strap: "Genuine Top-Grain Italian Calfskin",
      movement: "Swiss Precision Quartz Calibration",
      warranty: "1 Year Official Warranty"
    },
    description: "Modern minimalist Bauhaus-inspired dial with ultra-thin 6.8mm profile. Featherlight comfort designed for boardroom meetings and formal occasions.",
    isFeatured: true,
    discountBadge: "25% OFF",
    tag: "Bestseller",
    stock: 35,
    trackStock: true,
    keywords: ["watch", "ghori", "slim watch", "dress watch", "leather watch", "quartz watch", "men ghori"],
    createdAt: "2026-09-30T10:00:00.000Z"
  },
  {
    id: "prod-10",
    title: "Rycreo Aviator HD Polarized UV400 Sunglasses",
    slug: "rycreo-aviator-hd-polarized-sunglasses",
    category: "Accessories",
    subcategory: "Sunglasses",
    brand: "Rycreo Optics",
    sku: "RYC-SGL-010",
    price: 1850,
    salePrice: 1350,
    rating: 4.95,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "Medium 58mm", stock: 30 }
    ],
    colors: [
      { name: "Polarized Deep Black", hex: "#0F172A", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800" },
      { name: "Royal Gold Gradient", hex: "#D4AF37", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800" },
      { name: "Tortoise Amber Brown", hex: "#8B4513", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-10-1", combination: { "Color": "Polarized Deep Black" }, price: 1850, salePrice: 1350, stock: 12, inStock: true, sku: "RYC-SGL-PDB" },
      { id: "var-10-2", combination: { "Color": "Royal Gold Gradient" }, price: 1850, salePrice: 1350, stock: 10, inStock: true, sku: "RYC-SGL-RGG" },
      { id: "var-10-3", combination: { "Color": "Tortoise Amber Brown" }, price: 1850, salePrice: 1350, stock: 8, inStock: true, sku: "RYC-SGL-TAB" }
    ],
    attributes: {
      lensTechnology: "9-Layer TAC HD Polarized",
      uvProtection: "100% UV400 Protection",
      frameMaterial: "Ultralight Magnesium-Aluminum Alloy",
      accessories: "Hard Leather Case + Microfiber Cleaning Cloth + Polarized Test Card"
    },
    description: "Classic teardrop aviator silhouette engineered with 9-layer TAC polarized lenses that eliminate blinding sun glares and protect against 100% UVA/UVB rays.",
    isFeatured: true,
    discountBadge: "27% OFF",
    tag: "High Demand",
    stock: 30,
    trackStock: true,
    keywords: ["sunglass", "sunglasses", "choshma", "chosma", "chashma", "polarized sunglass", "aviator", "black sunglass", "shades", "goggles"],
    createdAt: "2026-10-01T10:00:00.000Z"
  },
  {
    id: "prod-11",
    title: "Rycreo Wayfarer Classic Streetwear Sunglasses",
    slug: "rycreo-wayfarer-classic-streetwear-sunglasses",
    category: "Accessories",
    subcategory: "Sunglasses",
    brand: "Rycreo Optics",
    sku: "RYC-SGL-011",
    price: 1550,
    salePrice: 1150,
    rating: 4.89,
    reviewCount: 46,
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "Universal Fit 54mm", stock: 25 }
    ],
    colors: [
      { name: "Matte Black", hex: "#1E293B", image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800" },
      { name: "Glossy Jet Black", hex: "#000000", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800" },
      { name: "Leopard Havana Brown", hex: "#7B3F00", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-11-1", combination: { "Color": "Matte Black" }, price: 1550, salePrice: 1150, stock: 10, inStock: true, sku: "RYC-SGL-MB" },
      { id: "var-11-2", combination: { "Color": "Glossy Jet Black" }, price: 1550, salePrice: 1150, stock: 8, inStock: true, sku: "RYC-SGL-GJB" },
      { id: "var-11-3", combination: { "Color": "Leopard Havana Brown" }, price: 1550, salePrice: 1150, stock: 7, inStock: true, sku: "RYC-SGL-LHB" }
    ],
    attributes: {
      lensTechnology: "UV400 Anti-Reflective Glare Shield",
      frameMaterial: "Premium Durable TR90 Acetate",
      accessories: "Protective Magnetic Pouch & Cleaning Cloth"
    },
    description: "Timeless vintage wayfarer silhouette with reinforced metal hinges and lightweight TR90 acetate frames for all-day streetwear versatility.",
    isFeatured: false,
    discountBadge: "26% OFF",
    tag: "Retro Street",
    stock: 25,
    trackStock: true,
    keywords: ["sunglass", "sunglasses", "choshma", "chosma", "chashma", "wayfarer", "retro shades", "black glasses"],
    createdAt: "2026-10-02T10:00:00.000Z"
  },
  {
    id: "prod-12",
    title: "Rycreo AirBuds Pro 2 Hybrid ANC Wireless Earbuds",
    slug: "rycreo-airbuds-pro-2-hybrid-anc-earbuds",
    category: "Electronics",
    subcategory: "Audio & Headphones",
    brand: "Rycreo Acoustics",
    sku: "RYC-ELC-012",
    price: 3500,
    salePrice: 2450,
    rating: 4.95,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1588449668338-d1517689ee76?auto=format&fit=crop&q=80&w=800"
    ],
    sizes: [
      { size: "Universal Fit", stock: 50 }
    ],
    colors: [
      { name: "Pearl White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800" },
      { name: "Obsidian Black", hex: "#1A1A1A", image: "https://images.unsplash.com/photo-1588449668338-d1517689ee76?auto=format&fit=crop&q=80&w=800" }
    ],
    variations: [
      { id: "var-12-1", combination: { "Color": "Pearl White" }, price: 3500, salePrice: 2450, stock: 25, inStock: true, sku: "RYC-AIR2-PW" },
      { id: "var-12-2", combination: { "Color": "Obsidian Black" }, price: 3500, salePrice: 2450, stock: 25, inStock: true, sku: "RYC-AIR2-OB" }
    ],
    attributes: {
      brand: "Rycreo Acoustics",
      model: "AirBuds Pro 2 Hybrid ANC",
      battery: "45 Hours Total Playtime with Case",
      connectivity: "Bluetooth 5.4 Instant Connect",
      waterResistance: "IPX5 Sweat & Water Resistant",
      warranty: "6 Months Replacement Warranty"
    },
    description: "Equipped with advanced Active Noise Cancellation (up to -40dB), spatial audio with dynamic head tracking, and micro-engineered drivers for deep resonant bass.",
    isFeatured: true,
    discountBadge: "30% OFF",
    tag: "Bestseller Gadget",
    stock: 50,
    trackStock: true,
    keywords: ["earbuds", "airbuds", "airpods", "headphone", "earphone", "bluetooth earphone", "rycreo acoustics", "ear phone", "wireless earbud", "wireless headphone"],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-14",
    title: "Rycreo Precision Chronograph Sapphire Watch",
    slug: "rycreo-precision-chronograph-sapphire-watch",
    category: "Watches",
    subcategory: "Luxury Chronograph",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-014",
    price: 4500,
    salePrice: 3490,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#0F172A" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Blue", hex: "#1e40af" }
    ],
    variations: [
        { id: "var-14-1", combination: { "Color": "Black" }, price: 4500, salePrice: 3490, stock: 10, inStock: true, sku: "RYC-WTC-BLK" },
        { id: "var-14-2", combination: { "Color": "Silver" }, price: 4500, salePrice: 3490, stock: 10, inStock: true, sku: "RYC-WTC-SLV" },
        { id: "var-14-3", combination: { "Color": "Blue" }, price: 4500, salePrice: 3490, stock: 10, inStock: true, sku: "RYC-WTC-BLU" }
    ],
    description: "Architectural masterpiece crafted with aerospace-grade 316L stainless steel.",
    stock: 30,
    trackStock: true,
    rating: 4.8,
    reviewCount: 32,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-15",
    title: "Rycreo Minimalist Ultra-Slim Quartz Dress Watch",
    slug: "rycreo-minimalist-ultra-slim-quartz-watch",
    category: "Watches",
    subcategory: "Minimal Quartz",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-015",
    price: 2600,
    salePrice: 1950,
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Blue", hex: "#1e40af" }
    ],
    variations: [
        { id: "var-15-1", combination: { "Color": "Black" }, price: 2600, salePrice: 1950, stock: 10, inStock: true, sku: "RYC-WTC-BLK" },
        { id: "var-15-2", combination: { "Color": "Silver" }, price: 2600, salePrice: 1950, stock: 10, inStock: true, sku: "RYC-WTC-SLV" },
        { id: "var-15-3", combination: { "Color": "Blue" }, price: 2600, salePrice: 1950, stock: 10, inStock: true, sku: "RYC-WTC-BLU" }
    ],
    description: "Modern minimalist Bauhaus-inspired dial.",
    stock: 30,
    trackStock: true,
    rating: 4.7,
    reviewCount: 24,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-16",
    title: "Rycreo Royal Skeleton Automatic Mechanical Watch",
    slug: "rycreo-royal-skeleton-automatic-watch",
    category: "Watches",
    subcategory: "Automatic",
    brand: "Rycreo Horology",
    sku: "RYC-WTC-016",
    price: 4900,
    salePrice: 3850,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#0F172A" },
      { name: "Silver", hex: "#C0C0C0" },
      { name: "Blue", hex: "#1e40af" }
    ],
    variations: [
        { id: "var-16-1", combination: { "Color": "Black" }, price: 4900, salePrice: 3850, stock: 10, inStock: true, sku: "RYC-WTC-SKEL-BLK" },
        { id: "var-16-2", combination: { "Color": "Silver" }, price: 4900, salePrice: 3850, stock: 10, inStock: true, sku: "RYC-WTC-SKEL-SLV" },
        { id: "var-16-3", combination: { "Color": "Blue" }, price: 4900, salePrice: 3850, stock: 10, inStock: true, sku: "RYC-WTC-SKEL-BLU" }
    ],
    description: "Exquisite see-through skeleton dial.",
    stock: 30,
    trackStock: true,
    rating: 4.9,
    reviewCount: 41,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-17",
    title: "Rycreo Aviator HD Polarized Sunglasses",
    slug: "rycreo-aviator-hd-polarized-sunglasses",
    category: "Accessories",
    subcategory: "Sunglasses",
    brand: "Rycreo Optics",
    sku: "RYC-SGL-017",
    price: 1850,
    salePrice: 1350,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Transparent", hex: "#E5E7EB" }
    ],
    variations: [
        { id: "var-17-1", combination: { "Color": "Black" }, price: 1850, salePrice: 1350, stock: 10, inStock: true, sku: "RYC-SGL-AV-BLK" },
        { id: "var-17-2", combination: { "Color": "Brown" }, price: 1850, salePrice: 1350, stock: 10, inStock: true, sku: "RYC-SGL-AV-BRN" },
        { id: "var-17-3", combination: { "Color": "Transparent" }, price: 1850, salePrice: 1350, stock: 10, inStock: true, sku: "RYC-SGL-AV-TRN" }
    ],
    description: "Classic teardrop aviator silhouette.",
    stock: 30,
    trackStock: true,
    rating: 4.8,
    reviewCount: 18,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-18",
    title: "Rycreo Wayfarer Classic Sunglasses",
    slug: "rycreo-wayfarer-classic-sunglasses",
    category: "Accessories",
    subcategory: "Sunglasses",
    brand: "Rycreo Optics",
    sku: "RYC-SGL-018",
    price: 1550,
    salePrice: 1150,
    images: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Transparent", hex: "#E5E7EB" }
    ],
    variations: [
        { id: "var-18-1", combination: { "Color": "Black" }, price: 1550, salePrice: 1150, stock: 10, inStock: true, sku: "RYC-SGL-WF-BLK" },
        { id: "var-18-2", combination: { "Color": "Brown" }, price: 1550, salePrice: 1150, stock: 10, inStock: true, sku: "RYC-SGL-WF-BRN" },
        { id: "var-18-3", combination: { "Color": "Transparent" }, price: 1550, salePrice: 1150, stock: 10, inStock: true, sku: "RYC-SGL-WF-TRN" }
    ],
    description: "Timeless vintage wayfarer silhouette.",
    stock: 30,
    trackStock: true,
    rating: 4.7,
    reviewCount: 15,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-19",
    title: "Rycreo Modern Sport Sunglasses",
    slug: "rycreo-modern-sport-sunglasses",
    category: "Accessories",
    subcategory: "Sunglasses",
    brand: "Rycreo Optics",
    sku: "RYC-SGL-019",
    price: 1350,
    salePrice: 990,
    images: [
      "https://images.unsplash.com/photo-1509395176047-4a6915077541?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Brown", hex: "#8B4513" },
      { name: "Transparent", hex: "#E5E7EB" }
    ],
    variations: [
        { id: "var-19-1", combination: { "Color": "Black" }, price: 1350, salePrice: 990, stock: 10, inStock: true, sku: "RYC-SGL-SP-BLK" },
        { id: "var-19-2", combination: { "Color": "Brown" }, price: 1350, salePrice: 990, stock: 10, inStock: true, sku: "RYC-SGL-SP-BRN" },
        { id: "var-19-3", combination: { "Color": "Transparent" }, price: 1350, salePrice: 990, stock: 10, inStock: true, sku: "RYC-SGL-SP-TRN" }
    ],
    description: "Modern aerodynamic sport silhouette.",
    stock: 30,
    trackStock: true,
    rating: 4.6,
    reviewCount: 12,
    sizes: [],
    createdAt: "2026-10-03T10:00:00.000Z"
  },
  {
    id: "prod-20",
    title: "Premium Combed Cotton Socks 5-Pair Gift Box (প্রিমিয়াম মোজা সেট)",
    slug: "premium-combed-cotton-socks-5-pair-gift-box",
    category: "Accessories",
    subcategory: "Caps",
    brand: "Rycreo Essentials",
    sku: "RYC-SCK-020",
    price: 750,
    salePrice: 540,
    discountBadge: "28% OFF",
    images: [
      "/src/assets/images/upcoming_cotton_socks_1794573189023.jpg",
      "/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg"
    ],
    colors: [
      { name: "Assorted 5-Pair Crew", hex: "#1E293B", image: "/src/assets/images/upcoming_cotton_socks_1794573189023.jpg" },
      { name: "Sport Ankle 5-Pair", hex: "#334155", image: "/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg" }
    ],
    variations: [
      { id: "var-20-1", combination: { "Color": "Assorted 5-Pair Crew" }, price: 750, salePrice: 540, stock: 25, inStock: true, sku: "RYC-SCK-CRW" },
      { id: "var-20-2", combination: { "Color": "Sport Ankle 5-Pair" }, price: 750, salePrice: 540, stock: 25, inStock: true, sku: "RYC-SCK-ANK" }
    ],
    description: "প্রিমিয়াম কম্বেড কটন ৫ জোড়া মোজা সেট। নরম, ঘাম শোষক এবং সারা দিন আরামদায়ক ব্যবহারের জন্য তৈরি।",
    stock: 50,
    trackStock: true,
    rating: 4.9,
    reviewCount: 24,
    soldCount: 19,
    sizes: [{ size: "Free Size (EU 39-44)", stock: 50 }],
    createdAt: "2026-11-10T10:00:00.000Z"
  },
  {
    id: "prod-21",
    title: "Kids Sky Baseball Cap & 3-Pair Cotton Socks Set (বাচ্চাদের টুপি ও মোজা)",
    slug: "kids-sky-baseball-cap-3-pair-cotton-socks-set",
    category: "Clothing",
    subcategory: "Casual Shirts",
    brand: "Rycreo Kids",
    sku: "RYC-KID-021",
    price: 950,
    salePrice: 690,
    discountBadge: "27% OFF",
    images: [
      "/src/assets/images/kids_cap_socks_set_1794573993354.jpg",
      "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg"
    ],
    colors: [
      { name: "Sky Blue Cap Set", hex: "#7DD3FC", image: "/src/assets/images/kids_cap_socks_set_1794573993354.jpg" },
      { name: "Warm Cream Knit Set", hex: "#E7E0D3", image: "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg" }
    ],
    variations: [
      { id: "var-21-1", combination: { "Color": "Sky Blue Cap Set" }, price: 950, salePrice: 690, stock: 18, inStock: true, sku: "RYC-KID-CAP1" },
      { id: "var-21-2", combination: { "Color": "Warm Cream Knit Set" }, price: 950, salePrice: 690, stock: 18, inStock: true, sku: "RYC-KID-CAP2" }
    ],
    description: "বাচ্চাদের জন্য সফট কটন বেসবল ক্যাপ ও ৩ জোড়া আরামদায়ক মোজার কম্বো সেট। রোদ থেকে সুরক্ষা ও নরম ফিট।",
    stock: 36,
    trackStock: true,
    rating: 4.9,
    reviewCount: 17,
    soldCount: 14,
    sizes: [{ size: "2-5 Years", stock: 18 }, { size: "6-9 Years", stock: 18 }],
    createdAt: "2026-11-11T10:00:00.000Z"
  },
  {
    id: "prod-22",
    title: "Pro Goose-Feather Badminton Shuttlecock Tube — 12 Corks (ব্যাডমিন্টনের কর্ক)",
    slug: "pro-goose-feather-badminton-shuttlecock-tube-12-corks",
    category: "Accessories",
    subcategory: "Caps",
    brand: "Rycreo Sports",
    sku: "RYC-SPT-022",
    price: 1250,
    salePrice: 890,
    discountBadge: "29% OFF",
    images: [
      "/src/assets/images/badminton_feather_corks_1794573993654.jpg"
    ],
    colors: [
      { name: "Tournament White (Speed 77)", hex: "#F8FAFC", image: "/src/assets/images/badminton_feather_corks_1794573993654.jpg" }
    ],
    variations: [
      { id: "var-22-1", combination: { "Color": "Tournament White (Speed 77)" }, price: 1250, salePrice: 890, stock: 30, inStock: true, sku: "RYC-SPT-CRK12" }
    ],
    description: "প্রফেশনাল টুর্নামেন্ট গ্রেড হাঁসের পালকের ১২ পিস ব্যাডমিন্টন কর্ক টিউব। নিখুঁত ফ্লাইট ব্যালেন্স ও টেকসই কর্ক হেড।",
    stock: 30,
    trackStock: true,
    rating: 4.8,
    reviewCount: 29,
    soldCount: 22,
    sizes: [{ size: "12-Corks Tube", stock: 30 }],
    createdAt: "2026-11-12T10:00:00.000Z"
  },
  {
    id: "prod-23",
    title: "Borosilicate Airtight Bamboo-Lid Glass Jar 3-Piece Set (কাচের জার)",
    slug: "borosilicate-airtight-bamboo-lid-glass-jar-3-piece-set",
    category: "Home & Living",
    subcategory: "Desk Organization",
    brand: "Rycreo Home",
    sku: "RYC-HOM-023",
    price: 1850,
    salePrice: 1390,
    discountBadge: "25% OFF",
    images: [
      "/src/assets/images/upcoming_glass_jars_1794573190026.jpg",
      "/src/assets/images/glass_spice_jars_set_1794573996251.jpg"
    ],
    colors: [
      { name: "Round 3-Jar Set", hex: "#D6B88D", image: "/src/assets/images/upcoming_glass_jars_1794573190026.jpg" },
      { name: "Square 4-Spice Jar Set", hex: "#B08968", image: "/src/assets/images/glass_spice_jars_set_1794573996251.jpg" }
    ],
    variations: [
      { id: "var-23-1", combination: { "Color": "Round 3-Jar Set" }, price: 1850, salePrice: 1390, stock: 20, inStock: true, sku: "RYC-HOM-JAR3" },
      { id: "var-23-2", combination: { "Color": "Square 4-Spice Jar Set" }, price: 1850, salePrice: 1390, stock: 20, inStock: true, sku: "RYC-HOM-JAR4" }
    ],
    description: "প্রিমিয়াম বোরোসিলিকেট এয়ারটাইট কাচের জার সেট। প্রাকৃতিক ব্যাম্বু ঢাকনা ও সিলিকন সিল—মসলা, মধু, চা-পাতা ও ড্রাই ফুডের জন্য সেরা।",
    stock: 40,
    trackStock: true,
    rating: 4.9,
    reviewCount: 21,
    soldCount: 16,
    sizes: [{ size: "Standard Set", stock: 40 }],
    createdAt: "2026-11-12T12:00:00.000Z"
  },
  {
    id: "prod-24",
    title: "Toddler Knit Pom Beanie & Baby Socks Gift Pack (বাচ্চাদের টুপি ও মোজা)",
    slug: "toddler-knit-pom-beanie-baby-socks-gift-pack",
    category: "Clothing",
    subcategory: "Sweaters & Hoodies",
    brand: "Rycreo Kids",
    sku: "RYC-KID-024",
    price: 890,
    salePrice: 650,
    discountBadge: "27% OFF",
    images: [
      "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg",
      "/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg"
    ],
    colors: [
      { name: "Oatmeal Cream", hex: "#E6DCCA", image: "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg" },
      { name: "Sky Mint Combo", hex: "#BAE6FD", image: "/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg" }
    ],
    variations: [
      { id: "var-24-1", combination: { "Color": "Oatmeal Cream" }, price: 890, salePrice: 650, stock: 22, inStock: true, sku: "RYC-KID-BN1" },
      { id: "var-24-2", combination: { "Color": "Sky Mint Combo" }, price: 890, salePrice: 650, stock: 16, inStock: true, sku: "RYC-KID-BN2" }
    ],
    description: "নবজাতক ও ছোট বাচ্চাদের জন্য আরামদায়ক কেবল-নিট টুপি এবং ২ জোড়া ম্যাচিং কটন মোজার গিফট প্যাক।",
    stock: 38,
    trackStock: true,
    rating: 4.8,
    reviewCount: 15,
    soldCount: 11,
    sizes: [{ size: "0-2 Years", stock: 20 }, { size: "2-4 Years", stock: 18 }],
    createdAt: "2026-11-13T08:00:00.000Z"
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "RYCREO10",
    title: "10% Off Storewide Voucher",
    description: "Enjoy 10% instant discount on any orders over ৳1,000.",
    discountType: "percent",
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    usageLimit: 500,
    usedCount: 38,
    expiryDate: "2026-12-31",
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "coup-2",
    code: "EID20",
    title: "20% Festive & Eid Mega Voucher",
    description: "Special festive discount on traditional fusion & streetwear.",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 2000,
    maxDiscountAmount: 800,
    usageLimit: 200,
    usedCount: 74,
    expiryDate: "2026-11-15",
    active: true,
    createdAt: "2026-09-15T00:00:00.000Z"
  },
  {
    id: "coup-3",
    code: "FLAT300",
    title: "৳300 Flat Cash Discount",
    description: "Flat ৳300 off on shopping carts of ৳2,500 or more.",
    discountType: "fixed",
    discountValue: 300,
    minOrderAmount: 2500,
    usageLimit: 100,
    usedCount: 22,
    expiryDate: "2026-12-31",
    active: true,
    createdAt: "2026-09-20T00:00:00.000Z"
  },
  {
    id: "coup-free-ship",
    code: "FREESHIP",
    title: "100% Free Nationwide Delivery",
    description: "Enjoy zero delivery fee across all districts on orders over ৳1,000.",
    discountType: "fixed",
    discountValue: 0,
    minOrderAmount: 1000,
    isFreeDelivery: true,
    usageLimit: 500,
    usedCount: 19,
    expiryDate: "2026-12-31",
    active: true,
    createdAt: "2026-10-01T00:00:00.000Z"
  },
  {
    id: "coup-4",
    code: "WELCOME50",
    title: "৳50 First Order Voucher",
    description: "Special welcome gift for all new shoppers.",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 500,
    usageLimit: 1000,
    usedCount: 145,
    expiryDate: "2026-12-31",
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    productTitle: "Royal Festive Edition Fusion Mandarin Kurta Shirt",
    customerName: "Tanvir Hasan",
    rating: 5,
    comment: "The fabric quality of this Kurta is unbelievable! Perfect fitting for Eid and festival celebrations. Everyone complimented the royal stitching.",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=400"
    ],
    status: "approved",
    createdAt: "2026-09-18T14:30:00.000Z"
  },
  {
    id: "rev-2",
    productId: "prod-2",
    productTitle: "Premium Cotton Chino Pants & Cargo Denim",
    customerName: "Mahmudur Rahman",
    rating: 5,
    comment: "Best chino pants in Dhaka. Stretchable and durable, pockets are very tactical and comfortable.",
    status: "approved",
    createdAt: "2026-09-21T10:15:00.000Z"
  },
  {
    id: "rev-3",
    productId: "prod-4",
    productTitle: "Oversized Graphic Streetwear Drop-Shoulder T-Shirt",
    customerName: "Sakib Al Amin",
    rating: 5,
    comment: "Heavyweight 240 GSM cotton feels exactly like international streetwear brands. Highly recommended!",
    status: "approved",
    createdAt: "2026-09-24T18:40:00.000Z"
  }
];

export const INITIAL_QUICK_CATEGORIES: QuickCategoryShortcut[] = [
  {
    id: "qc-1",
    name: "Festive & Premium",
    label: "Festive Drops",
    icon: "✨",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=200",
    tag: "HOT",
    colorGradient: "from-amber-500 to-amber-700",
    targetCategory: "Festive & Premium",
    active: true,
    order: 1
  },
  {
    id: "qc-2",
    name: "Drop-Shoulder",
    label: "Drop-Shoulder",
    icon: "👕",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=200",
    tag: "TRENDING",
    colorGradient: "from-sky-500 to-indigo-600",
    targetCategory: "Drop-Shoulder",
    active: true,
    order: 2
  },
  {
    id: "qc-3",
    name: "Pants",
    label: "Chino Pants",
    icon: "👖",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=200",
    tag: "BESTSELLER",
    colorGradient: "from-slate-700 to-slate-900",
    targetCategory: "Pants",
    active: true,
    order: 3
  },
  {
    id: "qc-4",
    name: "Polo T-Shirts",
    label: "Luxe Polos",
    icon: "👔",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=200",
    tag: "CLASSIC",
    colorGradient: "from-blue-600 to-indigo-700",
    targetCategory: "Polo T-Shirts",
    active: true,
    order: 4
  },
  {
    id: "qc-5",
    name: "Watches",
    label: "Timepieces",
    icon: "⌚",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200",
    tag: "LUXURY",
    colorGradient: "from-emerald-600 to-teal-800",
    targetCategory: "Watches",
    active: true,
    order: 5
  },
  {
    id: "qc-6",
    name: "Electronics",
    label: "Smart Gadgets",
    icon: "🎧",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200",
    tag: "GADGETS",
    colorGradient: "from-purple-600 to-pink-600",
    targetCategory: "Electronics",
    active: true,
    order: 6
  },
  {
    id: "qc-7",
    name: "Sweaters & Hoodies",
    label: "Hoodies & Fleece",
    icon: "🧥",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=200",
    tag: "WINTER",
    colorGradient: "from-rose-600 to-orange-600",
    targetCategory: "Sweaters & Hoodies",
    active: true,
    order: 7
  }
];

export const INITIAL_PREORDER_PRODUCTS: PreOrderProduct[] = [
  {
    id: "pre-prod-1",
    title: "Rycreo Apex Titanium GPS Smartwatch (2026 Edition)",
    category: "Watches",
    price: 6500,
    salePrice: 4990,
    advanceAmount: 500,
    images: ["/src/assets/images/preorder_smartwatch_pro_1794543635576.jpg"],
    description: "AMOLED always-on sapphire display, 14-day battery life, dual-band GPS, and titanium unibody frame. Reserve your unit before the first Dhaka shipment arrives.",
    colors: ["Matte Black", "Titanium Silver"],
    sizes: ["44mm", "46mm"],
    weWillGetText: "20 দিনের মধ্যে",
    youWillGetText: "25 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 1,
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "pre-prod-2",
    title: "Studio Pro Hybrid ANC Wireless Headphones",
    category: "Electronics",
    price: 5400,
    salePrice: 4250,
    advanceAmount: 400,
    images: ["/src/assets/images/preorder_anc_headphones_1794543635863.jpg"],
    description: "48dB active noise cancellation, spatial audio drivers, 60-hour USB-C playback, and memory-foam ear cushions.",
    colors: ["Brushed Silver", "Obsidian Gray"],
    sizes: ["Standard"],
    weWillGetText: "15 দিনের মধ্যে",
    youWillGetText: "",
    isVisible: true,
    position: 2,
    createdAt: "2026-11-02T10:00:00.000Z"
  },
  {
    id: "pre-prod-3",
    title: "Nordic Suede Low-Top Court Sneakers",
    category: "Clothing",
    price: 3800,
    salePrice: 2950,
    advanceAmount: 300,
    images: ["/src/assets/images/preorder_sneakers_minimal_1794543635858.jpg"],
    description: "Hand-stitched suede and full-grain leather upper with cushioned EVA outsole for all-day urban comfort.",
    colors: ["Chalk Slate"],
    sizes: ["40", "41", "42", "43", "44"],
    weWillGetText: "",
    youWillGetText: "",
    isVisible: true,
    position: 3,
    createdAt: "2026-11-03T10:00:00.000Z"
  },
  {
    id: "pre-prod-4",
    title: "Atelier Luxe Pique Dual-Tone Travel Polo Set",
    category: "Polo T-Shirts",
    price: 2600,
    salePrice: 1990,
    advanceAmount: 200,
    images: ["/src/assets/images/buymore_polo_combo_1794543636471.jpg"],
    description: "240 GSM combed organic cotton pique with tailored collar and breathable summer weave.",
    colors: ["Navy & Ivory"],
    sizes: ["M", "L", "XL", "XXL"],
    weWillGetText: "18 দিনের মধ্যে",
    youWillGetText: "22 দিনের মধ্যে হাতে পাবেন",
    isVisible: true,
    position: 4,
    createdAt: "2026-11-04T10:00:00.000Z"
  },
  {
    id: "pre-prod-5",
    title: "Heritage Full-Grain Leather Belt & Wallet Box",
    category: "Accessories",
    price: 3200,
    salePrice: 2450,
    advanceAmount: 250,
    images: ["/src/assets/images/buymore_leather_combo_1794543635554.jpg"],
    description: "Vegetable-tanned genuine leather bifold wallet paired with a solid brushed-steel buckle belt in gift packaging.",
    colors: ["Espresso Brown"],
    sizes: ["Standard"],
    weWillGetText: "20 দিনের মধ্যে",
    youWillGetText: "",
    isVisible: true,
    position: 5,
    createdAt: "2026-11-05T10:00:00.000Z"
  },
  {
    id: "pre-prod-6",
    title: "Premium Breathable Combed Cotton Socks Set (5-Pair Box)",
    category: "Accessories",
    price: 750,
    salePrice: 550,
    advanceAmount: 100,
    images: ["/src/assets/images/upcoming_cotton_socks_1794573189023.jpg"],
    description: "প্রিমিয়াম কম্বেড কটন ৫ জোড়া মোজা সেট। নরম, ঘাম শোষক এবং সারা দিন আরামদায়ক ব্যবহারের জন্য উপযোগী। অফিস, স্পোর্টস ও দৈনন্দিন ব্যবহারের সেরা কম্বো বক্স।",
    colors: ["Assorted 5-Pair Box", "Navy & Charcoal"],
    sizes: ["Free Size (EU 39-44)"],
    weWillGetText: "10 দিনের মধ্যে",
    youWillGetText: "14 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 6,
    createdAt: "2026-11-06T10:00:00.000Z"
  },
  {
    id: "pre-prod-7",
    title: "Kids Ultra-Soft Cotton 3-Piece Combo Set (বাচ্চাদের কম্বো সেট)",
    category: "Clothing",
    price: 1450,
    salePrice: 1090,
    advanceAmount: 200,
    images: ["/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg"],
    description: "বাচ্চাদের জন্য ১০০% নরম কটন ৩-পিস কম্বো সেট (টি-শার্ট, কম্ফোর্ট শর্টস এবং ম্যাচিং মোজা)। শিশুর ত্বকের জন্য সম্পূর্ণ নিরাপদ ও আরামদায়ক গ্রীষ্মকালীন পোশাক সেট।",
    colors: ["Sky Blue", "Mint Green", "Warm Cream"],
    sizes: ["1-2 Years", "2-3 Years", "4-5 Years", "6-7 Years"],
    weWillGetText: "12 দিনের মধ্যে",
    youWillGetText: "16 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 7,
    createdAt: "2026-11-07T10:00:00.000Z"
  },
  {
    id: "pre-prod-8",
    title: "Borosilicate Airtight Bamboo-Lid Glass Jar Set (কাচের জার ৩-পিস)",
    category: "Home & Living",
    price: 1850,
    salePrice: 1390,
    advanceAmount: 200,
    images: ["/src/assets/images/upcoming_glass_jars_1794573190026.jpg"],
    description: "হাই-গ্রেড বোরোসিলিকেট এয়ারটাইট কাচের জার ৩-পিস সেট। ন্যাচারাল ব্যাম্বু ঢাকনা ও সিলিকন রিং সমৃদ্ধ—ড্রাই ফুড, মসলা, চা-পাতা ও কফি দীর্ঘদিন সতেজ রাখার জন্য আদর্শ।",
    colors: ["Crystal Clear & Bamboo"],
    sizes: ["3-Jar Set (500ml + 900ml + 1400ml)"],
    weWillGetText: "14 দিনের মধ্যে",
    youWillGetText: "18 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 8,
    createdAt: "2026-11-08T10:00:00.000Z"
  },
  {
    id: "pre-prod-9",
    title: "Tournament Speed-77 Feather Badminton Corks (ব্যাডমিন্টনের কর্ক ১২ পিস)",
    category: "Accessories",
    price: 1450,
    salePrice: 1050,
    advanceAmount: 150,
    images: ["/src/assets/images/badminton_feather_corks_1794573993654.jpg"],
    description: "টুর্নামেন্ট কোয়ালিটি প্রিমিয়াম গুজ ফেদার ব্যাডমিন্টন শাটলকক (১২ পিস টিউব)। ইনডোর ও আউটডোর খেলার জন্য দারুণ স্ট্যাবিলিটি ও ডুরেবিলিটি।",
    colors: ["Classic Tournament White"],
    sizes: ["12-Shuttlecock Tube"],
    weWillGetText: "8 দিনের মধ্যে",
    youWillGetText: "11 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 9,
    createdAt: "2026-11-09T10:00:00.000Z"
  },
  {
    id: "pre-prod-10",
    title: "Kids Breathable Sun Cap & Star Socks 4-Piece Pack (বাচ্চাদের টুপি ও মোজা)",
    category: "Clothing",
    price: 980,
    salePrice: 720,
    advanceAmount: 120,
    images: ["/src/assets/images/kids_cap_socks_set_1794573993354.jpg"],
    description: "স্কাই-ব্লু কটন বেসবল ক্যাপ এবং ৩ জোড়া ম্যাচিং স্টার প্যাটার্ন মোজা—বাচ্চাদের আউটডোর ও স্কুলের জন্য আরামদায়ক কম্বো।",
    colors: ["Sky Blue & Cream"],
    sizes: ["2-5 Years", "6-9 Years"],
    weWillGetText: "10 দিনের মধ্যে",
    youWillGetText: "14 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 10,
    createdAt: "2026-11-10T10:00:00.000Z"
  },
  {
    id: "pre-prod-11",
    title: "4-Piece Square Borosilicate Glass Spice & Honey Jars (কাচের স্পাইস জার)",
    category: "Home & Living",
    price: 1550,
    salePrice: 1190,
    advanceAmount: 150,
    images: ["/src/assets/images/glass_spice_jars_set_1794573996251.jpg"],
    description: "মসলা, মধু, পিংক সল্ট ও গোলমরিচ সংরক্ষণের জন্য ৪ পিস স্কয়ার এয়ারটাইট কাচের জার ও ব্যাম্বু ঢাকনা সেট।",
    colors: ["Clear Glass & Natural Bamboo"],
    sizes: ["4-Jar Pantry Pack"],
    weWillGetText: "12 দিনের মধ্যে",
    youWillGetText: "16 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 11,
    createdAt: "2026-11-11T10:00:00.000Z"
  },
  {
    id: "pre-prod-12",
    title: "Breathable Mesh Cushion Ankle Sport Socks 5-Pair Pack (স্পোর্টস মোজা)",
    category: "Accessories",
    price: 690,
    salePrice: 490,
    advanceAmount: 100,
    images: ["/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg"],
    description: "রানিং, ব্যাডমিন্টন ও জিমের জন্য এন্টি-ব্লিস্টার হিল ট্যাব ও ব্রেদেবল মেশ কটন অ্যাংকেল মোজা (৫ জোড়া)।",
    colors: ["5-Color Sport Pack"],
    sizes: ["Free Size (EU 39-44)"],
    weWillGetText: "9 দিনের মধ্যে",
    youWillGetText: "12 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 12,
    createdAt: "2026-11-12T10:00:00.000Z"
  },
  {
    id: "pre-prod-13",
    title: "Baby Cable-Knit Pom Beanie & Anti-Slip Socks Combo (বাচ্চাদের শীতের টুপি ও মোজা)",
    category: "Clothing",
    price: 920,
    salePrice: 680,
    advanceAmount: 120,
    images: ["/src/assets/images/kids_beanie_socks_set_1794573994095.jpg"],
    description: "শিশুর ত্বকের জন্য অতিরিক্ত নরম কেবল-নিট পমপম টুপি ও ২ জোড়া এন্টি-স্লিপ বেবি মোজা সেট।",
    colors: ["Warm Oatmeal Beige"],
    sizes: ["0-2 Years", "2-4 Years"],
    weWillGetText: "11 দিনের মধ্যে",
    youWillGetText: "15 দিনের মধ্যে ডেলিভারি",
    isVisible: true,
    position: 13,
    createdAt: "2026-11-13T10:00:00.000Z"
  }
];

export const INITIAL_BUYMORE_OFFERS: BuyMoreOffer[] = [
  {
    id: "bogo-1",
    title: "Buy 1 Signature Navy Polo, Get 1 Ivory Polo Free",
    badgeText: "Buy 1 Get 1 Free",
    offerType: "bogo",
    mainProductTitle: "Signature Navy Pique Polo Shirt",
    mainProductImage: "/src/assets/images/buymore_polo_combo_1794543636471.jpg",
    images: ["/src/assets/images/buymore_polo_combo_1794543636471.jpg"],
    buyQuantity: 1,
    price: 1350,
    regularValue: 2700,
    freeItems: [
      {
        id: "free-1",
        title: "Classic Ivory Pique Polo Shirt",
        image: "/src/assets/images/buymore_polo_combo_1794543636471.jpg",
        quantity: 1,
        value: 1350
      }
    ],
    description: "Order 1 Signature Navy Pique Polo Shirt and receive 1 Classic Ivory Pique Polo Shirt completely free in the same parcel.",
    voucherCode: "BOGO2026",
    isVisible: true,
    position: 1,
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "bogo-2",
    title: "Buy Leather Belt, Get Genuine Leather Wallet Free",
    badgeText: "Buy 1 Get Gift",
    offerType: "free_gift",
    mainProductTitle: "Espresso Full-Grain Leather Belt",
    mainProductImage: "/src/assets/images/buymore_leather_combo_1794543635554.jpg",
    images: ["/src/assets/images/buymore_leather_combo_1794543635554.jpg"],
    buyQuantity: 1,
    price: 1490,
    regularValue: 2690,
    freeItems: [
      {
        id: "free-2",
        title: "Matching Espresso Leather Bifold Wallet",
        image: "/src/assets/images/buymore_leather_combo_1794543635554.jpg",
        quantity: 1,
        value: 1200
      }
    ],
    description: "Purchase the handcrafted Espresso Full-Grain Leather Belt and get the matching Bifold Wallet free as a bonus gift.",
    voucherCode: "GIFTPAIR",
    isVisible: true,
    position: 2,
    createdAt: "2026-11-02T10:00:00.000Z"
  },
  {
    id: "bogo-3",
    title: "Buy Titanium Smartwatch, Get ANC Headphones at Bonus Deal",
    badgeText: "Buy 1 Get More",
    offerType: "buy_more_get_more",
    mainProductTitle: "Rycreo Titanium Smartwatch",
    mainProductImage: "/src/assets/images/preorder_smartwatch_pro_1794543635576.jpg",
    images: ["/src/assets/images/preorder_smartwatch_pro_1794543635576.jpg"],
    buyQuantity: 1,
    price: 5490,
    regularValue: 8900,
    freeItems: [
      {
        id: "free-3",
        title: "Extra Sport Silicone Strap + Magnetic Fast Dock",
        image: "/src/assets/images/preorder_smartwatch_pro_1794543635576.jpg",
        quantity: 2,
        value: 1400
      }
    ],
    description: "Includes the Titanium Smartwatch plus 2 complimentary accessories: Extra Fluoroelastomer Sport Strap and Magnetic Fast Charging Dock.",
    voucherCode: "MOREGEAR",
    isVisible: true,
    position: 3,
    createdAt: "2026-11-03T10:00:00.000Z"
  },
  {
    id: "bogo-4",
    title: "Buy Court Sneakers, Get 2 Pairs Cotton Crew Socks Free",
    badgeText: "Buy 1 Get 2 Free",
    offerType: "buy_more_get_more",
    mainProductTitle: "Nordic Suede Court Sneakers",
    mainProductImage: "/src/assets/images/preorder_sneakers_minimal_1794543635858.jpg",
    images: ["/src/assets/images/preorder_sneakers_minimal_1794543635858.jpg"],
    buyQuantity: 1,
    price: 2950,
    regularValue: 3550,
    freeItems: [
      {
        id: "free-4",
        title: "Combed Cotton Crew Socks (2 Pairs) + Shoe Care Brush",
        image: "/src/assets/images/preorder_sneakers_minimal_1794543635858.jpg",
        quantity: 2,
        value: 600
      }
    ],
    description: "Every pair of Nordic Suede Court Sneakers comes with 2 pairs of breathable cotton crew socks and a suede care brush.",
    isVisible: true,
    position: 4,
    createdAt: "2026-11-04T10:00:00.000Z"
  },
  {
    id: "bogo-5",
    title: "Buy 5-Pair Cotton Socks Box, Get 2 Ankle Sport Socks Free (মোজা অফার)",
    badgeText: "Buy 5 Get 2 Free",
    offerType: "buy_more_get_more",
    mainProductTitle: "Combed Cotton Crew Socks 5-Pair Box",
    mainProductImage: "/src/assets/images/upcoming_cotton_socks_1794573189023.jpg",
    images: [
      "/src/assets/images/upcoming_cotton_socks_1794573189023.jpg",
      "/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg"
    ],
    buyQuantity: 1,
    price: 650,
    regularValue: 1050,
    freeItems: [
      {
        id: "free-5",
        title: "Breathable Sport Ankle Socks (2 Pairs)",
        image: "/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg",
        quantity: 2,
        value: 400
      }
    ],
    description: "৫ জোড়া কম্বেড কটন ক্রু মোজা বক্স অর্ডার করলেই সাথে ২ জোড়া স্পোর্টস অ্যাংকেল মোজা একদম ফ্রি!",
    voucherCode: "SOCKS2FREE",
    isVisible: true,
    position: 5,
    createdAt: "2026-11-05T10:00:00.000Z"
  },
  {
    id: "bogo-6",
    title: "Buy Feather Badminton Cork Tube (12pcs), Get 3 Extra Corks Free",
    badgeText: "Buy 12 Get 3 Free",
    offerType: "buy_more_get_more",
    mainProductTitle: "Pro Goose-Feather Badminton Shuttlecock Tube",
    mainProductImage: "/src/assets/images/badminton_feather_corks_1794573993654.jpg",
    images: ["/src/assets/images/badminton_feather_corks_1794573993654.jpg"],
    buyQuantity: 1,
    price: 990,
    regularValue: 1450,
    freeItems: [
      {
        id: "free-6",
        title: "3x Extra Tournament Feather Shuttlecocks",
        image: "/src/assets/images/badminton_feather_corks_1794573993654.jpg",
        quantity: 3,
        value: 460
      }
    ],
    description: "১২ পিসের ব্যাডমিন্টন ফেদার কর্ক টিউব নিলে সাথে ৩ পিস এক্সট্রা টুর্নামেন্ট কর্ক একদম ফ্রি!",
    isVisible: true,
    position: 6,
    createdAt: "2026-11-06T10:00:00.000Z"
  },
  {
    id: "bogo-7",
    title: "Buy 3-Piece Bamboo Glass Jar Set, Get 1 Square Spice Jar Free (কাচের জার)",
    badgeText: "Buy 3 Get 1 Free",
    offerType: "bogo",
    mainProductTitle: "3-Piece Borosilicate Bamboo Glass Jar Set",
    mainProductImage: "/src/assets/images/upcoming_glass_jars_1794573190026.jpg",
    images: [
      "/src/assets/images/upcoming_glass_jars_1794573190026.jpg",
      "/src/assets/images/glass_spice_jars_set_1794573996251.jpg"
    ],
    buyQuantity: 1,
    price: 1450,
    regularValue: 1950,
    freeItems: [
      {
        id: "free-7",
        title: "1x Airtight Square Glass Spice & Honey Jar",
        image: "/src/assets/images/glass_spice_jars_set_1794573996251.jpg",
        quantity: 1,
        value: 500
      }
    ],
    description: "৩-পিস এয়ারটাইট কাচের জার সেটের সাথে ১টি স্কয়ার ব্যাম্বু-লিড স্পাইস জার একদম ফ্রি পাচ্ছেন।",
    isVisible: true,
    position: 7,
    createdAt: "2026-11-07T10:00:00.000Z"
  },
  {
    id: "bogo-8",
    title: "Buy Kids Baseball Cap & Socks Set, Get Baby Knit Socks Free (বাচ্চাদের সেট)",
    badgeText: "Buy 1 Get Gift",
    offerType: "free_gift",
    mainProductTitle: "Kids Sky Baseball Cap & 3-Pair Cotton Socks",
    mainProductImage: "/src/assets/images/kids_cap_socks_set_1794573993354.jpg",
    images: [
      "/src/assets/images/kids_cap_socks_set_1794573993354.jpg",
      "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg"
    ],
    buyQuantity: 1,
    price: 750,
    regularValue: 1120,
    freeItems: [
      {
        id: "free-8",
        title: "2 Pairs Cozy Baby Patterned Crew Socks",
        image: "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg",
        quantity: 2,
        value: 370
      }
    ],
    description: "বাচ্চাদের ক্যাপ ও ৩ জোড়া মোজার সেট কিনলেই সাথে ২ জোড়া বেবি কটন মোজা গিফট ফ্রি!",
    isVisible: true,
    position: 8,
    createdAt: "2026-11-08T10:00:00.000Z"
  },
  {
    id: "bogo-9",
    title: "Buy Kids 3-Piece Cotton Combo, Get Knit Beanie & 2 Socks Free",
    badgeText: "Combo + 2 Gifts",
    offerType: "buy_more_get_more",
    mainProductTitle: "Kids Ultra-Soft Cotton 3-Piece Combo Set",
    mainProductImage: "/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg",
    images: [
      "/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg",
      "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg"
    ],
    buyQuantity: 1,
    price: 1190,
    regularValue: 1790,
    freeItems: [
      {
        id: "free-9",
        title: "Toddler Cable-Knit Beanie Hat + 2 Baby Socks",
        image: "/src/assets/images/kids_beanie_socks_set_1794573994095.jpg",
        quantity: 1,
        value: 600
      }
    ],
    description: "বাচ্চাদের ৩-পিস কটন কম্বো সেটের সাথে সফট নিট টুপি ও ২ জোড়া বেবি মোজা ফ্রি বোনাস গিফট।",
    isVisible: true,
    position: 9,
    createdAt: "2026-11-09T10:00:00.000Z"
  }
];

export const INITIAL_BUYMORE_VOUCHERS: BuyMoreVoucher[] = [
  {
    id: "bmv-1",
    code: "BOGO2026",
    title: "Buy 1 Get 1 Free Polo Voucher",
    description: "Buy any 1 signature polo deal and claim an extra polo shirt free.",
    minBuyQty: 1,
    freeQty: 1,
    freeProductNote: "1x Classic Ivory Polo Free",
    discountPercent: 0,
    isVisible: true,
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "bmv-2",
    code: "GIFTPAIR",
    title: "Complimentary Wallet Gift Voucher",
    description: "Unlocked automatically on leather accessories combo orders.",
    minBuyQty: 1,
    freeQty: 1,
    freeProductNote: "1x Espresso Bifold Wallet Free",
    discountPercent: 5,
    isVisible: true,
    createdAt: "2026-11-02T10:00:00.000Z"
  },
  {
    id: "bmv-3",
    code: "MOREGEAR",
    title: "2 Free Accessories Bundle Voucher",
    description: "Get 2 complimentary smart accessories with watch bundle orders.",
    minBuyQty: 1,
    freeQty: 2,
    freeProductNote: "Extra Strap + Charging Dock Free",
    discountPercent: 0,
    isVisible: true,
    createdAt: "2026-11-03T10:00:00.000Z"
  }
];


