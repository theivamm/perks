import { Router } from 'express';
import { getPlans } from '../plans.js';

const router = Router();

// Precios y links de pago públicos (los usa la landing y el onboarding).
router.get('/', (_req, res) => {
  res.json({ plans: getPlans() });
});

export default router;
