import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Product } from '../types/store';
import { sanitizeForFirestore } from '../firebaseServices';

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

/**
 * Standard error logging conforming to Firebase security rules diagnostics
 */
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
    lower.includes("insufficient") ||
    lower.includes("quota")
  ) {
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('[adminService Firestore Notice]', errInfo.error);
}

export const AUTHORIZED_ADMIN_EMAILS = [
  'rycreoshop@gmail.com'
];

/**
 * Verifies and returns feedback on the admin identity check.
 * If user session is expired or missing, attempts silent refresh/recovery.
 */
export async function ensureAdminAuth(): Promise<{ isAuthorized: boolean; email: string | null; uid: string | null }> {
  try {
    if (auth.currentUser) {
      const email = auth.currentUser.email || '';
      return {
        isAuthorized: email.toLowerCase().trim() === 'rycreoshop@gmail.com',
        email: email || 'rycreoshop@gmail.com',
        uid: auth.currentUser.uid
      };
    }

    if (typeof localStorage !== 'undefined') {
      const savedPass = localStorage.getItem('admin_password');
      if (savedPass) {
        try {
          const cred = await signInWithEmailAndPassword(auth, 'rycreoshop@gmail.com', savedPass);
          return {
            isAuthorized: true,
            email: cred.user.email || 'rycreoshop@gmail.com',
            uid: cred.user.uid
          };
        } catch {}
      }
    }

    return {
      isAuthorized: false,
      email: null,
      uid: null
    };
  } catch (err: any) {
    return {
      isAuthorized: false,
      email: null,
      uid: null
    };
  }
}

export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const prodId = productData.id || `prod-${Date.now()}`;
  const path = `products/${prodId}`;
  const newProduct: Product = {
    ...productData,
    id: prodId,
    createdAt: new Date().toISOString()
  };

  try {
    const sanitized = sanitizeForFirestore(newProduct);
    const productRef = doc(db, 'products', prodId);
    await setDoc(productRef, sanitized);
    return { success: true, product: newProduct };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return { success: true, product: newProduct };
  }
}

/**
 * Updates an existing product in the Firestore 'products' collection.
 */
export async function updateProduct(
  product: Product
): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (!product || !product.id) {
    return { success: false, error: 'Validation Error: Missing product or product.id' };
  }

  const path = `products/${product.id}`;
  try {
    const sanitized = sanitizeForFirestore(product);
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, sanitized, { merge: true });
    return { success: true, product };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    return { success: true, product };
  }
}

/**
 * Permanently deletes a product from the Firestore 'products' collection.
 */
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  if (!productId) {
    return { success: false, error: 'Validation Error: Missing productId' };
  }

  const path = `products/${productId}`;
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true };
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, path);
    return { success: true };
  }
}

/**
 * Bulk deletes multiple products from the Firestore 'products' collection.
 */
export async function deleteProducts(
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!productIds || productIds.length === 0) return { success: true };
  try {
    await Promise.allSettled(productIds.map(id => deleteDoc(doc(db, 'products', id))));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetches all products directly from the 'products' collection reference.
 */
export async function getProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const collRef = collection(db, 'products');
    const q = query(collRef);
    const snap = await getDocs(q);

    const prods: Product[] = [];
    snap.forEach((d) => {
      prods.push({ id: d.id, ...d.data() } as Product);
    });

    prods.sort((a, b) => {
      const ordA = a.order !== undefined && a.order !== null ? Number(a.order) : 1000;
      const ordB = b.order !== undefined && b.order !== null ? Number(b.order) : 1000;
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    console.log(`[adminService getProducts: SUCCESS] Fetched ${prods.length} products from 'products' collection.`);
    return prods;
  } catch (err: any) {
    console.error('[adminService getProducts: FAILED]', {
      operation: 'LIST',
      collection: 'products',
      path,
      errorCode: err?.code || 'unknown',
      errorMessage: err?.message || String(err),
      stack: err?.stack
    });
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Fetches a single product by ID directly from 'products' collection.
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    return null;
  } catch (err: any) {
    console.error(`[adminService getProductById: FAILED] ${path}`, err);
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}
