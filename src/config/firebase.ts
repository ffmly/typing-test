import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDOomCj_tjxMFOLPEMasqPbu4tRrYHyAN8",
  authDomain: "typingspeed-ab7dd.firebaseapp.com",
  projectId: "typingspeed-ab7dd",
  storageBucket: "typingspeed-ab7dd.firebasestorage.app",
  messagingSenderId: "1093254233647",
  appId: "1:1093254233647:web:5378d86b724c07196910da",
  measurementId: "G-48GJFQ1YMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally
export const analytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
}; 