import { getPlanFeatures, type PlanTier } from '@/lib/types'

export { getPlanFeatures }

/**
 * Server-side plan gate — use in Server Components and API routes.
 * Throws a 403-style error if the tenant's plan doesn't include the feature.
 */
export function assertFeature(
  tier: PlanTier,
  feature: keyof ReturnType<typeof getPlanFeatures>
): void {
  const features = getPlanFeatures(tier)
  if (!features[feature]) {
    throw new Error(
      `Feature "${feature}" is not available on Plan ${tier}. Please upgrade.`
    )
  }
}
