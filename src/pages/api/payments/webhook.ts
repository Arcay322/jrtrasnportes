import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebaseAdmin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { sendTicketNotification } from '../../../lib/notifications';

const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-8739191024340798-020516-70e28f3a3880816cf6179bc3ebff99bd-161678122';
const client = new MercadoPagoConfig({ accessToken: mpToken });
const payment = new Payment(client);

export const POST: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    // Leer el body de forma segura
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // El webhook de MercadoPago a veces envía datos vacíos para pruebas
    }

    // Obtener ID del pago
    const paymentId = url.searchParams.get('data.id') || (body.data && body.data.id);
    const type = url.searchParams.get('type') || body.type;

    if (type === 'payment' && paymentId) {
      // 1. Obtener detalles del pago desde MercadoPago
      const paymentInfo = await payment.get({ id: paymentId });

      const reservationId = paymentInfo.external_reference;
      const status = paymentInfo.status; // 'approved', 'rejected', 'in_process', etc.

      if (reservationId) {
        // 2. Actualizar estado en Firestore
        const reservationRef = db.collection('reservations').doc(reservationId);
        
        await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(reservationRef);
          if (!doc.exists) return;

          transaction.update(reservationRef, {
            paymentStatus: status,
            paymentId: String(paymentId),
            updatedAt: new Date().toISOString()
          });
        });

        console.log(`✅ Webhook MP: Reserva ${reservationId} actualizada a estado: ${status}`);

        // 3. Si el pago es aprobado, enviar boleto por WhatsApp
        if (status === 'approved') {
          await sendTicketNotification(reservationId);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Error en webhook de MercadoPago:', error);
    // Retornamos 200 para evitar que MercadoPago reintente en bucle si hay errores de configuración local
    return new Response(
      JSON.stringify({ received: false, error: error.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
export const GET = POST; // Habilitar GET para pruebas rápidas desde el navegador
