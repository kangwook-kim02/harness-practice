# Step 7: listings-ui

## 읽어야 할 파일

먼저 아래 파일들을 읽고 기존 코드와 UI 가이드를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md`
- `src/types/index.ts`
- `src/app/api/listings/route.ts`
- `src/app/api/listings/[id]/route.ts`
- `CLAUDE.md`

## 작업

매물 목록·검색·상세·등록·수정 UI를 구현한다.

### 컴포넌트

**`src/components/ListingCard.tsx`** — Server Component

```typescript
// Props: { listing: ListingWithProfile }
// 표시: 제목, 주소, price_per_night(원 단위 포맷), 기간, 대학교명
// UI_GUIDE.md 카드 스타일:
//   rounded-lg bg-gray-50 border border-gray-200 p-5 hover:shadow-sm transition-shadow
// contact_info는 이 컴포넌트에서 표시하지 않는다. 이유: 상세 페이지에서만 노출.
```

**`src/components/SearchFilter.tsx`** — Client Component

```typescript
// Props: { onFilterChange: (filter: ListingFilter) => void; initialFilter?: ListingFilter }
// 필터 항목: 키워드 검색, 최소/최대 가격, 기간(available_from~available_to), 정렬
// URL 쿼리 파라미터와 동기화 (useSearchParams + useRouter)
```

**`src/components/ListingForm.tsx`** — Client Component

```typescript
// Props: {
//   mode: 'create' | 'edit'
//   initialData?: Listing
//   onSubmit: (formData: FormData) => Promise<void>
// }
// 필드: 제목, 설명, 주소, 가격(숫자), 기간, 연락처, 집주인 동의서(File), 사진(File 복수)
```

### 페이지

**`src/app/(main)/layout.tsx`**
- 네비게이션 바: 로고, 로그인/로그아웃 버튼, 현재 사용자 인증 상태 뱃지
- `max-w-5xl` 레이아웃, 좌측 정렬 (UI_GUIDE.md)

**`src/app/(main)/page.tsx`** — Server Component
- URL 쿼리 파라미터로 `ListingFilter` 파싱 → `GET /api/listings` fetch
- `<SearchFilter>` + `<ListingCard>` 목록 렌더링

**`src/app/(main)/listings/[id]/page.tsx`** — Server Component
- `GET /api/listings/[id]` fetch → 없으면 notFound()
- 매물 상세 정보 표시
- `contact_info`: 로그인 사용자에게만 표시. 비로그인은 "로그인 후 연락처를 확인할 수 있습니다" 표시.
- 본인 매물이면 수정/삭제 버튼 표시

**`src/app/(main)/listings/new/page.tsx`**
- 세션 없음 → `/login` redirect
- `profiles.verified = false` → `/verification` redirect
- `<ListingForm mode="create">` 렌더링, 제출 시 `POST /api/listings`

**`src/app/(main)/listings/[id]/edit/page.tsx`**
- 소유자 확인 → 비소유자는 notFound()
- `<ListingForm mode="edit">` 렌더링, 제출 시 `PUT /api/listings/[id]`

### 테스트

`src/components/ListingCard.test.tsx`, `src/components/SearchFilter.test.tsx`:
- TDD: 테스트를 먼저 작성하고 구현하라
- `ListingCard`가 `contact_info`를 렌더링하지 않는지 확인

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - `contact_info`가 비로그인 사용자에게 노출되지 않는가?
   - `docs/UI_GUIDE.md`의 AI 슬롭 안티패턴이 없는가?
   - Client Component에서 Supabase를 직접 호출하지 않는가?
3. `phases/0-mvp/index.json`의 step 7을 업데이트한다.

## 금지사항

- `docs/UI_GUIDE.md` "AI 슬롭 안티패턴" 목록의 어떤 것도 사용하지 마라. 이유: backdrop-blur, gradient-text, 보라/인디고 색상 등 금지.
- Client Component에서 Supabase를 직접 호출하지 마라. 이유: CLAUDE.md CRITICAL 규칙. 데이터 변경은 `/api/listings/*`를 통해서만.
- 비로그인 사용자에게 `contact_info`를 노출하지 마라. 이유: 최소한의 스팸 방지.
- 기존 테스트를 깨뜨리지 마라.
