import twilio from 'twilio';

const accountSid = import.meta.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom =
  import.meta.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox por defecto

let twilioClient: any = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
  console.log('📱 Twilio SDK inicializado para alertas de WhatsApp.');
} else {
  console.warn(
    '⚠️ Advertencia: Falta TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN. Se usará un cliente simulado (mock).'
  );
  
  // Cliente Mock para desarrollo sin credenciales
  twilioClient = {
    messages: {
      create: async (params: any) => {
        console.log('📦 [SIMULACIÓN WHATSAPP] Envío de mensaje:');
        console.log(`- De: ${params.from}`);
        console.log(`- Para: ${params.to}`);
        console.log(`- Mensaje:\n"${params.body}"`);
        return {
          sid: 'mock_sid_' + Math.random().toString(36).substring(7),
          status: 'sent'
        };
      }
    }
  };
}

export { twilioClient, whatsappFrom };
export default twilioClient;
