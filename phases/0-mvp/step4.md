# Step 4: auth

## 읽어야 할 파일

먼저 아래 파일들을 읽고 아키텍처와 기존 코드를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/ADR.md`
- `docs/UI_GUIDE.md`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`
- `src/types/index.ts`
- `CLAUDE.md`

## 작업

회원가입·로그인·로그아웃 API 라우트와 페이지를 구현한다.

### API 라우트

**`src/app/api/auth/register/route.ts`** — POST

```typescript
// Request body: { email: string; password: string; nickname: string; university: string }
// 처리 순서:
// 1. supabase.auth.signUp({ email, password })
// 2. createServiceClient()로 profiles 테이블 INSERT
//    { id: user.id, nickname, university, verified: false, role: 'user' }
// 응답: 201 + { user }
// 에러: 이미 존재하는 이메일 → 409
```

**`src/app/api/auth/login/route.ts`** — POST

```typescript
// Request body: { email: string; password: string }
// supabase.auth.signInWithPassword({ email, password })
// 응답: 200 + { user }
// 에러: 잘못된 자격증명 → 401
```

**`src/app/api/auth/logout/route.ts`** — POST

```typescript
// supabase.auth.signOut()
// 응답: 204
```

### 페이지

**`src/app/(auth)/layout.tsx`**
- 인증 페이지 공통 레이아웃 (로그인 폼 한정으로 중앙 정렬 허용 — UI_GUIDE.md 예외)

**`src/app/(auth)/register/page.tsx`** — Client Component
- 필드: 이메일, 비밀번호, 닉네임, 대학교명
- `POST /api/auth/register` 호출
- 성공 시 `/verification` 페이지로 redirect

**`src/app/(auth)/login/page.tsx`** — Client Component
- 필드: 이메일, 비밀번호
- `POST /api/auth/login` 호출
- 성공 시 `/` 페이지로 redirect

### 테스트

`src/app/api/auth/register/route.test.ts`, `src/app/api/auth/login/route.test.ts`:
- TDD: 테스트를 먼저 작성하고 구현하라
- Supabase 클라이언트를 mock하여 단위 테스트 작성
- 이메일 중복 → 409, 잘못된 자격증명 → 401 케이스 포함

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - register가 `createServiceClient()`로 profiles를 생성하는가?
   - API 라우트가 Next.js Route Handler 형식(`export async function POST(req: Request)`)인가?
3. `phases/0-mvp/index.json`의 step 4를 업데이트한다.

## 금지사항

- Client Component에서 Supabase를 직접 호출하지 마라. 이유: CLAUDE.md CRITICAL 규칙. 폼 제출은 반드시 `/api/auth/*` 라우트를 통해서만.
- 비밀번호를 직접 DB에 저장하지 마라. 이유: Supabase Auth가 해시 처리. `auth.signUp()`만 사용.
- 기존 테스트를 깨뜨리지 마라.
