# Step 1: db-schema

## 읽어야 할 파일

먼저 아래 파일들을 읽고 데이터베이스 스키마 설계를 파악하라:

- `docs/ARCHITECTURE.md` (데이터베이스 스키마 섹션)
- `docs/ADR.md` (ADR-002: Supabase 선택, ADR-003: 관리자 수동 승인)
- `CLAUDE.md`

## 작업

`supabase/schema.sql` 파일을 생성한다. 이 파일은 Supabase SQL Editor에서 직접 실행할 SQL이다.

### 포함할 내용

1. **Enum 타입**
   - `user_role`: `'user'`, `'admin'`
   - `verification_status`: `'pending'`, `'approved'`, `'rejected'`
   - `listing_status`: `'active'`, `'inactive'`

2. **profiles 테이블** (`docs/ARCHITECTURE.md` 스키마 참조)
   - `id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `verified` 기본값: `false`
   - `role` 기본값: `'user'`

3. **student_verifications 테이블** (`docs/ARCHITECTURE.md` 스키마 참조)

4. **listings 테이블** (`docs/ARCHITECTURE.md` 스키마 참조)
   - `price_per_night`, `available_from`, `available_to` 컬럼에 인덱스 추가 (검색 성능)

5. **RLS(Row Level Security) 설정**
   - 각 테이블에 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - `listings` SELECT: 누구나 (`status = 'active'`인 것만)
   - `listings` INSERT: `auth.uid() = user_id` AND `profiles.verified = true`
   - `listings` UPDATE/DELETE: `auth.uid() = user_id` (소유자만)
   - `profiles` SELECT: 누구나
   - `profiles` UPDATE: `auth.uid() = id` (본인만)
   - `student_verifications` SELECT/INSERT: `auth.uid() = user_id` (본인만)

6. **신규 사용자 자동 profiles 생성 trigger**
   - `auth.users` INSERT 시 `profiles` 테이블에 자동 INSERT하는 함수 + trigger 작성

### 완료 후

파일을 생성한 뒤 즉시 `phases/0-mvp/index.json`의 step 1을 아래와 같이 업데이트하고 중단하라:

```json
{
  "status": "blocked",
  "blocked_reason": "아래 두 작업을 완료한 뒤 status를 'pending'으로 리셋하세요:\n1. Supabase 대시보드 > SQL Editor에서 supabase/schema.sql 실행\n2. Supabase 대시보드 > Storage에서 버킷 3개 생성:\n   - student-docs (private)\n   - landlord-consents (private)\n   - listing-images (public)"
}
```

## Acceptance Criteria

```bash
test -f supabase/schema.sql && echo "OK"
```

## 검증 절차

1. `supabase/schema.sql` 파일이 생성되었는지 확인한다.
2. SQL 문법 오류가 없는지 파일을 검토한다 (실행하지 않고 파일만 검토).
3. `phases/0-mvp/index.json`의 step 1을 `"status": "blocked"`로 업데이트한다.

## 금지사항

- Supabase CLI나 외부 도구를 실행하지 마라. 이유: 설치되어 있지 않을 수 있음.
- SQL을 직접 Supabase에 실행하지 마라. 이유: 이 step은 파일 생성만 담당.
- 기존 테스트를 깨뜨리지 마라.
