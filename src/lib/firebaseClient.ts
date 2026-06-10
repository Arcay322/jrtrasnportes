import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración cargada desde variables de entorno del cliente (Astro PUBLIC_)
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || 'MOCK_API_KEY_FOR_LOCAL_DEV',
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-proj.firebaseapp.com',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || 'mock-proj',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-proj.appspot.com',
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || '1:1234:web:abcd'
};

let app;
let auth: any;
const googleProvider = new GoogleAuthProvider();

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.error('❌ Error al inicializar Firebase Client SDK:', error);
}

export { auth, googleProvider };
