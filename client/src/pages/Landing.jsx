/**
 * WINTUU — Landing page
 * Rework completo. Nueva arquitectura, nuevo copy, nuevas secciones.
 *
 * Módulos (en orden):
 *  1. Navbar         — minimal, transparente → sólido en scroll
 *  2. Hero           — editorial split, imagen full-height
 *  3. Marquee        — ticker infinito CSS
 *  4. Manifiesto     — gran declaración editorial
 *  5. Showcase       — tabs interactivas con preview
 *  6. Stats          — números grandes, dark full-bleed
 *  7. Journey        — pasos alternados con fotografía real
 *  8. Reviews        — testimonios estilo magazine
 *  9. Planes         — pricing limpio
 * 10. FAQ            — accordion minimal
 * 11. CTA final      — split gradient
 * 12. Footer         — 3 columnas, editorial
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  QrCode,
  Sun,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ─── helpers ───────────────────────────────────────────── */
const fmt = (v) => `$ ${Number(v || 0).toLocaleString('es-AR')}`;

function storedAdminApp() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if (!key.startsWith('wintuu:user:') || key.endsWith(':_global')) continue;
    try {
      const s = JSON.parse(localStorage.getItem(key) || 'null');
      if (s?.role === 'admin' && s?.tenant_slug) return { slug: s.tenant_slug, user: s };
    } catch { /* noop */ }
  }
  return null;
}

/* ─── Logo SVG ──────────────────────────────────────────── */
function Logo({ size = 36, mono = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="12" fill={mono ? 'white' : 'url(#lg)'} fillOpacity={mono ? 0.08 : 1} />
      <path
        d="M10 14 L15.5 30 L22 19 L28.5 30 L34 14"
        stroke={mono ? 'white' : 'url(#ls)'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#69dacf" />
          <stop offset="1" stopColor="#9b8df8" />
        </linearGradient>
        <linearGradient id="ls" x1="10" y1="14" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="rgba(255,255,255,0.8)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Gradient text span ────────────────────────────────── */
const G = ({ children, className = '' }) => (
  <span className={`bg-gradient-to-r from-[#69dacf] to-[#9b8df8] bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans]     = useState([]);
  const [faq, setFaq]         = useState(null);
  const [menuOpen, setMenu]   = useState(false);
  const [dark, setDark]       = useState(true);
  const [activeTab, setTab]   = useState(0);
  const [adminApp, setAdmin]  = useState(() => storedAdminApp());

  const navRef      = useRef(null);
  const heroTextRef = useRef(null);
  const rootRef     = useRef(null);

  const slug    = adminApp?.slug || (user?.role === 'admin' ? user.tenant_slug : '');
  const authed  = Boolean(user || adminApp);
  const panelTo = slug ? `/${slug}/dashboard` : '/checkout';

  /* meta + plans */
  useEffect(() => {
    document.title = 'WINTUU · Fidelizá. Retené. Crecé.';
    api('/api/plans').then((d) => setPlans(d.plans || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api('/api/onboarding/status').then((s) => { if (s?.slug) setAdmin({ slug: s.slug, user }); }).catch(() => {});
  }, [user]);

  /* dark/light */
  useEffect(() => {
    document.documentElement.dataset.landingTheme = dark ? 'dark' : 'light';
  }, [dark]);

  /* ── GSAP ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Nav solidify on scroll */
      ScrollTrigger.create({
        start: 'top -60',
        onEnter:  () => gsap.to(navRef.current, { '--nav-bg': '0.96', duration: 0.3 }),
        onLeaveBack: () => gsap.to(navRef.current, { '--nav-bg': '0', duration: 0.3 }),
      });

      /* Hero lines stagger */
      gsap.from('.hero-line', {
        y: 80,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: 'power4.out',
        delay: 0.1,
      });

      gsap.from('.hero-sub', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.7,
      });

      gsap.from('.hero-cta-row', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.95,
      });

      gsap.from('.hero-img', {
        scale: 1.06,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        delay: 0,
      });

      gsap.from('.hero-float', {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'back.out(1.4)',
        delay: 1.1,
      });

      /* Scroll reveals */
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        const dir = el.dataset.reveal;
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          x: dir === 'left' ? -50 : dir === 'right' ? 50 : 0,
          y: dir === 'up' ? 50 : 0,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
        });
      });

      /* Stagger children */
      gsap.utils.toArray('[data-stagger]').forEach((container) => {
        gsap.from(container.children, {
          scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none none' },
          y: 35,
          opacity: 0,
          stagger: 0.09,
          duration: 0.65,
          ease: 'power3.out',
        });
      });

      /* KPI counters */
      gsap.utils.toArray('.kpi').forEach((el) => {
        const end = parseFloat(el.dataset.end);
        const suffix = el.dataset.suffix || '';
        const obj = { val: 0 };
        gsap.to(obj, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          val: end,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(obj.val) + suffix; },
        });
      });

      /* Manifiesto char reveal */
      const mf = document.querySelector('.manifesto-text');
      if (mf) {
        const words = mf.textContent.trim().split(' ');
        mf.innerHTML = words.map((w) => `<span class="mw">${w} </span>`).join('');
        gsap.from('.mw', {
          scrollTrigger: { trigger: mf, start: 'top 80%', toggleActions: 'play none none none' },
          opacity: 0.08,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power2.out',
        });
      }

    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* Feature tab transition */
  const changeTab = useCallback((i) => {
    const panel = document.querySelector('.tab-panel');
    if (!panel) { setTab(i); return; }
    gsap.to(panel, { opacity: 0, y: 12, duration: 0.18, onComplete: () => {
      setTab(i);
      gsap.to(panel, { opacity: 1, y: 0, duration: 0.25 });
    }});
  }, []);

  const doLogout = async () => {
    setMenu(false);
    await logout(slug || undefined);
    setAdmin(null);
    navigate('/');
  };

  const d = dark;

  /* ── DATA ── */
  const TABS = [
    {
      label: 'QR personal',
      icon: QrCode,
      title: 'Un código. Un cliente. Todo su historial.',
      body: 'Cada cliente recibe su propio QR. Tu equipo lo escanea en un segundo y el progreso queda registrado automáticamente — sin papel, sin recordar nombres, sin sistemas lentos.',
      stat: '< 3 seg por registro',
      img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
    },
    {
      label: 'Premios automáticos',
      icon: Gift,
      title: 'El beneficio llega solo. Vos no tenés que hacer nada.',
      body: 'Configurás la regla una vez: "a la décima compra, cupón del 20%". El sistema la ejecuta solo. Tus clientes reciben el premio en el momento exacto, sin que nadie tenga que acordarse.',
      stat: '100% automático',
      img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80',
    },
    {
      label: 'Analytics real',
      icon: BarChart3,
      title: 'Sabés quién vuelve. Sabés quién no.',
      body: 'El panel te muestra quién compra seguido, quién lleva semanas sin aparecer y qué beneficios generan más retorno. Información que antes estaba dispersa en papeles y WhatsApp.',
      stat: '+38% retención promedio',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    },
    {
      label: 'Tu app, tu marca',
      icon: Zap,
      title: 'Tu nombre. Tus colores. Tu link.',
      body: 'Tus clientes no ven "WINTUU". Ven tu negocio. Tu logo, tu paleta, tu URL. Una experiencia que se siente 100% tuya, construida en minutos desde el panel de administración.',
      stat: 'Activo en < 1 hora',
      img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const JOURNEY = [
    {
      n: '01',
      title: 'Te registrás y configurás en minutos.',
      body: 'Elegís el nombre, cargás los colores y definís la primera regla. Sin código, sin técnicos, sin reuniones de onboarding eternas. En menos de una hora tenés tu app operativa.',
      img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
      tag: 'Setup',
    },
    {
      n: '02',
      title: 'Tus clientes se identifican y acumulan.',
      body: 'Cada visita, compra o servicio queda registrado con un escaneo. El cliente ve su progreso en tiempo real desde el celular, sin instalar nada. Vos ves el historial completo en el panel.',
      img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
      tag: 'En uso',
    },
    {
      n: '03',
      title: 'El premio llega. El cliente vuelve.',
      body: 'Cuando el cliente cumple la meta, el beneficio aparece automáticamente. Un cupón, un regalo, un descuento. Lo que vos decidas. La razón concreta para que vuelva a elegirte.',
      img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80',
      tag: 'Retención',
    },
  ];

  const REVIEWS = [
    { quote: 'Antes dependía de que alguien recordara cuántos cafés había tomado cada cliente. Ahora el sistema lo hace solo y los clientes nos preguntan cuánto les falta para el próximo premio.', name: 'Valentina G.', biz: 'Cafetería El Tostador, CABA', init: 'VG' },
    { quote: 'Lo activé un viernes al mediodía. El lunes ya tenía 40 clientes registrados y tres premios entregados. No esperaba que fuera tan rápido.', name: 'Rodrigo M.', biz: 'Fit Studio, Rosario', init: 'RM' },
    { quote: 'Mis clientas se enganchan mucho con ver el progreso. Vienen antes para llegar al 10mo servicio. El ticket promedio subió y yo no hice nada diferente.', name: 'Camila S.', biz: 'Studio de Uñas, Mendoza', init: 'CS' },
  ];

  return (
    <div
      ref={rootRef}
      className={`min-h-screen antialiased ${d ? 'bg-[#070A12] text-white' : 'bg-[#FAFBFF] text-[#0A0D1A]'}`}
    >
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-inner { animation: marquee 28s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }
        :root { --nav-bg: 0; }
        [data-landing-theme="dark"] .nav-wrap { background: rgba(7,10,18,var(--nav-bg)); }
        [data-landing-theme="light"] .nav-wrap { background: rgba(250,251,255,var(--nav-bg)); }
      `}</style>

      {/* ══ 1. NAVBAR ══════════════════════════════════════════ */}
      <header ref={navRef} className="nav-wrap fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-all duration-300" style={{ borderBottom: d ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={36} />
            <span className={`text-[17px] font-black tracking-[-0.02em] transition group-hover:opacity-80 ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              WINTUU
            </span>
          </Link>

          {/* Desktop center links */}
          <nav className="hidden items-center gap-8 lg:flex">
            {[['#showcase', 'Producto'], ['#journey', 'Cómo funciona'], ['#planes', 'Precios'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className={`text-[13px] font-medium transition-colors ${d ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'}`}>
                {label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden items-center gap-2 lg:flex">
            <button onClick={() => setDark(v => !v)} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${d ? 'text-white/40 hover:text-white hover:bg-white/6' : 'text-black/40 hover:text-black hover:bg-black/6'}`}>
              {d ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {authed ? (
              <>
                <Link to={panelTo} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold transition ${d ? 'text-white/70 hover:text-white hover:bg-white/6' : 'text-black/70 hover:text-black hover:bg-black/6'}`}>
                  <LayoutDashboard size={14} /> Mi panel
                </Link>
                <button onClick={doLogout} className={`rounded-lg px-3 py-2 text-[13px] transition ${d ? 'text-white/35 hover:text-white' : 'text-black/35 hover:text-black'}`}>
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/ingresar" className={`rounded-lg px-4 py-2 text-[13px] font-medium transition ${d ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}>
                  Ingresar
                </Link>
                <Link
                  to="/checkout"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-5 py-2 text-[13px] font-bold text-white shadow-lg shadow-[#69dacf]/20 transition hover:opacity-88 hover:shadow-[#69dacf]/35"
                >
                  Empezar gratis <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setDark(v => !v)} className={`flex h-8 w-8 items-center justify-center rounded-lg ${d ? 'text-white/50' : 'text-black/50'}`}>
              {d ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => setMenu(v => !v)} className={`flex h-9 w-9 items-center justify-center rounded-lg ${d ? 'text-white' : 'text-black'}`}>
              {menuOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={`border-t px-6 py-6 lg:hidden ${d ? 'border-white/6 bg-[#070A12]' : 'border-black/6 bg-[#FAFBFF]'}`}>
            <div className="flex flex-col gap-1">
              {[['#showcase', 'Producto'], ['#journey', 'Cómo funciona'], ['#planes', 'Precios'], ['#faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenu(false)} className={`rounded-xl px-4 py-3 text-sm font-medium ${d ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-black/70 hover:bg-black/5 hover:text-black'}`}>{label}</a>
              ))}
              <div className={`my-3 h-px ${d ? 'bg-white/8' : 'bg-black/8'}`} />
              {authed ? (
                <>
                  <Link to={panelTo} onClick={() => setMenu(false)} className="rounded-xl bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-4 py-3 text-center text-sm font-bold text-white">
                    Mi panel
                  </Link>
                  <button onClick={doLogout} className={`mt-2 text-center text-sm ${d ? 'text-white/40' : 'text-black/40'}`}>Salir</button>
                </>
              ) : (
                <>
                  <Link to="/ingresar" onClick={() => setMenu(false)} className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${d ? 'text-white/60' : 'text-black/60'}`}>Ingresar</Link>
                  <Link to="/checkout" onClick={() => setMenu(false)} className="rounded-xl bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-4 py-3 text-center text-sm font-bold text-white">
                    Empezar gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══ 2. HERO ════════════════════════════════════════════ */}
      <section className={`relative ${d ? 'bg-[#070A12]' : 'bg-[#FAFBFF]'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid min-h-screen lg:grid-cols-[1fr_44%]">
        {/* Left: texto */}
        <div className="flex flex-col justify-center pb-20 pt-32 lg:pt-28">
          {/* Pill */}
          <div className="hero-line mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#69dacf]/25 bg-[#69dacf]/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#69dacf]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#69dacf]" />
            Fidelización para negocios argentinos
          </div>

          {/* Headline */}
          <div ref={heroTextRef} className="overflow-hidden">
            <h1 className={`text-5xl font-black leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[70px] ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              <span className="hero-line block">Fidelizá.</span>
              <span className="hero-line block">Retení.</span>
              <span className="hero-line block"><G>Crecé.</G></span>
            </h1>
          </div>

          <p className={`hero-sub mt-7 max-w-md text-base leading-relaxed sm:text-[17px] ${d ? 'text-white/50' : 'text-black/50'}`}>
            WINTUU convierte cada compra en un paso hacia el próximo premio. Tus clientes acumulan, tu negocio retiene. Sin papel, sin apps, sin fricción.
          </p>

          <div className="hero-cta-row mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/checkout"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-7 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-[#69dacf]/25 transition hover:opacity-90 hover:shadow-[#69dacf]/40 hover:gap-3"
            >
              Activar mi programa
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#journey"
              className={`rounded-2xl border px-7 py-3.5 text-[15px] font-semibold transition ${d ? 'border-white/12 text-white/60 hover:border-white/30 hover:text-white' : 'border-black/12 text-black/55 hover:border-black/30 hover:text-black'}`}
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Mini stats */}
          <div className="hero-cta-row mt-10 flex items-center gap-7">
            {[['< 1 hora', 'para estar operativo'], ['0', 'instalaciones'], ['100%', 'tu marca']].map(([val, label]) => (
              <div key={label}>
                <p className={`text-lg font-black leading-none ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>{val}</p>
                <p className={`mt-1 text-[11px] ${d ? 'text-white/35' : 'text-black/35'}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: imagen */}
        <div className="hero-img relative hidden overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85"
            alt="Negocio con programa de fidelización"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A12]/55 to-transparent" />

          {/* Floating cards */}
          <div className="hero-float absolute bottom-16 left-8 rounded-2xl border border-white/12 bg-[#070A12]/80 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#69dacf]/20 text-sm font-black text-[#69dacf]">LR</span>
              <div>
                <p className="text-[11px] font-bold text-white">🎉 Premio activado</p>
                <p className="text-[10px] text-white/45">Lucas R. · Cupón 20% off</p>
              </div>
            </div>
          </div>

          <div className="hero-float absolute right-8 top-1/3 rounded-2xl border border-white/12 bg-[#070A12]/80 px-5 py-4 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9b8df8]">Este mes</p>
            <p className="mt-0.5 text-2xl font-black text-white">+38%</p>
            <p className="text-[10px] text-white/45">Tasa de retención</p>
          </div>

          <div className="hero-float absolute bottom-40 right-8 rounded-2xl border border-white/12 bg-[#070A12]/80 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#69dacf]" />
              <p className="text-[11px] font-semibold text-white">342 clientes activos</p>
            </div>
            <div className="mt-3 flex -space-x-2">
              {['ML', 'SV', 'JR', 'CA'].map((i) => (
                <span key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#070A12] bg-gradient-to-br from-[#69dacf] to-[#9b8df8] text-[9px] font-black text-white">{i}</span>
              ))}
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#070A12] text-[9px] font-bold ${d ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'}`}>+</span>
            </div>
          </div>
        </div>
        </div>{/* grid */}
        </div>{/* max-w container */}
      </section>

      {/* ══ 3. MARQUEE TICKER ══════════════════════════════════ */}
      <div className={`overflow-hidden py-4 ${d ? 'bg-[#0D1121]' : 'bg-[#F0F2FF]'}`}>
        <div className="marquee-inner flex whitespace-nowrap">
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex shrink-0 items-center gap-0">
              {['Fidelización sin papel', 'QR personal por cliente', 'Premios automáticos', 'App con tu marca', 'Sin comisiones', 'Activo en 1 hora', 'Analytics en tiempo real', 'Multi-local', 'Soporte por WhatsApp', 'Sin instalaciones', '100% tu identidad', 'Clientes que vuelven'].map((item) => (
                <span key={item} className={`flex items-center gap-5 px-8 text-[13px] font-semibold ${d ? 'text-white/35' : 'text-black/35'}`}>
                  {item}
                  <span className="text-[#69dacf] opacity-60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ 4. MANIFIESTO ══════════════════════════════════════ */}
      <section className="px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <p className={`mb-6 text-[11px] font-bold uppercase tracking-[0.2em] ${d ? 'text-white/30' : 'text-black/30'}`} data-reveal="up">
            Por qué existimos
          </p>
          <p className={`manifesto-text text-2xl font-bold leading-[1.45] sm:text-3xl lg:text-[38px] lg:leading-[1.35] ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
            El 80% de los ingresos futuros de tu negocio viene del 20% de tus clientes actuales. Pero la mayoría no tiene idea de quién es ese 20%. Nosotros sí.
          </p>
          <div className={`mt-10 h-px max-w-sm ${d ? 'bg-white/8' : 'bg-black/8'}`} />
          <div className="mt-8 flex items-center gap-6" data-reveal="up">
            <Link to="/checkout" className={`flex items-center gap-2 text-[14px] font-semibold transition hover:gap-3 ${d ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'}`}>
              Empezar ahora <ArrowUpRight size={15} className="text-[#69dacf]" />
            </Link>
            <Link to="/shanti-chi" className="text-[13px] text-[#69dacf] underline underline-offset-4 opacity-70 hover:opacity-100">
              Ver demo en vivo →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 5. SHOWCASE INTERACTIVO ════════════════════════════ */}
      <section id="showcase" className={`px-6 py-24 lg:px-10 ${d ? 'bg-[#0D1121]' : 'bg-[#F4F5FF]'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14" data-reveal="up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b8df8]">Producto</p>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              Una plataforma. <G>Cuatro armas.</G>
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Tab list */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" data-stagger>
              {TABS.map(({ label, icon: Icon }, i) => (
                <button
                  key={label}
                  onClick={() => changeTab(i)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-5 py-3.5 text-left text-[14px] font-semibold transition-all ${
                    activeTab === i
                      ? 'bg-gradient-to-r from-[#69dacf]/12 to-[#9b8df8]/12 text-[#69dacf] border border-[#69dacf]/25'
                      : d
                        ? 'text-white/45 hover:text-white hover:bg-white/4'
                        : 'text-black/45 hover:text-black hover:bg-black/4'
                  }`}
                >
                  <Icon size={16} className={activeTab === i ? 'text-[#69dacf]' : ''} />
                  {label}
                  {activeTab === i && <span className="ml-auto text-[#9b8df8]">→</span>}
                </button>
              ))}
            </div>

            {/* Tab panel */}
            <div className="tab-panel grid overflow-hidden rounded-2xl lg:grid-cols-[1fr_420px]">
              {/* Text */}
              <div className={`flex flex-col justify-center p-8 lg:p-12 ${d ? 'bg-[#111729]' : 'bg-white'}`}>
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#9b8df8]/12 px-3 py-1 text-[11px] font-bold text-[#9b8df8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9b8df8]" />
                  {TABS[activeTab].stat}
                </span>
                <h3 className={`text-2xl font-black leading-tight lg:text-3xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
                  {TABS[activeTab].title}
                </h3>
                <p className={`mt-4 text-[15px] leading-relaxed ${d ? 'text-white/50' : 'text-black/50'}`}>
                  {TABS[activeTab].body}
                </p>
                <Link to="/checkout" className="mt-8 inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-[#69dacf] underline underline-offset-4 hover:text-[#9b8df8]">
                  Empezar con esto <ArrowUpRight size={13} />
                </Link>
              </div>
              {/* Image */}
              <div className="relative hidden h-80 overflow-hidden lg:block lg:h-auto">
                <img
                  src={TABS[activeTab].img}
                  alt={TABS[activeTab].label}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 6. STATS ════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#0D1121] via-[#0D1121] to-[#14102A] px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-16 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/30" data-reveal="up">
            Lo que dicen los datos
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { end: 38, suffix: '%', label: 'Tasa de retención promedio con programa activo', color: '#69dacf' },
              { end: 67, suffix: '%', label: 'Más gasto de clientes recurrentes vs nuevos', color: '#9b8df8' },
              { end: 5, suffix: 'x', label: 'Más barato retener que adquirir un cliente nuevo', color: '#69dacf' },
              { end: 342, suffix: '', label: 'Clientes promedio registrados en el primer mes', color: '#9b8df8' },
            ].map(({ end, suffix, label, color }, i) => (
              <div key={i} className="flex flex-col justify-between p-10 bg-[#0D1121]">
                <p className="kpi text-6xl font-black leading-none lg:text-7xl" style={{ color }} data-end={end} data-suffix={suffix}>
                  {end}{suffix}
                </p>
                <p className="mt-6 text-sm leading-snug text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. JOURNEY ══════════════════════════════════════════ */}
      <section id="journey" className={`px-6 py-24 lg:px-10 ${d ? 'bg-[#070A12]' : 'bg-[#FAFBFF]'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-20" data-reveal="up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#69dacf]">Cómo funciona</p>
            <h2 className={`max-w-xl text-3xl font-black tracking-tight sm:text-4xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              Tres pasos. Sin fricción. Sin tecnicismos.
            </h2>
          </div>

          <div className="space-y-6">
            {JOURNEY.map(({ n, title, body, img, tag }, i) => (
              <div
                key={n}
                className={`grid overflow-hidden rounded-2xl lg:grid-cols-2 ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
                data-reveal={i % 2 === 0 ? 'left' : 'right'}
              >
                {/* Text */}
                <div className={`flex flex-col justify-center p-8 lg:p-14 ${d ? 'bg-[#0D1121]' : 'bg-white'} ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="mb-6 flex items-center gap-4">
                    <span className="text-6xl font-black leading-none opacity-[0.06]" style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span>
                    <span className="rounded-full border border-[#69dacf]/25 bg-[#69dacf]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#69dacf]">{tag}</span>
                  </div>
                  <h3 className={`text-xl font-black leading-snug sm:text-2xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>{title}</h3>
                  <p className={`mt-4 text-[15px] leading-relaxed ${d ? 'text-white/48' : 'text-black/48'}`}>{body}</p>
                </div>

                {/* Image */}
                <div className={`relative min-h-60 overflow-hidden lg:min-h-0 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <img src={img} alt={title} className="h-full w-full object-cover" loading="lazy" />
                  <div className={`absolute inset-0 ${d ? 'bg-[#070A12]/30' : 'bg-black/15'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. REVIEWS ══════════════════════════════════════════ */}
      <section className={`px-6 py-24 lg:px-10 ${d ? 'bg-[#0D1121]' : 'bg-[#F4F5FF]'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex items-end justify-between" data-reveal="up">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b8df8]">Testimonios</p>
              <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
                Lo que dicen<br />los que ya lo usan.
              </h2>
            </div>
            <Link to="/shanti-chi" className={`hidden items-center gap-1.5 text-[13px] font-semibold sm:flex ${d ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}>
              Ver demo <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
            {REVIEWS.map(({ quote, name, biz, init }) => (
              <div key={name} className={`flex flex-col rounded-2xl border p-8 ${d ? 'border-white/8 bg-[#111729]' : 'border-black/8 bg-white'}`}>
                <p className="mb-5 text-3xl leading-none text-[#69dacf] opacity-40">"</p>
                <p className={`flex-1 text-[15px] leading-relaxed ${d ? 'text-white/75' : 'text-black/75'}`}>{quote}</p>
                <div className="mt-8 flex items-center gap-3 border-t pt-6" style={{ borderColor: d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#69dacf] to-[#9b8df8] text-xs font-black text-white">
                    {init}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>{name}</p>
                    <p className={`text-[12px] ${d ? 'text-white/35' : 'text-black/35'}`}>{biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. PLANES ═══════════════════════════════════════════ */}
      <section id="planes" className={`px-6 py-24 lg:px-10 ${d ? 'bg-[#070A12]' : 'bg-[#FAFBFF]'}`}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center" data-reveal="up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#69dacf]">Precios</p>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              Simple. Claro. Sin letra chica.
            </h2>
            <p className={`mx-auto mt-4 max-w-md text-[15px] ${d ? 'text-white/45' : 'text-black/45'}`}>
              Ambos planes incluyen todo. Mantenimiento, actualizaciones y soporte — siempre incluidos.
            </p>
          </div>

          {plans.length === 0 && (
            <div className={`rounded-2xl border p-12 text-center ${d ? 'border-white/8 text-white/25' : 'border-black/8 text-black/25'}`}>
              Cargando planes…
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2" data-stagger>
            {plans.map((p) => {
              const featured = p.id === 'vitalicia';
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    featured
                      ? 'border-[#9b8df8]/35 bg-gradient-to-b from-[#69dacf]/5 to-[#9b8df8]/5'
                      : d
                        ? 'border-white/8 bg-[#0D1121]'
                        : 'border-black/8 bg-white'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3.5 left-8 rounded-full bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-4 py-1 text-[11px] font-black uppercase tracking-wide text-white">
                      Mejor valor
                    </span>
                  )}
                  <div>
                    <h3 className={`text-lg font-black ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>{p.name}</h3>
                    <p className={`mt-0.5 text-[12px] ${d ? 'text-white/35' : 'text-black/35'}`}>{p.period}</p>
                    <p className={`mt-5 text-4xl font-black ${featured ? 'text-[#9b8df8]' : d ? 'text-white' : 'text-[#0A0D1A]'}`}>
                      {fmt(p.price)}
                    </p>
                  </div>

                  <ul className="my-8 flex-1 space-y-3">
                    {[
                      'App con tu nombre, colores y link',
                      'Clientes con Google — sin instalar nada',
                      'Cupones, premios y reglas ilimitadas',
                      'Panel de administración completo',
                      'Escaneo QR y registro de visitas',
                      'Soporte por WhatsApp',
                    ].map((t) => (
                      <li key={t} className={`flex items-start gap-2.5 text-[14px] ${d ? 'text-white/60' : 'text-black/60'}`}>
                        <Check size={14} className="mt-0.5 shrink-0 text-[#69dacf]" /> {t}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/checkout?plan=${p.id}`}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold transition ${
                      featured
                        ? 'bg-gradient-to-r from-[#69dacf] to-[#9b8df8] text-white shadow-lg shadow-[#69dacf]/20 hover:opacity-90'
                        : d
                          ? 'border border-white/15 text-white hover:bg-white/5'
                          : 'border border-black/15 text-[#0A0D1A] hover:bg-black/4'
                    }`}
                  >
                    Elegir {p.name} <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 10. FAQ ══════════════════════════════════════════════ */}
      <section id="faq" className={`px-6 py-24 lg:px-10 ${d ? 'bg-[#0D1121]' : 'bg-[#F4F5FF]'}`}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-12" data-reveal="up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b8df8]">FAQ</p>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>
              Preguntas frecuentes.
            </h2>
          </div>

          <div className="space-y-2" data-stagger>
            {[
              ['¿Necesito saber de tecnología?', 'Para nada. Si podés crear una cuenta de Instagram, podés configurar WINTUU. Todo el panel está pensado para dueños de negocios, no para desarrolladores.'],
              ['¿En cuánto tiempo está operativo?', 'La mayoría de los negocios tiene su app activa en menos de una hora. Configurás el nombre, los colores, la primera regla y ya podés empezar a registrar clientes.'],
              ['¿Mis clientes tienen que instalar algo?', 'No. Tus clientes entran desde el navegador de su celular con Google. Sin descarga, sin cuenta nueva, sin fricción.'],
              ['¿Puedo cambiar las reglas después?', 'Sí, en cualquier momento. Desde el panel editás los premios, las metas, los cupones y los vencimientos sin tocar ningún código.'],
              ['¿Funciona para más de un local?', 'Sí. WINTUU consolida la información de todos tus puntos de atención en un solo panel, con reportes por local y en conjunto.'],
              ['¿Qué pasa si no me convence?', 'Hablá con nosotros antes de pagar. Podés ver el demo en vivo en /shanti-chi y hacernos todas las preguntas que necesites por WhatsApp.'],
            ].map(([q, a], i) => (
              <div
                key={q}
                className={`rounded-2xl border transition ${d ? 'border-white/8 bg-[#111729]' : 'border-black/8 bg-white'}`}
              >
                <button
                  onClick={() => setFaq(faq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left"
                >
                  <span className={`text-[15px] font-semibold ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>{q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${faq === i ? 'rotate-180 text-[#69dacf]' : d ? 'text-white/30' : 'text-black/30'}`}
                  />
                </button>
                {faq === i && (
                  <p className={`px-7 pb-6 text-[14px] leading-relaxed ${d ? 'text-white/50' : 'text-black/50'}`}>{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 11. CTA FINAL ════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-0 lg:px-10">
        <div className="grid min-h-[600px] lg:grid-cols-2">
          {/* Left dark */}
          <div className={`flex flex-col justify-center px-8 py-20 lg:px-16 ${d ? 'bg-[#070A12]' : 'bg-[#0A0D1A]'}`} data-reveal="left">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#69dacf]/70">Empezar es simple</p>
            <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              Tu app.<br />
              Tu marca.<br />
              <G>Tu programa.</G>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/45">
              En menos de una hora tenés tu sistema de fidelización operativo, con tu nombre y tu link para compartir con tus clientes.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/checkout"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-7 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-[#69dacf]/25 transition hover:opacity-90"
              >
                Activar ahora <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/541161120433?text=Hola%2C%20quiero%20conocer%20WINTUU"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-white/12 px-7 py-3.5 text-[15px] font-semibold text-white/60 transition hover:border-white/25 hover:text-white"
              >
                Hablar por WhatsApp
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {['Sin instalaciones', 'Sin comisiones', 'Soporte incluido'].map((t) => (
                <span key={t} className="flex items-center gap-2 text-[12px] text-white/30">
                  <Check size={12} className="text-[#69dacf]" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right gradient */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#69dacf] via-[#7ec8e3] to-[#9b8df8] p-12" data-reveal="right">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
            <div className="relative text-center">
              <Logo size={64} />
              <p className="mt-6 text-5xl font-black tracking-[-0.03em] text-white sm:text-6xl">WINTUU</p>
              <p className="mt-3 text-lg font-semibold text-white/70">Fidelización para negocios argentinos</p>
              <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                {[['< 1h', 'para activar'], ['0', 'instalaciones'], ['∞', 'posibilidades']].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-3xl font-black text-white">{v}</p>
                    <p className="mt-1 text-[11px] font-semibold text-white/55">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 12. FOOTER ══════════════════════════════════════════ */}
      <footer className={`px-6 py-16 lg:px-10 ${d ? 'bg-[#070A12]' : 'bg-[#FAFBFF]'}`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <Logo size={32} />
                <span className={`font-black tracking-tight ${d ? 'text-white' : 'text-[#0A0D1A]'}`}>WINTUU</span>
              </div>
              <p className={`mt-4 max-w-xs text-[13px] leading-relaxed ${d ? 'text-white/38' : 'text-black/38'}`}>
                Programa de fidelización para negocios argentinos. Tu marca, tus reglas, tus clientes — de vuelta.
              </p>
              <div className="mt-6">
                <a
                  href="https://wa.me/541161120433"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366]/12 px-4 py-2 text-[12px] font-semibold text-[#25D366] transition hover:bg-[#25D366]/20"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  WhatsApp +54 11 6112-0433
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <p className={`mb-4 text-[11px] font-bold uppercase tracking-[0.15em] ${d ? 'text-white/30' : 'text-black/30'}`}>Producto</p>
              <div className="flex flex-col gap-2.5">
                {[['#showcase', 'Funcionalidades'], ['/checkout', 'Precios'], ['/shanti-chi', 'Ver demo'], ['/ingresar', 'Ingresar']].map(([to, label]) => (
                  <Link key={label} to={to} className={`text-[13px] transition ${d ? 'text-white/45 hover:text-white' : 'text-black/45 hover:text-black'}`}>{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className={`mb-4 text-[11px] font-bold uppercase tracking-[0.15em] ${d ? 'text-white/30' : 'text-black/30'}`}>Empresa</p>
              <div className="flex flex-col gap-2.5">
                {[['#faq', 'Preguntas frecuentes'], ['/wintuu/admin', 'Panel equipo'], ['https://wa.me/541161120433', 'Soporte']].map(([to, label]) => (
                  to.startsWith('http')
                    ? <a key={label} href={to} target="_blank" rel="noreferrer" className={`text-[13px] transition ${d ? 'text-white/45 hover:text-white' : 'text-black/45 hover:text-black'}`}>{label}</a>
                    : <Link key={label} to={to} className={`text-[13px] transition ${d ? 'text-white/45 hover:text-white' : 'text-black/45 hover:text-black'}`}>{label}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
            <p className={`text-[12px] ${d ? 'text-white/22' : 'text-black/22'}`}>© {new Date().getFullYear()} WINTUU. Todos los derechos reservados.</p>
            <div className="flex items-center gap-5">
              <button onClick={() => setDark(v => !v)} className={`flex items-center gap-2 text-[12px] transition ${d ? 'text-white/30 hover:text-white' : 'text-black/30 hover:text-black'}`}>
                {d ? <><Sun size={12} /> Modo claro</> : <><Moon size={12} /> Modo oscuro</>}
              </button>
              {!authed && (
                <Link to="/checkout" className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#69dacf] to-[#9b8df8] px-4 py-1.5 text-[12px] font-bold text-white transition hover:opacity-85">
                  Empezar gratis
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
