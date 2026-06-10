import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

type Booking = {
  id: string;
  routeSlug: string;
  routeName: string;
  date: string;
  schedule: string;
  selectedSeats: number[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerDni: string;
  paymentStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Perfil de usuario (para google logins incompletos)
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchUserDataAndBookings();
  }, []);

  const fetchUserDataAndBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener reservas
      const res = await fetch('/api/reservations/user');
      if (!res.ok) {
        throw new Error('No se pudieron obtener tus reservas o la sesión expiró.');
      }
      const data = await res.json();
      setBookings(data);

      // 2. Extraer datos de perfil del primer boleto si no hay perfil de usuario,
      // o consultar de cookies o metadatos de sesión si estuviera disponible.
      if (data.length > 0) {
        const firstBooking = data[0];
        setDisplayName(firstBooking.customerName || '');
        setDni(firstBooking.customerDni || '');
        setPhone(firstBooking.customerPhone || '');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    if (dni.length < 8 || phone.length < 9) {
      setProfileMessage('DNI debe ser de 8 dígitos y Teléfono de 9 dígitos.');
      setProfileSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/reservations/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, phone, displayName })
      });

      if (!res.ok) {
        throw new Error('Error al actualizar perfil en el servidor');
      }

      setProfileMessage('✓ Perfil actualizado con éxito. Buscando boletos asociados...');
      setIsEditingProfile(false);
      
      // Volver a cargar para jalar boletos asociados al nuevo DNI/teléfono
      setTimeout(() => {
        fetchUserDataAndBookings();
        setProfileMessage('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setProfileMessage('❌ Error: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      const res = await fetch('/api/auth/session', {
        method: 'DELETE'
      });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const isProfileIncomplete = !dni || !phone;

  // Filtrar boletos activos y pasados
  const todayStr = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(b => b.date >= todayStr);
  const pastBookings = bookings.filter(b => b.date < todayStr);

  return (
    <div className="w-full space-y-8">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 dark:bg-pampa-100/40 border border-pampa-200/50 dark:border-pampa-200/20 backdrop-blur-md rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="font-headline text-2xl text-pampa-900">
            ¡Hola, {displayName || 'Pasajero'}!
          </h2>
          <p className="text-xs text-pampa-700/60 dark:text-pampa-400 mt-1">
            DNI: {dni || 'No registrado'} | Teléfono: {phone || 'No registrado'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1.5 px-4 py-2 border border-pampa-200 dark:border-pampa-200/30 hover:bg-pampa-100/50 dark:hover:bg-pampa-200/40 text-pampa-800 dark:text-pampa-900 text-xs font-bold rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Editar Datos
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-logo-500 hover:bg-logo-600 text-white text-xs font-bold rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Alerta de Perfil Incompleto */}
      {isProfileIncomplete && !isEditingProfile && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-yellow-500/10 dark:bg-yellow-500/5 border border-yellow-500/30 dark:border-yellow-500/20 rounded-2xl p-5 text-sm text-yellow-800 dark:text-yellow-200 animate-pulse">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5">warning</span>
            <div>
              <p className="font-bold">Perfil Incompleto para Descarga de Boletos</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Falta ingresar tu DNI o número de celular. Completa tus datos para asociar tus boletos comprados previamente y poder descargar tus PDFs de viaje.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="shrink-0 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm"
          >
            Completar Ahora
          </button>
        </div>
      )}

      {/* Formulario de Perfil (Colapsable) */}
      {isEditingProfile && (
        <div className="bg-white dark:bg-pampa-100/60 border border-pampa-200 dark:border-pampa-200/30 rounded-2xl p-6 shadow-sm">
          <h3 className="font-headline text-lg text-pampa-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-pampa-500">manage_accounts</span>
            Actualizar Información de Perfil
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            {profileMessage && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${profileMessage.startsWith('✓') ? 'bg-green-500/10 border border-green-500/20 text-green-700' : 'bg-logo-500/10 border border-logo-500/20 text-logo-600 dark:text-logo-400'}`}>
                {profileMessage}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pampa-700 mb-1" htmlFor="profile-name">
                  Nombre
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 py-2 text-sm text-pampa-900 dark:text-pampa-900 outline-none focus:border-pampa-400 dark:focus:border-pampa-300 focus:ring-2 focus:ring-pampa-300/30"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pampa-700 mb-1" htmlFor="profile-dni">
                  DNI (8 dígitos)
                </label>
                <input
                  id="profile-dni"
                  type="text"
                  required
                  maxLength={8}
                  pattern="\d{8}"
                  className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 py-2 text-sm text-pampa-900 dark:text-pampa-900 outline-none focus:border-pampa-400 dark:focus:border-pampa-300 focus:ring-2 focus:ring-pampa-300/30"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pampa-700 mb-1" htmlFor="profile-phone">
                  Celular / WhatsApp
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  required
                  maxLength={9}
                  pattern="9\d{8}"
                  className="w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 py-2 text-sm text-pampa-900 dark:text-pampa-900 outline-none focus:border-pampa-400 dark:focus:border-pampa-300 focus:ring-2 focus:ring-pampa-300/30"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-pampa-500 hover:bg-pampa-600 text-white dark:text-pampa-50 font-bold text-xs px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {profileSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="border border-pampa-200 dark:border-pampa-200/30 hover:bg-pampa-100 dark:hover:bg-pampa-200/40 text-pampa-800 dark:text-pampa-900 font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-pampa-500 border-t-transparent" />
          <p className="text-sm text-pampa-700/60 font-semibold">Cargando tus boletos y reservas...</p>
        </div>
      ) : error ? (
        <div className="bg-logo-500/10 border border-logo-500/25 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-logo-500 text-4xl mb-2">cloud_off</span>
          <p className="text-sm font-bold text-logo-600">{error}</p>
          <button
            onClick={fetchUserDataAndBookings}
            className="mt-4 bg-logo-500 hover:bg-logo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
          >
            Reintentar Carga
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Boletos Próximos */}
          <div>
            <h3 className="font-headline text-xl text-pampa-900 mb-4 flex items-center gap-2 border-b border-pampa-200 dark:border-pampa-200/30 pb-2">
              <span className="material-symbols-outlined text-quebrada-400">confirmation_number</span>
              Mis Viajes Próximos
            </h3>
            {activeBookings.length === 0 ? (
              <div className="bg-white/50 dark:bg-pampa-200/10 border border-dashed border-pampa-200 dark:border-pampa-200/30 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-pampa-300 text-4xl mb-2">departure_board</span>
                <p className="text-sm text-pampa-700/60 dark:text-pampa-400 font-semibold">No tienes ningún viaje próximo programado.</p>
                <a
                  href="/reservar"
                  className="mt-4 inline-flex items-center gap-1 bg-pampa-500 hover:bg-pampa-600 text-white dark:text-pampa-50 text-xs font-bold px-4 py-2.5 rounded-lg transition-all no-underline"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Comprar Pasaje
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="bg-white dark:bg-pampa-100/60 border border-pampa-200 dark:border-pampa-200/30 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${booking.paymentStatus === 'approved' ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20 dark:border-green-500/30' : booking.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20 dark:border-yellow-500/30' : 'bg-logo-500/10 text-logo-700 dark:text-logo-400 border border-logo-500/20 dark:border-logo-500/30'}`}>
                          {booking.paymentStatus === 'approved' ? 'Aprobado' : booking.paymentStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </span>
                        <span className="text-xs text-pampa-700/50 dark:text-pampa-400/70 font-data">ID: {booking.id}</span>
                      </div>
                      
                      <h4 className="font-headline text-lg text-pampa-900 mb-2">{booking.routeName}</h4>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-3">
                        <div className="flex items-center gap-1.5 text-pampa-700">
                          <span className="material-symbols-outlined text-sm text-pampa-400">calendar_today</span>
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pampa-700">
                          <span className="material-symbols-outlined text-sm text-pampa-400">schedule</span>
                          <span>{booking.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pampa-700">
                          <span className="material-symbols-outlined text-sm text-pampa-400">event_seat</span>
                          <span>Asientos: {booking.selectedSeats.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pampa-700">
                          <span className="material-symbols-outlined text-sm text-pampa-400">payments</span>
                          <span className="font-bold text-pampa-900">S/ {booking.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-pampa-50/50 dark:bg-pampa-200/20 border-t border-pampa-200/50 dark:border-pampa-200/20 px-5 py-3 flex gap-2">
                      <a
                        href={booking.paymentStatus === 'approved' ? `https://viajaayacucho.com/tickets/${booking.id}.pdf` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg transition-all no-underline ${booking.paymentStatus === 'approved' ? 'bg-pampa-500 hover:bg-pampa-600 text-white dark:text-pampa-50' : 'bg-pampa-200/50 text-pampa-400 cursor-not-allowed'}`}
                        onClick={(e) => {
                          if (booking.paymentStatus !== 'approved') {
                            e.preventDefault();
                            alert('El boleto aún no está aprobado para descarga.');
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Descargar PDF
                      </a>
                      
                      <a
                        href={`https://wa.me/51928413201?text=Hola%20soporte%2C%20tengo%20una%20consulta%20sobre%20mi%20boleto%20aprobado%20con%20ID%20${booking.id}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-xs font-bold px-3 py-2 border border-pampa-200 dark:border-pampa-200/30 hover:bg-pampa-100 dark:hover:bg-pampa-200/40 rounded-lg text-pampa-800 dark:text-pampa-900 transition-all no-underline"
                      >
                        <span className="material-symbols-outlined text-sm">support_agent</span>
                        Soporte
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial de Viajes */}
          <div>
            <h3 className="font-headline text-xl text-pampa-900 mb-4 flex items-center gap-2 border-b border-pampa-200 dark:border-pampa-200/30 pb-2">
              <span className="material-symbols-outlined text-pampa-400">history</span>
              Historial de Viajes Pasados
            </h3>
            {pastBookings.length === 0 ? (
              <p className="text-xs text-pampa-700/50 dark:text-pampa-400 italic">No se encontraron registros de viajes pasados.</p>
            ) : (
              <div className="bg-white dark:bg-pampa-100/60 border border-pampa-200 dark:border-pampa-200/30 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-pampa-50 dark:bg-pampa-200/40 border-b border-pampa-200 dark:border-pampa-200/20 text-pampa-800 dark:text-pampa-900 font-bold uppercase tracking-wider">
                      <th className="p-4">Destino</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Asientos</th>
                      <th className="p-4">Importe</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pampa-100 dark:divide-pampa-200/20">
                    {pastBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-pampa-50/20 dark:hover:bg-pampa-200/10 text-pampa-700 dark:text-pampa-800">
                        <td className="p-4 font-bold">{booking.routeName}</td>
                        <td className="p-4">{booking.date} - {booking.schedule}</td>
                        <td className="p-4">Asientos: {booking.selectedSeats.join(', ')}</td>
                        <td className="p-4 font-bold">S/ {booking.totalPrice.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <a
                            href={`https://wa.me/51928413201?text=Hola%20JR%20Transportes%2C%20requiero%20solicitar%20factura%20de%20mi%20viaje%20con%20ID%20${booking.id}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-pampa-600 hover:text-pampa-800 no-underline"
                          >
                            <span className="material-symbols-outlined text-xs">receipt_long</span>
                            Comprobante
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
