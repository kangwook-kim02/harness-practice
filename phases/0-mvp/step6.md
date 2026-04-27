# Step 6: listings-api

## 읽어야 할 파일

먼저 아래 파일들을 읽고 기존 코드와 설계를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/ADR.md` (ADR-004: 연락처 직접 노출)
- `src/lib/supabase/server.ts`
- `src/types/index.ts` (Listing, ListingFilter, ListingWithProfile)
- `src/services/verification.ts`
- `CLAUDE.md`

## 작업

매물 CRUD API 라우트와 서비스 레이어를 구현한다.

### `src/services/listings.ts`

```typescript
async function getListings(filter: ListingFilter): Promise<ListingWithProfile[]>
// listings JOIN profiles(nickname, university) 쿼리
// 필터 적용:
//   search → title, description, address ILIKE '%search%'
//   minPrice / maxPrice → price_per_night 범위
//   availableFrom / availableTo → available_from, available_to 범위
//   sortBy: 'price_asc' → price_per_night ASC, 'price_desc' → price_per_night DESC
// status = 'active'인 매물만 반환

async function getListingById(id: string): Promise<ListingWithProfile | null>

async function createListing(
  userId: string,
  data: Omit<ListingInsert, 'user_id' | 'landlord_consent_url' | 'image_urls'>,
  files: { consent: File; images: File[] }
): Promise<Listing>
// 처리 순서:
// 1. landlord-consents 버킷에 consent 업로드
// 2. listing-images 버킷에 images 배열 업로드
// 3. 위 두 단계 성공 후에만 listings INSERT
// Storage 업로드 실패 시 DB INSERT하지 않는다. 이유: URL 없는 row 생성 시 데이터 불일치.

async function updateListing(
  id: string,
  userId: string,
  data: ListingUpdate
): Promise<Listing>
// listings.user_id = userId 확인 후 UPDATE. 불일치 시 throw.

async function deleteListing(id: string, userId: string): Promise<void>
// listings.user_id = userId 확인 후 DELETE. 불일치 시 throw.
```

### API 라우트

**`src/app/api/listings/route.ts`**

- `GET`: 쿼리 파라미터로 `ListingFilter` 수신 → `getListings()` → 200
  - 세션 불필요 (비인증 사용자도 조회 허용)
- `POST`: FormData 수신 → 인증 확인 → `createListing()` → 201
  - FormData 필드: `title`, `description`, `address`, `price_per_night`(숫자), `available_from`, `available_to`, `contact_info`, `landlord_consent`(File), `images`(File 복수)
  - 세션 없음 → 401, `profiles.verified = false` → 403

**`src/app/api/listings/[id]/route.ts`**

- `GET`: `getListingById()` → 200 | 404 (세션 불필요)
- `PUT`: 세션 + 소유권 확인 → `updateListing()` → 200
- `DELETE`: 세션 + 소유권 확인 → `deleteListing()` → 204

### 테스트

`src/services/listings.test.ts`:
- TDD: 테스트를 먼저 작성하고 구현하라
- `verified=false` 사용자의 등록 거부 케이스 포함
- 소유권 없는 수정/삭제 거부 케이스 포함

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - `GET /api/listings`가 세션 없이도 동작하는가?
   - `POST /api/listings`가 `verified=true`인 사용자만 허용하는가?
   - Storage 업로드 실패 시 DB INSERT를 하지 않는가?
3. `phases/0-mvp/index.json`의 step 6을 업데이트한다.

## 금지사항

- `GET /api/listings`에 인증을 강제하지 마라. 이유: CLAUDE.md CRITICAL 규칙 — 매물 조회는 비인증 사용자도 허용.
- `verified=false`인 사용자의 `POST /api/listings`를 허용하지 마라. 이유: CLAUDE.md CRITICAL 규칙.
- Storage 업로드 완료 전에 DB INSERT하지 마라. 이유: URL 없는 row 생성 시 데이터 불일치.
- 기존 테스트를 깨뜨리지 마라.
