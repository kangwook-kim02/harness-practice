# Step 5: student-verification

## 읽어야 할 파일

먼저 아래 파일들을 읽고 기존 코드와 아키텍처를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/ADR.md` (ADR-003: 관리자 수동 승인)
- `docs/UI_GUIDE.md`
- `src/lib/supabase/server.ts`
- `src/types/index.ts`
- `src/app/api/auth/register/route.ts`
- `CLAUDE.md`

## 작업

학생 인증 서류 업로드 API와 페이지를 구현한다.

### `src/services/verification.ts`

```typescript
// Storage bucket: 'student-docs' (private)

async function submitVerification(
  userId: string,
  file: File
): Promise<StudentVerification>
// 1. pending 상태 중복 신청 확인 → 있으면 throw (중복 방지)
// 2. student-docs 버킷에 파일 업로드
//    경로: `{userId}/{Date.now()}-{file.name}`
// 3. student_verifications INSERT
//    { user_id: userId, document_url, status: 'pending' }

async function getVerificationStatus(
  userId: string
): Promise<'pending' | 'approved' | 'rejected' | null>
// student_verifications에서 최신 row의 status 반환
// row가 없으면 null 반환
```

### API 라우트

**`src/app/api/verification/route.ts`** — POST

```typescript
// 1. 세션 검증 → 없으면 401
// 2. FormData에서 `document` 파일 추출
// 3. submitVerification(user.id, file) 호출
// 4. 중복 pending → 409
// 5. 성공: 201 + { verification }
```

**`src/app/api/verification/status/route.ts`** — GET

```typescript
// 1. 세션 검증 → 없으면 401
// 2. getVerificationStatus(user.id) 호출
// 3. 200 + { status }
```

### 페이지

**`src/app/(auth)/verification/page.tsx`** — Client Component

`GET /api/verification/status`로 현재 상태를 조회하고 상태별 UI를 표시하라:

- `null` (미신청): 파일 업로드 폼 (accept="image/*,.pdf")
- `'pending'`: "검토 중입니다" 메시지
- `'approved'`: "인증 완료" + 홈 이동 버튼
- `'rejected'`: "인증 거절됨" + 재신청 업로드 폼

인증 상태 뱃지는 `docs/UI_GUIDE.md`의 뱃지 스타일을 사용하라.

### 테스트

`src/services/verification.test.ts`:
- TDD: 테스트를 먼저 작성하고 구현하라
- 중복 pending 신청 거부 케이스 반드시 포함
- Supabase 클라이언트와 Storage를 mock하여 테스트

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - API가 세션 없으면 401을 반환하는가?
   - pending 상태 중복 신청을 막는가?
   - Storage bucket 이름이 `student-docs`인가?
3. `phases/0-mvp/index.json`의 step 5를 업데이트한다.

## 금지사항

- `student-docs` bucket을 public으로 설정하지 마라. 이유: 학생증·재학증명서는 개인정보.
- 파일 경로를 고정값(`{userId}/{filename}`)으로 설정하지 마라. 이유: 동일 파일명 재업로드 시 덮어쓰기 발생. 타임스탬프를 포함하라.
- 기존 테스트를 깨뜨리지 마라.
