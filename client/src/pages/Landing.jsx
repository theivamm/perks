import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  Coffee,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatPrice(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
}

const NAV = [
  ['#como-funciona', 'Cómo funciona'],
  ['#beneficios', 'Beneficios'],
  ['#planes', 'Planes'],
  ['#faq', 'Preguntas'],
];

const STEPS = [
  ['Identificás al cliente', 'Con su nombre, teléfono o su código personal. Sin formularios eternos.', QrCode],
  ['Registrás la compra', 'Una visita, un pedido, un turno: lo que tenga sentido para tu negocio.', Zap],
  ['El progreso se actualiza solo', 'Cada movimiento queda guardado en el perfil y el historial del cliente.', TrendingUp],
  ['Se activa el premio', 'Cupón, descuento o regalo listo para entregar, en el momento justo.', Gift],
];

const USE_CASES = [
  ['Cafetería', 'Cada 10 consumos, café y croissant de regalo.', Coffee],
  ['Restaurante', 'Después de 5 reservas, un beneficio para la próxima cena.', Store],
  ['Salón de uñas', 'En la quinta visita, 20% en el próximo servicio.', Sparkles],
  ['Gimnasio o estudio', 'Premio por asistencia sostenida durante el mes.', Calendar],
  ['Óptica', 'Recordatorio y beneficio cuando llega el momento de renovar.', BarChart3],
  ['Cualquier negocio', 'Si tus clientes pueden volver, podés darles una razón.', Star],
];

const FAQ = [
  [
    '¿Sirve solamente para cafeterías?',
    'No. Funciona en cualquier negocio donde una persona pueda volver a comprar, reservar, asistir o contratar un servicio.',
  ],
  [
    '¿Tengo que usar una regla de 10 compras?',
    'No. Vos definís la meta: 5 visitas, 10 compras, un monto acumulado, asistencia mensual o cumpleaños. La plataforma se adapta a cómo funciona tu negocio.',
  ],
  [
    '¿Cómo se identifica al cliente?',
    'Cada cliente tiene un código QR personal. Tu equipo lo escanea o busca el perfil por nombre o teléfono, y la compra queda registrada en segundos.',
  ],
  [
    '¿Mi equipo necesita aprender un sistema complejo?',
    'No. Registrar una compra son dos toques desde el celular o la computadora. No hace falta recordar reglas ni planillas.',
  ],
  [
    '¿El cliente necesita instalar una aplicación?',
    'No. Tus clientes entran desde el navegador con su cuenta de Google y ven su progreso, sus cupones y sus premios al instante.',
  ],
  [
    '¿Puedo cambiar el premio después?',
    'Sí. Podés editar los cupones, las metas y las reglas cuando quieras desde el panel, sin tocar nada técnico.',
  ],
  [
    '¿Puede funcionar en más de un local?',
    'Sí. PERKS está preparado para trabajar con varios puntos de atención y consolidar la información de tus clientes.',
  ],
  [
    '¿Puede enviar mensajes por WhatsApp?',
    'Sí. Las notificaciones automáticas por WhatsApp requieren una integración autorizada con WhatsApp Business Platform o un proveedor oficial, además del consentimiento del cliente.',
  ],
  [
    '¿PERKS entrega una plataforma propia?',
    'Sí. Cada negocio tiene su propio perfil, con su nombre, sus colores y su link personalizado para compartir con sus clientes.',
  ],
  [
    '¿Puedo empezar con algo pequeño?',
    'Sí. Se empieza con una regla simple y una meta clara. Después se suman automatizaciones, campañas y reportes a medida que el sistema crece.',
  ],
];

function storedAdminApp() {
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    if (!key.startsWith('perks:user:') || key.endsWith(':_global')) continue;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved?.role === 'admin' && saved?.tenant_slug) return { slug: saved.tenant_slug, user: saved };
    } catch {
      // Ignora sesiones locales inválidas.
    }
  }
  return null;
}

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminApp, setAdminApp] = useState(() => storedAdminApp());

  const tenantSlug = adminApp?.slug || (user?.role === 'admin' ? user.tenant_slug : '');
  const isLoggedIn = Boolean(user || adminApp);
  const panelTo = tenantSlug ? `/${tenantSlug}/dashboard` : '/checkout';

  // Usuarios logueados con tokens viejos pueden no traer el slug de su app.
  useEffect(() => {
    if (!user) return;
    api('/api/onboarding/status')
      .then((s) => {
        if (s?.slug) setAdminApp({ slug: s.slug, user });
      })
      .catch(() => {});
  }, [user]);

  const doLogout = async () => {
    setMenuOpen(false);
    await logout(tenantSlug || undefined);
    setAdminApp(null);
    navigate('/');
  };

  useEffect(() => {
    document.title = 'PERKS · Clientes que vuelven';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'PERKS convierte cada compra en una razón para volver: registrá visitas, conocé a tus clientes y premialos automáticamente.'
      );
    }
    api('/api/plans')
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-[#0A0A0C]">
              <Sparkles size={16} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">PERKS</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-white/60 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to={panelTo}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-[#0A0A0C] transition hover:bg-amber-300"
                >
                  <LayoutDashboard size={15} />
                  {tenantSlug ? 'Ir al dashboard de mi app' : 'Quiero mi app'}
                </Link>
                <button
                  onClick={doLogout}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={15} />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/checkout" className="text-sm font-semibold text-white/70 transition hover:text-white">
                  Ingresar
                </Link>
                <Link
                  to="/checkout"
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-[#0A0A0C] transition hover:bg-amber-300"
                >
                  Quiero mi app
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
            {menuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0A0A0C] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {NAV.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-white/70"
                >
                  {label}
                </a>
              ))}
              {isLoggedIn ? (
                <>
                  <Link
                    to={panelTo}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-center text-sm font-bold text-[#0A0A0C]"
                  >
                    <LayoutDashboard size={15} />
                    {tenantSlug ? 'Ir al dashboard de mi app' : 'Quiero mi app'}
                  </Link>
                  <button
                    onClick={doLogout}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70"
                  >
                    <LogOut size={15} />
                    Salir
                  </button>
                </>
              ) : (
                <Link
                  to="/checkout"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-amber-400 px-4 py-2 text-center text-sm font-bold text-[#0A0A0C]"
                >
                  Quiero mi app
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Sparkles size={13} /> Clientes que vuelven
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Convertí cada compra en una razón para volver.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/60">
              PERKS registra cada visita, conoce mejor a tus clientes y los premia automáticamente cuando alcanzan
              la meta que vos definís. Vos elegís la regla; PERKS reconoce y premia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-[#0A0A0C] transition hover:bg-amber-300"
              >
                Quiero fidelizar clientes <ArrowRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Mirá cómo funciona
              </a>
            </div>
            <p className="mt-4 text-sm text-white/40">
              Sin instalar nada. Tus clientes entran con Google y ven su progreso al instante.
            </p>
          </div>

          <MockDashboard />
        </div>
      </section>

      {/* PROBLEMA / SOLUCIÓN */}
      <section id="beneficios" className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Vender es solo el principio</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tus clientes vuelven. Pero hoy depende de que alguien los recuerde.
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            Entre pedidos, turnos y mensajes es difícil saber quién compra seguido, cuándo fue su última visita o
            quién está cerca de recibir un premio.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <h3 className="text-lg font-bold text-white/50">Hoy</h3>
              <ul className="mt-5 space-y-3 text-white/50">
                {['Compras sueltas', 'Nombres en WhatsApp', 'Tarjetas de papel', 'Promociones generales', 'No sabemos quién volvió'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-3">
                      <X size={16} className="text-white/30" /> {t}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="rounded-3xl border border-amber-400/30 bg-amber-400/[0.06] p-7">
              <h3 className="text-lg font-bold text-amber-300">Con PERKS</h3>
              <ul className="mt-5 space-y-3 text-white/85">
                {['Perfil único por cliente', 'Historial de compras', 'Progreso visible', 'Premio configurado', 'Cada visita cuenta'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-3">
                      <Check size={16} className="text-amber-300" /> {t}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Simple para tu equipo. Claro para tus clientes.
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cada visita suma. Cada premio tiene una regla.
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            Definís qué acción querés reconocer y cuándo se activa el beneficio. El sistema registra el progreso y
            avisa cuando llega el momento.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, body, Icon], i) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                    <Icon size={20} />
                  </span>
                  <span className="text-2xl font-extrabold text-white/15">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGLAS */}
      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Vos decidís qué premiar</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Diez compras, cinco visitas o el objetivo que tenga sentido para tu negocio.
            </h2>
            <p className="mt-4 text-white/60">
              No todos los negocios funcionan igual. Configuramos las reglas, los beneficios y los tiempos alrededor
              de la forma en que trabajan tus clientes.
            </p>
            <div className="mt-8 space-y-3">
              {[
                ['Cada 10 compras', 'producto gratis'],
                ['Quinta visita', '20% de descuento'],
                ['30 días sin volver', 'beneficio de reactivación'],
                ['Cumpleaños', 'regalo especial'],
              ].map(([when, then]) => (
                <div
                  key={when}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <span className="font-semibold text-white/80">{when}</span>
                  <span className="flex items-center gap-2 text-amber-300">
                    <ArrowRight size={15} /> {then}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <RuleBuilder />
        </div>
      </section>

      {/* TRES FORMAS */}
      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Una plataforma. Tres formas de ganar.
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Mejor para tus clientes. Más simple para tu equipo. Más claro para vos.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ['Tus clientes', Users, ['Ven su progreso', 'Reciben beneficios relevantes', 'No pierden una tarjeta de papel', 'Tienen una razón concreta para volver']],
              ['Tu equipo', Zap, ['Encuentra rápido cada perfil', 'Registra visitas en segundos', 'Sabe cuándo entregar un premio', 'No depende de recordar reglas']],
              ['Tu negocio', BarChart3, ['Conoce la frecuencia de compra', 'Identifica clientes valiosos', 'Reactiva personas inactivas', 'Mide qué beneficios generan retorno']],
            ].map(([title, Icon, items]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/60">
                  {items.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-amber-300" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            La misma idea. Reglas diferentes.
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Si tus clientes pueden volver, podés darles una razón para hacerlo.
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map(([title, body, Icon]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <Icon size={20} className="text-amber-300" />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              No más intuición sin datos
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Mirá quién vuelve, qué funciona y dónde tenés una oportunidad.
            </h2>
            <p className="mt-4 text-white/60">
              El panel reúne la actividad importante para mejorar la fidelización sin armar reportes a mano.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                ['Clientes activos', '342'],
                ['Tasa de regreso', '38%'],
                ['Premios entregados', '47'],
                ['Por reactivar', '26'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="mt-1 text-sm text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <MockBars />
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Planes</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Empezá con una regla. Crecé cuando lo necesites.
          </h2>
          <p className="mt-4 max-w-2xl text-white/60">
            Ambos planes incluyen mantenimiento, actualizaciones y tu propio link personalizado para tus clientes.
          </p>

          <div className="mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {plans.length === 0 && (
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
                Cargando planes…
              </div>
            )}
            {plans.map((p) => {
              const highlight = p.id === 'vitalicia';
              return (
                <div
                  key={p.id}
                  className={`relative rounded-3xl border p-8 ${
                    highlight ? 'border-amber-400/50 bg-amber-400/[0.07]' : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  {highlight && (
                    <span className="absolute -top-3 left-8 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-[#0A0A0C]">
                      Mejor valor
                    </span>
                  )}
                  <h3 className="text-xl font-extrabold">{p.name}</h3>
                  <p className="mt-1 text-sm text-white/50">{p.period}</p>
                  <p className="mt-5 text-4xl font-extrabold">{formatPrice(p.price)}</p>
                  <ul className="mt-6 space-y-3 text-sm text-white/70">
                    {[
                      'Tu perfil con link personalizado',
                      'Productos, cupones y reglas ilimitadas',
                      'Clientes con Google, sin instalar nada',
                      'Escaneo de QR y panel de administración',
                      'Mantenimiento y actualizaciones incluidas',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <Check size={16} className="mt-0.5 shrink-0 text-amber-300" /> {t}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/checkout?plan=${p.id}`}
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition ${
                      highlight
                        ? 'bg-amber-400 text-[#0A0A0C] hover:bg-amber-300'
                        : 'border border-white/20 text-white hover:border-white/50'
                    }`}
                  >
                    Elegir {p.name} <ArrowRight size={17} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONFIANZA */}
      <section className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-amber-300" size={24} />
            <h2 className="text-2xl font-extrabold tracking-tight">
              Fácil de usar. Diseñado para cuidar la relación con tus clientes.
            </h2>
          </div>
          <p className="mt-4 max-w-3xl text-white/60">
            La información y las comunicaciones se manejan con orden, control y transparencia.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Acceso por usuarios y permisos',
              'Historial de cambios importantes',
              'Exportación de datos',
              'Respaldo de la información',
              'Reglas de vencimiento configurables',
              'Consentimiento para comunicaciones',
              'Baja de mensajes promocionales',
              'Integración con canales oficiales',
            ].map((t) => (
              <div key={t} className="flex items-start gap-2.5 text-sm text-white/70">
                <Check size={16} className="mt-0.5 shrink-0 text-amber-300" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/10 px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Dudas frecuentes</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>

          <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.02]">
            {FAQ.map(([q, a], i) => (
              <div key={q}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  <span className="font-semibold">{q}</span>
                  <span className="text-xl text-amber-300">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="px-6 pb-6 text-sm leading-relaxed text-white/60">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/10 px-5 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Contanos cómo compran tus clientes.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/60">
            En minutos tenés tu app lista, con tu nombre y tu link para compartir. Después la hacés crecer a tu ritmo.
          </p>
          <Link
            to="/checkout"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-lg font-bold text-[#0A0A0C] transition hover:bg-amber-300"
          >
            Crear mi app ahora <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-[#0A0A0C]">
              <Sparkles size={14} />
            </span>
            <span className="font-extrabold tracking-tight">PERKS</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to="/shanti-chi" className="transition hover:text-white">
              Ver demo
            </Link>
            {!isLoggedIn && (
              <Link to="/checkout" className="transition hover:text-white">
                Ingresar
              </Link>
            )}
            <Link to="/perks/admin" className="transition hover:text-white">
              Equipo PERKS
            </Link>
          </div>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} PERKS</p>
        </div>
      </footer>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="relative">
      <div className="rounded-3xl border border-white/10 bg-[#111114] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Users size={15} className="text-amber-300" /> Clientes
          </div>
          <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
            Sistema activo
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {[
            ['ML', 'Martina López', '9 visitas', '9/10', true],
            ['LR', 'Lucas Ruiz', 'premio disponible', '10/10', false],
            ['SV', 'Sofía Vega', '4 visitas', '4/10', true],
          ].map(([initials, name, sub, prog, active]) => (
            <div
              key={name}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                active ? 'border-white/10 bg-white/[0.02]' : 'border-amber-400/40 bg-amber-400/[0.08]'
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className={`truncate text-xs ${active ? 'text-white/45' : 'text-amber-300'}`}>{sub}</p>
              </div>
              <span className="text-xs font-bold text-white/50">{prog}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.04] p-4">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Progreso hacia el premio</span>
            <span>8 de 10</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-amber-400" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
            <Gift size={13} className="text-amber-300" /> Próximo premio: Café + croissant
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-white/10 bg-[#111114] px-4 py-3 shadow-xl sm:block">
        <p className="text-xs text-white/45">Compra registrada</p>
        <p className="text-sm font-bold text-amber-300">✓ Progreso actualizado</p>
      </div>
    </div>
  );
}

function RuleBuilder() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111114] p-6 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">Constructor de reglas</p>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold text-amber-300">CUANDO</p>
          <p className="mt-1 text-sm text-white/70">
            un cliente complete <strong className="text-white">10 compras</strong>
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold text-amber-300">ENTONCES</p>
          <p className="mt-1 text-sm text-white/70">
            generar <strong className="text-white">Cupón 20%</strong>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold text-white/40">VÁLIDO</p>
            <p className="mt-1 text-sm text-white/70">30 días</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-bold text-white/40">AVISAR</p>
            <p className="mt-1 text-sm text-white/70">al instante</p>
          </div>
        </div>
      </div>
      <p className="mt-5 text-xs text-white/45">
        Regla lista: al completar 10 compras, el cliente recibe un cupón 20% válido por 30 días.
      </p>
    </div>
  );
}

function MockBars() {
  const bars = [42, 58, 51, 66, 72, 64, 81, 90];
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111114] p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="font-bold">Clientes nuevos vs. recurrentes</p>
        <span className="text-xs text-white/40">Últimos 8 meses</span>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/25" /> Nuevos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Recurrentes
        </span>
      </div>
      <div className="mt-6 flex h-40 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col justify-end gap-1">
            <div className="rounded-t bg-amber-400" style={{ height: `${h}%` }} />
            <div className="rounded-b bg-white/15" style={{ height: `${100 - h}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
