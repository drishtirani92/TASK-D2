import fs from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export { FieldValue };

let db = null;

// Connects to Firestore the first time it is needed.
// The service account key is a secret, so it is never written in the code.
export function getDb() {
  if (db) return db;

  initializeApp({ credential: cert(loadServiceAccount()) });
  db = getFirestore();
  return db;
}

// On your own computer the key is a file (serviceAccountKey.json).
// On a hosting site you cannot upload that file safely, so the same key can
// be stored as one environment variable (base64 text) instead.
function loadServiceAccount() {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  }

  const keyPath = path.resolve(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json',
  );

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Firebase service account key not found at ${keyPath}. See the README.`,
    );
  }

  return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
}
