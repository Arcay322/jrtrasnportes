# Plan Detallado - Landing Page JR Tours Morochucos

Fecha: 2026-04-03
Proyecto: Landing informativa y de conversion para empresa de transporte interprovincial en Ayacucho.
Stack aprobado: Astro + Tailwind CSS + JavaScript ligero.
Estilo visual aprobado: Andino moderno.

## 1) Objetivo de negocio

Objetivo principal:
- Convertir visitas en consultas por WhatsApp y llamadas.

Objetivos secundarios:
- Comunicar seguridad, responsabilidad y cobertura local.
- Presentar rutas y servicios de forma clara.
- Construir confianza con una identidad visual profesional.

Indicadores de exito (KPIs):
- Clics en boton de WhatsApp.
- Clics en numero de telefono.
- Tasa de scroll hasta CTA final.
- Tiempo promedio en pagina.

## 2) Alcance funcional de la landing (MVP)

Secciones incluidas:
1. Hero principal con propuesta de valor y CTA.
2. Rutas y destinos (Pampa Cangallo, Cangallo, Huancasancos).
3. Servicios (pasajeros, giros, encomiendas, turismo).
4. Seguridad y confianza.
5. Medios de pago (Yape y Plin).
6. Preguntas frecuentes.
7. CTA final con contacto.
8. Footer con datos clave.

Funcionalidades:
- Boton flotante de WhatsApp.
- Boton para llamada directa en movil.
- Mensajes prellenados para WhatsApp segun intencion.
- Navegacion por anclas a secciones.

Fuera de alcance en esta etapa:
- Sistema de reservas en linea.
- Panel administrativo.
- Integraciones de pagos en sitio.

## 3) Direccion visual: Andino moderno

Concepto:
- Combinar identidad local de Ayacucho con un estilo limpio, confiable y actual.

Paleta sugerida:
- Primario: Azul petroleo (#0C5A6E).
- Secundario: Dorado calido (#E8B24C).
- Fondo claro: Crema arena (#F6E7CE).
- Acento alerta/accion: Rojo andino (#C8392B).
- Texto principal: Azul noche (#0E2430).

Tipografia recomendada:
- Titulos: Bree Serif o similar con personalidad.
- Cuerpo: Nunito Sans o Source Sans 3 para alta legibilidad.

Principios visuales:
- Contraste alto para lectura en movil.
- Jerarquia clara de titulares, subtitulos y CTA.
- Uso medido de color acento para conversion.
- Imagenes reales (unidad, rutas, paisajes) con buena calidad.

## 4) Arquitectura tecnica

Tecnologias:
- Astro para sitio estatico de alto rendimiento.
- Tailwind CSS para consistencia y velocidad de UI.
- JavaScript minimo para interacciones.

Estructura de carpetas objetivo:
- src/pages/index.astro
- src/components/
- src/layouts/
- src/styles/
- public/images/
- docs/plans/

Buenas practicas:
- Componentizacion por seccion.
- Variables de diseno centralizadas.
- Carga optimizada de imagenes.
- Semantica HTML y etiquetas ARIA basicas.

## 5) Plan de ejecucion por fases

### Fase 1: Discovery y contenido (Dia 1)

Tareas:
- Confirmar telefono, WhatsApp y texto de propuesta de valor.
- Confirmar rutas, servicios y cobertura.
- Definir FAQs iniciales.

Entregable:
- Documento de contenido validado.

Criterio de cierre:
- No hay contradicciones entre servicios, rutas y contacto.

### Fase 2: Diseño UX/UI (Dia 2)

Tareas:
- Wireframe mobile-first.
- Definir sistema visual final (colores, tipografias, componentes).
- Definir layout de secciones y jerarquia de CTA.

Entregable:
- Boceto de interfaz final.

Criterio de cierre:
- La propuesta de valor se entiende en menos de 8 segundos.

### Fase 3: Setup tecnico (Dia 3)

Tareas:
- Inicializar proyecto Astro.
- Integrar Tailwind.
- Crear layout base y componentes iniciales.

Entregable:
- Proyecto corriendo en local sin errores.

Criterio de cierre:
- Build limpia y estructura base lista para contenido.

### Fase 4: Desarrollo de secciones (Dia 4 y 5)

Tareas:
- Construir Hero, rutas, servicios, confianza, FAQ, CTA final y footer.
- Integrar botones de WhatsApp y llamada.
- Implementar estados hover/focus y transiciones suaves.

Entregable:
- Landing funcional completa en desktop y movil.

Criterio de cierre:
- Flujo de navegacion y conversion operativo de inicio a fin.

### Fase 5: Calidad profesional (Dia 6)

Tareas:
- QA visual en varios breakpoints.
- QA funcional de todos los enlaces y CTA.
- Revisión de ortografia y consistencia.
- Ajustes de accesibilidad basica y contraste.
- Optimizar imagenes y rendimiento.

Entregable:
- Version candidata a produccion.

Criterio de cierre:
- Sin errores criticos de usabilidad, contenido ni funcionalidad.

### Fase 6: SEO, analitica y lanzamiento (Dia 7)

Tareas:
- Configurar titulo, descripcion y Open Graph.
- Configurar GA4 y eventos de conversion.
- Publicar en Vercel o Netlify.
- Verificar pagina en produccion.

Entregable:
- Landing publicada y medible.

Criterio de cierre:
- Sitio en linea, indexable y con tracking activo.

## 6) Checklist de calidad profesional

Contenido y conversion:
- Propuesta de valor clara en Hero.
- Minimo 3 CTA a WhatsApp en la pagina.
- Contacto visible y clickeable en movil.

Diseño:
- Sistema visual consistente.
- Espaciado y jerarquia uniformes.
- Buen contraste de texto y botones.

Tecnico:
- Carga rapida en movil.
- Sin enlaces rotos.
- Semantica HTML correcta.
- Responsive validado.

Medicion:
- Eventos de clic en WhatsApp y llamada registrados.

## 7) Riesgos y mitigacion

Riesgo: informacion incompleta de horarios/tarifas.
- Mitigacion: usar CTA de consulta directa por WhatsApp.

Riesgo: fotos de baja calidad.
- Mitigacion: priorizar pocas imagenes buenas, comprimidas y bien encuadradas.

Riesgo: cambios tardios de contenido.
- Mitigacion: congelar contenido antes de la fase de QA.

## 8) Proximos incrementos (post-lanzamiento)

- Pagina de rutas detalladas.
- Formulario de solicitud de encomienda.
- Modulo simple de reservas.
- Seccion de testimonios reales y galeria de viajes.

---

Estado actual:
- Plan aprobado para ejecucion.
- Se inicia desarrollo tecnico inmediatamente con el stack definido.
