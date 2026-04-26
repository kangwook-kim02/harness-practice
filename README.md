# 대학생 단기 숙박 공유 플랫폼

대학생이 방학·단기 공석 방을 안전하게 내놓고 구할 수 있는 대학생 전용 숙박 공유 플랫폼입니다.
학생증/재학증명서 기반 인증으로 대학생만 매물을 등록할 수 있으며, [Harness 프레임워크](#개발-방법론-harness)로 단계적으로 개발합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대학생 인증 | 학생증 또는 재학증명서 업로드 → 관리자 수동 승인 |
| 매물 등록 | 위치, 1박 가격, 숙박 가능 기간, 집주인 동의서, 사진 업로드 |
| 매물 검색 | 키워드 검색, 가격 낮은순/높은순 정렬, 기간 필터 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript (strict mode) |
| 스타일링 | Tailwind CSS |
| DB / 인증 / 스토리지 | Supabase (PostgreSQL + Auth + Storage) |

---

## 개발 방법론: Harness

이 프로젝트는 **Harness 프레임워크**를 사용해 개발합니다. 큰 작업을 여러 step으로 쪼개고, Claude가 각 step을 독립 세션으로 실행하며 자동으로 커밋합니다.

### 폴더 구조

```
├── docs/
│   ├── PRD.md            # 제품 요구사항
│   ├── ARCHITECTURE.md   # 아키텍처 및 DB 스키마
│   ├── ADR.md            # 기술 결정 근거
│   └── UI_GUIDE.md       # 디자인 원칙 및 컴포넌트 규칙
├── scripts/
│   ├── execute.py        # Harness 실행 엔진
│   └── test_execute.py   # 실행 엔진 테스트
├── phases/               # 개발 단계별 실행 파일 (자동 생성)
└── CLAUDE.md             # 프로젝트 규칙 (모든 Claude 세션에 주입)
```

### 개발 워크플로우

```
1. /harness  →  step 설계 (Claude와 대화)
2. 파일 생성  →  phases/{task}/index.json + step{N}.md
3. 실행       →  python3 scripts/execute.py {task-name}
```

### 실행 명령어

```bash
# phase 순차 실행
python3 scripts/execute.py 0-mvp

# 실행 후 원격 브랜치에 push
python3 scripts/execute.py 0-mvp --push
```

---

## 데이터베이스 스키마

주요 테이블 요약 (상세 내용은 `docs/ARCHITECTURE.md` 참고)

```
profiles              — 사용자 프로필 + 인증 상태 + role
student_verifications — 학생 인증 요청 (문서 URL, 승인 상태)
listings              — 매물 (위치, 가격, 기간, 동의서, 이미지, 연락처)
```

---

## MVP 제외 사항

- 플랫폼 내 메시지 (연락처 직접 노출 방식으로 대체)
- 결제 시스템 (예약금, 정산)
- 리뷰 및 평점
- 지도 기반 검색
- 예약 확정 플로우 (수락/거절)
- 이메일/푸시 알림

---

## 요구사항

- Python 3.8+
- [Claude Code CLI](https://claude.ai/code) (`claude` 명령어가 PATH에 있어야 함)
- Git
