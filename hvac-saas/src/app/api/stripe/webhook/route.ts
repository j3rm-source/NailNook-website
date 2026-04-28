import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

const DEFAULT_SMS_TEMPLATES = [
  {
    sequence_position: 0,
    delay_hours: 0,
    body: "Hi {first_name}! This is {business_name}. Thanks for reaching out — we'd love to help with your {issue_type}. Click here to book a time that works for you: {booking_link}",
  },
  {
    sequence_position: 1,
    delay_hours: 24,
    body: "Hey {first_name}, just following up from {business_name}. We still have openings this week — grab a spot here: {booking_link}. Any questions? Just reply to this text!",
  },
  {
    sequence_position: 2,
    delay_hours: 72,
    body: "Hi {first_name}, last check-in from {business_name}. If you're still in need of service, we're here: {booking_link}. Have a great day!",
  },
]

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!
  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const planTier = Number(session.metadata?.plan_tier) as 1 | 2 | 3
      const fullName = session.metadata?.full_name ?? ''
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (!userId) break

      // 1. Create tenant
      const businessName = fullName ? `${fullName}'s Business` : 'My Business'
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          business_name: businessName,
          plan_tier: planTier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: 'active',
        })
        .select('id')
        .single()

      if (tenantError || !tenant) {
        console.error('Failed to create tenant:', tenantError)
        break
      }

      // 2. Create user profile
      const { data: authUser } = await supabase.auth.admin.getUserById(userId)
      await supabase.from('user_profiles').insert({
        id: userId,
        tenant_id: tenant.id,
        email: authUser?.user?.email ?? '',
        full_name: fullName,
        role: 'owner',
      })

      // 3. Seed default SMS templates
      await supabase.from('sms_templates').insert(
        DEFAULT_SMS_TEMPLATES.map((t) => ({ ...t, tenant_id: tenant.id }))
      )

      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('tenants')
        .update({
          stripe_subscription_status: sub.status,
          plan_tier: Number(sub.metadata?.plan_tier) as 1 | 2 | 3,
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('tenants')
        .update({ stripe_subscription_status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
