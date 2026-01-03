import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPnrZraQaqJNle1_AmuXQFKsXXZECOxSg",
  authDomain: "nova-academy-mock-test.firebaseapp.com",
  projectId: "nova-academy-mock-test",
  storageBucket: "nova-academy-mock-test.firebasestorage.app",
  messagingSenderId: "59328810988",
  appId: "1:59328810988:web:4e0974dc0cd11526733ac9",
  measurementId: "G-7K3EKN57W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence (helps with offline mode)
// This will cache data locally so the app works even when offline
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence already enabled in another tab');
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support persistence
      console.warn('This browser does not support Firestore persistence');
    }
  });
} catch (error) {
  console.warn('Could not enable Firestore persistence:', error);
}

