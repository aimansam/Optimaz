import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface BetaAccess {
  user_id: string
  granted_at: string
  pro_expires_at: string | null
}

/**
 * Check whether the current user has active beta Pro access.
 *
 * Access is active when:
 *   - A row exists in beta_access for the user, AND
 *   - pro_expires_at IS NULL (beta still ongoing) OR pro_expires_at > now()
 *
 * On v1.0 launch day run:
 *   UPDATE beta_access SET pro_expires_at = now() + INTERVAL '1 month' WHERE pro_expires_at IS NULL;
 *
 * After beta fully ends, remove calls to this hook and drop the table.
 */
export function useBetaAccess() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['beta-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beta_access')
        .select('user_id, granted_at, pro_expires_at')
        .maybeSingle()

      if (error) throw error
      return data as BetaAccess | null
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Returns true if the user currently has active Pro access from beta.
 * Use hasBetaPro alongside your Stripe subscription check:
 *
 *   const hasPro = hasBetaPro || stripeSubscriptionActive
 */
export function useHasBetaPro(): boolean {
  const { data } = useBetaAccess()
  if (!data) return false
  if (data.pro_expires_at === null) return true // beta ongoing — no expiry yet
  return new Date(data.pro_expires_at) > new Date()
}
