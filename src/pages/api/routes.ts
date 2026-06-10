import type { APIRoute } from 'astro';
import { db } from '../../lib/firebaseAdmin';

const STATIC_ROUTES = [
  {
    slug: 'pampa-cangallo',
    name: 'Pampa Cangallo',
    category: 'destino',
    price: 'Desde S/ 20',
    travelTime: '2h aprox.'
  },
  {
    slug: 'cangallo',
    name: 'Cangallo',
    category: 'destino',
    price: 'Desde S/ 25',
    travelTime: '2h 30m aprox.'
  },
  {
    slug: 'huancasancos',
    name: 'Huancasancos',
    category: 'destino',
    price: 'Desde S/ 45',
    travelTime: '4h aprox.'
  },
  {
    slug: 'tour-millpu',
    name: 'Aguas Turquesas de Millpu',
    category: 'tour',
    price: 'S/ 80',
    travelTime: 'Full Day'
  },
  {
    slug: 'tour-pachapupum',
    name: 'Pachapupum (Huanca Sancos)',
    category: 'tour',
    price: 'S/ 110',
    travelTime: 'Full Day'
  }
];

export const GET: APIRoute = async () => {
  try {
    const snapshot = await db.collection('routes').get();

    if (snapshot.empty) {
      return new Response(JSON.stringify(STATIC_ROUTES), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const routes: any[] = [];
    snapshot.forEach((doc) => {
      routes.push(doc.data());
    });

    return new Response(JSON.stringify(routes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.warn('Usando rutas fallback. Motivo:', error);
    // Robustez: fallback estático en caso de que Firebase aún no esté conectado
    return new Response(JSON.stringify(STATIC_ROUTES), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
