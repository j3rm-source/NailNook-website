import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set — add it to .env.local')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

// Alias for backwards compatibility with existing route handlers
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => getStripe()[prop as keyof Stripe],
})

export const PLAN_PRICE_IDS: Record<1 | 2 | 3, string> = {
  1: process.env.STRIPE_PRICE_PLAN1!,
  2: process.env.STRIPE_PRICE_PLAN2!,
  3: process.env.STRIPE_PRICE_PLAN3!,
}

export const PLAN_SETUP_FEE_IDS: Record<1 | 2 | 3, string> = {
  1: process.env.STRIPE_SETUP_FEE_PLAN1!,
  2: process.env.STRIPE_SETUP_FEE_PLAN2!,
  3: process.env.STRIPE_SETUP_FEE_PLAN3!,
}

export const PLAN_NAMES: Record<1 | 2 | 3, string> = {
  1: 'Foundation',
  2: 'Growth System',
  3: 'Revenue Partner',
}

export const PLAN_DESCRIPTIONS: Record<1 | 2 | 3, string> = {
  1: 'Website, CRM & Booking — $900 setup + $200/mo',
  2: 'AI Receptionist, SMS & SEO — $1,000 setup + $500/mo',
  3: 'Full Revenue System — $4,000 setup + $1,000/mo',
}
