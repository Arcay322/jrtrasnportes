export type Destination = {
  slug: string;
  name: string;
  category?: 'destino' | 'tour';
  price: string;
  description: string;
  image: string;
  gallery: string[];
  fleetImage: string;
  longDescription: string;
  travelTime: string;
  fareNote: string;
  highlights: string[];
};

export const destinations: Destination[] = [
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
    highlights: ['Salidas frecuentes', 'Atencion por WhatsApp', 'Encomiendas en ruta']
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
    highlights: ['Ruta interprovincial segura', 'Coordinacion de equipaje', 'Soporte por llamada']
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
    highlights: ['Cobertura de zonas altas', 'Servicio turistico disponible', 'Atencion personalizada']
  },
  {
    slug: 'tour-millpu',
    name: 'Aguas Turquesas de Millpu',
    category: 'tour',
    price: 'A consultar',
    description: 'Son unas famosas piscinas naturales escalonadas que se forman a lo largo de un cañón en la comunidad de Circamarca.',
    image: '/images/Aguas%20turquesas/aguas_turquesas.webp',
    gallery: [
      '/images/Aguas%20turquesas/aguas_turquesas.webp',
      '/images/Aguas%20turquesas/aguas_turquesas2.webp',
      '/images/Aguas%20turquesas/aguas_turquesas3.jpg'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Son unas famosas piscinas naturales escalonadas que se forman a lo largo de un cañón en la comunidad de Circamarca. El color del agua es espectacular, sobre todo si vas entre mayo y noviembre, cuando las lluvias disminuyen.',
    travelTime: 'Full Day (3h a 4h de viaje solo ida)',
    fareNote: 'Consultar tarifas y horarios de salidas.',
    highlights: ['Paisaje único', 'Caminata', 'Fotografía']
  },
  {
    slug: 'tour-pachapupum',
    name: 'Pachapupum (Huanca Sancos)',
    category: 'tour',
    price: 'A consultar',
    description: 'Cono volcánico de piedra caliza rodeado de pozas rústicas de aguas termales con propiedades medicinales.',
    image: '/images/Pachapupum/pachapupum.webp',
    gallery: [
      '/images/Pachapupum/pachapupum.webp',
      '/images/Pachapupum/pachapupum2.jpg',
      '/images/Pachapupum/pachapupum3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Es un monumento natural fascinante. Se trata de un cono volcánico de piedra caliza rodeado de pozas rústicas de aguas termales a las que se les atribuyen propiedades medicinales.',
    travelTime: 'Full Day',
    fareNote: 'Consultar tarifas.',
    highlights: ['Aguas termales', 'Cono volcánico', 'Relajación']
  },
  {
    slug: 'tour-cataratas-cangallo',
    name: 'Cataratas de Pumapaqcha y Batán',
    category: 'tour',
    price: 'A consultar',
    description: 'Caminata impresionante a través de caídas de agua hermosas, conocidas por la fuerte energía "mística" del lugar.',
    image: '/images/Cataratas%20de%20pumapaqcha/pumapaqcha.webp',
    gallery: [
      '/images/Cataratas%20de%20pumapaqcha/pumapaqcha.webp',
      '/images/Cataratas%20de%20pumapaqcha/batan.webp',
      '/images/Cataratas%20de%20pumapaqcha/pumapaqcha2.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Están ubicadas en la provincia de Cangallo. Se suelen recorrer juntas en una caminata que incluye también la catarata de Qorimaqma. Son caídas de agua muy hermosas, rodeadas de historias locales y conocidas por la fuerte energía "mística" que se siente en el lugar.',
    travelTime: 'Full Day',
    fareNote: 'Consultar opciones de guiado.',
    highlights: ['Caminata', 'Cascadas', 'Misticismo']
  },
  {
    slug: 'tour-campanayocc',
    name: 'Cascada de Campanayocc',
    category: 'tour',
    price: 'A consultar',
    description: 'Imponente caída de agua rodeada de naturaleza pura en el distrito de Sarhua, rodeado de cultura ancestral.',
    image: '/images/cascada%20de%20campanayocc/campanayocc.webp',
    gallery: [
      '/images/cascada%20de%20campanayocc/campanayocc.webp',
      '/images/cascada%20de%20campanayocc/campanayocc2.webp',
      '/images/cascada%20de%20campanayocc/campanayocc3.jpg'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Una imponente caída de agua rodeada de naturaleza pura en el distrito de Sarhua, un lugar que además es súper rico culturalmente por sus famosas tablas pintadas.',
    travelTime: 'Full Day (con visita a poblado)',
    fareNote: 'Consultar tarifas.',
    highlights: ['Cultura Sarhuina', 'Caída de agua', 'Naturaleza']
  },
  {
    slug: 'tour-ruqruqa',
    name: 'Cascada de Ruqruqa (Quispillaccta)',
    category: 'tour',
    price: 'A consultar',
    description: 'Joya natural ubicada en Chuschi, famosa porque el rocío del agua y la luz del sol forman arcoíris naturales.',
    image: '/images/cascada%20de%20Ruqruqa/cascada_ruqruqa.png',
    gallery: [
      '/images/cascada%20de%20Ruqruqa/cascada_ruqruqa.png',
      '/images/cascada%20de%20Ruqruqa/cascada_ruqruqa2.webp',
      '/images/cascada%20de%20Ruqruqa/cascada_ruqruqa3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Es una joya natural ubicada en Chuschi (Cangallo). Tiene una caída de agua cristalina de unos 20 metros de altura, famosa porque el rocío del agua y la luz del sol forman arcoíris naturales en el lugar.',
    travelTime: 'Full Day',
    fareNote: 'Consultar disponibilidad.',
    highlights: ['Arcoíris natural', 'Caminata limpia', 'Refrescante']
  },
  {
    slug: 'tour-vilcashuaman',
    name: 'Ruinas de Vilcashuamán',
    category: 'tour',
    price: 'A consultar',
    description: 'Centro administrativo incaico donde conocerás el Templo del Sol y la Luna, así como la imponente pirámide ceremonial del Ushnu.',
    image: '/images/vilcashuaman/vilcashuaman.webp',
    gallery: [
      '/images/vilcashuaman/vilcashuaman.webp',
      '/images/vilcashuaman/vilcashuaman2.webp',
      '/images/vilcashuaman/vilcashuaman3.webp'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Fue uno de los centros administrativos incaicos más importantes. Ahí puedes conocer el Templo del Sol y la Luna (sobre el cual se construyó la iglesia principal) y subir al Ushnu, una pirámide ceremonial escalonada.',
    travelTime: 'Full Day',
    fareNote: 'El ingreso arqueológico tiene costo aparte.',
    highlights: ['Historia Inca', 'Arquitectura', 'Cultura']
  },
  {
    slug: 'tour-pampas-quinua',
    name: 'Pampas de Quinua',
    category: 'tour',
    price: 'A consultar',
    description: 'Santuario Histórico de la Pampa de Ayacucho, un lugar bellísimo y clave en nuestra historia donde destaca el obelisco de 44 metros.',
    image: '/images/pampa%20de%20quinua/quinua1.jpg',
    gallery: [
      '/images/pampa%20de%20quinua/quinua1.jpg',
      '/images/pampa%20de%20quinua/quinua2.webp',
      '/images/pampa%20de%20quinua/quinua3.jpg'
    ],
    fleetImage: '/images/avanzarojo.webp',
    longDescription: 'Es el Santuario Histórico de la Pampa de Ayacucho. Un lugar clave en la historia peruana y sudamericana por la Batalla de Ayacucho, donde destaca el gigantesco obelisco blanco de 44 metros de altura.',
    travelTime: 'Medio Día o Día completo',
    fareNote: 'Consultar salidas fin de semana.',
    highlights: ['Cabalgatas', 'Cerámica', 'Patrimonio']
  }
];

export function getDestinationBySlug(slug: string) {
  return destinations.find((destination) => destination.slug === slug);
}
