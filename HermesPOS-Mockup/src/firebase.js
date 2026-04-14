// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setDoc, collection, getDoc, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc, orderBy, limit, Timestamp, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Activar persistencia en IndexedDB (caché local)
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("✅ Caché local habilitado");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("⚠️ Solo se puede usar una pestaña con persistencia activa a la vez");
    } else if (err.code === 'unimplemented') {
      console.warn("⚠️ El navegador no soporta IndexedDB");
    }
  });


export { auth, getFirestore, setDoc, collection, getDoc, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc, db, storage, getStorage, ref, uploadBytes, getDownloadURL, orderBy, limit, Timestamp };
