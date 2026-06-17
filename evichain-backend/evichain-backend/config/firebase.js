import admin from 'firebase-admin';

let firestore = null;
let firebaseInitError = null;

function normalizedEnv(name) {
  const value = process.env[name];
  return value ? value.trim() : '';
}

function normalizePrivateKey(rawKey) {
  if (!rawKey) return '';
  return rawKey.replace(/\\n/g, '\n').replace(/^['"]|['"]$/g, '').trim();
}

function parseServiceAccountJSON(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getFirebaseConfig() {
  const serviceAccountFromDedicatedEnv = parseServiceAccountJSON(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '');
  const serviceAccountFromPrivateKeyEnv = parseServiceAccountJSON(process.env.FIREBASE_PRIVATE_KEY || '');
  const serviceAccount = serviceAccountFromDedicatedEnv || serviceAccountFromPrivateKeyEnv || null;

  const projectId = normalizedEnv('FIREBASE_PROJECT_ID') || serviceAccount?.project_id || '';
  const clientEmail = normalizedEnv('FIREBASE_CLIENT_EMAIL') || serviceAccount?.client_email || '';
  const privateKeySource = serviceAccount?.private_key || process.env.FIREBASE_PRIVATE_KEY || '';

  return {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKeySource),
    collectionName: normalizedEnv('FIREBASE_COLLECTION') || 'evidence_metadata',
    databaseURL: normalizedEnv('FIREBASE_DATABASE_URL'),
  };
}

export function getFirebaseStatus() {
  const config = getFirebaseConfig();
  const configured = Boolean(config.projectId && config.clientEmail && config.privateKey);

  return {
    configured,
    projectId: config.projectId || null,
    collectionName: config.collectionName,
  };
}

function getFirestore() {
  if (firebaseInitError) {
    return null;
  }

  const config = getFirebaseConfig();

  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    return null;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
        databaseURL: config.databaseURL || undefined,
      });
    }

    if (!firestore) {
      firestore = admin.firestore();
    }
  } catch (error) {
    firebaseInitError = error;
    console.error(`[EviChain] Firebase initialization failed: ${error.message}`);
    return null;
  }

  return firestore;
}

export function getFirestoreInstance() {
  return getFirestore();
}

export async function saveEvidenceMetadata(record) {
  const db = getFirestore();
  const config = getFirebaseConfig();

  if (!db) {
    return {
      configured: Boolean(config.projectId && config.clientEmail && config.privateKey),
      saved: false,
      reason: firebaseInitError
        ? `Firebase initialization failed: ${firebaseInitError.message}`
        : 'Firebase is not configured',
    };
  }

  if (!record?.evidenceId) {
    throw new Error('evidenceId is required for Firebase persistence');
  }

  const { collectionName } = config;
  const payload = {
    ...record,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection(collectionName).doc(record.evidenceId).set(payload, { merge: true });
  } catch (error) {
    return {
      configured: true,
      saved: false,
      collectionName,
      reason: `Firebase write failed: ${error.message}`,
    };
  }

  return {
    configured: true,
    saved: true,
    collectionName,
  };
}
