import { getFirestoreInstance } from '../config/firebase.js';

const COLLECTION = process.env.FIREBASE_AUTH_COLLECTION || 'auth_events';
const PROFILE_COLLECTION = process.env.FIREBASE_AUTH_PROFILE_COLLECTION || 'auth_profiles';

function normalizeWalletAddress(walletAddress) {
  return (walletAddress || '').trim().toLowerCase();
}

function toPlainObject(value) {
  if (!value || typeof value !== 'object') return {};
  return Array.isArray(value) ? {} : value;
}

export async function saveAuthEvent({
  walletAddress,
  ip,
  userAgent,
  method = 'metamask',
  verified = true,
  metadata = {},
} = {}) {
  const db = getFirestoreInstance();
  if (!db) {
    return { saved: false, configured: false, reason: 'Firebase not configured' };
  }

  const payload = {
    walletAddress: (walletAddress || '').toLowerCase(),
    ip: ip || null,
    userAgent: userAgent || null,
    method: method || 'metamask',
    verified: Boolean(verified),
    metadata: metadata || {},
    timestamp: Math.floor(Date.now() / 1000),
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    const ref = await db.collection(COLLECTION).add(payload);
    return { saved: true, configured: true, id: ref.id };
  } catch (error) {
    return { saved: false, configured: true, reason: `Firebase write failed: ${error.message}` };
  }
}

export async function saveAuthProfile({
  walletAddress,
  fullName,
  role,
  mode = 'signin',
  metadata = {},
} = {}) {
  const db = getFirestoreInstance();
  if (!db) {
    return { saved: false, configured: false, reason: 'Firebase not configured' };
  }

  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (!normalizedWallet) {
    return { saved: false, configured: true, reason: 'walletAddress is required' };
  }

  const docRef = db.collection(PROFILE_COLLECTION).doc(normalizedWallet);

  let existing = null;
  try {
    const snap = await docRef.get();
    existing = snap.exists ? (snap.data() || {}) : null;
  } catch (error) {
    return { saved: false, configured: true, reason: `Firebase read failed: ${error.message}` };
  }

  if (existing && mode === 'signup') {
    return {
      saved: false,
      configured: true,
      exists: true,
      walletAddress: normalizedWallet,
      reason: 'Wallet already registered. Please sign in with this wallet.',
    };
  }

  const safeExisting = toPlainObject(existing);
  const mergedMetadata = {
    ...(toPlainObject(safeExisting.metadata)),
    ...(toPlainObject(metadata)),
  };

  const payload = {
    walletAddress: normalizedWallet,
    fullName: fullName || safeExisting.fullName || null,
    role: role || safeExisting.role || null,
    authMode: mode || safeExisting.authMode || 'signin',
    metadata: mergedMetadata,
    signInCount: Number(safeExisting.signInCount || 0) + (mode === 'signin' ? 1 : 0),
    signUpCount: Number(safeExisting.signUpCount || 0) + (mode === 'signup' ? 1 : 0),
    createdAt: safeExisting.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await docRef.set(payload, { merge: true });
    return { saved: true, configured: true, walletAddress: normalizedWallet };
  } catch (error) {
    return { saved: false, configured: true, reason: `Firebase write failed: ${error.message}` };
  }
}

export async function getAuthProfile(walletAddress) {
  const db = getFirestoreInstance();
  if (!db) {
    return { found: false, configured: false, profile: null };
  }

  const normalizedWallet = (walletAddress || '').toLowerCase();
  if (!normalizedWallet) {
    return { found: false, configured: true, profile: null };
  }

  try {
    const snap = await db.collection(PROFILE_COLLECTION).doc(normalizedWallet).get();
    if (!snap.exists) {
      return { found: false, configured: true, profile: null };
    }

    const data = snap.data() || {};
    return {
      found: true,
      configured: true,
      profile: {
        walletAddress: normalizedWallet,
        fullName: data.fullName || null,
        role: data.role || null,
        authMode: data.authMode || null,
        metadata: toPlainObject(data.metadata),
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        signInCount: Number(data.signInCount || 0),
        signUpCount: Number(data.signUpCount || 0),
      },
    };
  } catch (error) {
    return { found: false, configured: true, profile: null, reason: `Firebase read failed: ${error.message}` };
  }
}
