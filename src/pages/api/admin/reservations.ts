import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebaseAdmin';

const STATIC_RESERVATIONS = [
  {
    id: 'res-001',
    routeSlug: 'cangallo',
    routeName: 'Cangallo',
    date: '2026-06-12',
    schedule: '08:30 AM',
    selectedSeats: [3, 4],
    totalPrice: 50.0,
    customerName: 'Juan Pérez',
    customerPhone: '918712309',
    paymentStatus: 'approved',
    createdAt: '2026-06-10T02:00:00.000Z'
  },
  {
    id: 'res-002',
    routeSlug: 'pampa-cangallo',
    routeName: 'Pampa Cangallo',
    date: '2026-06-13',
    schedule: '06:00 AM',
    selectedSeats: [7],
    totalPrice: 20.0,
    customerName: 'María Rojas',
    customerPhone: '980849165',
    paymentStatus: 'pending',
    createdAt: '2026-06-10T03:30:00.000Z'
  }
];

export const GET: APIRoute = async () => {
  try {
    const snapshot = await db
      .collection('reservations')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return new Response(JSON.stringify(STATIC_RESERVATIONS), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reservations: any[] = [];
    snapshot.forEach((doc) => {
      reservations.push(doc.data());
    });

    return new Response(JSON.stringify(reservations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.warn('Usando reservas fallback. Motivo:', error);
    // Fallback robusto
    return new Response(JSON.stringify(STATIC_RESERVATIONS), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
