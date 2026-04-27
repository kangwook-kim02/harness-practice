# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 기술 스택과 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md`
- `CLAUDE.md`

## 작업

현재 디렉토리(`harness-practice/`)에 Next.js 15 앱을 초기화하고, 테스트 환경을 구성한다.

### 1. Next.js 15 초기화

아래 명령어로 현재 디렉토리에 Next.js 앱을 생성한다:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

- `CLAUDE.md`, `docs/`, `scripts/`, `README.md`, `.env.local`, `.gitignore`, `phases/` 파일은 절대 덮어쓰지 마라.
- 기존 파일과 충돌이 발생하면 기존 파일을 유지한다.

### 2. 의존성 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

### 3. Vitest 설정

`vitest.config.ts`를 생성하라:

- `environment: 'jsdom'`
- `globals: true`
- `setupFiles: './src/test/setup.ts'`
- `resolve.alias`: `'@'` → `'./src'`

`src/test/setup.ts`를 생성하라:

- `@testing-library/jest-dom` import

`package.json` scripts에 추가:

- `"test": "vitest run"`
- `"test:watch": "vitest"`

### 4. 기본 레이아웃 설정

`src/app/layout.tsx`:
- `<html lang="ko">`, `<body>` 기본 설정
- UI_GUIDE.md 색상 기반 전역 스타일 (화이트 배경 `#ffffff`, 기본 텍스트 `text-gray-900`)

`src/app/page.tsx`를 간단한 플레이스홀더로 교체하라 (빌드 통과용).

### 5. Smoke test 작성

`src/app/page.test.tsx`에 컴포넌트 렌더링 smoke test를 작성하라.

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # smoke test 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트:
   - `src/` 디렉토리 구조인가?
   - `tsconfig.json`에 `"strict": true`가 설정되어 있는가?
   - `.env.local`이 덮어써지지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다.

## 금지사항

- `--no-git` 없이 create-next-app을 실행하지 마라. 이유: git repo가 이미 존재함.
- `CLAUDE.md`, `docs/`, `scripts/`, `.env.local`, `phases/`를 수정하거나 삭제하지 마라. 이유: 프로젝트 가드레일 및 하네스 파일.
- Vitest를 Jest와 혼용하지 마라. 이유: 설정 충돌.
- 기존 테스트를 깨뜨리지 마라.
