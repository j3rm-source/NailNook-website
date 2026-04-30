import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLAN_PRICE_IDS, PLAN_SETUP_FEE_IDS } from '@/lib/stripe'

function firstOfNextMonthUnix(): number {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return Math.floor(first.getTime() / 1000)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const plan = Number(body.plan) as 1 | 2 | 3

  if (![1, 2, 3].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId = PLAN_PRICE_IDS[plan]
  const setupFeeId = PLAN_SETUP_FEE_IDS[plan]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      { price: priceId, quantity: 1 },
    ],
    customer_email: user.email,
    metadata: {
      user_id: user.id,
      plan_tier: String(plan),
      full_name: user.user_metadata?.full_name ?? '',
    },
    success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/signup/plan?cancelled=true`,
    subscription_data: {
      metadata: { user_id: user.id, plan_tier: String(plan) },
      add_invoice_items: [{ price: setupFeeId }],
      billing_cycle_anchor: firstOfNextMonthUnix(),
      proration_behavior: 'none',
    },
  })

  return NextResponse.json({ url: session.url })
}
