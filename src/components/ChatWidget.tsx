import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
};

const QUICK_QUESTIONS = [
  '¿Cuáles son los horarios de salida?',
  '¿Cuáles son los precios de los pasajes?',
  '¿De dónde salen las minivans?',
  '¿Realizan envíos de encomiendas?'
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! 🇵🇪 Soy el asistente virtual de JR Transportes. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre rutas, tarifas, horarios o encomiendas.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll al final del chat cuando llega un mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.answer || 'Lo siento, no pude entender tu consulta. ¿Podrías intentar formularla de otra manera?',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje al bot:', error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'Lo siento, tengo problemas de conexión en este momento. Inténtalo de nuevo más tarde.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[84px] right-5 z-50 flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="mb-4 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-pampa-200 bg-white shadow-float transition-all duration-300 sm:w-[380px]">
          {/* Cabecera del Chat */}
          <div className="flex items-center justify-between bg-cielo-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-pampa-50/10">
                <span className="material-symbols-outlined text-pampa-300">smart_toy</span>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-quebrada-500 ring-2 ring-cielo-950 animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-headline text-sm font-semibold">JR Tours Asistente</h4>
                <p className="text-[10px] text-cream-light/75">Respuesta inmediata</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto bg-pampa-50/40 p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cielo-500 text-white rounded-br-none shadow-soft'
                      : 'bg-white text-pampa-900 border border-pampa-200/60 rounded-bl-none shadow-soft'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-pampa-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-none border border-pampa-200/60 bg-white px-4 py-3 shadow-soft">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-pampa-400 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-pampa-400 animate-bounce delay-150"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-pampa-400 animate-bounce delay-300"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas Sugeridas */}
          {messages.length === 1 && (
            <div className="bg-white px-4 py-2 border-t border-pampa-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pampa-400 mb-2">Preguntas sugeridas</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="rounded-full border border-pampa-200 bg-pampa-50 px-2.5 py-1 text-[11px] font-medium text-pampa-700 hover:bg-pampa-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Entrada de Texto */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2 border-t border-pampa-100 bg-white p-3"
          >
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-pampa-200 bg-pampa-50/50 px-3 text-xs font-semibold text-pampa-800 focus:border-cielo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cielo-500 text-white transition-all hover:bg-cielo-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante para abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-cielo-500 text-white shadow-float transition-all duration-200 hover:-translate-y-0.5 hover:bg-cielo-600 hover:shadow-elevated active:scale-95"
        aria-label="Abrir asistente de reservas"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'forum'}
        </span>
      </button>
    </div>
  );
}
