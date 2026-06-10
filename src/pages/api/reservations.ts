import type { APIRoute } from 'astro';
import { db } from '../../lib/firebaseAdmin';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const routeSlug = url.searchParams.get('route');
  const date = url.searchParams.get('date');
  const schedule = url.searchParams.get('schedule');

  if (!routeSlug || !date || !schedule) {
    return new Response(
      JSON.stringify({ message: 'Parámetros incompletos' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const snapshot = await db
      .collection('reservations')
      .where('routeSlug', '==', routeSlug)
      .where('date', '==', date)
      .where('schedule', '==', schedule)
      .get();

    const occupiedSeats: number[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const isApproved = data.paymentStatus === 'approved';
      
      // Bloqueo temporal: Asientos pendientes comprados en los últimos 10 minutos
      const createdAtTime = data.createdAt ? new Date(data.createdAt).getTime() : 0;
      const isPendingAndRecent =
        data.paymentStatus === 'pending' &&
        Date.now() - createdAtTime < 10 * 60 * 1000;

      if (isApproved || isPendingAndRecent) {
        if (Array.isArray(data.selectedSeats)) {
          occupiedSeats.push(...data.selectedSeats);
        }
      }
    });

    // Eliminar duplicados y ordenar
    const uniqueSeats = Array.from(new Set(occupiedSeats)).sort((a, b) => a - b);

    return new Response(JSON.stringify({ occupiedSeats: uniqueSeats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Error en servidor', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
