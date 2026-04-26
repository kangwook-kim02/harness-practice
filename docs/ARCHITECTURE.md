# 아키텍처

## 기술 스택
- Next.js 15 (App Router)
- TypeScript strict mode
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Storage)

## 디렉토리 구조
```
src/
├── app/
│   ├── (auth)/            # 로그인, 회원가입, 학생 인증 요청 페이지
│   ├── (main)/            # 매물 목록, 매물 상세 페이지
│   ├── admin/             # 관리자 페이지 (인증 요청 검토)
│   └── api/               # API 라우트 핸들러 (모든 서버 로직)
│       ├── auth/
│       ├── listings/
│       └── admin/
├── components/            # 재사용 UI 컴포넌트
├── types/                 # TypeScript 타입 정의
├── lib/                   # Supabase 클라이언트, 유틸리티
└── services/              # 비즈니스 로직 (API 라우트에서 호출)
```

## 데이터베이스 스키마 (Supabase / PostgreSQL)

### profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (FK auth.users) | 사용자 ID |
| nickname | text | 닉네임 |
| university | text | 대학교명 |
| verified | boolean | 학생 인증 완료 여부 |
| role | enum('user', 'admin') | 사용자 권한 |
| created_at | timestamptz | 생성일 |

### student_verifications
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid (FK profiles) | 신청자 |
| document_url | text | 업로드된 문서 URL (Supabase Storage) |
| status | enum('pending', 'approved', 'rejected') | 처리 상태 |
| reviewed_by | uuid (FK profiles) | 검토한 관리자 |
| reviewed_at | timestamptz | 검토 일시 |
| created_at | timestamptz | 신청일 |

> 제약: `status = 'pending'`인 행이 존재하면 동일 user_id로 새 신청 불가 (API에서 검증)

### listings
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid (FK profiles) | 등록자 |
| title | text | 매물 제목 |
| description | text | 상세 설명 |
| address | text | 주소 |
| price_per_night | numeric | 1박 가격 (원) |
| available_from | date | 숙박 가능 시작일 |
| available_to | date | 숙박 가능 종료일 |
| landlord_consent_url | text | 집주인 동의서 URL (Supabase Storage) |
| image_urls | text[] | 사진 URL 배열 (Supabase Storage) |
| contact_info | text | 등록자 연락처 (매물 상세 페이지에 표시) |
| status | enum('active', 'inactive') | 매물 공개 여부 |
| created_at | timestamptz | 등록일 |

## 패턴
- Server Components를 기본으로 사용. 인터랙션(폼, 버튼 이벤트)이 필요한 곳만 Client Component 사용
- 모든 DB 접근은 API 라우트 또는 서버 액션을 통해서만 수행

## 데이터 흐름
```
사용자 입력
  → Client Component (폼, 이벤트)
  → API 라우트 (app/api/) — 세션 검증 + 비즈니스 로직
  → Supabase (DB 쿼리 / Storage 업로드)
  → 응답
  → UI 업데이트
```

## 상태 관리
- 서버 상태: Server Components에서 직접 fetch (Supabase 서버 클라이언트)
- 클라이언트 상태: useState / useReducer (전역 상태 라이브러리 사용 안 함)
