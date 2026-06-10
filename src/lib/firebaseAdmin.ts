import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let isInitialized = false;

if (!getApps().length) {
  // Soporte para Astro (import.meta.env) y Node tradicional (process.env)
  const projectId = import.meta.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = import.meta.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = import.meta.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      const formattedKey = privateKey.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey
        }),
        projectId
      });
      console.log('🔥 Firebase Admin SDK inicializado usando variables de entorno.');
      isInitialized = true;
    } catch (e) {
      console.error('❌ Error al inicializar Firebase Admin con env vars:', e);
    }
  } else {
    // Buscar archivo local en desarrollo
    const keyPath = path.resolve('./firebase-key.json');
    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin SDK inicializado usando firebase-key.json local.');
        isInitialized = true;
      } catch (e) {
        console.error('❌ Error al inicializar Firebase Admin con firebase-key.json:', e);
      }
    } else {
      console.warn(
        '⚠️ Advertencia: No se encontraron credenciales de Firebase en variables de entorno ni en firebase-key.json. Usando mocks.'
      );
    }
  }
} else {
  isInitialized = true;
}

let dbInstance: any;
let authInstance: any;

if (isInitialized) {
  try {
    dbInstance = getFirestore();
    authInstance = getAuth();
  } catch (err) {
    console.error('⚠️ Error al obtener firestore/auth, usando mocks de seguridad:', err);
    isInitialized = false;
  }
}

if (!isInitialized || !dbInstance || !authInstance) {
  // Mocks para desarrollo local libre de caídas
  dbInstance = {
    collection: () => ({
      get: async () => {
        return {
          empty: true,
          forEach: () => {}
        };
      },
      doc: () => ({
        get: async () => {
          return {
            exists: false,
            data: () => null
          };
        },
        set: async () => {
          return { writeTime: new Date() };
        },
        update: async () => {
          return { writeTime: new Date() };
        }
      })
    })
  };

  authInstance = {
    createSessionCookie: async (idToken: string) => {
      return `mock_cookie_${idToken}`;
    },
    verifySessionCookie: async (cookie: string) => {
      if (cookie && cookie.startsWith('mock_cookie_')) {
        const token = cookie.replace('mock_cookie_', '');
        const email = token === 'admin_token' ? 'admin@viajaayacucho.com' : 'cliente@viajaayacucho.com';
        const role = token === 'admin_token' ? 'admin' : 'client';
        return {
          uid: `mock-uid-${token}`,
          email,
          role,
          name: token === 'admin_token' ? 'Admin Demo' : 'Cliente Demo'
        };
      }
      throw new Error('Firebase Admin no inicializado y cookie inválida');
    },
    verifyIdToken: async (idToken: string) => {
      const email = idToken === 'admin_token' ? 'admin@viajaayacucho.com' : 'cliente@viajaayacucho.com';
      return {
        uid: `mock-uid-${idToken}`,
        email,
        name: idToken === 'admin_token' ? 'Admin Demo' : 'Cliente Demo'
      };
    },
    getUser: async (uid: string) => {
      return {
        uid,
        email: uid.includes('admin') ? 'admin@viajaayacucho.com' : 'cliente@viajaayacucho.com',
        displayName: uid.includes('admin') ? 'Admin Demo' : 'Cliente Demo'
      };
    }
  };
}

export const db = dbInstance;
export const auth = authInstance;
