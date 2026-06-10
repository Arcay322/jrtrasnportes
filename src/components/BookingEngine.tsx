import React, { useState, useEffect } from 'react';

type Destination = {
  slug: string;
  name: string;
  category: 'destino' | 'tour';
  price: string;
  travelTime: string;
};

// Fallback por si la API aún no está activa (robustez de código)
const DEFAULT_DESTINATIONS: Destination[] = [
  { slug: 'pampa-cangallo', name: 'Pampa Cangallo', category: 'destino', price: 'Desde S/ 20', travelTime: '2h aprox.' },
  { slug: 'cangallo', name: 'Cangallo', category: 'destino', price: 'Desde S/ 25', travelTime: '2h 30m aprox.' },
  { slug: 'huancasancos', name: 'Huancasancos', category: 'destino', price: 'Desde S/ 45', travelTime: '4h aprox.' },
  { slug: 'tour-millpu', name: 'Aguas Turquesas de Millpu', category: 'tour', price: 'S/ 80', travelTime: 'Full Day' },
  { slug: 'tour-pachapupum', name: 'Pachapupum (Huanca Sancos)', category: 'tour', price: 'S/ 110', travelTime: 'Full Day' }
];

const SCHEDULES = ['06:00 AM', '08:30 AM', '11:00 AM', '01:30 PM', '04:30 PM', '07:00 PM'];

export default function BookingEngine() {
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>(DEFAULT_DESTINATIONS);
  
  // Form State
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDni, setCustomerDni] = useState('');
  
  // Loading and Error State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Asientos ocupados simulados / obtenidos de la API
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([3, 7, 12]);

  // Cargar destinos reales desde Firestore en el montaje
  useEffect(() => {
    fetch('/api/routes')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar rutas');
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) setDestinations(data);
      })
      .catch((err) => console.warn('Usando destinos fallback:', err));
  }, []);

  // Pre-seleccionar la ruta si viene como parametro "route" en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const routeParam = params.get('route');
      if (routeParam) {
        setSelectedSlug(routeParam);
      }
    }
  }, []);

  // Obtener asientos ocupados reales cuando se selecciona ruta, fecha y horario
  useEffect(() => {
    if (selectedSlug && selectedDate && selectedSchedule) {
      setLoading(true);
      fetch(`/api/reservations?route=${selectedSlug}&date=${selectedDate}&schedule=${selectedSchedule}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.occupiedSeats) {
            setOccupiedSeats(data.occupiedSeats);
          }
          setLoading(false);
        })
        .catch(() => {
          // Fallback a mock en desarrollo si no hay backend activo
          setOccupiedSeats([2, 5, 11]);
          setLoading(false);
        });
    }
  }, [selectedSlug, selectedDate, selectedSchedule]);

  const selectedDestination = destinations.find((d) => d.slug === selectedSlug);
  const numericPrice = selectedDestination 
    ? parseInt(selectedDestination.price.replace(/[^\d]/g, '')) || 25 
    : 25;
  const totalPrice = selectedSeats.length * numericPrice;

  // Manejo de la selección de asientos (máximo 5 por persona)
  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) return; // Asiento ocupado

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 5) {
        alert('Puedes reservar un máximo de 5 asientos por transacción.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Enviar reserva e iniciar MercadoPago
  const handlePayment = async () => {
    if (!customerName || !customerPhone || !customerDni) {
      setErrorMessage('Por favor, completa todos tus datos personales.');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeSlug: selectedSlug,
          routeName: selectedDestination?.name,
          date: selectedDate,
          schedule: selectedSchedule,
          seats: selectedSeats,
          price: numericPrice,
          totalPrice,
          customer: {
            name: customerName,
            phone: customerPhone,
            dni: customerDni
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar el pago');

      // Redirigir al checkout de MercadoPago Sandbox/Producción
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió el enlace de pago de MercadoPago');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con la pasarela de pagos.');
      setLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-pampa-200/60 dark:border-pampa-200/30 bg-white dark:bg-pampa-100/60 p-6 shadow-card md:p-8">
      {/* Indicador de pasos */}
      <div className="mb-8 flex items-center justify-between border-b border-pampa-100 pb-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= num
                  ? 'bg-cielo-500 text-white shadow-soft'
                  : 'bg-pampa-100 text-pampa-500'
              }`}
            >
              {num}
            </span>
            <span
              className={`hidden text-xs font-bold sm:inline ${
                step === num ? 'text-pampa-800' : 'text-pampa-400'
              }`}
            >
              {num === 1 && 'Elige tu Viaje'}
              {num === 2 && 'Selecciona Asientos'}
              {num === 3 && 'Datos y Pago'}
            </span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-logo-500/10 p-4 text-sm font-semibold text-logo-600 border border-logo-500/20">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* PASO 1: Selección de Destino, Fecha y Horario */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 mb-2">
                Destino o Tour
              </label>
              <select
                className="h-12 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-pampa-50/50 dark:bg-pampa-950/40 px-4 text-sm font-semibold text-pampa-800 dark:text-pampa-900 focus:border-cielo-500 dark:focus:border-pampa-300 focus:outline-none"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
              >
                <option value="">Selecciona una opción...</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name} ({d.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 mb-2">
                Fecha de Salida
              </label>
              <input
                type="date"
                min={getTodayString()}
                className="h-12 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-pampa-50/50 dark:bg-pampa-950/40 px-4 text-sm font-semibold text-pampa-800 dark:text-pampa-900 focus:border-cielo-500 dark:focus:border-pampa-300 focus:outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 mb-2">
              Horario de Salida
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {SCHEDULES.map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setSelectedSchedule(time)}
                  className={`h-11 rounded-lg border text-xs font-bold transition-all ${
                    selectedSchedule === time
                      ? 'border-cielo-500 bg-cielo-500 text-white shadow-soft'
                      : 'border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 text-pampa-700 dark:text-pampa-900 hover:bg-pampa-50 dark:hover:bg-pampa-200/40'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              disabled={!selectedSlug || !selectedDate || !selectedSchedule}
              onClick={() => setStep(2)}
              className="btn-primary w-full sm:w-auto"
            >
              Continuar
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Mapa de Asientos */}
      {step === 2 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Mapa de Asientos */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-base font-bold text-pampa-800">Mapa de Asientos (Minivan H1)</h3>
            
            {/* Cabina */}
            <div className="mx-auto max-w-[280px] rounded-t-3xl border-2 border-dashed border-pampa-300/40 p-4">
              <div className="flex justify-between items-center mb-6 px-4">
                <span className="text-xs font-bold text-pampa-400">Parabrisas</span>
                <span className="material-symbols-outlined text-pampa-400 rotate-90">navigation</span>
              </div>
              
              <div className="flex justify-between mb-8">
                {/* Conductor */}
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-pampa-200 text-pampa-500 cursor-not-allowed">
                  <span className="material-symbols-outlined">airline_seat_recline_normal</span>
                </div>
                {/* Asiento 1 (Copiloto) */}
                <button
                  type="button"
                  onClick={() => handleSeatClick(1)}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    occupiedSeats.includes(1)
                      ? 'bg-logo-500 text-white cursor-not-allowed'
                      : selectedSeats.includes(1)
                      ? 'bg-cielo-500 text-white shadow-soft'
                      : 'bg-pampa-100 text-pampa-700 hover:bg-pampa-200'
                  }`}
                >
                  1
                </button>
              </div>

              {/* Distribución asientos de Minivan H1 */}
              <div className="space-y-4">
                {/* Fila 2: [2, 3, 4] */}
                <div className="flex justify-between">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSeatClick(num)}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        occupiedSeats.includes(num)
                          ? 'bg-logo-500/80 text-white cursor-not-allowed'
                          : selectedSeats.includes(num)
                          ? 'bg-cielo-500 text-white shadow-soft'
                          : 'bg-pampa-100 text-pampa-700 hover:bg-pampa-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Fila 3: [5, 6, 7] */}
                <div className="flex justify-between">
                  {[5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSeatClick(num)}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        occupiedSeats.includes(num)
                          ? 'bg-logo-500/80 text-white cursor-not-allowed'
                          : selectedSeats.includes(num)
                          ? 'bg-cielo-500 text-white shadow-soft'
                          : 'bg-pampa-100 text-pampa-700 hover:bg-pampa-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Fila 4: [8, 9, 10] */}
                <div className="flex justify-between">
                  {[8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSeatClick(num)}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        occupiedSeats.includes(num)
                          ? 'bg-logo-500/80 text-white cursor-not-allowed'
                          : selectedSeats.includes(num)
                          ? 'bg-cielo-500 text-white shadow-soft'
                          : 'bg-pampa-100 text-pampa-700 hover:bg-pampa-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Fila 5: [11, 12, 13, 14, 15] */}
                <div className="flex justify-between gap-1">
                  {[11, 12, 13, 14, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSeatClick(num)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                        occupiedSeats.includes(num)
                          ? 'bg-logo-500/80 text-white cursor-not-allowed'
                          : selectedSeats.includes(num)
                          ? 'bg-cielo-500 text-white shadow-soft'
                          : 'bg-pampa-100 text-pampa-700 hover:bg-pampa-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="mt-6 flex justify-center gap-6">
              <div className="flex items-center gap-1.5 text-xs text-pampa-600">
                <span className="h-4 w-4 rounded bg-pampa-100"></span> Disponible
              </div>
              <div className="flex items-center gap-1.5 text-xs text-pampa-600">
                <span className="h-4 w-4 rounded bg-cielo-500"></span> Seleccionado
              </div>
              <div className="flex items-center gap-1.5 text-xs text-pampa-600">
                <span className="h-4 w-4 rounded bg-logo-500"></span> Ocupado
              </div>
            </div>
          </div>

          {/* Resumen Lateral */}
          <div className="rounded-xl bg-pampa-50 dark:bg-pampa-100/40 p-5 border border-pampa-200/50 dark:border-pampa-200/20">
            <h4 className="font-headline text-lg text-pampa-900 mb-4">Detalle de Asientos</h4>
            <div className="space-y-3 text-sm text-pampa-700">
              <div className="flex justify-between">
                <span>Ruta:</span>
                <strong className="text-pampa-900">{selectedDestination?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <strong className="text-pampa-900">{selectedDate}</strong>
              </div>
              <div className="flex justify-between">
                <span>Hora:</span>
                <strong className="text-pampa-900">{selectedSchedule}</strong>
              </div>
              <div className="flex justify-between border-t border-pampa-200/50 pt-2">
                <span>Asientos:</span>
                <strong className="text-pampa-900">
                  {selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(', ') : 'Ninguno'}
                </strong>
              </div>
              <div className="flex justify-between border-t border-pampa-200/50 pt-2 text-base">
                <span>Precio Unitario:</span>
                <strong className="text-pampa-900 font-data">S/ {numericPrice.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between border-b border-pampa-200/50 pb-2 text-lg font-bold text-pampa-900">
                <span>Total:</span>
                <span className="text-cielo-600 font-data">S/ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(3)}
                className="btn-primary w-full"
              >
                Ingresar Datos
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs font-bold text-pampa-500 hover:text-pampa-700 py-2"
              >
                ← Volver a ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: Datos y Checkout */}
      {step === 3 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pampa-800 dark:text-white mb-4">Datos del Pasajero</h3>
            
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 dark:text-pampa-400 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ej. Arnie Calderón"
                className="h-11 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-pampa-50/50 dark:bg-pampa-950/40 px-4 text-sm font-semibold text-pampa-800 dark:text-pampa-900 placeholder-pampa-400 dark:placeholder-pampa-500 focus:border-cielo-500 dark:focus:border-pampa-300 focus:outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 dark:text-pampa-400 mb-1.5">
                Número de Celular (WhatsApp)
              </label>
              <input
                type="tel"
                placeholder="Ej. 928413201"
                className="h-11 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-pampa-50/50 dark:bg-pampa-950/40 px-4 text-sm font-semibold text-pampa-800 dark:text-pampa-900 placeholder-pampa-400 dark:placeholder-pampa-500 focus:border-cielo-500 dark:focus:border-pampa-300 focus:outline-none"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600/70 dark:text-pampa-400 mb-1.5">
                Documento de Identidad (DNI)
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="Ej. 74839201"
                className="h-11 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-pampa-50/50 dark:bg-pampa-950/40 px-4 text-sm font-semibold text-pampa-800 dark:text-pampa-900 placeholder-pampa-400 dark:placeholder-pampa-500 focus:border-cielo-500 dark:focus:border-pampa-300 focus:outline-none font-data"
                value={customerDni}
                onChange={(e) => setCustomerDni(e.target.value.replace(/[^\d]/g, ''))}
              />
            </div>
          </div>

          {/* Resumen Final y Pago */}
          <div className="rounded-xl bg-pampa-50 dark:bg-pampa-100/40 p-5 border border-pampa-200/50 dark:border-pampa-200/20 flex flex-col justify-between">
            <div>
              <h4 className="font-headline text-lg text-pampa-900 mb-4">Confirmar Viaje</h4>
              <div className="space-y-2 text-sm text-pampa-700">
                <p>📍 <strong>Origen:</strong> Terminal Sur de Ayacucho</p>
                <p>🏁 <strong>Destino:</strong> {selectedDestination?.name}</p>
                <p>📅 <strong>Fecha:</strong> {selectedDate}</p>
                <p>⏰ <strong>Horario:</strong> {selectedSchedule}</p>
                <p>💺 <strong>Asientos Seleccionados:</strong> {selectedSeats.sort((a,b)=>a-b).join(', ')}</p>
                <p className="border-t border-pampa-200/50 pt-2 text-lg font-bold text-pampa-900">
                  Total a Pagar: <span className="text-cielo-600 font-data">S/ {totalPrice.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={handlePayment}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                data-loading={loading ? "true" : "false"}
              >
                {!loading && (
                  <>
                    <span className="material-symbols-outlined text-sm">payment</span>
                    Pagar con MercadoPago
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs font-bold text-pampa-500 hover:text-pampa-700 py-2"
              >
                ← Cambiar asientos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
