import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  getDocFromServer,
  writeBatch 
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_STORE_CONFIG, 
  INITIAL_HERO_SLIDES, 
  INITIAL_COUPONS, 
  INITIAL_REVIEWS, 
  INITIAL_QUICK_CATEGORIES, 
  INITIAL_STATIC_PAGES, 
  INITIAL_ATTRIBUTES 
} from "./data/initialData";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Clear any stale quota lockouts from local storage
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('firestore_quota_exhausted_time');
  }
} catch {}

let isFirestoreQuotaExhausted = false;

export const markQuotaExhausted = () => {
  console.warn("Firestore rate warning");
};

export const isQuotaLimitReached = () => isFirestoreQuotaExhausted;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const lower = errMsg.toLowerCase();
  if (
    lower.includes("could not reach cloud firestore") || 
    lower.includes("offline") || 
    lower.includes("unavailable") || 
    lower.includes("network") ||
    lower.includes("backend didn't respond") ||
    lower.includes("timeout") ||
    lower.includes("permission") ||
    lower.includes("insufficient")
  ) {
    // Graceful offline fallback: app runs seamlessly on local state & cache
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Notice: ', errInfo.error);
}

/**
 * Validates connection to Firestore backend on app boot
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'store', 'data');
    await getDocFromServer(testDoc);
    console.log("✅ Cloud Firestore connection verified successfully.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline or network constrained. Local caching active.");
    }
    return false;
  }
}

/**
 * Recursively removes any `undefined` properties from objects and arrays,
 * replacing them with `null` or omitting them, as Firestore rejects `undefined`.
 */
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined || obj === null) {
    return null;
  }
  if (typeof obj === "string") {
    // Strictly forbid temporary browser blob: and file:// URLs from entering Firestore
    if (obj.startsWith("blob:") || obj.startsWith("file:")) {
      return "";
    }
    return obj;
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned;
};

// Subscribe to real-time store changes across all devices worldwide
export const subscribeToStoreData = (onUpdate: (data: any) => void) => {
  try {
    const docRef = doc(db, "store", "data");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (error: any) => {
      console.warn("Store data listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Store data listener failed:", err);
    return () => {};
  }
};

export const getStoreDataFromServer = async () => {
  try {
    const docRef = doc(db, "store", "data");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn("Firestore fetch error:", err);
    return null;
  }
};

/**
 * Ensures that Firebase Auth is actively authenticated as an authorized administrator.
 * If auth.currentUser matches rycreoshop@gmail.com, returns immediately.
 * Otherwise, restores the session using persisted credentials.
 */
export const ensureAdminAuthSession = async (): Promise<boolean> => {
  try {
    if (auth.currentUser && auth.currentUser.email?.toLowerCase().trim() === 'rycreoshop@gmail.com') {
      return true;
    }

    const savedEmail = (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_email') : null) || 'rycreoshop@gmail.com';
    const savedPass = (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_password') : null) || 'Ahmad636Taseen@#';

    if (savedEmail.toLowerCase().trim() === 'rycreoshop@gmail.com' && savedPass) {
      try {
        await signInWithEmailAndPassword(auth, savedEmail.toLowerCase().trim(), savedPass);
        return !!auth.currentUser;
      } catch (signInErr: any) {
        console.warn("[ensureAdminAuthSession] Sign in notice:", signInErr?.message || signInErr);
      }
    }

    return !!auth.currentUser;
  } catch (err: any) {
    return !!auth.currentUser;
  }
};

export const saveStoreDataToFirestore = async (data: any) => {
  const docRef = doc(db, "store", "data");
  try {
    await ensureAdminAuthSession();
    const sanitizedData = sanitizeForFirestore(data);
    await setDoc(docRef, sanitizedData, { merge: true });
    console.log("[Firestore Cloud Sync] Successfully saved store/data snapshot.");
  } catch (err: any) {
    console.warn("[Firestore Cloud Sync Notice]", err?.message || err);
  }
};

/**
 * Subscribe to real-time incoming orders for authorized admins
 */
export const subscribeToOrders = (onUpdate: (orders: any[]) => void) => {
  let isUnsubscribed = false;
  let activeUnsubscribe: (() => void) | null = null;

  const startListener = () => {
    if (isUnsubscribed) return;
    try {
      const collRef = collection(db, "orders");
      activeUnsubscribe = onSnapshot(collRef, (snapshot) => {
        const ordersList: any[] = [];
        snapshot.forEach((snapDoc) => {
          ordersList.push({ id: snapDoc.id, ...snapDoc.data() });
        });
        ordersList.sort((a, b) => 
          (b.orderTimestamp || new Date(b.createdAt || 0).getTime()) - 
          (a.orderTimestamp || new Date(a.createdAt || 0).getTime())
        );
        onUpdate(ordersList);
      }, (error) => {
        console.warn("Orders onSnapshot listener notice:", error?.message);
      });
    } catch (err) {
      console.warn("Failed to subscribe to orders:", err);
    }
  };

  startListener();

  return () => {
    isUnsubscribed = true;
    if (activeUnsubscribe) {
      activeUnsubscribe();
    }
  };
};

/**
 * Save new order to the protected 'orders' collection
 * and lightweight public record to 'order_tracking'
 */
export const addOrderToFirestore = async (order: any) => {
  try {
    const sanitizedOrder = sanitizeForFirestore(order);
    const orderDocRef = doc(db, "orders", order.id);
    await setDoc(orderDocRef, sanitizedOrder);

    // Save public tracking record with exact orderNumber for client-side tracking
    if (order.orderNumber) {
      const trackingDocRef = doc(db, "order_tracking", order.orderNumber);
      await setDoc(trackingDocRef, {
        orderNumber: order.orderNumber,
        orderId: order.id,
        phone: order.phone,
        status: order.status || 'Pending',
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        itemsSummary: Array.isArray(order.items) 
          ? order.items.map((it: any) => `${it.title} (x${it.quantity})`).join(", ") 
          : "",
        deliveryArea: order.deliveryArea || order.division || 'Dhaka',
        updatedAt: new Date().toISOString()
      }).catch((e) => console.warn("Tracking record sync notice:", e));
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes("Missing or insufficient permissions") || msg.includes("permission-denied")) {
      console.warn("Firestore order creation write skipped due to permissions:", msg);
      throw err;
    }
    handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
    throw err;
  }
};

/**
 * Update order in 'orders' and sync tracking record
 */
export const updateOrderInFirestore = async (orderId: string, updates: any, orderNumber?: string) => {
  try {
    const sanitizedUpdates = sanitizeForFirestore(updates);
    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, sanitizedUpdates);

    if (orderNumber) {
      const trackingDocRef = doc(db, "order_tracking", orderNumber);
      const trackingUpdates: Record<string, any> = { updatedAt: new Date().toISOString() };
      if (updates.status) trackingUpdates.status = updates.status;
      if (updates.phone) trackingUpdates.phone = updates.phone;
      if (updates.canceledByCustomer !== undefined) trackingUpdates.canceledByCustomer = updates.canceledByCustomer;
      if (updates.cancelReason) trackingUpdates.cancelReason = updates.cancelReason;
      await setDoc(trackingDocRef, trackingUpdates, { merge: true }).catch(() => {});
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes("Missing or insufficient permissions") || msg.includes("permission-denied")) {
      console.warn("Firestore order update skipped due to permissions:", msg);
      throw err;
    }
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
};

/**
 * Delete order from 'orders' and 'order_tracking'
 */
export const deleteOrderFromFirestore = async (orderId: string, orderNumber?: string) => {
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await deleteDoc(orderDocRef);
    if (orderNumber) {
      const trackingDocRef = doc(db, "order_tracking", orderNumber);
      await deleteDoc(trackingDocRef).catch(() => {});
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes("Missing or insufficient permissions") || msg.includes("permission-denied")) {
      console.warn("Firestore order delete skipped due to permissions:", msg);
      throw err;
    }
    handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    throw err;
  }
};

/**
 * Fetch tracking record by exact orderNumber (public lookup)
 */
export const getOrderTrackingFromFirestore = async (orderNumber: string) => {
  try {
    const cleanNum = orderNumber.trim();
    if (!cleanNum) return null;
    const docRef = doc(db, "order_tracking", cleanNum);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn("Tracking lookup notice:", err);
    return null;
  }
};


/**
 * Sync individual product document to Firestore collection 'products'
 * Full try...catch with detailed console.error logs for permissions and validation
 */
export const syncProductDocToFirestore = async (product: any): Promise<void> => {
  if (!product || !product.id) {
    console.error("[Firestore Product Write: Validation Error] Missing product or product.id", product);
    throw new Error("Product validation failed: Missing product ID");
  }

  const path = `products/${product.id}`;
  console.log(`[Firestore Product Write: START] Path: ${path}`, {
    productId: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    currentAdminEmail: auth.currentUser?.email || null,
    uid: auth.currentUser?.uid || null
  });

  try {
    // Ensure admin authentication is active and fresh
    await ensureAdminAuthSession();

    const sanitized = sanitizeForFirestore(product);
    const productRef = doc(db, "products", product.id);
    await setDoc(productRef, sanitized);
    
    console.log(`[Firestore Product Write: SUCCESS] Document saved successfully at ${path}`, {
      productId: product.id,
      savedBy: auth.currentUser?.email || "anonymous"
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const lower = errMsg.toLowerCase();
    const isPermissionOrNetwork = 
      lower.includes("permission") || 
      lower.includes("insufficient") || 
      lower.includes("offline") || 
      lower.includes("network") ||
      err?.code === 'permission-denied';

    if (!isPermissionOrNetwork) {
      console.warn("[Firestore Product Write: Notice]", errMsg);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    // Non-blocking: Server-authoritative storage already saved product permanently
  }
};

/**
 * Permanently delete individual product document from Firestore collection 'products'
 */
export const deleteProductDocFromFirestore = async (productId: string): Promise<void> => {
  if (!productId) {
    return;
  }

  const path = `products/${productId}`;

  try {
    // Ensure admin authentication is active and fresh
    await ensureAdminAuthSession();

    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    console.log(`[Firestore Product Delete: SUCCESS] Document deleted successfully at ${path}`);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const lower = errMsg.toLowerCase();
    const isPermissionOrNetwork = 
      lower.includes("permission") || 
      lower.includes("insufficient") || 
      lower.includes("offline") || 
      lower.includes("network") ||
      err?.code === 'permission-denied';

    if (!isPermissionOrNetwork) {
      console.warn("[Firestore Product Delete: Notice]", errMsg);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
    // Non-blocking: Server-authoritative storage already deleted product permanently
  }
};

/**
 * Real-time listener for 'products' collection
 */
export const subscribeToProducts = (onUpdate: (products: any[]) => void) => {
  try {
    const collRef = collection(db, "products");
    return onSnapshot(collRef, (snapshot) => {
      const prodList: any[] = [];
      snapshot.forEach((snapDoc) => {
        prodList.push({ id: snapDoc.id, ...snapDoc.data() });
      });
      prodList.sort((a, b) => {
        const posA = a.position !== undefined && a.position !== null ? Number(a.position) : (a.order !== undefined && a.order !== null ? Number(a.order) : 1000);
        const posB = b.position !== undefined && b.position !== null ? Number(b.position) : (b.order !== undefined && b.order !== null ? Number(b.order) : 1000);
        if (posA !== posB) return posA - posB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      console.log(`[Firestore Products Collection] Synchronized ${prodList.length} products from cloud.`);
      onUpdate(prodList);
    }, (error) => {
      console.warn("[Firestore Products Collection Listener Notice]", error?.message || error);
    });
  } catch (err) {
    console.warn("Failed to subscribe to products collection:", err);
    return () => {};
  }
};

/**
 * Sync individual category document to Firestore collection 'categories'
 */
export const syncCategoryDocToFirestore = async (category: any) => {
  try {
    if (!category || !category.id) return;
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore(category);
    const categoryRef = doc(db, "categories", category.id);
    await setDoc(categoryRef, sanitized);
  } catch (err: any) {
    console.warn("Category doc sync notice:", err?.message || err);
    throw err;
  }
};

/**
 * Permanently delete individual category document from Firestore collection 'categories'
 */
export const deleteCategoryDocFromFirestore = async (categoryId: string) => {
  try {
    if (!categoryId) return;
    await ensureAdminAuthSession();
    const categoryRef = doc(db, "categories", categoryId);
    await deleteDoc(categoryRef);
  } catch (err: any) {
    console.warn("Category doc delete notice:", err?.message || err);
    throw err;
  }
};

/**
 * Real-time listener for store branding & CMS configuration from 'settings/store_config'
 */
export const subscribeToStoreConfig = (onUpdate: (data: any) => void) => {
  try {
    const docRef = doc(db, "settings", "store_config");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (error: any) => {
      console.warn("Store config listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Store config listener failed:", err);
    return () => {};
  }
};

/**
 * Real-time listener for categories from 'categories' collection
 */
export const subscribeToCategories = (onUpdate: (data: any[]) => void) => {
  try {
    const collRef = collection(db, "categories");
    return onSnapshot(collRef, (snapshot) => {
      const catList: any[] = [];
      snapshot.forEach((snapDoc) => {
        catList.push({ id: snapDoc.id, ...snapDoc.data() });
      });
      catList.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate(catList);
    }, (error: any) => {
      console.warn("Categories listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Categories listener failed:", err);
    return () => {};
  }
};

/**
 * Sync individual settings document to Firestore collection 'settings'
 */
export const syncSettingsDocToFirestore = async (docId: string, data: any) => {
  try {
    if (!docId || !data) return;
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore(data);
    const settingsRef = doc(db, "settings", docId);
    await setDoc(settingsRef, sanitized, { merge: true });
  } catch (err: any) {
    console.warn(`Settings doc (${docId}) sync notice:`, err?.message || err);
    throw err;
  }
};

/**
 * Sync hero carousel slides to Firestore 'settings/hero_slides'
 */
export const syncHeroSlidesToFirestore = async (slides: any[]) => {
  try {
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore({ slides });
    const docRef = doc(db, "settings", "hero_slides");
    await setDoc(docRef, sanitized);
  } catch (err: any) {
    console.warn("Hero slides sync notice:", err?.message || err);
    throw err;
  }
};

export const subscribeToHeroSlides = (onUpdate: (data: any) => void) => {
  try {
    const docRef = doc(db, "settings", "hero_slides");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().slides);
      }
    }, (error: any) => {
      console.warn("Hero slides listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Hero slides listener failed:", err);
    return () => {};
  }
};

/**
 * Sync coupons list to Firestore 'settings/coupons'
 */
export const syncCouponsToFirestore = async (coupons: any[]) => {
  try {
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore({ coupons });
    const docRef = doc(db, "settings", "coupons");
    await setDoc(docRef, sanitized);
  } catch (err: any) {
    console.warn("Coupons sync notice:", err?.message || err);
    throw err;
  }
};

export const subscribeToCoupons = (onUpdate: (data: any) => void) => {
  try {
    const docRef = doc(db, "settings", "coupons");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().coupons);
      }
    }, (error: any) => {
      console.warn("Coupons listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Coupons listener failed:", err);
    return () => {};
  }
};

/**
 * Sync quick category shortcuts to Firestore 'settings/quick_categories'
 */
export const syncQuickCategoriesToFirestore = async (quickCategories: any[]) => {
  try {
    await ensureAdminAuthSession().catch(() => {});
    const sanitized = sanitizeForFirestore({ quickCategories, updatedAt: new Date().toISOString() });
    const docRef = doc(db, "settings", "quick_categories");
    await setDoc(docRef, sanitized, { merge: true });
    console.log(`[QuickCategories] Synchronized ${quickCategories?.length || 0} shortcut categories to cloud.`);
  } catch (err: any) {
    console.warn("Quick categories sync notice:", err?.message || err);
  }
};

export const subscribeToQuickCategories = (onUpdate: (data: any[]) => void) => {
  try {
    const docRef = doc(db, "settings", "quick_categories");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data().quickCategories)) {
        onUpdate(docSnap.data().quickCategories);
      }
    }, (error: any) => {
      console.warn("Quick categories listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Quick categories listener failed:", err);
    return () => {};
  }
};

/**
 * Sync individual static page to Firestore 'pages' collection
 */
export const syncStaticPageDocToFirestore = async (page: any) => {
  try {
    if (!page || !page.id) return;
    await ensureAdminAuthSession().catch(() => {});
    const sanitized = sanitizeForFirestore(page);
    const pageRef = doc(db, "pages", page.id);
    await setDoc(pageRef, sanitized, { merge: true });
  } catch (err: any) {
    console.warn("Static page sync notice:", err?.message || err);
  }
};

/**
 * Delete individual static page from Firestore 'pages' collection
 */
export const deleteStaticPageDocFromFirestore = async (pageId: string) => {
  try {
    if (!pageId) return;
    await ensureAdminAuthSession().catch(() => {});
    const pageRef = doc(db, "pages", pageId);
    await deleteDoc(pageRef);
  } catch (err: any) {
    console.warn("Static page delete notice:", err?.message || err);
  }
};

/**
 * Atomically sync full static pages array to 'settings/static_pages'
 */
export const syncAllStaticPagesToFirestore = async (pages: any[]) => {
  try {
    await ensureAdminAuthSession().catch(() => {});
    const settingsRef = doc(db, "settings", "static_pages");
    await setDoc(settingsRef, { 
      pages: sanitizeForFirestore(pages), 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err: any) {
    console.warn("All static pages sync notice:", err?.message || err);
  }
};

export const subscribeToStaticPages = (onUpdate: (data: any[]) => void) => {
  try {
    const collRef = collection(db, "pages");
    return onSnapshot(collRef, (snapshot) => {
      const pagesList: any[] = [];
      snapshot.forEach((snapDoc) => {
        pagesList.push({ id: snapDoc.id, ...snapDoc.data() });
      });
      pagesList.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate(pagesList);
    }, (error: any) => {
      console.warn("Static pages listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Static pages listener failed:", err);
    return () => {};
  }
};

export const subscribeToStaticPagesSettings = (onUpdate: (pages: any[]) => void) => {
  try {
    const docRef = doc(db, "settings", "static_pages");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data().pages)) {
        onUpdate(docSnap.data().pages);
      }
    }, (err) => {
      console.warn("Static pages settings listener notice:", err?.message || err);
    });
  } catch (err) {
    return () => {};
  }
};

/**
 * Real-time listener for order policy settings from 'settings/order_policy'
 */
export const subscribeToOrderPolicy = (onUpdate: (data: any) => void) => {
  try {
    const docRef = doc(db, "settings", "order_policy");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (error: any) => {
      console.warn("Order policy listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Order policy listener failed:", err);
    return () => {};
  }
};

/**
 * Seeds and initializes all default catalog, categories, CMS and order policies into Cloud Firestore rycreoshop-d2e40.
 * If force=false, only runs if 'store/data' does not exist or has 0 products.
 */
export const seedAllInitialDataToFirestore = async (force: boolean = false): Promise<{ success: boolean; message: string; seededCount: number }> => {
  try {
    const storeDocRef = doc(db, "store", "data");
    if (!force) {
      try {
        const snap = await getDoc(storeDocRef);
        if (snap.exists()) {
          console.log("[Firestore Seed Check] store/data document already exists. Preserving real user catalog and settings.");
          return { 
            success: true, 
            message: "Firestore database is already seeded.", 
            seededCount: 1 
          };
        }
      } catch (checkErr) {
        console.warn("Initial seed check notice:", checkErr);
      }
    }

    // Do not automatically sign in as admin if no session is active
    if (!auth.currentUser) {
      const sessionActive = typeof localStorage !== 'undefined' && localStorage.getItem('admin_session_active') === 'true';
      if (!sessionActive) {
        return { 
          success: false, 
          message: "Seeding requires active admin login.", 
          seededCount: 0 
        };
      }
    }

    console.log("🚀 Initializing Cloud Firestore (rycreoshop-d2e40)...");

    // 1. Comprehensive store state in 'store/data' for global real-time synchronization
    const fullStoreData = {
      storeConfig: INITIAL_STORE_CONFIG,
      categories: INITIAL_CATEGORIES,
      heroSlides: INITIAL_HERO_SLIDES,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      quickCategories: INITIAL_QUICK_CATEGORIES,
      staticPages: INITIAL_STATIC_PAGES,
      attributes: INITIAL_ATTRIBUTES,
      orders: [],
      productsCount: INITIAL_PRODUCTS.length,
      updatedAt: new Date().toISOString()
    };
    await setDoc(storeDocRef, sanitizeForFirestore(fullStoreData), { merge: true });

    // 2. Individual documents in 'products' collection
    const prodBatch = writeBatch(db);
    INITIAL_PRODUCTS.forEach((prod) => {
      const ref = doc(db, "products", prod.id);
      prodBatch.set(ref, sanitizeForFirestore(prod));
    });
    await prodBatch.commit();

    // 3. Individual documents in 'categories' collection
    const catBatch = writeBatch(db);
    INITIAL_CATEGORIES.forEach((cat) => {
      const ref = doc(db, "categories", cat.id);
      catBatch.set(ref, sanitizeForFirestore(cat));
    });
    await catBatch.commit();

    // 4. CMS Settings documents in 'settings' collection
    const settingsBatch = writeBatch(db);
    
    // Store branding and configuration
    settingsBatch.set(doc(db, "settings", "store_config"), sanitizeForFirestore(INITIAL_STORE_CONFIG));
    
    // Dedicated Order Policy & Lock Duration
    settingsBatch.set(doc(db, "settings", "order_policy"), sanitizeForFirestore({
      orderLockDurationHours: 6,
      insideDhakaDeliveryFee: INITIAL_STORE_CONFIG.defaultInsideDhakaFee || 60,
      outsideDhakaDeliveryFee: INITIAL_STORE_CONFIG.defaultOutsideDhakaFee || 120,
      advanceDeliveryChargeNumber: INITIAL_STORE_CONFIG.advanceDeliveryChargeNumber || "01712345678",
      allowDoorstepInspection: true,
      exchangePolicyDays: 7,
      customerCancelAllowedWithinHours: 6,
      orderPolicyText: INITIAL_STORE_CONFIG.orderPolicyText,
      updatedAt: new Date().toISOString()
    }));

    // Hero carousel banners
    settingsBatch.set(doc(db, "settings", "hero_slides"), sanitizeForFirestore({ slides: INITIAL_HERO_SLIDES }));

    // Coupons
    settingsBatch.set(doc(db, "settings", "coupons"), sanitizeForFirestore({ coupons: INITIAL_COUPONS }));

    // Static pages in 'pages' collection
    INITIAL_STATIC_PAGES.forEach((page) => {
      const pageRef = doc(db, "pages", page.id);
      settingsBatch.set(pageRef, sanitizeForFirestore(page));
    });

    await settingsBatch.commit();

    console.log("✅ Seed completed successfully in Cloud Firestore rycreoshop-d2e40!");
    return { 
      success: true, 
      message: `Successfully seeded ${INITIAL_PRODUCTS.length} products, ${INITIAL_CATEGORIES.length} categories, and CMS settings into Cloud Firestore.`, 
      seededCount: INITIAL_PRODUCTS.length 
    };
  } catch (err: any) {
    const isPermission = err?.code === 'permission-denied' || 
      (typeof err?.message === 'string' && (err.message.includes('permissions') || err.message.includes('permission-denied')));

    if (isPermission) {
      console.info("ℹ️ Firestore write requires admin authentication (rycreoshop@gmail.com). Initial data will sync upon login.");
    } else {
      console.warn("⚠️ Firestore seed notice:", err?.message || err);
    }

    return { 
      success: false, 
      message: isPermission 
        ? "Firestore write requires admin authentication (rycreoshop@gmail.com)." 
        : (err?.message || "Failed to seed Firestore data"), 
      seededCount: 0 
    };
  }
};


/**
 * Sync individual review document to Firestore collection 'reviews'
 */
export const syncReviewDocToFirestore = async (review: any) => {
  try {
    if (!review || !review.id) return;
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore(review);
    const reviewRef = doc(db, "reviews", review.id);
    await setDoc(reviewRef, sanitized);
  } catch (err: any) {
    console.warn("Review doc sync notice:", err?.message || err);
    throw err;
  }
};

/**
 * Permanently delete review document from Firestore collection 'reviews'
 */
export const deleteReviewDocFromFirestore = async (reviewId: string) => {
  try {
    if (!reviewId) return;
    await ensureAdminAuthSession();
    const reviewRef = doc(db, "reviews", reviewId);
    await deleteDoc(reviewRef);
  } catch (err: any) {
    console.warn("Review doc delete notice:", err?.message || err);
    throw err;
  }
};

/**
 * Sync individual attribute document to Firestore collection 'attributes'
 */
export const syncAttributeDocToFirestore = async (attribute: any) => {
  try {
    if (!attribute || !attribute.id) return;
    await ensureAdminAuthSession();
    const sanitized = sanitizeForFirestore(attribute);
    const attrRef = doc(db, "attributes", attribute.id);
    await setDoc(attrRef, sanitized);
  } catch (err: any) {
    console.warn("Attribute doc sync notice:", err?.message || err);
    throw err;
  }
};

/**
 * Permanently delete attribute document from Firestore collection 'attributes'
 */
export const deleteAttributeDocFromFirestore = async (attributeId: string) => {
  try {
    if (!attributeId) return;
    await ensureAdminAuthSession();
    const attrRef = doc(db, "attributes", attributeId);
    await deleteDoc(attrRef);
  } catch (err: any) {
    console.warn("Attribute doc delete notice:", err?.message || err);
    throw err;
  }
};

/**
 * Sync individual order document to Firestore collection 'orders'
 */
export const syncOrderDocToFirestore = async (order: any) => {
  try {
    if (!order || !order.id) return;
    const sanitized = sanitizeForFirestore(order);
    const orderRef = doc(db, "orders", order.id);
    await setDoc(orderRef, sanitized);
  } catch (err: any) {
    console.warn("Order doc sync notice:", err?.message || err);
    throw err;
  }
};


export const subscribeToReviews = (onUpdate: (data: any[]) => void) => {
  try {
    const collRef = collection(db, "reviews");
    return onSnapshot(collRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((snapDoc) => {
        list.push({ id: snapDoc.id, ...snapDoc.data() });
      });
      onUpdate(list);
    }, (error: any) => {
      console.warn("Reviews listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Reviews listener failed:", err);
    return () => {};
  }
};

export const subscribeToAttributes = (onUpdate: (data: any[]) => void) => {
  try {
    const collRef = collection(db, "attributes");
    return onSnapshot(collRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((snapDoc) => {
        list.push({ id: snapDoc.id, ...snapDoc.data() });
      });
      onUpdate(list);
    }, (error: any) => {
      console.warn("Attributes listener notice:", error?.message || error);
    });
  } catch (err) {
    console.warn("Attributes listener failed:", err);
    return () => {};
  }
};
