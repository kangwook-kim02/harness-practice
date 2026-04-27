import type {
  Profile,
  Listing,
  StudentVerification,
  ListingInsert,
  ListingUpdate,
  ListingWithProfile,
  ListingFilter,
} from './index'

describe('core types', () => {
  it('Profile has required fields', () => {
    const profile: Profile = {
      id: 'uuid-1',
      nickname: '홍길동',
      university: '서울대학교',
      verified: false,
      role: 'user',
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(profile.id).toBe('uuid-1')
    expect(profile.role).toBe('user')
  })

  it('Listing has required fields', () => {
    const listing: Listing = {
      id: 'uuid-2',
      user_id: 'uuid-1',
      title: '방 구합니다',
      description: '설명',
      address: '서울시 관악구',
      price_per_night: 30000,
      available_from: '2026-07-01',
      available_to: '2026-08-31',
      landlord_consent_url: 'https://example.com/doc.pdf',
      image_urls: [],
      contact_info: '010-0000-0000',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(listing.status).toBe('active')
    expect(listing.image_urls).toEqual([])
  })

  it('StudentVerification nullable fields are correct', () => {
    const sv: StudentVerification = {
      id: 'uuid-3',
      user_id: 'uuid-1',
      document_url: 'https://example.com/cert.pdf',
      status: 'pending',
      reviewed_by: null,
      reviewed_at: null,
      created_at: '2026-01-01T00:00:00Z',
    }
    expect(sv.reviewed_by).toBeNull()
    expect(sv.reviewed_at).toBeNull()
  })

  it('ListingInsert optional fields can be omitted', () => {
    const insert: ListingInsert = {
      user_id: 'uuid-1',
      title: '테스트',
      description: '설명',
      address: '주소',
      price_per_night: 20000,
      available_from: '2026-07-01',
      available_to: '2026-08-31',
      landlord_consent_url: 'https://example.com/doc.pdf',
      contact_info: '010-0000-0000',
    }
    expect(insert.id).toBeUndefined()
    expect(insert.status).toBeUndefined()
  })

  it('ListingUpdate allows partial update', () => {
    const update: ListingUpdate = { status: 'inactive' }
    expect(update.status).toBe('inactive')
  })

  it('ListingWithProfile includes profiles join', () => {
    const listing: ListingWithProfile = {
      id: 'uuid-2',
      user_id: 'uuid-1',
      title: '방',
      description: '설명',
      address: '주소',
      price_per_night: 50000,
      available_from: '2026-07-01',
      available_to: '2026-08-31',
      landlord_consent_url: 'https://example.com/doc.pdf',
      image_urls: ['https://example.com/img.jpg'],
      contact_info: '010-1234-5678',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      profiles: { nickname: '김철수', university: '연세대학교' },
    }
    expect(listing.profiles.nickname).toBe('김철수')
  })

  it('ListingFilter is optional fields', () => {
    const filter: ListingFilter = { sortBy: 'price_asc', minPrice: 10000 }
    expect(filter.sortBy).toBe('price_asc')
  })
})
