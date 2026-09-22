# Wintuu — Brief de diseño, contenido e implementación de la home

**Documento para Claude Code.** Implementá esta propuesta sobre el proyecto existente. El entregable esperado es la nueva landing pública de Wintuu, terminada y responsive, con los textos de este documento, imágenes seleccionadas, animaciones suaves y enlaces funcionando.

**Marca:** Wintuu · **Color principal obligatorio:** `#00CFCD` · **Formato:** one page · **Idioma:** español de Argentina, con voseo natural.

Este brief se preparó a partir de las cuatro referencias visuales y de `repomix-output-theivamm-perks.git.xml`. La revisión del código confirma la estructura y los comportamientos descritos; no acredita que las integraciones estén operativas en producción. Antes de editar, contrastá las rutas y componentes con el checkout actual del repositorio.

## 1. Qué estamos construyendo

Wintuu les permite a los negocios tener un perfil propio y un panel para crear cupones, acompañar el progreso de sus clientes y entregar beneficios. El menú digital viene incluido en ambos planes: cada negocio lo completa con sus productos, precios e imágenes.

La home tiene que presentar ese producto de forma cercana. Al recorrerla, una persona debe entender qué ve el negocio, qué ve el cliente, cómo se suman puntos y qué incluye cada plan.

**Idea de diseño:** una herramienta digital que forma parte de la vida cotidiana de un negocio. Vidrio, superficies oscuras, luz menta, fotos cálidas y pequeñas escenas del producto. El café, las personas y los dispositivos acercan la tecnología a situaciones reconocibles.

**Sensación buscada:** moderna, cuidada, humana, joven y fácil de entender. El diseño tiene que tener dirección de arte: composición asimétrica, jerarquías claras, imágenes bien recortadas y detalles de interfaz que expliquen el producto.

### Tono editorial

- Presentar con calma; hablar como alguien que está mostrando cómo funciona una herramienta.
- Usar «tu negocio», «tus clientes», «creás», «elegís», «sumás», «podés».
- Mantener frases breves, concretas y amables.
- Hablar de beneficios, visitas, puntos, premios y encuentros. Reservar términos como «dashboard» para las instrucciones técnicas; en la web, decir «panel».
- Dejar que los botones indiquen el próximo paso: «Conocer Wintuu», «Ver cómo funciona», «Ver planes», «Ingresar», «Escribir por WhatsApp».
- Evitar «dispará tus ventas», «multiplicá tus ingresos», «transformá tu negocio», «la solución definitiva», «aprovechá ahora» y urgencias artificiales.
- No inventar testimonios, clientes, estrellas de valoración, porcentajes de crecimiento, cantidad de usuarios ni resultados garantizados.
- No agregar «gratis», «sin tarjeta», «prueba gratuita», «ilimitado», «sin comisiones», devoluciones ni promesas de soporte inmediato: no forman parte de este brief.

## 2. Lo que el código permite afirmar

Usá esta tabla para sostener el contenido. Los textos de la landing anterior y `landing-perks.md` no son una fuente suficiente para prometer funcionalidades.

| Tema | Evidencia del Repomix | Implicación para esta home |
| --- | --- | --- |
| Landing pública | `client/src/App.jsx`: `/` renderiza `Landing` | El archivo principal a rediseñar es `client/src/pages/Landing.jsx`. |
| Home de cada negocio | `/:slug/*` y `client/src/pages/Home.jsx` | `Home.jsx` pertenece a la app de cada negocio. No es la portada comercial que se está encargando. |
| Ingreso general | `/ingresar` → `AccessPortal.jsx` | El botón «Ingresar» apunta a esa ruta. El portal permite elegir los negocios y roles de la cuenta. |
| Checkout | `/checkout` → `Checkout.jsx` | Reutilizarlo. Acepta `?plan=mensual` y `?plan=vitalicia`. |
| Alta | `/comenzar` y `/onboarding` → `Onboarding.jsx` | El checkout continúa a `/comenzar?plan=…`; allí están la identificación con Google, el pago y la creación del perfil. |
| Planes | `server/src/plans.js`, `server/src/routes/plans.js` | IDs reales: `mensual` y `vitalicia`. Valores por defecto: ARS 30.000 y ARS 300.000. Se consultan con `/api/plans`. |
| Forma de pago | `server/src/routes/payments.js` | El mensual usa una suscripción recurrente de Mercado Pago; el vitalicio, un pago único. |
| Identidad del negocio | `SettingsPage.jsx`, `ThemeContext.jsx`, `Onboarding.jsx` | Nombre, logo, colores y enlace con slug. Un enlace propio dentro de la plataforma no equivale a un dominio propio incluido. |
| Cupones | `dashboard/Coupons.jsx`, `server/src/routes/coupons.js` | El administrador define título, descripción, tipo de premio, valor y meta de puntos. Puede editar y pausar cupones. |
| Tipos de beneficio | Tipos `monto`, `descuento`, `regalo` | Hablar de un monto de descuento, un porcentaje o un regalo. No presentar el monto como dinero retirable. |
| Activación | `CouponsPage.jsx`, `Home.jsx`, `/api/coupons/activate` | El cliente elige y activa un cupón. Tiene un cupón en acumulación a la vez; puede conservar cupones ya completados. |
| Suma de puntos | `ScanPage.jsx`, `ClientDetail.jsx`, `/api/clients/registered/:id/puntos` | El negocio escanea el QR y confirma «Sumar 1 punto», o suma desde el perfil. No se acredita un punto simplemente por abrir la web. |
| Canje | `/api/clients/scan`, `/api/coupons/validate` | Al completar la meta aparece un cupón listo para canjear. El negocio valida el canje por QR o código; queda registrado. |
| Seguimiento | `Clients.jsx`, `ClientDetail.jsx`, `CouponsPage.jsx` | Hay listado de clientes, progreso y cupones completados/canjeados. Mostrar estas vistas, sin inventar analítica avanzada. |
| Menú digital | `MenuManager.jsx`, `PublicMenu.jsx`, `server/src/routes/menu.js` | Productos, fotos, descripciones, precios, categorías, disponibilidad y destacados/ofertas. El menú se puede consultar públicamente. |
| Acceso web | `AccessPortal.jsx`, `Login.jsx`, rutas del cliente | Presentar el uso desde el navegador y el acceso con Google para participar. No prometer una app nativa en tiendas. |

### Circuito que deben explicar el copy y las imágenes

1. El negocio crea el cupón y define su meta de puntos.
2. El cliente entra al perfil del negocio, se identifica y activa un cupón.
3. El negocio registra los puntos de las visitas o consumos que decide reconocer.
4. Al llegar a la meta, el cupón queda listo para canjear.
5. El negocio valida el canje. El cliente puede activar otro cupón y comenzar de nuevo.

La home puede resumirlo en cuatro pasos, agrupando el último tramo. **Activar, sumar puntos y canjear son acciones distintas.** Las ilustraciones deben respetar ese orden.

### Límites de los ejemplos

- «Un café después de 5 puntos» es un ejemplo de configuración, no una regla obligatoria de Wintuu.
- El código revisado no confirma automatizaciones por cumpleaños, puntos calculados por gasto, reservas, campañas automáticas de WhatsApp ni reportes consolidados de sucursales. No incluir esas promesas de la landing anterior.
- El menú se presenta como menú o catálogo digital; no publicitar delivery, carrito ni cobro de pedidos por la mera existencia de archivos de pedidos en el repositorio.
- El menú viene incluido, pero el negocio debe cargar su contenido. No decir que Wintuu ya conoce o carga automáticamente su carta.
- Los mockups son vistas ilustrativas de funciones reales. No montar pantallas que consulten o modifiquen datos de clientes reales para decorar la landing.

## 3. Cómo interpretar las referencias visuales

| Referencia adjunta | Qué tomar | Cómo llevarlo a Wintuu |
| --- | --- | --- |
| `cff9eef9-ab16-4d47-93a0-f578da7fc2cd.png` — tarjetas oscuras con luz rosa | Diferentes tamaños de tarjeta, bordes suaves, brillo localizado y profundidad | Cambiar el rosa por luz menta. Usar cupones, puntos y pantallas como protagonistas de las tarjetas. |
| `c4bcd2a2-6ca7-4620-bf98-36d2152198be.png` — interfaces sobre violeta oscuro | Capas de interfaz, vidrio sobrio, buen espacio entre gráfica y texto | Crear vistas de cupones, un panel y un menú, con bordes finos y fondos translúcidos. |
| `19b1bcbe-34f7-494e-b757-8b5dc58fa200.png` — mosaico negro y azul | Ritmo de tamaños, recortes grandes, gráficos que ocupan la tarjeta | Tomar la composición editorial. Reemplazar métricas de marketing por información de ejemplo del producto. |
| `174e2554-ed1b-4984-8c81-de8deaf1c21e.png` — hero claro con personas | Calidez, fotografías jóvenes, columnas asimétricas, superposición de una interfaz | Incorporar personas, café, teléfono y notebook. Conservar la base oscura de Wintuu y sumar alguna superficie crema. |

La propuesta resultante combina **bento oscuro + glass + fotografía editorial cálida**. No copiar los textos, marcas, cifras ni ilustraciones ajenas de las referencias.

### Reglas para evitar un resultado genérico

- El hero debe tener una composición visual propia, con teléfono, foto y tarjeta de progreso; no una imagen rectangular aislada junto a un título.
- El producto se presenta mediante cinco escenas de distinto tamaño y tratamiento, no mediante una fila de iconos con descripciones.
- Cada tarjeta tiene un propósito: mostrar identidad, crear un cupón, seguir puntos, administrar clientes o consultar el menú.
- Usar zonas de silencio visual alrededor de las escenas. No llenar cada hueco de pills, estrellas, órbitas o decoraciones.
- Los halos pertenecen a una tarjeta o un dispositivo; no invaden todos los párrafos de la página.
- Los iconos acompañan; la fotografía y las interfaces llevan el peso visual.
- Mantener el menta como color reconocible de la marca. No convertir cada sección en una paleta nueva.

## 4. Sistema visual

### Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--wt-bg` | `#080F12` | Fondo general oscuro, con un matiz petróleo. |
| `--wt-surface` | `#101B20` | Tarjetas opacas y fallback del vidrio. |
| `--wt-surface-raised` | `#17272C` | Capas internas y pantallas. |
| `--wt-mint` | `#00CFCD` | Color principal obligatorio, CTA, puntos y acentos. |
| `--wt-mint-light` | `#8CECE2` | Extremo luminoso de gradientes y detalles. |
| `--wt-mint-dark` | `#006A69` | Texto/acento sobre fondos claros. |
| `--wt-cream` | `#F3F0E7` | Una tarjeta editorial y detalles cálidos. |
| `--wt-lilac` | `#B7A8F5` | Acento secundario pequeño en un cupón o etiqueta. |
| `--wt-text` | `#F4F8F7` | Títulos y texto principal sobre oscuro. |
| `--wt-muted` | `#A9BCBD` | Texto secundario legible sobre oscuro. |
| `--wt-ink` | `#08282C` | Texto sobre menta o crema. |
| `--wt-border` | `rgba(220,255,250,.13)` | Contorno de vidrio y separadores. |

Como orientación, 70% de superficies oscuras, 20% de imágenes/interfaz y 10% de acentos claros o menta. El lila ocupa una fracción pequeña de ese acento.

**Contraste:** los botones menta llevan texto petróleo oscuro. No poner texto blanco pequeño sobre `#00CFCD`. Sobre fotos, usar un respaldo oscuro estable detrás del texto. Verificar contraste después de componer transparencias, no solo comparando colores aislados.

### Tipografía

- Títulos: **Manrope**, pesos 500–700, con una forma amable y compacta.
- Cuerpo y UI: **Inter**, ya presente en el proyecto, pesos 400–600.
- Si no es posible cargar Manrope, usar Inter con los mismos tamaños y espaciado, sin bloquear el render.
- H1: aproximadamente 72–80 px en desktop amplio; 44–56 px en mobile; ajustar con `clamp()` y verificar a 360 px. Interlineado 1.03–1.08 y tracking de aproximadamente `-0.04em`.
- H2: 40–56 px desktop; 30–36 px mobile. Interlineado 1.1–1.16.
- Títulos de tarjeta: 22–28 px. Cuerpo: 16–18 px, interlineado 1.55–1.65.
- Microcopy: 12–14 px. No reducir el contenido relevante a una letra minúscula para que entre en un mockup.
- Limitar el ancho de párrafos a 50–62 caracteres cuando corresponda. Usar `text-wrap: balance` en títulos con fallback natural.
- No aplicar todo en negrita. La jerarquía nace del tamaño, el espacio y el contraste.

### Contenedores y espacios

- Ancho máximo de contenido: 1280 px, centrado.
- Márgenes laterales: 20–24 px mobile; 32 px tablet; al menos 48 px desktop cuando haya espacio.
- Separación entre secciones: 96–120 px desktop y 64–80 px mobile.
- Gap entre tarjetas: 16–20 px desktop y 12–16 px mobile.
- Radio exterior de bento: 28–32 px desktop y 22–24 px mobile.
- Padding de tarjetas: 28–32 px desktop y 22–24 px mobile.
- Controles con altura cómoda, de al menos 44 px. Los botones principales pueden medir 48–52 px.
- Evitar alturas rígidas en bloques de texto. Las alturas de composición que se indican más abajo son referencias para desktop, no límites que recorten contenido.

### Tratamiento del vidrio

El vidrio debe mostrar profundidad: un fondo parcialmente transparente, una luz suave detrás, contorno de 1 px, reflejo interno y sombra exterior contenida. `backdrop-filter` por sí solo no genera el efecto si detrás hay un plano uniforme.

Base orientativa, con todas las reglas acotadas a la landing:

```css
.wintuu-landing {
  --wt-bg: #080f12;
  --wt-surface: #101b20;
  --wt-mint: #00cfcd;
  --wt-text: #f4f8f7;
  --wt-muted: #a9bcbd;
  background: var(--wt-bg);
  color: var(--wt-text);
  isolation: isolate;
}

.wintuu-landing .wt-glass {
  position: relative;
  border: 1px solid rgba(220, 255, 250, .13);
  border-radius: 30px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.065), rgba(255,255,255,.012)),
    rgba(16, 27, 32, .78);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.07),
    0 24px 64px rgba(0,0,0,.2);
}

@supports (backdrop-filter: blur(1px)) {
  .wintuu-landing .wt-glass {
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
}

.wintuu-landing section[id] {
  scroll-margin-top: 104px;
}
```

Aplicar reflejos y halos con pseudoelementos no interactivos. Mantener el texto por encima. Recortar las capas decorativas dentro de una capa propia de la tarjeta para conservar el contorno visible de foco de sus controles.

## 5. Logo y fotografía

### Logo

El usuario indica que el logo de Wintuu está en `assets`. Localizalo en el repositorio actual y usá ese archivo, respetando proporciones, espacio de seguridad y variante disponible.

El árbol del Repomix adjunto no lista ese directorio ni permite verificar el archivo del logo; no asumir por eso que falta en el proyecto actual. Revisar `assets`, `client/src/assets` y `client/public/assets` según la organización real. No inventar un nombre de importación.

El `Logo.jsx` existente toma la marca configurable de cada negocio. Para esta landing conviene un `WintuuLogo` de presentación que use el asset de la plataforma. No mostrar accidentalmente el logo de un negocio visitado antes.

Si el archivo realmente no está en el checkout de trabajo, continuar con el resto y señalar el asset faltante al entregar. No redibujar una marca definitiva ni sustituirla por un icono de Lucide. Para una maqueta local temporal, se admite escribir «Wintuu» claramente como reemplazo pendiente.

### Dirección de fotografía

Personas adultas jóvenes, aproximadamente de 22–35 años, estética urbana/hipster natural, ropa cotidiana, cafeterías de especialidad, notebooks y teléfonos. Expresiones espontáneas y encuadres con algo de contexto. Luz de ventana, madera, cerámica y verdes apagados; pieles naturales.

Evitar reuniones corporativas rígidas, trajes, apretones de manos, selfies de influencer, sonrisas excesivamente posadas y fotografías azules de «tecnología».

| Ubicación | Imagen a buscar | Encuadre | Búsqueda orientativa |
| --- | --- | --- | --- |
| Hero, tarjeta fotográfica | Persona joven consultando un teléfono en una cafetería | Vertical 4:5; rostro y teléfono reconocibles | `young adult using smartphone specialty coffee cafe candid` |
| Producto, identidad del negocio | Persona detrás del mostrador o dueña de un café usando notebook | Horizontal 4:3; manos y entorno real | `independent cafe owner laptop counter natural light` |
| Menú digital | Café y pieza de pastelería sobre mesa o mostrador | Detalle 4:3, luz cálida y fondo simple | `specialty coffee pastry ceramic cup natural light` |
| Cierre, foto pequeña | Dos personas compartiendo café o trabajando en una notebook | Horizontal 3:2; momento distendido | `friends cafe laptop candid urban coffee shop` |

Seleccionar fotos de stock con permiso de uso adecuado y registrar su origen. Las búsquedas son una guía de selección, no URLs ni assets ya descargados. Se puede usar Unsplash o Pexels como fuente de búsqueda, verificando cada imagen y sus condiciones.

- Elegir 3–4 fotos coherentes entre sí. No usar una imagen distinta en cada tarjeta.
- Descargar las seleccionadas y servir archivos estables desde el proyecto, según sus condiciones de uso. Evitar endpoints aleatorios de imágenes o enlaces que cambien cada vez que carga la página.
- Recortar mediante `object-fit: cover` y definir `object-position` por foto y breakpoint. Conservar caras, manos y dispositivos.
- El teléfono que muestra Wintuu se construye con HTML/CSS y una interfaz ilustrativa fiel al producto. No incrustar texto ilegible dentro de una imagen de stock.
- Optimizar a WebP/AVIF cuando el flujo del proyecto lo permita; incluir dimensiones y variantes responsive.
- La imagen principal del hero carga con prioridad; las inferiores, con carga diferida.
- Los nombres como `hero-cafe-phone.webp` o `cafe-owner-laptop.webp` son propuestas para nuevos assets, no rutas existentes confirmadas.

## 6. Arquitectura de la one page

Orden obligatorio:

1. Navbar.
2. Hero.
3. Producto — `#producto`.
4. Cómo funciona — `#como-funciona`.
5. Planes — `#planes`.
6. FAQs — `#faqs`.
7. Contacto por WhatsApp — `#contacto`.
8. Footer memorable.

El menú digital se integra dentro de Producto y se recuerda en Cómo funciona y Planes. No hace falta crear una sección adicional que repita toda la explicación.

## 7. Navbar

### Diseño

Barra flotante de vidrio oscuro, centrada, con aproximadamente 72 px de alto en desktop y 64 px en mobile. Borde fino, radio de 20–24 px, ligera separación del borde superior y posición sticky. Debe quedar por encima de los mockups.

Distribución desktop: logo a la izquierda; navegación en el centro; ingreso y acceso a planes a la derecha, con espacios claros entre grupos.

### Texto y destinos

| Elemento | Texto exacto | Destino |
| --- | --- | --- |
| Logo | Asset de Wintuu | `/#inicio` |
| Nav 1 | Producto | `#producto` |
| Nav 2 | Cómo funciona | `#como-funciona` |
| Nav 3 | Planes | `#planes` |
| Nav 4 | FAQs | `#faqs` |
| Acceso | Ingresar | `/ingresar` |
| Botón discreto | Ver planes | `#planes` |

El acceso a planes puede ser un botón menta pequeño. «Ingresar» tiene jerarquía secundaria pero buena legibilidad.

En mobile: logo + botón de menú. Dentro del menú, los cuatro navitems y los dos accesos. Al seleccionar una sección, cerrar el menú y llevar a la sección sin que el encabezado tape el título. Cierre con Escape, devolución del foco y estado `aria-expanded` correcto.

Si el proyecto ya resuelve de forma fiable un negocio administrado por la sesión activa, se puede reemplazar «Ingresar» por «Mi panel». Usar la sesión/contexto existente y el slug real. Si no hay un destino inequívoco, conservar `/ingresar` para que el portal permita elegir. No deducir permisos por encontrar un valor antiguo en `localStorage`.

## 8. Hero — texto y composición final

Asignar `id="inicio"` a esta sección para el regreso desde el logo y el footer.

### Copy visible

**Eyebrow**

> Tu negocio. Tus clientes. Más cerca.

**H1 obligatorio, respetar literalmente**

> Con Wintuu ganamos todos

**Bajada obligatoria, respetar literalmente**

> La forma más simple de conectar tu negocio con tus clientes y ofrecerles beneficios.

**Botón principal:** `Conocer Wintuu` → `#producto`.

**Botón secundario:** `Ver cómo funciona` → `#como-funciona`.

**Línea de apoyo pequeña:**

> Cupones, puntos y tu menú digital, en un mismo lugar.

### Composición desktop

- Dos zonas de aproximadamente 46% texto y 54% composición visual, con 40–64 px de separación, ajustadas al ancho real.
- H1 en dos líneas cuando entre bien: «Con Wintuu» / «ganamos todos». A anchos menores, permitir tres líneas naturales. No modificar palabras para forzar un corte.
- «ganamos todos» recibe un gradiente sutil de menta a menta claro. «Con Wintuu» queda en blanco cálido.
- El texto se alinea a la izquierda y ocupa una columna legible. No encerrarlo en una tarjeta de vidrio.
- A la derecha, un pequeño bento de tres piezas: teléfono alto, fotografía vertical y tarjeta de puntos. Las piezas comparten radios y separación, pero tienen tamaños distintos.

| Pieza del hero | Tamaño orientativo | Contenido |
| --- | --- | --- |
| Teléfono | 55–60% del ancho visual; altura aproximada 480–540 px | Vista de cliente de «Café Nube», un cupón y su progreso. Fondo petróleo con halo menta. |
| Fotografía | 40–45% del ancho; en la parte superior | Persona usando un teléfono en un café. Foto a sangre con un degradado inferior suave. |
| Tarjeta de puntos | Debajo de la fotografía | Una UI de progreso 4/5 y un pequeño mensaje de beneficio. Fondo de vidrio con un detalle crema. |

Una sola superposición controlada, de aproximadamente 12–24 px, puede dar profundidad. Mantener la pantalla visible, la cara libre y los botones fuera de las capas decorativas. La primera pantalla debe mostrar texto, botones y producto sin exigir un scroll largo.

### Contenido exacto de la interfaz ilustrativa

Usar un negocio ficticio, identificado con una etiqueta discreta **«Vista de ejemplo»**.

```text
Café Nube
Tus beneficios

Café de regalo
Completá 5 puntos y disfrutá tu próximo café.

4 de 5 puntos
Te falta 1 punto.

Tu cupón activo
```

En la tarjeta pequeña: `Una visita más cerca.` y `4 / 5 puntos`.

Estos números ilustran el progreso de un cupón. No son estadísticas de Wintuu. Las piezas no deben simular ser botones activos de una cuenta real. Si aparece un QR, identificarlo como ilustrativo y no usar un código de un cliente real.

### Mobile

Texto primero, botones después y composición visual a continuación. El teléfono conserva protagonismo; la foto y el progreso pueden ocupar dos piezas menores al lado o debajo según el ancho. No eliminar toda la fotografía al pasar a mobile. Evitar que el teléfono quede tan pequeño que se convierta en una mancha ilegible.

## 9. Producto — bento principal

### Encabezado

**Eyebrow:** `Producto`.

**H2:**

> Lo de tu negocio, en un mismo lugar.

**Bajada:**

> Un perfil con tu identidad, beneficios que elegís vos y un panel para llevarlos al día. Del otro lado, tus clientes encuentran sus puntos, sus premios y tu menú.

### Distribución desktop

Grilla de 12 columnas. Cinco tarjetas, tres filas de referencia, con 16–20 px de separación. Usar alturas aproximadas de 260–290 px por fila y permitir crecimiento cuando lo requiera el contenido.

| Tarjeta | Columnas | Filas | Escena |
| --- | --- | --- | --- |
| A. Cupones | 1–7 | 1 | Dos cupones superpuestos y una meta visible. |
| B. Identidad | 8–12 | 1 | Foto del negocio + pequeño perfil de marca. |
| C. Menú incluido | 1–5 | 2–3 | Tarjeta alta, clara, con mini menú y foto de café. |
| D. Panel | 6–12 | 2 | Ventana ancha con clientes y estado de cupones. |
| E. Puntos | 6–12 | 3 | Progreso de puntos y estado de premio. |

En tablet, reorganizar en dos columnas conservando un módulo ancho. En mobile, una columna; las composiciones se adaptan al ancho y al contenido. No conservar las alturas de desktop ni crear scroll horizontal dentro de las tarjetas.

### A. Cupones

**Título:**

> Los beneficios los elegís vos.

**Texto:**

> Un porcentaje, un monto de descuento o un regalo. Creás el cupón y definís cuántos puntos hacen falta para conseguirlo.

**Visual:** dos cupones de vidrio, uno menta y uno con un detalle lila. Etiquetas ilustrativas: `Café de regalo · 5 puntos` y `15% de descuento · 8 puntos`. Contorno delicado, pequeño corte de ticket y una superposición de pocos grados. El texto de explicación permanece en un plano horizontal y legible.

### B. Identidad

**Título:**

> Tu negocio, con tu identidad.

**Texto:**

> Tu nombre, tu logo y tus colores, en un perfil con un enlace para compartir con tus clientes.

**Visual:** fotografía del negocio y un panel pequeño superpuesto que diga `Café Nube · Perfil de ejemplo`. Puede mostrarse `/cafe-nube` como texto ilustrativo, sin enlazarlo a un negocio inexistente. Usar una identidad ficticia simple para el ejemplo; no confundirla con el logo real de Wintuu.

### C. Menú incluido

**Etiqueta:** `Incluido en ambos planes`.

**Título:**

> Y tu menú, también.

**Texto:**

> Cargá productos, fotos, precios y categorías. Tu menú digital queda disponible en el mismo perfil y lo actualizás desde el panel.

**Remate pequeño:**

> Un lugar más para mostrar lo que hacés.

**Visual:** una superficie crema con texto petróleo. Abajo, mini pantalla de menú con `Cafés`, `Algo rico` y `Bebidas`, foto de café y tarjetas de productos. Datos ficticios coherentes, por ejemplo `Flat white · $4.500` y `Croissant · $3.800`, dentro de la vista identificada como ejemplo. No presentar esos precios como datos reales de un local.

### D. Panel

**Título:**

> Un panel para llevarlo al día.

**Texto:**

> Creá y editá cupones, consultá el progreso de tus clientes y actualizá tu menú desde el mismo lugar.

**Visual:** una ventana de interfaz con una navegación corta: `Menú`, `Clientes`, `Cupones`. Mostrar dos filas de ejemplo y estados `En progreso` / `Listo para canjear`. Usar nombres ficticios, sin teléfonos, emails reales ni gráficos de facturación inventados. Incluir una etiqueta pequeña `Vista del negocio`.

### E. Puntos

**Título:**

> Cada punto acerca un premio.

**Texto:**

> Tus clientes ven cuánto llevan y cuánto les falta. Cuando completan la meta, el beneficio queda listo para canjear en tu negocio.

**Visual:** una tarjeta de cinco marcas, cuatro completas, junto a una segunda vista del estado final `5 de 5 · Listo para canjear`. La transición puede mostrar el paso de 4 a 5 una sola vez al entrar en pantalla. No mostrar un premio entregado antes de completar la meta.

## 10. Cómo funciona — cuatro pasos

### Encabezado

**Eyebrow:** `Cómo funciona`.

**H2:**

> De una visita a las ganas de volver.

**Bajada:**

> Vos definís el beneficio. Tus clientes van sumando. Cada uno puede seguir su progreso desde el celular.

### Copy de los pasos

| Número | Título | Texto |
| --- | --- | --- |
| 01 | Creás un cupón. | Elegís el premio y la cantidad de puntos para conseguirlo. Puede ser un descuento o ese pequeño regalo que representa a tu negocio. |
| 02 | Tus clientes lo activan. | Entran al perfil de tu negocio, acceden con Google y eligen el cupón que quieren empezar a completar. |
| 03 | Cada visita puede sumar. | Cuando corresponde sumar un punto, escaneás el QR de su cupón y lo registrás desde el panel. El cliente puede ver cómo avanza. |
| 04 | Llega el premio. Y otra vuelta. | Al completar la meta, el cupón queda listo para canjear. Lo validás en tu negocio y el cliente puede activar otro para volver a empezar. |

**Nota de cierre:**

> Y mientras tanto, tu menú está ahí: listo para que lo consulten y elijan qué disfrutar.

### Diseño e interacción

Dos columnas: pasos numerados a la izquierda y una escena del producto a la derecha. Las explicaciones permanecen visibles. Un indicador menta marca el paso seleccionado y la escena cambia con un crossfade breve.

Escenas: formulario de cupón → cupón activado → QR y registro del punto → cupón listo/canje validado. Es una demostración de presentación: no dispara llamadas de activación, pagos, cámara o canje reales.

La selección debe funcionar por clic y teclado, no solo por hover. No usar un carrusel automático que cambie antes de terminar de leer. En mobile, mostrar el ejemplo junto a los pasos o simplificar a ilustraciones compactas; conservar toda la explicación y el orden.

## 11. Planes — copy y comportamiento

### Encabezado

**Eyebrow:** `Planes`.

**H2:**

> Elegí cómo acompañar a tu negocio.

**Bajada:**

> Las mismas herramientas, con dos formas de usar Wintuu: mes a mes o con un único pago.

### Tarjetas

| Campo | Mensual | De por vida |
| --- | --- | --- |
| Nombre | Mensual | De por vida |
| Precio solicitado | $30.000 | $300.000 |
| Aclaración | ARS · por mes | ARS · pago único |
| Descripción | Para sumar Wintuu al día a día de tu negocio, mes a mes. | Un único pago para seguir usando Wintuu sin una cuota mensual. |
| Botón | Continuar con el mensual | Continuar con el de por vida |
| Destino | `/checkout?plan=mensual` | `/checkout?plan=vitalicia` |
| Microcopy | Suscripción mensual con renovación automática. | Acceso de por vida, con un pago único. |

**Contenido compartido, visible para ambos planes:**

- Perfil con tu nombre, logo, colores y enlace.
- Panel de administración.
- Cupones con metas de puntos.
- Progreso de clientes y validación de canjes.
- Menú digital incluido.

**Nota inferior:**

> El pago se realiza a través de Mercado Pago. Después, configurás el perfil de tu negocio.

**Enlace complementario:** `¿Tenés una duda sobre los planes? Escribinos.` → WhatsApp.

### Diseño

Dos tarjetas del mismo peso, con el precio claramente legible y el mismo espacio para comparar. La de por vida puede tener un borde menta algo más visible; no agregar «más elegido», «recomendado» ni descuentos ficticios. Un solo bloque inferior puede reunir las herramientas compartidas y el menú incluido.

No usar contadores, precios tachados, cintas de oferta, un toggle anual/mensual ni cálculos de ahorro. La diferencia es la modalidad de pago.

### Integración de precios

Consultar `/api/plans` mediante el helper `api` existente y mapear por `id`, no por posición en el array. El código usa `mensual` y `vitalicia`; conservar esos valores aunque el nombre visible sea «De por vida».

Los montos aprobados en este brief coinciden con los defaults del servidor. El servidor también permite configuración por entorno: si devuelve otro importe, resolver esa discrepancia antes de publicar la nueva home. No mostrar un precio comercial distinto al checkout ni modificar la lógica de cobro como parte del diseño.

Durante la carga, reservar el espacio del precio. Si falla la consulta, mostrar `No pudimos cargar los precios en este momento.` y un botón `Reintentar`, manteniendo las descripciones de los planes y el acceso al checkout. No mostrar `$0`, `NaN` ni valores que parezcan confirmados cuando no se pudo obtener el precio.

## 12. FAQs — contenido final

**Eyebrow:** `FAQs`.

**H2:**

> Algunas dudas, resueltas.

**Bajada:**

> Y si te queda alguna más, estamos a un mensaje.

Mostrar un acordeón con estas preguntas y respuestas. Se pueden abrir una o varias; todos los controles deben funcionar con teclado. Usar respuestas en el DOM y encabezados semánticos, sin convertir el contenido en imágenes.

### ¿Qué es Wintuu?

Wintuu es un espacio digital para tu negocio y sus clientes. Desde tu panel creás cupones, definís premios y seguís el progreso de quienes participan. Tus clientes encuentran sus beneficios y tu menú en el perfil de tu negocio.

### ¿Sirve solo para cafeterías?

No. Podés usarlo en comercios y negocios de servicios que quieran reconocer las visitas de sus clientes. Vos elegís el beneficio y cuántos puntos hacen falta para conseguirlo.

### ¿Mis clientes tienen que descargar una app?

No. Entran al perfil de tu negocio desde el navegador del celular. Para activar cupones y ver su progreso, acceden con su cuenta de Google. El menú se puede consultar sin iniciar sesión.

### ¿Cómo se suman los puntos?

El cliente activa un cupón. Cuando corresponde sumar un punto, escaneás su QR o buscás su perfil desde el panel y registrás el punto. Al completar la meta que definiste, el cupón queda listo para canjear.

### ¿Qué tipo de premios puedo crear?

Podés crear un porcentaje de descuento, un monto de descuento o un regalo. También definís el nombre del cupón, su descripción y los puntos necesarios para conseguirlo.

### ¿El menú digital está incluido?

Sí, viene incluido en ambos planes. Lo completás con tus productos, fotos, precios y categorías, y después podés actualizarlo desde el panel cuando lo necesites.

### ¿Puedo usar el nombre y los colores de mi negocio?

Sí. Tu perfil puede llevar el nombre, el logo y los colores de tu negocio. También tiene un enlace dentro de Wintuu para compartir con tus clientes.

### ¿Qué cambia entre el plan mensual y el de por vida?

La modalidad de pago. El mensual se renueva cada mes. El de por vida se abona una sola vez. Ambos incluyen el perfil del negocio, el panel, los cupones, el seguimiento de puntos y el menú digital.

### ¿Cómo empiezo?

Elegís un plan y continuás al checkout. Luego accedés con Google y completás el pago en Mercado Pago. Cuando se confirma, configurás el nombre y el enlace de tu negocio y seguís los primeros pasos para cargar tu contenido.

### ¿Puedo cancelar la renovación del plan mensual?

Sí. Podés cancelar la renovación automática desde la configuración de tu panel. El acceso continúa hasta el final del período abonado.

### ¿Ya tengo una cuenta: por dónde ingreso?

Desde «Ingresar», arriba de esta página. El portal te permite elegir el negocio al que querés entrar y acceder como cliente o administrador, según corresponda a tu cuenta.

**Implementación del último texto:** convertir «Ingresar» en enlace real a `/ingresar`.

### Composición de FAQs

En desktop, encabezado breve a la izquierda y preguntas a la derecha, con divisores finos y mucho espacio. Evitar once tarjetas de vidrio pesadas. Usar un signo más que rote suavemente al abrir y texto de tamaño cómodo. En mobile, todo en una columna.

## 13. Contacto por WhatsApp

### Copy visible

**H2:**

> ¿Te quedó alguna duda? Lo charlamos.

**Texto:**

> Si querés saber cómo encaja Wintuu en tu negocio, escribinos. Podemos empezar por ahí.

**Botón:** `Escribir por WhatsApp`.

**Número visible:** `11 6112-0433`.

**Mensaje precargado:** `Hola, tengo una consulta sobre Wintuu.`

**URL:**

```text
https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.
```

Se conserva el número internacional que ya aparece en el checkout del Repomix, adaptando el mensaje a Wintuu y al tono solicitado. Verificar que el enlace abra el contacto correcto; no modificar el número por suposición ni enviar un mensaje durante la prueba.

### Diseño

Panel horizontal de vidrio, con un degradado suave menta y una foto pequeña de café/personas en el extremo opuesto. El texto y el botón tienen el mayor contraste. No añadir formulario, correo inventado, ventana de ventas ni promesa de respuesta en una cantidad determinada de minutos.

Abrir WhatsApp en una pestaña nueva con `rel="noopener noreferrer"`. El enlace debe funcionar desde desktop y mobile. No hace falta agregar un widget flotante que compita con el hero y tape contenido.

## 14. Footer memorable

El cierre tiene una composición propia. Debe sentirse como el último momento visual de la página, con espacio, identidad y una frase que conecte con la idea de volver.

### Copy visible

**Frase protagonista:**

> Nos vemos a la vuelta.

**Línea de apoyo:**

> Por ese café, ese lugar y esas ganas de volver.

**Firma de marca:**

> Con Wintuu ganamos todos.

**Navegación:** `Producto` · `Cómo funciona` · `Planes` · `FAQs` · `Ingresar`.

**Copyright:** `© {año actual} Wintuu.`

### Dirección visual

- Fondo petróleo muy oscuro con un halo menta bajo, que parezca iluminar el borde inferior.
- Frase «Nos vemos a la vuelta.» grande, en dos líneas si lo necesita; entre 72–112 px desktop y 44–64 px mobile.
- Una pequeña fotografía o fragmento de tarjeta de cupón puede acompañar el extremo derecho, sin llenar la zona central.
- Debajo, el logo real de Wintuu en gran escala, con ancho de hasta 70–85% del contenedor si su calidad lo permite. Mantenerlo completo y proporcionado. Si solo existe un raster pequeño, reducir su tamaño; no ampliar hasta pixelar.
- La firma y los enlaces van en una franja final más sobria, con separador de 1 px y bastante aire.
- Se puede incluir `Volver arriba ↑` → `#inicio`.
- No agregar redes sociales sin URLs reales, un newsletter inventado ni enlaces de términos/privacidad con `href="#"`. Si hay documentos legales reales en el proyecto actual, reutilizar sus destinos; si no, dejar esa necesidad señalada en la entrega sin fabricar contenido legal.

## 15. Movimiento y efectos de texto

La animación acompaña la lectura. Debe percibirse al entrar o interactuar, sin hacer que la página parezca constantemente inquieta.

| Elemento | Efecto | Parámetros orientativos |
| --- | --- | --- |
| H1 | Entrada por líneas: opacidad y desplazamiento vertical corto | 650–800 ms; desfase de 80–110 ms; `translateY` inicial de 14–20 px. |
| «ganamos todos» | Gradiente menta y una pasada de luz tenue | Una sola pasada después de la entrada; no animación infinita. |
| Bajada y CTA | Aparición como un grupo | 450–600 ms, después del título. |
| Mosaico del hero | Aparición escalonada de las tres piezas | 500–700 ms; desfase de 70–100 ms; sin zoom fuerte. |
| Bento | Aparición al entrar en viewport | Opacidad + `translateY` de 14–18 px; una vez por carga. |
| Tarjeta al hover | Elevación pequeña y borde algo más claro | 180–220 ms; desplazamiento máximo de 3–4 px; solo donde haya hover real. |
| Indicador de puntos | Progreso de 4 a 5 en la escena correspondiente | 500–700 ms; una vez, con estado final legible. |
| Pasos | Crossfade de la escena | 200–300 ms, iniciado por selección o interacción. |
| FAQ | Apertura suave y rotación del icono | 180–240 ms; sin cortar texto ni desplazar el foco. |
| Footer | Entrada de frase y marca | 650–800 ms; desplazamiento corto, una vez. |

Curva orientativa: `cubic-bezier(.22, 1, .36, 1)`. Priorizar `transform` y `opacity`.

### Implementación recomendada

El proyecto tiene React, Tailwind y Lucide. El `package.json` revisado no incluye GSAP ni Framer Motion. Esta propuesta se puede implementar con CSS, `IntersectionObserver` y estado de React; no hace falta instalar dos librerías de animación para resolverla.

- El contenido es visible por defecto. Activar estados de entrada mediante una clase que solo se agregue cuando la animación esté inicializada.
- El H1 conserva un único texto accesible. Si se duplican spans para un efecto visual, ocultar la copia decorativa a tecnologías de asistencia.
- No separar cada letra del título en un efecto de máquina de escribir ni usar texto que se desarme al hacer scroll.
- No usar scroll hijacking, cursores personalizados, partículas permanentes, luces que persiguen todo el mouse ni WebGL para el fondo.
- No aplicar `will-change` a toda la página. Limitarlo a los elementos animados cuando haga falta.
- Los mockups pueden tener profundidad estática; no necesitan estar flotando en bucle.
- Con `prefers-reduced-motion: reduce`, eliminar entradas desplazadas, brillos animados y scroll suave. Todo el contenido queda visible inmediatamente y los controles conservan su funcionalidad.
- Limpiar observers, listeners y timers al desmontar. Verificar el comportamiento bajo React StrictMode.

## 16. Enlaces e integración con el proyecto

### Mapa definitivo de destinos

| Origen | Destino | Tipo |
| --- | --- | --- |
| Logo de la navbar | `/#inicio` | Ruta raíz y ancla. |
| Producto / Conocer Wintuu | `#producto` | Ancla. |
| Cómo funciona / Ver cómo funciona | `#como-funciona` | Ancla. |
| Planes / Ver planes | `#planes` | Ancla. |
| FAQs | `#faqs` | Ancla. |
| Ingresar, navbar/footer/FAQ | `/ingresar` | Ruta existente. |
| Continuar con el mensual | `/checkout?plan=mensual` | Checkout con plan seleccionado. |
| Continuar con el de por vida | `/checkout?plan=vitalicia` | Checkout con plan seleccionado. |
| Contacto y consulta sobre planes | URL de WhatsApp de la sección 13 | Enlace externo. |
| Volver arriba | `#inicio` | Ancla del hero. |

Usar `Link` de React Router para rutas internas y `<a>` para anclas y enlaces externos, según la estructura real de la página. No cambiar `vitalicia` por `lifetime` o `anual`. No crear una segunda pantalla de ingreso ni otro checkout.

`/demo` existe en el snapshot, pero redirige al negocio por defecto. No tratarlo como una demo pública validada, ni poner un botón «Ver demo» que termine en un negocio real sin revisar. La explicación visual de esta home es local e ilustrativa.

### Alcance de los archivos

Punto de entrada real: `client/src/pages/Landing.jsx`.

Organización sugerida para el nuevo código, ajustable a las convenciones actuales:

```text
client/src/pages/Landing.jsx
client/src/components/landing/WintuuLogo.jsx
client/src/components/landing/LandingNavbar.jsx
client/src/components/landing/HeroBento.jsx
client/src/components/landing/ProductBento.jsx
client/src/components/landing/HowItWorks.jsx
client/src/components/landing/PricingSection.jsx
client/src/components/landing/FaqSection.jsx
client/src/components/landing/ContactSection.jsx
client/src/components/landing/LandingFooter.jsx
client/src/components/landing/ProductMockups.jsx
client/src/styles/wintuu-landing.css
```

Esta lista propone archivos nuevos; no afirma que ya existan. Evitar convertir de nuevo toda la landing en un único componente enorme.

- Acotar estilos, fuentes específicas y tokens a `.wintuu-landing` o usar CSS Modules.
- No sobrescribir globalmente `.card`, `.btn-primary`, `--primary`, `body` ni el tema de los negocios para obtener el estilo de esta página.
- La landing tiene su propia presentación oscura. No necesita un selector claro/oscuro adicional.
- Conservar rutas, contextos de autenticación, tenant y tema. El proyecto ya separa plataformas y negocios mediante esos contextos.
- No renombrar claves `perks:*` del almacenamiento, rutas `/perks/admin`, IDs de planes, variables de entorno ni referencias de pago por un cambio de marca visual.
- «Wintuu» debe aparecer en todos los textos de esta nueva landing. En el snapshot hay pantallas de ingreso/checkout que todavía dicen «PERKS»: este encargo exige enlazarlas, no reconstruir su lógica. Señalar esa diferencia en la entrega si sigue presente en el repositorio actual.
- No usar el componente global `Navbar.jsx` de los negocios para esta navegación comercial.
- Construir mockups de presentación con datos ficticios locales. No importar `Home` ni componentes que disparen consultas o acciones de una cuenta al montarse.
- Usar las dependencias existentes siempre que alcancen. No migrar a Next.js, Tailwind 4 u otro framework para hacer esta home.

### Metadatos

**Title:** `Wintuu | Con Wintuu ganamos todos`.

**Description:** `Conectá tu negocio con tus clientes con cupones, puntos y beneficios. Wintuu reúne tu programa de fidelización y tu menú digital en un mismo lugar.`

Un único H1. Jerarquía de H2 por sección y H3 en tarjetas/preguntas cuando corresponda. Mantener `lang="es"`; usar recursos de Wintuu para el favicon de la plataforma cuando estén disponibles.

Revisar el manejo de `document.title`, meta description y favicon en `ThemeContext.jsx` y los scripts de `client/index.html`: el snapshot contiene lógica de marca de negocio y caché. La landing debe conservar sus metadatos y la visita a un negocio debe conservar los de ese negocio. Resolverlo con una distinción explícita entre raíz y tenant, no con un timeout que compita por escribir el título.

No inventar un dominio canónico o una imagen Open Graph inexistente. Usar la configuración real del despliegue cuando esté disponible.

## 17. Orden de implementación y criterios de aceptación

### Secuencia de trabajo

1. Revisar instrucciones del repositorio, rutas actuales, dependencias, assets de marca y mecanismo de precios.
2. Montar estructura semántica y copiar los textos finales de este documento, con los enlaces reales.
3. Construir el hero y una tarjeta de producto con acabado final para fijar vidrio, tipografía, iluminación y escala. Continuar el resto con ese criterio visual.
4. Implementar el bento completo y las vistas ilustrativas fieles al producto.
5. Integrar fotos elegidas, planes desde la API, FAQs y contacto.
6. Ajustar mobile/tablet, navegación por teclado, metadatos y movimiento reducido.
7. Revisar visualmente en navegador y ejecutar el build del proyecto. Corregir lo observado antes de entregar.

No dar por terminado el trabajo con una estructura de colores y placeholders. Las imágenes, los textos y los estados de navegación forman parte de la implementación.

### Revisión de contenido y producto

- [ ] H1 y bajada del hero coinciden literalmente con el pedido.
- [ ] Se distingue qué hace el negocio y qué ve el cliente.
- [ ] Los pasos respetan activar → sumar puntos → completar → canjear.
- [ ] Los ejemplos de cupones tienen metas y estados coherentes.
- [ ] El menú se presenta como incluido, editable y a completar por el negocio.
- [ ] Los precios son ARS 30.000/mes y ARS 300.000 por única vez, y coinciden con el checkout/configuración real.
- [ ] No quedan testimonios inventados, métricas comerciales falsas ni funciones heredadas sin respaldo.
- [ ] Todas las apariciones de la marca en la landing dicen Wintuu y usan su logo real cuando está disponible.

### Revisión visual

- [ ] El hero combina texto, teléfono, fotografía y progreso con una composición reconocible.
- [ ] El bento tiene tamaños, materiales y escenas diferentes, con bordes y espacios coherentes.
- [ ] El menta `#00CFCD` domina la identidad; el lila y el crema acompañan.
- [ ] Las fotos se sienten naturales y comparten luz/tono; no se recortan caras ni manos importantes.
- [ ] El vidrio muestra profundidad sin bajar la legibilidad.
- [ ] El footer tiene la frase «Nos vemos a la vuelta.», una firma de marca clara y una composición propia.
- [ ] Hay revisión de capturas a 390, 768 y 1440 px, y un chequeo adicional de overflow a 360 px.
- [ ] No hay scroll horizontal, texto truncado, imágenes rotas ni controles montados unos sobre otros.

### Revisión funcional

- [ ] Los cuatro navitems llevan a sus secciones y dejan el título visible debajo de la navbar.
- [ ] Menú mobile y FAQs funcionan con mouse, touch y teclado.
- [ ] `/ingresar` abre la pantalla existente.
- [ ] Cada CTA de plan abre `/checkout` con el plan correcto seleccionado.
- [ ] WhatsApp abre el número indicado con el mensaje amable, sin enviarlo automáticamente.
- [ ] Los precios tienen estado de carga, error y reintento; no aparece un cero ficticio.
- [ ] La landing no dispara activaciones, canjes, accesos a cámara ni pagos al mostrar sus ejemplos.
- [ ] El modo de movimiento reducido mantiene todo el contenido visible.
- [ ] Los estilos y metadatos de la portada no contaminan los de un negocio al navegar.
- [ ] `npm run build` desde la raíz finaliza correctamente; en el snapshot delega al build de `client`.
- [ ] No aparecen errores nuevos en la consola durante la navegación principal.

Si no hay credenciales o backend accesible, indicar qué integración se pudo revisar por código y cuál no se probó en ejecución. No realizar pagos reales ni modificar datos de clientes para validar esta landing.

### Entrega esperada de Claude

Entregar la implementación terminada, una explicación breve de lo cambiado, los archivos relevantes y el resultado del build/revisión visual. Señalar únicamente pendientes concretos, como un logo que no esté en el repositorio, un precio de entorno diferente al brief o una integración que no se pudo ejecutar.

**Criterio final:** al abrir la home, Wintuu debe sentirse como un producto pensado para negocios reales: se entiende, se reconoce su personalidad visual y se puede recorrer sin presión de venta.
