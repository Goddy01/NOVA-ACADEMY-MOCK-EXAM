import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// Get it from: https://console.firebase.google.com/ > Project Settings > General > Your apps
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

