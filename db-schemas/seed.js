import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Buscar credenciales de Firebase en el entorno o en un archivo local
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve('./firebase-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    `⚠️ Error: No se encontró el archivo de credenciales de Firebase en: ${serviceAccountPath}`
  );
  console.log(
    'Por favor, coloca tu archivo JSON de clave privada de cuenta de servicio de Firebase en la raíz del proyecto con el nombre "firebase-key.json" o define la variable de entorno FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// 1. Datos semilla de Rutas y Tours (extraídos de destinations.ts)
const routes = [
  {
    slug: 'pampa-cangallo',
    name: 'Pampa Cangallo',
    category: 'destino',
    price: 'Desde S/ 20',
    description: 'Tierra morochuca de llanuras altas y tradicion viva.',
    image: '/images/Pampa%20cangallo/pampa-cangallo.webp',
    gallery: [
      '/images/Pampa%20cangallo/pampa-cangallo.webp',
      '/images/Pampa%20cangallo/pampa-cangallo2.webp',
      '/images/Pampa%20cangallo/pampa-cangallo3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription:
      'Ruta ideal para viajeros que valoran paisajes andinos y conectividad local. Nuestro servicio busca puntualidad, trato cercano y seguridad durante todo el trayecto.',
    travelTime: '2h aprox. desde Ayacucho (referencial)',
    fareNote: 'Tarifa puede variar por temporada y punto de embarque.',
    highlights: [
      'Salidas frecuentes',
      'Atencion por WhatsApp',
      'Encomiendas en ruta'
    ],
    capacity: 6,
    vehicleType: 'Toyota Avanza (Camioneta)'
  },
  {
    slug: 'cangallo',
    name: 'Cangallo',
    category: 'destino',
    price: 'Desde S/ 25',
    description: 'La ciudad heroica conectada con viajes seguros y puntuales.',
    image: '/images/Cangallo/Ciudad_de_Cangallo.webp',
    gallery: [
      '/images/Cangallo/Ciudad_de_Cangallo.webp',
      '/images/Cangallo/Cangallo2.webp',
      '/images/Cangallo/Cangallo3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription:
      'Conectamos Ayacucho y Cangallo con unidades confiables y coordinacion rapida. Esta ruta es ideal para viajes familiares, laborales y de tramite.',
    travelTime: '2h 30m aprox. desde Ayacucho (referencial)',
    fareNote: 'Tarifa puede variar por temporada y punto de embarque.',
    highlights: [
      'Ruta interprovincial segura',
      'Coordinacion de equipaje',
      'Soporte por llamada'
    ],
    capacity: 4,
    vehicleType: 'Toyota Yaris (Sedán)'
  },
  {
    slug: 'huancasancos',
    name: 'Huancasancos',
    category: 'destino',
    price: 'Desde S/ 45',
    description: 'Conectamos destinos de altura con maxima responsabilidad.',
    image: '/images/Huancasancos/Huancasancos.webp',
    gallery: [
      '/images/Huancasancos/Huancasancos.webp',
      '/images/Huancasancos/Huancasancos2.webp',
      '/images/Huancasancos/Huancasancos3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription:
      'Servicio pensado para rutas de mayor distancia y geografia exigente. Priorizamos manejo responsable, comunicacion clara y cumplimiento de itinerario.',
    travelTime: '4h aprox. desde Ayacucho (referencial)',
    fareNote: 'Tarifa puede variar por temporada y punto de embarque.',
    highlights: [
      'Cobertura de zonas altas',
      'Servicio turistico disponible',
      'Atencion personalizada'
    ],
    capacity: 6,
    vehicleType: 'Toyota Avanza (Camioneta)'
  },
  {
    slug: 'tour-millpu',
    name: 'Aguas Turquesas de Millpu',
    category: 'tour',
    price: 'A consultar',
    description:
      'Son unas famosas piscinas naturales escalonadas que se forman a lo largo de un cañón en la comunidad de Circamarca.',
    image: '/images/Aguas%20turquesas/aguas_turquesas.webp',
    gallery: [
      '/images/Aguas%20turquesas/aguas_turquesas.webp',
      '/images/Aguas%20turquesas/aguas_turquesas2.webp',
      '/images/Aguas%20turquesas/aguas_turquesas3.jpg'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription:
      'Son unas famosas piscinas naturales escalonadas que se forman a lo largo de un cañón en la comunidad de Circamarca. El color del agua es espectacular, sobre todo si vas entre mayo y noviembre, cuando las lluvias disminuyen.',
    travelTime: 'Full Day (3h a 4h de viaje solo ida)',
    fareNote: 'Consultar tarifas y horarios de salidas.',
    highlights: ['Paisaje único', 'Caminata', 'Fotografía'],
    capacity: 6,
    vehicleType: 'Toyota Avanza (Camioneta)'
  },
  {
    slug: 'tour-pachapupum',
    name: 'Pachapupum (Huanca Sancos)',
    category: 'tour',
    price: 'A consultar',
    description:
      'Cono volcánico de piedra caliza rodeado de pozas rústicas de aguas termales con propiedades medicinales.',
    image: '/images/Pachapupum/pachapupum.webp',
    gallery: [
      '/images/Pachapupum/pachapupum.webp',
      '/images/Pachapupum/pachapupum2.jpg',
      '/images/Pachapupum/pachapupum3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription:
      'Es un monumento natural fascinante. Se trata de un cono volcánico de piedra caliza rodeado de pozas rústicas de aguas termales a las que se les atribuyen propiedades medicinales.',
    travelTime: 'Full Day',
    fareNote: 'Consultar tarifas.',
    highlights: ['Aguas termales', 'Cono volcánico', 'Relajación'],
    capacity: 6,
    vehicleType: 'Toyota Avanza (Camioneta)'
  }
];

// 2. Datos semilla de Flota
const fleet = [
  {
    id: 'fleet-01',
    plate: 'V3X-982',
    type: 'Toyota Avanza (Camioneta)',
    capacity: 6,
    driverName: 'Juan Carlos Quispe',
    status: 'activo'
  },
  {
    id: 'fleet-02',
    plate: 'F4T-811',
    type: 'Toyota Yaris (Sedán)',
    capacity: 4,
    driverName: 'Pedro Mendoza',
    status: 'activo'
  },
  {
    id: 'fleet-03',
    plate: 'A9B-122',
    type: 'Toyota Avanza (Camioneta)',
    capacity: 6,
    driverName: 'Arnie Calderón',
    status: 'activo'
  },
  {
    id: 'fleet-04',
    plate: 'W5V-304',
    type: 'Toyota Yaris (Sedán)',
    capacity: 4,
    driverName: 'Lucho Fernández',
    status: 'mantenimiento'
  }
];

// 3. Datos semilla de FAQs (Base de conocimiento Chatbot)
const faqs = [
  {
    id: 'faq-horarios',
    question: '¿Cuáles son los horarios de salida?',
    answer:
      'Nuestras salidas hacia Pampa Cangallo y Cangallo inician desde las 5:00 AM hasta las 7:00 PM. Salimos cada vez que se llenan las unidades, aproximadamente cada 30 minutos desde el Terminal Sur de Ayacucho.',
    keywords: ['horario', 'salida', 'hora', 'frecuencia', 'mañana', 'tarde']
  },
  {
    id: 'faq-precios',
    question: '¿Cuáles son los precios de los pasajes?',
    answer:
      'El pasaje a Pampa Cangallo cuesta S/ 20 soles, a Cangallo S/ 25 soles y a Huancasancos S/ 45 soles. Las tarifas de los tours a Millpu o Pachapupum son a consultar según temporada y cantidad de pasajeros.',
    keywords: ['precio', 'pasaje', 'costo', 'tarifa', 'boleto', 'soles']
  },
  {
    id: 'faq-punto-embarque',
    question: '¿De dónde salen las minivans?',
    answer:
      'Todas nuestras unidades salen del Terminal Sur de Ayacucho, ubicado en el distrito de San Juan Bautista. Contamos con un counter de atención presencial identificado como JR Transportes.',
    keywords: [
      'donde',
      'terminal',
      'embarque',
      'lugar',
      'paradero',
      'sur',
      'ayacucho'
    ]
  },
  {
    id: 'faq-encomiendas',
    question: '¿Realizan envíos de encomiendas?',
    answer:
      'Sí, realizamos envíos de encomiendas y giros rápidos a Pampa Cangallo, Cangallo y Huancasancos todos los días. La recepción se realiza en el Terminal Sur y la entrega se coordina directamente por WhatsApp.',
    keywords: ['encomienda', 'paquete', 'giro', 'envio', 'mandar', 'dinero']
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando carga de datos semilla en Firestore...');

  try {
    // Cargar rutas
    for (const route of routes) {
      await db.collection('routes').doc(route.slug).set(route);
      console.log(`✅ Ruta cargada: ${route.slug}`);
    }

    // Cargar flota
    for (const vehicle of fleet) {
      await db.collection('fleet').doc(vehicle.id).set(vehicle);
      console.log(`✅ Vehículo cargado: ${vehicle.id} (${vehicle.plate})`);
    }

    // Cargar FAQs
    for (const faq of faqs) {
      await db.collection('faqs').doc(faq.id).set(faq);
      console.log(`✅ FAQ cargada: ${faq.id}`);
    }

    console.log('🎉 ¡Carga de datos semilla completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cargar los datos en Firestore:', error);
    process.exit(1);
  }
}

seedDatabase();
