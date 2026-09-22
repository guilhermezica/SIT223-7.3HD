import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALv_8Bqacm3LwSUqHEAD9p3-r8BmWdiLI",
  authDomain: "sit313-p4.firebaseapp.com",
  projectId: "sit313-p4",
  storageBucket: "sit313-p4.firebasestorage.app",
  messagingSenderId: "1018689007776",
  appId: "1:1018689007776:web:fefac28791a2d0c2f659c5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);