import type { APIRoute } from 'astro';
import { auth, db } from '../../../lib/firebaseAdmin';

// 1. POST: Crear la cookie de sesión y actualizar perfil en Firestore
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { idToken, profile } = await request.json();

    if (!idToken) {
      return new Response(JSON.stringify({ message: 'Token de ID faltante' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar el token para obtener UID y Email
    const decodedClaims = await auth.verifyIdToken(idToken);
    const uid = decodedClaims.uid;
    const email = decodedClaims.email;

    // Crear o actualizar perfil en Firestore
    try {
      const userDocRef = db.collection('users').doc(uid);
      const userDoc = await userDocRef.get();

      if (profile) {
        // Viene del formulario de registro
        await userDocRef.set({
          uid,
          email,
          displayName: profile.name || decodedClaims.name || '',
          phone: profile.phone || '',
          dni: profile.dni || '',
          role: 'client',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else if (!userDoc.exists) {
        // Es un inicio de sesión por primera vez (ej. Google Sign-In) sin perfil
        await userDocRef.set({
          uid,
          email,
          displayName: decodedClaims.name || email?.split('@')[0] || 'Usuario',
          phone: '',
          dni: '',
          role: email === 'admin@viajaayacucho.com' ? 'admin' : 'client',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (dbError) {
      console.warn('⚠️ No se pudo guardar el perfil en Firestore. Continuando con sesión.', dbError);
    }

    // Crear la cookie de sesión de Firebase Auth (expira en 5 días)
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Guardar en la cookie __session (nombre mandatorio para Vercel/Firebase CDN cache)
    cookies.set('__session', sessionCookie, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 5 * 24 * 60 * 60 // 5 días en segundos
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Error al crear sesión por cookie:', error);
    return new Response(
      JSON.stringify({ message: 'Token de autenticación inválido', error: error.message }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// 2. DELETE: Cerrar sesión (destruir la cookie)
export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete('__session', { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

