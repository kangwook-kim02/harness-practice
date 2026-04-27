export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string
          university: string
          verified: boolean
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          nickname: string
          university: string
          verified?: boolean
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          university?: string
          verified?: boolean
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      student_verifications: {
        Row: {
          id: string
          user_id: string
          document_url: string
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_url: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          document_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          address: string
          price_per_night: number
          available_from: string
          available_to: string
          landlord_consent_url: string
          image_urls: string[]
          contact_info: string
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          address: string
          price_per_night: number
          available_from: string
          available_to: string
          landlord_consent_url: string
          image_urls?: string[]
          contact_info: string
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          address?: string
          price_per_night?: number
          available_from?: string
          available_to?: string
          landlord_consent_url?: string
          image_urls?: string[]
          contact_info?: string
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
      verification_status: 'pending' | 'approved' | 'rejected'
      listing_status: 'active' | 'inactive'
    }
  }
}
