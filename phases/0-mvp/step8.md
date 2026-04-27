# Step 8: admin

## 읽어야 할 파일

먼저 아래 파일들을 읽고 기존 코드와 설계를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/ADR.md` (ADR-003: 관리자 수동 승인)
- `docs/UI_GUIDE.md`
- `src/lib/supabase/server.ts` (createServiceClient)
- `src/types/index.ts`
- `src/app/api/verification/route.ts`
- `CLAUDE.md`

## 작업

관리자 인증 검토 페이지와 API를 구현한다.

### API 라우트

**`src/app/api/admin/verifications/route.ts`** — GET

```typescript
// 1. 세션 검증 → 없으면 401
// 2. profiles에서 role 조회 → 'admin'이 아니면 403
// 3. student_verifications JOIN profiles(nickname, university)
//    기본: status = 'pending', 쿼리 파라미터 ?status= 로 필터 변경 가능
// 4. 200 + { verifications }
```

**`src/app/api/admin/verifications/[id]/route.ts`** — POST

```typescript
// Request body: { action: 'approve' | 'reject' }
// 1. 세션 검증 → 없으면 401
// 2. role = 'admin' 확인 → 아니면 403
// 3. createServiceClient() 사용 (RLS 우회)
// 4. action = 'approve':
//    - student_verifications: status = 'approved', reviewed_by = admin.id, reviewed_at = now()
//    - profiles: verified = true (user_id 기준)
// 5. action = 'reject':
//    - student_verifications: status = 'rejected', reviewed_by = admin.id, reviewed_at = now()
// 6. 200 + { verification }
```

### 페이지

**`src/app/admin/layout.tsx`**
- 세션 및 `role = 'admin'` 검증. 조건 미충족 시 `/` 로 redirect.

**`src/app/admin/page.tsx`** — Server Component
- `GET /api/admin/verifications?status=pending` fetch
- 각 항목 표시: 닉네임, 대학교, 신청일, 서류 파일 링크, 승인/거절 버튼
- 승인/거절 버튼: Client Component에서 `POST /api/admin/verifications/[id]` 호출

### 테스트

`src/app/api/admin/verifications/route.test.ts`:
- TDD: 테스트를 먼저 작성하고 구현하라
- admin이 아닌 사용자 접근 → 403 케이스 반드시 포함
- approve 시 `profiles.verified = true`가 업데이트되는지 확인

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - 모든 `/api/admin/*` 라우트가 `role = 'admin'` 확인 후 처리하는가?
   - approve 시 `student_verifications` + `profiles` 두 테이블이 모두 업데이트되는가?
   - `createServiceClient()`를 사용하는가?
3. `phases/0-mvp/index.json`의 step 8을 업데이트한다.

## 금지사항

- `/api/admin/*` 라우트에서 role 확인을 생략하지 마라. 이유: CLAUDE.md CRITICAL 규칙 — 관리자 전용 기능은 반드시 admin role 확인 후 처리.
- approve 시 `student_verifications`만 업데이트하고 `profiles.verified` 업데이트를 빠뜨리지 마라. 이유: `profiles.verified = true`가 되어야 해당 사용자가 매물 등록 가능.
- anon 클라이언트로 admin 작업을 처리하지 마라. 이유: RLS가 일반 사용자의 다른 사용자 profiles 수정을 막음. `createServiceClient()` 사용.
- 기존 테스트를 깨뜨리지 마라.
