// ============================================================
// J2 Systems — Core Types
// ============================================================

export type PlanTier = 1 | 2 | 3

export interface Tenant {
  id: string
  created_at: string
  business_name: string
  plan_tier: PlanTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  twilio_number: string | null
  area_code: string | null
  google_review_link: string | null
  calcom_link: string | null
  website_slug: string | null
  // AI receptionist config
  ai_voice: string
  ai_greeting: string | null
  ai_call_hours: string | null
  ai_transfer_number: string | null
  // Website customization
  primary_color: string
  logo_url: string | null
  tagline: string | null
  services: string[]
  about_text: string | null
}

export interface UserProfile {
  id: string
  tenant_id: string
  email: string
  full_name: string | null
  role: 'owner' | 'staff'
  created_at: string
}

export type ContactSource = 'website_form' | 'ai_call' | 'sms_reply' | 'manual' | 'cal_booking'
export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'booked' | 'won' | 'lost'

export interface Contact {
  id: string
  tenant_id: string
  created_at: string
  first_name: string
  last_name: string | null
  phone: string | null
  email: string | null
  source: ContactSource
  status: ContactStatus
  notes: string | null
  address: string | null
  issue_type: string | null
  lead_score: number | null
}

export type JobStatus = 'new' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface Job {
  id: string
  tenant_id: string
  contact_id: string
  created_at: string
  updated_at: string
  title: string
  status: JobStatus
  description: string | null
  quoted_amount: number | null
  invoice_amount: number | null
  scheduled_at: string | null
  completed_at: string | null
  contact?: Contact
}

export interface Booking {
  id: string
  tenant_id: string
  job_id: string | null
  contact_id: string
  calcom_booking_id: string | null
  created_at: string
  starts_at: string
  ends_at: string
  status: 'upcoming' | 'completed' | 'cancelled' | 'no_show'
}

export interface SmsTemplate {
  id: string
  tenant_id: string
  sequence_position: 0 | 1 | 2  // t+0, t+24hr, t+72hr
  body: string
  delay_hours: number
}

export interface SmsSequence {
  id: string
  tenant_id: string
  contact_id: string
  qstash_message_ids: string[]
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
}

export interface AiCall {
  id: string
  tenant_id: string
  contact_id: string | null
  created_at: string
  caller_phone: string
  duration_seconds: number | null
  outcome: 'booked' | 'follow_up_sent' | 'no_answer' | 'other'
  transcript: string | null
  summary: string | null
  bland_call_id: string
}

// Plan feature flags
export interface PlanFeatures {
  hasAIReceptionist: boolean
  hasSMSFollowups: boolean
  hasGoogleRanking: boolean
  hasAnalytics: boolean
  hasOngoingOptimization: boolean
  hasLeadGenTracking: boolean
}

export function getPlanFeatures(tier: PlanTier): PlanFeatures {
  return {
    hasAIReceptionist: tier >= 2,
    hasSMSFollowups: tier >= 2,
    hasGoogleRanking: tier >= 2,
    hasAnalytics: tier >= 3,
    hasOngoingOptimization: tier >= 3,
    hasLeadGenTracking: tier >= 3,
  }
}
