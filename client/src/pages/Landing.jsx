import { useEffect } from 'react';
import '../styles/wintuu-landing.css';
import '../styles/wintuu-landing-v2.css';
import { useReveal } from '../components/landing/useReveal.js';
import LandingNavbar from '../components/landing/LandingNavbar.jsx';
import HeroBento from '../components/landing/HeroBento.jsx';
import ProductBento from '../components/landing/ProductBento.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import PricingSection from '../components/landing/PricingSection.jsx';
import FaqSection from '../components/landing/FaqSection.jsx';
import ContactSection from '../components/landing/ContactSection.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';

const TITLE = 'Wintuu | Con Wintuu ganamos todos';
const DESCRIPTION =
  'Conectá tu negocio con tus clientes con cupones, puntos y beneficios. Wintuu reúne tu programa de fidelización y tu menú digital en un mismo lugar.';

export default function Landing() {
  const rootRef = useReveal();

  // La landing es la raíz pública: fija su propio título/meta, separado
  // del branding por-tenant que maneja ThemeContext dentro de /:slug.
  useEffect(() => {
    document.title = TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', DESCRIPTION);
  }, []);

  return (
    <div ref={rootRef} className="wintuu-landing min-h-screen">
      <LandingNavbar />
      <HeroBento />
      <ProductBento />
      <HowItWorks />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter />
    </div>
  );
}
