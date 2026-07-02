import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebaseAdmin';

const STATIC_FLEET = [
  { id: 'fleet-01', plate: 'V3X-982', type: 'Toyota Avanza (Camioneta)', capacity: 6, driverName: 'Juan Carlos Quispe', status: 'activo' },
  { id: 'fleet-02', plate: 'F4T-811', type: 'Toyota Yaris (Sedán)', capacity: 4, driverName: 'Pedro Mendoza', status: 'activo' },
  { id: 'fleet-03', plate: 'A9B-122', type: 'Toyota Avanza (Camioneta)', capacity: 6, driverName: 'Arnie Calderón', status: 'activo' }
];

// 1. GET: Listar todos los vehículos de la flota
export const GET: APIRoute = async () => {
  try {
    const snapshot = await db.collection('fleet').get();

    if (snapshot.empty) {
      return new Response(JSON.stringify(STATIC_FLEET), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fleet: any[] = [];
    snapshot.forEach((doc) => {
      fleet.push(doc.data());
    });

    return new Response(JSON.stringify(fleet), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.warn('Usando flota fallback. Motivo:', error);
    // Fallback robusto si Firebase no está disponible aún
    return new Response(JSON.stringify(STATIC_FLEET), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 2. POST: Registrar un nuevo vehículo
export const POST: APIRoute = async ({ request }) => {
  try {
    const vehicle = await request.json();

    if (!vehicle || !vehicle.id || !vehicle.plate || !vehicle.driverName) {
      return new Response(
        JSON.stringify({ message: 'Datos del vehículo incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.collection('fleet').doc(vehicle.id).set(vehicle);

    return new Response(
      JSON.stringify({ message: 'Vehículo guardado con éxito', vehicle }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Error en base de datos', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// 3. PATCH: Actualizar el estado de un vehículo
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { status } = await request.json();

    if (!id || !status) {
      return new Response(
        JSON.stringify({ message: 'ID o estado faltante' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db.collection('fleet').doc(id).update({ status });

    return new Response(
      JSON.stringify({ message: 'Estado del vehículo actualizado con éxito' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Error en base de datos', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
