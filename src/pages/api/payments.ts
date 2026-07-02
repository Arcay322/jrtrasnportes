import type { APIRoute } from 'astro';
import { db } from '../../lib/firebaseAdmin';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializar el cliente de MercadoPago (con token de prueba para fallback)
const mpToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-8739191024340798-020516-70e28f3a3880816cf6179bc3ebff99bd-161678122';
const client = new MercadoPagoConfig({ accessToken: mpToken });
const preference = new Preference(client);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { routeSlug, routeName, date, schedule, seats, totalPrice, customer } = body;

    // Validaciones básicas
    if (!routeSlug || !date || !schedule || !seats || seats.length === 0 || !customer) {
      return new Response(
        JSON.stringify({ message: 'Datos de reserva incompletos o inválidos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);

    // 1. Crear documento de reserva en Firestore con estado 'pending'
    const reservationRef = db.collection('reservations').doc();
    const reservationId = reservationRef.id;

    const reservationData = {
      id: reservationId,
      routeSlug,
      routeName,
      date,
      schedule,
      selectedSeats: seats,
      totalPrice: Number(totalPrice),
      customerName: customer.name,
      customerPhone: customer.phone,
      customerDni: customer.dni,
      paymentStatus: 'pending', // Esperando confirmación de MercadoPago
      createdAt: new Date().toISOString()
    };

    await reservationRef.set(reservationData);

    // 2. Crear la preferencia de pago en MercadoPago
    const mpPreference = await preference.create({
      body: {
        items: [
          {
            id: routeSlug,
            title: `Pasaje JR Transportes: ${routeName} (Asiento/s: ${seats.sort((a: number, b: number) => a - b).join(', ')})`,
            quantity: 1,
            unit_price: Number(totalPrice),
            currency_id: 'PEN'
          }
        ],
        payer: {
          name: customer.name,
          phone: {
            number: customer.phone
          },
          identification: {
            type: 'DNI',
            number: customer.dni
          }
        },
        back_urls: {
          success: `${url.origin}/reservar?status=success&id=${reservationId}`,
          failure: `${url.origin}/reservar?status=failure&id=${reservationId}`,
          pending: `${url.origin}/reservar?status=pending&id=${reservationId}`
        },
        auto_return: 'approved',
        // El webhook recibirá las actualizaciones de estado de MercadoPago
        notification_url: `${url.origin}/api/payments/webhook`,
        external_reference: reservationId
      }
    });

    // 3. Guardar el ID de preferencia en Firestore para rastreo
    await reservationRef.update({
      preferenceId: mpPreference.id
    });

    // 4. Retornar el punto de inicio de MercadoPago para la redirección
    return new Response(
      JSON.stringify({
        init_point: mpPreference.init_point,
        preferenceId: mpPreference.id,
        reservationId
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    return new Response(
      JSON.stringify({
        message: 'Error al procesar la reserva o el pago',
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
