import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLTCEfCziDNO0a3kTIrRaz-fuXsHGxsDA",
  authDomain: "eksamen-9ec44.firebaseapp.com",
  projectId: "eksamen-9ec44",
  storageBucket: "eksamen-9ec44.appspot.com",
  messagingSenderId: "519964879447",
  appId: "1:519964879447:web:cded38f0cd18f933f75112"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, database, auth };
