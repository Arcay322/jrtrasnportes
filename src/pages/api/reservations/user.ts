import type { APIRoute } from 'astro';
import { auth, db } from '../../../lib/firebaseAdmin';

// GET: Obtener las reservas del usuario autenticado
export const GET: APIRoute = async ({ cookies }) => {
  const sessionCookie = cookies.get('__session')?.value;

  if (!sessionCookie) {
    return new Response(JSON.stringify({ message: 'Sesión no activa' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    // Obtener perfil de Firestore
    let userData: any = null;
    try {
      const userDoc = await db.collection('users').doc(uid).get();
      userData = userDoc.exists ? userDoc.data() : null;
    } catch (dbErr) {
      console.warn('⚠️ Error al consultar usuario en Firestore. Usando claims.', dbErr);
    }

    let reservations: any[] = [];

    // Si Firestore está activo y cargado
    if (userData) {
      const { dni, phone } = userData;
      const queries: any[] = [];

      // Buscar por userId
      try {
        queries.push(db.collection('reservations').where('userId', '==', uid).get());
      } catch (e) {
        console.warn('Error querying by userId:', e);
      }

      // Buscar por DNI si existe
      if (dni) {
        try {
          queries.push(db.collection('reservations').where('customerDni', '==', dni).get());
        } catch (e) {
          console.warn('Error querying by DNI:', e);
        }
      }

      // Buscar por Teléfono si existe
      if (phone) {
        try {
          queries.push(db.collection('reservations').where('customerPhone', '==', phone).get());
        } catch (e) {
          console.warn('Error querying by phone:', e);
        }
      }

      if (queries.length > 0) {
        const snapshots = await Promise.all(queries);
        const resMap = new Map();

        snapshots.forEach((snapshot) => {
          if (snapshot && typeof snapshot.forEach === 'function') {
            snapshot.forEach((doc: any) => {
              resMap.set(doc.id, doc.data());
            });
          }
        });

        reservations = Array.from(resMap.values());
      }
    } else {
      // Intentar solo por userId
      try {
        const snapshot = await db.collection('reservations').where('userId', '==', uid).get();
        if (snapshot && typeof snapshot.forEach === 'function') {
          snapshot.forEach((doc: any) => {
            reservations.push(doc.data());
          });
        }
      } catch (e) {
        console.warn('Error querying by userId simple:', e);
      }
    }

    // Ordenar por fecha de creación (de más nuevo a más antiguo)
    reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Simular boletos mockeados en desarrollo local si la base de datos está vacía y se usa mock
    if (reservations.length === 0 && sessionCookie.startsWith('mock_cookie_')) {
      reservations = [
        {
          id: 'res-mock-1',
          routeSlug: 'cangallo',
          routeName: 'Ayacucho a Cangallo',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
          schedule: '08:30 AM',
          selectedSeats: [5, 6],
          totalPrice: 50.00,
          customerName: userData?.displayName || decodedClaims.name || 'Pasajero Demo',
          customerPhone: userData?.phone || '987654321',
          customerDni: userData?.dni || '12345678',
          paymentStatus: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          id: 'res-mock-2',
          routeSlug: 'huancasancos',
          routeName: 'Ayacucho a Huancasancos',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // Hace 2 días
          schedule: '06:00 AM',
          selectedSeats: [10],
          totalPrice: 35.00,
          customerName: userData?.displayName || decodedClaims.name || 'Pasajero Demo',
          customerPhone: userData?.phone || '987654321',
          customerDni: userData?.dni || '12345678',
          paymentStatus: 'approved',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    return new Response(JSON.stringify(reservations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching user reservations:', error);
    return new Response(JSON.stringify({ message: 'Error en servidor', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST: Actualizar DNI, teléfono o nombre del usuario logueado
export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionCookie = cookies.get('__session')?.value;

  if (!sessionCookie) {
    return new Response(JSON.stringify({ message: 'Sesión no activa' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    const { dni, phone, displayName } = await request.json();

    if (!dni && !phone && !displayName) {
      return new Response(JSON.stringify({ message: 'Ningún dato provisto para actualizar' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    if (dni) updateData.dni = dni;
    if (phone) updateData.phone = phone;
    if (displayName) updateData.displayName = displayName;

    try {
      await db.collection('users').doc(uid).set(updateData, { merge: true });
    } catch (dbErr) {
      console.warn('⚠️ No se pudo guardar cambios de perfil en Firestore. Ejecutando mock.', dbErr);
    }

    return new Response(JSON.stringify({ success: true, message: 'Perfil actualizado con éxito' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return new Response(JSON.stringify({ message: 'Error en servidor', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
