import type { APIRoute } from 'astro';
import { db } from '../../lib/firebaseAdmin';

// Fallback estático en caso de que Firestore falle al cargar contexto
const FALLBACK_CONTEXT = `
JR Transportes es una empresa de transporte interprovincial y turismo ubicada en Ayacucho, Perú.
Rutas y tarifas actuales de pasajes:
- Pampa Cangallo: S/ 20 (Duración: 2h aprox.)
- Cangallo: S/ 25 (Duración: 2h 30m aprox.)
- Huancasancos: S/ 45 (Duración: 4h aprox.)

Tours destacados:
- Aguas Turquesas de Millpu: S/ 80 (Full Day)
- Pachapupum (Huanca Sancos): S/ 110 (Full Day)

Políticas y Horarios:
- Salidas todos los días desde el Terminal Sur de Ayacucho (San Juan Bautista).
- Horarios de salida: Desde las 5:00 AM hasta las 7:00 PM (salidas continuas cada 30 minutos).
- Encomiendas y giros: Se reciben en el Terminal Sur de Ayacucho y se entregan en ruta.
- Reservas: Los usuarios pueden reservar en tiempo real seleccionando sus asientos y pagando con MercadoPago en: https://jrtransportesmorochucos.com/reservar
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ answer: 'Mensaje inválido.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deepseekApiKey = import.meta.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

    if (!deepseekApiKey) {
      console.warn('⚠️ Advertencia: Falta DEEPSEEK_API_KEY en las variables de entorno. El bot responderá en modo simulación.');
      return new Response(
        JSON.stringify({
          answer: `[Simulación DeepSeek v4] Recibí tu mensaje: "${message}". Para activar el cerebro de IA real, configura la variable DEEPSEEK_API_KEY en tu archivo .env.`
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Obtener contexto dinámico de Firestore (RAG ligero)
    let dynamicContext = '';
    try {
      // Cargar rutas
      const routesSnapshot = await db.collection('routes').get();
      if (!routesSnapshot.empty) {
        dynamicContext += 'Rutas y tarifas actualizadas de JR Transportes:\n';
        routesSnapshot.forEach((doc) => {
          const r = doc.data();
          dynamicContext += `- ${r.name} (${r.category}): ${r.price}. Tiempo de viaje: ${r.travelTime}.\n`;
        });
      }

      // Cargar FAQs adicionales
      const faqsSnapshot = await db.collection('faqs').get();
      if (!faqsSnapshot.empty) {
        dynamicContext += '\nPreguntas frecuentes y respuestas:\n';
        faqsSnapshot.forEach((doc) => {
          const f = doc.data();
          dynamicContext += `- Pregunta: ${f.question}\n  Respuesta: ${f.answer}\n`;
        });
      }
    } catch (dbError) {
      console.warn('⚠️ Error al consultar Firestore para contexto, usando fallback estático:', dbError);
      dynamicContext = FALLBACK_CONTEXT;
    }

    if (!dynamicContext) {
      dynamicContext = FALLBACK_CONTEXT;
    }

    // 2. Construir System Prompt
    const systemPrompt = `
Eres "Mateo", el Asistente Virtual Inteligente oficial de la empresa de transporte y turismo "JR Transportes" de Ayacucho, Perú.
Tu objetivo es resolver dudas de los clientes con amabilidad, precisión y de forma concisa.

Contexto actual de la empresa:
${dynamicContext}

Instrucciones de comportamiento:
1. Sé extremadamente educado, servicial y usa modismos peruanos cordiales si es apropiado, pero mantén la seriedad comercial.
2. Si el cliente desea reservar pasajes o comprar boletos, explícale que puede hacerlo directamente en la web seleccionando su asiento y pagando con Yape/Plin/Tarjeta en el enlace: https://jrtransportesmorochucos.com/reservar
3. NO inventes precios, rutas, vehículos ni horarios que no estén detallados en el contexto.
4. Si el cliente te pregunta algo fuera de tu alcance o que no sabes responder, di amablemente que no cuentas con esa información y recomiéndale comunicarse con nuestra central de llamadas al 928 413 201 o haciendo clic en el botón de WhatsApp de soporte.
5. Mantén tus respuestas relativamente cortas (máximo 2 párrafos) para que sean fáciles de leer en un chat widget o WhatsApp.
`;

    // 3. Llamada a la API de DeepSeek (Compatible con OpenAI)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // Mapea al modelo DeepSeek-V3 / DeepSeek-R1
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API de DeepSeek respondió con código ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu respuesta en este momento.';

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Error en el cerebro de DeepSeek API:', error);
    return new Response(
      JSON.stringify({
        answer: 'Lo siento, ocurrió un error interno al conectar con mi cerebro de IA.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
