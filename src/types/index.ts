import type { Database } from './database'

export type { Database }

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type StudentVerification = Database['public']['Tables']['student_verifications']['Row']

export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']

export type ListingWithProfile = Listing & {
  profiles: Pick<Profile, 'nickname' | 'university'>
}

export interface ListingFilter {
  search?: string
  minPrice?: number
  maxPrice?: number
  availableFrom?: string
  availableTo?: string
  sortBy?: 'price_asc' | 'price_desc'
}
