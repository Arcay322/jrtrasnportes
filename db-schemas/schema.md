# Esquema de Base de Datos Firebase Firestore - ViajaAyacucho

Este documento describe el modelo de datos NoSQL diseñado en Cloud Firestore para gestionar rutas, flota de vehículos, reservas en tiempo real y la base de conocimiento del chatbot para **JR Transportes**.

---

## 🗺️ 1. Colección: `routes`

Almacena todas las rutas de viaje interprovinciales y los servicios turísticos (tours).

- **Ruta de Colección:** `/routes`
- **Identificador:** Slug único de la ruta (ej. `pampa-cangallo`, `tour-millpu`).

### Estructura de Documento:

```json
{
  "slug": "pampa-cangallo",
  "name": "Pampa Cangallo",
  "category": "destino", // "destino" o "tour"
  "price": "Desde S/ 20",
  "description": "Tierra morochuca de llanuras altas y tradicion viva.",
  "image": "/images/Pampa%20cangallo/pampa-cangallo.webp",
  "gallery": [
    "/images/Pampa%20cangallo/pampa-cangallo.webp",
    "/images/Pampa%20cangallo/pampa-cangallo2.webp",
    "/images/Pampa%20cangallo/pampa-cangallo3.webp"
  ],
  "fleetImage": "/images/avanzarojo.webp",
  "longDescription": "Ruta ideal para viajeros que valoran paisajes andinos y conectividad local. Nuestro servicio busca puntualidad, trato cercano y seguridad durante todo el trayecto.",
  "travelTime": "2h aprox. desde Ayacucho (referencial)",
  "fareNote": "Tarifa puede variar por temporada y punto de embarque.",
  "highlights": [
    "Salidas frecuentes",
    "Atencion por WhatsApp",
    "Encomiendas en ruta"
  ]
}
```

---

## 🚐 2. Colección: `fleet`

Gestiona la flota vehicular disponible de la empresa y la asignación de conductores.

- **Ruta de Colección:** `/fleet`
- **Identificador:** ID del vehículo (ej. `fleet-01`, `fleet-02`).

### Estructura de Documento:

```json
{
  "id": "fleet-01",
  "plate": "V3X-982",
  "type": "H1 Minivan", // Tipo de vehículo
  "capacity": 15, // Cantidad de asientos disponibles
  "driverName": "Juan Carlos Quispe",
  "status": "activo" // "activo", "mantenimiento", "inactivo"
}
```

---

## 🎟️ 3. Colección: `reservations`

Almacena todas las compras y reservas de pasajes/tours realizadas por los usuarios.

- **Ruta de Colección:** `/reservations`
- **Identificador:** ID autogenerado de Firestore (ej. `res_xyz123`).

### Estructura de Documento:

```json
{
  "id": "res_xyz123",
  "routeSlug": "pampa-cangallo",
  "date": "2026-06-12", // Fecha del viaje (YYYY-MM-DD)
  "departureTime": "06:00 AM", // Horario de salida
  "customerName": "Arnie Calderon",
  "customerPhone": "928413201",
  "selectedSeats": [4, 5], // Números de asiento seleccionados
  "totalPrice": 40.0, // En soles (PEN)
  "paymentId": "mp_9876543210", // ID de transacción de MercadoPago
  "paymentStatus": "approved", // "pending", "approved", "rejected"
  "createdAt": "2026-06-10T06:12:00.000Z" // Timestamp de creación
}
```

---

## 🤖 4. Colección: `faqs`

Almacena la base de conocimientos para responder de forma automatizada en el chatbot de la web.

- **Ruta de Colección:** `/faqs`
- **Identificador:** ID autogenerado o clave semántica (ej. `faq-precios`, `faq-millpu`).

### Estructura de Documento:

```json
{
  "id": "faq-precios-cangallo",
  "question": "¿Cuánto cuesta el pasaje a Cangallo?",
  "answer": "El pasaje a Cangallo está disponible desde S/ 25 soles ida. Puedes reservarlo directamente en nuestra web o consultarnos horarios de salida.",
  "keywords": ["precio", "costo", "cangallo", "pasaje", "tarifa"]
}
```
