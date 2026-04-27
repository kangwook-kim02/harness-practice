# Step 2: core-types

## 읽어야 할 파일

먼저 아래 파일들을 읽고 데이터베이스 스키마와 설계를 파악하라:

- `docs/ARCHITECTURE.md` (데이터베이스 스키마)
- `supabase/schema.sql` (step 1에서 생성된 실제 SQL 스키마)
- `CLAUDE.md`

## 작업

`src/types/` 디렉토리에 TypeScript 타입을 정의한다.

### `src/types/database.ts`

Supabase 스키마에 대응하는 `Database` 타입을 수동으로 정의하라. Supabase 자동생성 타입 형식을 따른다:

```typescript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; nickname: string; university: string; verified: boolean; role: 'user' | 'admin'; created_at: string }
        Insert: { ... }
        Update: { ... }
      }
      student_verifications: { Row: ...; Insert: ...; Update: ... }
      listings: { Row: ...; Insert: ...; Update: ... }
    }
    Enums: {
      user_role: 'user' | 'admin'
      verification_status: 'pending' | 'approved' | 'rejected'
      listing_status: 'active' | 'inactive'
    }
  }
}
```

각 테이블의 Row/Insert/Update 타입은 `supabase/schema.sql`의 컬럼 정의와 정확히 일치해야 한다.
- `Insert` 타입: 자동 생성 컬럼(`id`, `created_at`)은 optional
- `Update` 타입: 모든 필드 optional (Partial)

### `src/types/index.ts`

애플리케이션 레벨 타입과 헬퍼 타입을 정의하라:

```typescript
// Database Row 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type StudentVerification = Database['public']['Tables']['student_verifications']['Row']

// Insert / Update 타입
export type ListingInsert = Database['public']['Tables']['listings']['Insert']
export type ListingUpdate = Database['public']['Tables']['listings']['Update']

// 복합 타입 (listings JOIN profiles)
export type ListingWithProfile = Listing & {
  profiles: Pick<Profile, 'nickname' | 'university'>
}

// 매물 검색 필터
export interface ListingFilter {
  search?: string
  minPrice?: number
  maxPrice?: number
  availableFrom?: string   // ISO date string (YYYY-MM-DD)
  availableTo?: string
  sortBy?: 'price_asc' | 'price_desc'
}
```

### `src/types/index.test.ts`

타입이 올바르게 구성되었는지 컴파일 타임에 검증하는 최소 테스트를 작성하라.

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `supabase/schema.sql`의 모든 컬럼이 타입에 반영되었는지 확인한다.
3. `phases/0-mvp/index.json`의 step 2를 업데이트한다.

## 금지사항

- `any` 타입을 사용하지 마라. 이유: TypeScript strict mode.
- `supabase gen types` CLI 명령어를 실행하지 마라. 이유: Supabase CLI가 설치되어 있지 않음. 수동 정의로 대체.
- 기존 테스트를 깨뜨리지 마라.
