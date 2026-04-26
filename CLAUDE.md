# 프로젝트: 대학생 단기 숙박 공유 플랫폼

## 기술 스택
- Next.js 15 (App Router)
- TypeScript strict mode
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Storage)

## 아키텍처 규칙
- CRITICAL: 모든 API 로직은 app/api/ 라우트 핸들러에서만 처리
- CRITICAL: 클라이언트 컴포넌트에서 Supabase를 직접 호출하지 말 것 (서버 액션 또는 API 라우트 사용)
- CRITICAL: 인증이 필요한 모든 API는 세션 검증 후 처리할 것
- CRITICAL: 관리자 전용 기능은 반드시 admin role 확인 후 처리할 것
- CRITICAL: 매물 등록은 학생 인증(verified=true)이 완료된 사용자만 가능. 매물 조회/검색은 비인증 사용자도 허용
- 컴포넌트는 components/ 폴더에, 타입은 types/ 폴더에 분리
- Server Components를 기본으로 사용하고, 인터랙션이 필요한 곳만 Client Component 사용

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것 (TDD)
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:)

## 명령어
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run test     # 테스트
