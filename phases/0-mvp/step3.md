# Step 3: supabase-client

## 읽어야 할 파일

먼저 아래 파일들을 읽고 타입 정의와 아키텍처를 파악하라:

- `docs/ARCHITECTURE.md`
- `src/types/database.ts`
- `src/types/index.ts`
- `CLAUDE.md`

## 작업

Supabase 클라이언트와 Next.js 미들웨어를 설정한다.

### `src/lib/supabase/server.ts`

`@supabase/ssr`의 `createServerClient`를 사용하는 서버 클라이언트를 작성하라:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// 일반 서버 클라이언트 — RLS 적용됨
export async function createClient(): Promise<SupabaseClient<Database>>

// 서비스 롤 클라이언트 — RLS 우회, 관리자 전용 작업에 사용
export async function createServiceClient(): Promise<SupabaseClient<Database>>
```

사용 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (서비스 롤 클라이언트 전용)

### `src/lib/supabase/browser.ts`

`@supabase/ssr`의 `createBrowserClient`를 사용하는 브라우저 클라이언트를 작성하라:

```typescript
'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// 싱글턴 패턴으로 구현
export function createClient(): SupabaseClient<Database>
```

### `src/middleware.ts`

세션 갱신 미들웨어를 작성하라:
- Supabase 세션 쿠키를 자동으로 refresh
- `matcher`: `/_next/`, `/favicon.ico`, `/api/` 등 제외하고 일반 페이지 라우트에 적용

### `src/lib/supabase/server.test.ts`

서버 클라이언트가 정상적으로 인스턴스화되는지 테스트하라 (Supabase mock 사용, 실제 DB 연결 불필요).

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 체크리스트:
   - `createServiceClient()`가 `SUPABASE_SERVICE_ROLE_KEY`를 사용하는가?
   - `browser.ts`에 `'use client'` 지시어가 있는가?
3. `phases/0-mvp/index.json`의 step 3을 업데이트한다.

## 금지사항

- `src/lib/supabase/browser.ts`를 Server Component에서 import하지 마라. 이유: 'use client' 전용 파일이라 빌드 에러 발생.
- `SUPABASE_SERVICE_ROLE_KEY`를 `NEXT_PUBLIC_` 접두사로 노출하지 마라. 이유: 클라이언트에 service role 키가 노출되면 RLS가 무력화됨.
- 기존 테스트를 깨뜨리지 마라.
