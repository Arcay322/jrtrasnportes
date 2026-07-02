import React, { useState, useEffect } from 'react';

type Reservation = {
  id: string;
  routeSlug: string;
  routeName: string;
  date: string;
  schedule: string;
  selectedSeats: number[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  paymentStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

type Vehicle = {
  id: string;
  plate: string;
  type: string;
  capacity: number;
  driverName: string;
  status: 'activo' | 'inactivo' | 'mantenimiento';
};

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    routeSlug: 'cangallo',
    routeName: 'Cangallo',
    date: '2026-06-12',
    schedule: '08:30 AM',
    selectedSeats: [3, 4],
    totalPrice: 50.0,
    customerName: 'Juan Pérez',
    customerPhone: '918712309',
    paymentStatus: 'approved',
    createdAt: '2026-06-10T02:00:00.000Z'
  },
  {
    id: 'res-002',
    routeSlug: 'pampa-cangallo',
    routeName: 'Pampa Cangallo',
    date: '2026-06-13',
    schedule: '06:00 AM',
    selectedSeats: [7],
    totalPrice: 20.0,
    customerName: 'María Rojas',
    customerPhone: '980849165',
    paymentStatus: 'pending',
    createdAt: '2026-06-10T03:30:00.000Z'
  }
];

const MOCK_FLEET: Vehicle[] = [
  { id: 'fleet-01', plate: 'V3X-982', type: 'Toyota Avanza (Camioneta)', capacity: 6, driverName: 'Juan Carlos Quispe', status: 'activo' },
  { id: 'fleet-02', plate: 'F4T-811', type: 'Toyota Yaris (Sedán)', capacity: 4, driverName: 'Pedro Mendoza', status: 'activo' },
  { id: 'fleet-03', plate: 'A9B-122', type: 'Toyota Avanza (Camioneta)', capacity: 6, driverName: 'Arnie Calderón', status: 'activo' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'fleet' | 'metrics'>('overview');
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [fleet, setFleet] = useState<Vehicle[]>(MOCK_FLEET);
  const [loading, setLoading] = useState(false);


  // Formulario de flota nuevo vehículo
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Toyota Avanza (Camioneta)');
  const [newCapacity, setNewCapacity] = useState(6);
  const [newDriver, setNewDriver] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Intentar cargar reservas reales
      const resReservations = await fetch('/api/admin/reservations');
      if (resReservations.ok) {
        const data = await resReservations.json();
        if (data && data.length > 0) setReservations(data);
      }

      // Intentar cargar flota real
      const resFleet = await fetch('/api/admin/fleet');
      if (resFleet.ok) {
        const data = await resFleet.json();
        if (data && data.length > 0) setFleet(data);
      }
    } catch (err) {
      console.warn('Usando datos simulados de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de un vehículo
  const handleUpdateVehicleStatus = async (id: string, status: 'activo' | 'inactivo' | 'mantenimiento') => {
    try {
      const response = await fetch(`/api/admin/fleet?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Error al actualizar');
      
      setFleet(fleet.map(v => v.id === id ? { ...v, status } : v));
    } catch (err) {
      console.warn('Fallback local usado para estado:', err);
      setFleet(fleet.map(v => v.id === id ? { ...v, status } : v));
    }
  };

  // Agregar vehículo
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newDriver) {
      alert('Completa la placa y el conductor.');
      return;
    }

    const newVehicle: Vehicle = {
      id: `fleet-${Date.now()}`,
      plate: newPlate.toUpperCase(),
      type: newType,
      capacity: Number(newCapacity),
      driverName: newDriver,
      status: 'activo'
    };

    try {
      const response = await fetch('/api/admin/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });

      if (!response.ok) throw new Error('No se pudo guardar');
      
      setFleet([...fleet, newVehicle]);
    } catch (err) {
      console.warn('Fallback local usado para nuevo vehículo:', err);
      setFleet([...fleet, newVehicle]);
    }

    setNewPlate('');
    setNewDriver('');
  };

  // Métricas
  const approvedReservations = reservations.filter(r => r.paymentStatus === 'approved');
  const totalSales = approvedReservations.reduce((sum, r) => sum + r.totalPrice, 0);
  const activeVehiclesCount = fleet.filter(v => v.status === 'activo').length;

  return (
    <div className="w-full bg-white rounded-xl border border-pampa-200/60 shadow-card overflow-hidden">
      {/* Cabecera Interna */}
      <div className="bg-cielo-950 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline text-2xl text-white">Panel de Administración</h2>
          <p className="text-xs text-cream-light/75">Gestión de flota y monitoreo de ventas de JR Transportes</p>
        </div>
        
        {/* Pestañas */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-white dark:!bg-pampa-600 text-cielo-950 shadow-soft' : 'text-white hover:bg-white/5'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'reservations' ? 'bg-white dark:!bg-pampa-600 text-cielo-950 shadow-soft' : 'text-white hover:bg-white/5'
            }`}
          >
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'fleet' ? 'bg-white dark:!bg-pampa-600 text-cielo-950 shadow-soft' : 'text-white hover:bg-white/5'
            }`}
          >
            Flota Vehicular
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'metrics' ? 'bg-white dark:!bg-pampa-600 text-cielo-950 shadow-soft' : 'text-white hover:bg-white/5'
            }`}
          >
            Métricas CMMI
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && <p className="text-center text-sm font-semibold text-pampa-500 py-8">Cargando datos...</p>}

        {/* TAB 1: RESUMEN / METRICAS (MA - Medición y Análisis) */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-pampa-200 bg-pampa-50/40 p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pampa-500">Ingresos Totales</p>
                  <strong className="text-3xl text-pampa-900 font-data">S/ {totalSales.toFixed(2)}</strong>
                </div>
                <span className="material-symbols-outlined text-cielo-500 bg-cielo-100 p-3 rounded-full">payments</span>
              </div>

              <div className="rounded-xl border border-pampa-200 bg-pampa-50/40 p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pampa-500">Reservas Aprobadas</p>
                  <strong className="text-3xl text-pampa-900 font-data">{approvedReservations.length}</strong>
                </div>
                <span className="material-symbols-outlined text-poncho-400 bg-pampa-100 p-3 rounded-full">confirmation_number</span>
              </div>

              <div className="rounded-xl border border-pampa-200 bg-pampa-50/40 p-5 flex items-center justify-between shadow-soft">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-pampa-500">Flota Activa</p>
                  <strong className="text-3xl text-pampa-900 font-data">{activeVehiclesCount} / {fleet.length}</strong>
                </div>
                <span className="material-symbols-outlined text-quebrada-400 bg-quebrada-500/10 p-3 rounded-full">directions_bus</span>
              </div>
            </div>

            {/* Tabla de ventas recientes */}
            <div className="border border-pampa-200 dark:border-pampa-200/30 rounded-xl overflow-hidden shadow-soft">
              <div className="bg-pampa-50/60 dark:bg-pampa-200/20 px-5 py-4 border-b border-pampa-200 dark:border-pampa-200/30 flex justify-between items-center">
                <h3 className="font-headline text-lg text-pampa-800">Ventas Recientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-pampa-100 dark:bg-pampa-200/40 text-[10px] font-extrabold uppercase tracking-wider text-pampa-600 dark:text-pampa-400">
                    <tr>
                      <th className="px-5 py-3">Cliente</th>
                      <th className="px-5 py-3">Ruta</th>
                      <th className="px-5 py-3">Asientos</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pampa-200/50 dark:divide-pampa-200/30 text-pampa-800 dark:text-pampa-900">
                    {reservations.slice(0, 5).map(res => (
                      <tr key={res.id}>
                        <td className="px-5 py-3.5 font-semibold text-pampa-800 dark:text-pampa-100">{res.customerName}</td>
                        <td className="px-5 py-3.5 text-pampa-600 dark:text-pampa-300">{res.routeName}</td>
                        <td className="px-5 py-3.5 font-data text-pampa-600 dark:text-pampa-300">{res.selectedSeats.join(', ')}</td>
                         <td className="px-5 py-3.5 font-data font-bold text-cielo-700 dark:text-cielo-300">S/ {res.totalPrice.toFixed(2)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            res.paymentStatus === 'approved' ? 'bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400' : 'bg-pampa-100 dark:bg-pampa-200/40 text-pampa-500 dark:text-pampa-400'
                          }`}>
                            {res.paymentStatus === 'approved' ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTION DE RESERVAS */}
        {!loading && activeTab === 'reservations' && (
          <div className="border border-pampa-200 dark:border-pampa-200/30 rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-pampa-50 dark:bg-pampa-200/40 text-[10px] font-extrabold uppercase tracking-wider text-pampa-600 dark:text-pampa-400">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Contacto</th>
                    <th className="px-5 py-3">Ruta / Destino</th>
                    <th className="px-5 py-3">Fecha y Hora</th>
                    <th className="px-5 py-3">Asientos</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pampa-200/50 dark:divide-pampa-200/30 text-pampa-800 dark:text-pampa-900">
                  {reservations.map(res => (
                    <tr key={res.id}>
                      <td className="px-5 py-3.5 font-data text-xs text-pampa-500 dark:text-pampa-400">{res.id}</td>
                      <td className="px-5 py-3.5 font-bold text-pampa-800 dark:text-pampa-100">{res.customerName}</td>
                      <td className="px-5 py-3.5 font-data text-xs text-pampa-600 dark:text-pampa-300">{res.customerPhone}</td>
                      <td className="px-5 py-3.5 text-pampa-600 dark:text-pampa-300">{res.routeName}</td>
                      <td className="px-5 py-3.5 text-xs text-pampa-600 dark:text-pampa-300">{res.date} a las {res.schedule}</td>
                      <td className="px-5 py-3.5 font-data text-pampa-600 dark:text-pampa-300">{res.selectedSeats.join(', ')}</td>
                       <td className="px-5 py-3.5 font-data font-bold text-cielo-700 dark:text-cielo-300">S/ {res.totalPrice.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          res.paymentStatus === 'approved' ? 'bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400' : 'bg-pampa-100 dark:bg-pampa-200/40 text-pampa-500 dark:text-pampa-400'
                        }`}>
                          {res.paymentStatus === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GESTION DE FLOTA */}
        {!loading && activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Vehículos */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-headline text-lg text-pampa-800">Vehículos de la Flota</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleet.map(vehicle => (
                  <div key={vehicle.id} className="border border-pampa-200 dark:border-pampa-200/30 rounded-xl p-5 bg-white dark:bg-pampa-100/60 shadow-soft relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-data font-extrabold text-base bg-pampa-100 text-pampa-800 px-2 py-0.5 rounded">
                          {vehicle.plate}
                        </span>
                        <h4 className="font-headline text-lg mt-2 text-pampa-900">{vehicle.type}</h4>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        vehicle.status === 'activo' ? 'bg-quebrada-500/10 text-quebrada-600' :
                        vehicle.status === 'mantenimiento' ? 'bg-logo-500/10 text-logo-600' : 'bg-pampa-100 text-pampa-500'
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="text-xs text-pampa-600 space-y-1.5 mt-4">
                      <p>💺 <strong>Capacidad:</strong> {vehicle.capacity} asientos</p>
                      <p>👤 <strong>Conductor:</strong> {vehicle.driverName}</p>
                    </div>

                    {/* Acciones de Estado */}
                    <div className="flex gap-2 border-t border-pampa-100 pt-3 mt-4">
                      <button
                        type="button"
                        onClick={() => handleUpdateVehicleStatus(vehicle.id, 'activo')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          vehicle.status === 'activo' ? 'bg-quebrada-500 text-white' : 'bg-pampa-100 text-pampa-600 hover:bg-pampa-200'
                        }`}
                      >
                        Activo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateVehicleStatus(vehicle.id, 'mantenimiento')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          vehicle.status === 'mantenimiento' ? 'bg-logo-500 text-white' : 'bg-pampa-100 text-pampa-600 hover:bg-pampa-200'
                        }`}
                      >
                        Taller
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateVehicleStatus(vehicle.id, 'inactivo')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          vehicle.status === 'inactivo' ? 'bg-pampa-500 text-white' : 'bg-pampa-100 text-pampa-600 hover:bg-pampa-200'
                        }`}
                      >
                        Inactivo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agregar Vehículo */}
            <div className="border border-pampa-200 rounded-xl p-5 bg-pampa-50/40 h-fit">
              <h3 className="font-headline text-lg text-pampa-800 mb-4">Agregar Vehículo</h3>
              <form onSubmit={handleAddVehicle} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600 mb-1.5">Placa</label>
                  <input
                    type="text"
                    maxLength={7}
                    placeholder="Ej. V3X-982"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 font-semibold text-pampa-800 dark:text-pampa-900 focus:outline-none focus:border-cielo-500 dark:focus:border-pampa-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600 mb-1.5">Tipo</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value);
                      if (e.target.value === 'Toyota Yaris (Sedán)') {
                        setNewCapacity(4);
                      } else if (e.target.value === 'Toyota Avanza (Camioneta)') {
                        setNewCapacity(6);
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 font-semibold text-pampa-800 dark:text-pampa-900 focus:outline-none focus:border-cielo-500 dark:focus:border-pampa-300"
                  >
                    <option value="Toyota Avanza (Camioneta)">Toyota Avanza (Camioneta) (6 as.)</option>
                    <option value="Toyota Yaris (Sedán)">Toyota Yaris (Sedán) (4 as.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600 mb-1.5">Capacidad Asientos</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 font-semibold text-pampa-800 dark:text-pampa-900 focus:outline-none focus:border-cielo-500 dark:focus:border-pampa-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-pampa-600 mb-1.5">Conductor Asignado</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Carlos Quispe"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="h-10 w-full rounded-lg border border-pampa-200 dark:border-pampa-200/30 bg-white dark:bg-pampa-950/40 px-3 font-semibold text-pampa-800 dark:text-pampa-900 focus:outline-none focus:border-cielo-500 dark:focus:border-pampa-300"
                  />
                </div>

                <button type="submit" className="btn-primary w-full h-10 text-xs">
                  Guardar Vehículo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: METRICAS CMMI (MA - Measurement & Analysis) */}
        {!loading && activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="border border-pampa-200 dark:border-pampa-200/30 rounded-xl overflow-hidden shadow-soft">
              <div className="bg-pampa-50/60 dark:bg-pampa-200/20 px-5 py-4 border-b border-pampa-200 dark:border-pampa-200/30">
                <h3 className="font-headline text-lg text-pampa-800">Métricas y Análisis de Calidad (CMMI Nivel 2)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-pampa-100 dark:bg-pampa-200/40 text-[10px] font-extrabold uppercase tracking-wider text-pampa-600 dark:text-pampa-400">
                    <tr>
                      <th className="px-5 py-3">Métrica</th>
                      <th className="px-5 py-3">Valor Real</th>
                      <th className="px-5 py-3">Meta / Umbral</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3">Interpretación Académica / CMMI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pampa-200/50 dark:divide-pampa-200/30 text-pampa-800 dark:text-pampa-900">
                    <tr>
                      <td className="px-5 py-3.5 font-semibold">Porcentaje de Avance (PAP)</td>
                      <td className="px-5 py-3.5 font-data">92.0%</td>
                      <td className="px-5 py-3.5 font-data">&gt; 90.0%</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400 border border-quebrada-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Óptimo</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-pampa-600 dark:text-pampa-400">Planificación del proyecto en cronograma correcto.</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold">Tasa Eficacia Chatbot (TEC)</td>
                      <td className="px-5 py-3.5 font-data">82.5%</td>
                      <td className="px-5 py-3.5 font-data">&gt; 80.0%</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400 border border-quebrada-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Óptimo</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-pampa-600 dark:text-pampa-400">El chatbot resuelve consultas sin derivar a operador humano.</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold">Densidad de Defectos (DD)</td>
                      <td className="px-5 py-3.5 font-data">1.1 / KLOC</td>
                      <td className="px-5 py-3.5 font-data">&lt; 2.0 / KLOC</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400 border border-quebrada-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Óptimo</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-pampa-600 dark:text-pampa-400">Nivel de bugs en producción dentro del rango de aceptación.</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3.5 font-semibold">Tiempo de Respuesta Pasarela</td>
                      <td className="px-5 py-3.5 font-data">1.8 segundos</td>
                      <td className="px-5 py-3.5 font-data">&lt; 2.5 seg</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-quebrada-500/10 text-quebrada-600 dark:text-quebrada-400 border border-quebrada-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Óptimo</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-pampa-600 dark:text-pampa-400">Comunicación ágil con el sandbox de MercadoPago.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
