import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Service account credentials come from .env as a single JSON string
// (copy the whole downloaded service-account JSON file into FIREBASE_SERVICE_ACCOUNT).
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
