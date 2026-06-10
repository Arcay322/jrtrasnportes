import { db } from './firebaseAdmin';
import { twilioClient, whatsappFrom } from './twilioClient';

export async function sendTicketNotification(reservationId: string) {
  try {
    const doc = await db.collection('reservations').doc(reservationId).get();
    if (!doc.exists) {
      console.error(
        `❌ sendTicketNotification: No se encontró la reserva ${reservationId}`
      );
      return false;
    }

    const data = doc.data();
    if (!data) return false;

    // Normalizar número de teléfono (por defecto +51 de Perú si no tiene prefijo de país)
    let phone = data.customerPhone.trim().replace(/\s/g, '');
    if (!phone.startsWith('+')) {
      phone = `+51${phone}`;
    }
    const whatsappTo = `whatsapp:${phone}`;

    const seatsList = Array.isArray(data.selectedSeats)
      ? data.selectedSeats.sort((a: number, b: number) => a - b).join(', ')
      : 'No especificados';

    const messageBody =
      `🎫 *JR Transportes - Boleto de Viaje*\n\n` +
      `¡Hola ${data.customerName}! Confirmamos la compra de tu pasaje con éxito. Aquí tienes el detalle de tu viaje:\n\n` +
      `📍 *Origen:* Terminal Sur de Ayacucho\n` +
      `🏁 *Destino:* ${data.routeName}\n` +
      `📅 *Fecha:* ${data.date}\n` +
      `⏰ *Horario:* ${data.schedule}\n` +
      `💺 *Asiento(s):* ${seatsList}\n` +
      `💰 *Total Pagado:* S/ ${data.totalPrice.toFixed(2)}\n\n` +
      `Puedes ver tu boleto digital y presentarlo en embarque ingresando aquí:\n` +
      `https://jrtransportesmorochucos.com/reservar?status=success&id=${data.id}\n\n` +
      `¡Gracias por confiar en nosotros! Recuerda llegar 20 minutos antes de la hora de salida.`;

    const message = await twilioClient.messages.create({
      body: messageBody,
      from: whatsappFrom,
      to: whatsappTo
    });

    console.log(
      `📱 Notificación WhatsApp enviada para la reserva ${reservationId}. SID: ${message.sid}`
    );

    // Guardar SID de notificación en Firestore para auditoría
    await db.collection('reservations').doc(reservationId).update({
      whatsappNotificationSid: message.sid,
      notifiedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error(
      `❌ Error al enviar notificación de WhatsApp para la reserva ${reservationId}:`,
      error
    );
    return false;
  }
}
