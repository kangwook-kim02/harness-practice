# Harness 프레임워크

Claude Code를 활용한 **단계적(step-by-step) AI 자동 개발 워크플로우** 템플릿입니다.
문서 기반의 가드레일 아래 Claude가 단계별로 코드를 작성하고 자가 교정하며 커밋합니다.

---

## 폴더 구조

```
harness-practice/
│
├── docs/                     # 프로젝트 설계 문서 (매 step 프롬프트에 자동 주입)
│   ├── PRD.md                # 제품 요구사항 — 목표, 사용자, 핵심 기능
│   ├── ARCHITECTURE.md       # 디렉토리 구조, 패턴, 데이터 흐름
│   ├── ADR.md                # Architecture Decision Records — 기술 선택 근거
│   └── UI_GUIDE.md           # 디자인 원칙, 색상, 컴포넌트 규칙
│
├── scripts/
│   ├── execute.py            # Harness 실행 엔진 (핵심)
│   └── test_execute.py       # execute.py 단위 테스트
│
├── .claude/
│   ├── settings.json         # Claude Code 훅 설정 (안전 가드, 자동 lint/test)
│   └── commands/
│       ├── harness.md        # /harness 슬래시 커맨드 — step 설계 워크플로우
│       └── review.md         # /review 슬래시 커맨드 — 코드 리뷰 체크리스트
│
├── CLAUDE.md                 # 프로젝트 규칙 — 모든 Claude 세션에 주입되는 가드레일
├── .gitignore
└── README.md
```

> **phases/** 디렉토리는 `/harness` 커맨드 실행 후 자동 생성됩니다.

---

## 핵심 개념

### Harness란?

하나의 큰 개발 작업을 **여러 step으로 쪼개고**, 각 step을 독립적인 Claude 세션으로 실행하는 프레임워크입니다.

```
전체 작업 (Phase)
  ├── Step 0: 프로젝트 초기 설정
  ├── Step 1: 타입 정의
  ├── Step 2: API 레이어
  └── Step 3: UI 구현
```

`execute.py`가 각 step마다 Claude CLI를 호출하고, 실패 시 자동으로 최대 3회 재시도합니다.

### 자동으로 처리되는 것들

| 기능 | 설명 |
|------|------|
| 브랜치 생성 | `feat-{phase-name}` 브랜치 자동 생성 및 checkout |
| 가드레일 주입 | `CLAUDE.md` + `docs/*.md` 를 매 step 프롬프트에 포함 |
| 컨텍스트 누적 | 완료된 step의 요약(summary)을 다음 step에 전달 |
| 자가 교정 | 실패 시 에러 메시지를 피드백으로 주입해 최대 3회 재시도 |
| 2단계 커밋 | 코드 변경(`feat:`)과 메타데이터(`chore:`)를 분리 커밋 |
| 타임스탬프 | `started_at`, `completed_at`, `failed_at` 자동 기록 |

---

## 워크플로우

### 1단계: 프로젝트 문서 작성

`docs/` 폴더의 템플릿 파일을 채웁니다. 중괄호 `{}` 부분을 실제 내용으로 교체하세요.

```
docs/PRD.md          ← 무엇을 만드는지
docs/ARCHITECTURE.md ← 어떻게 만드는지
docs/ADR.md          ← 왜 그 기술을 선택했는지
docs/UI_GUIDE.md     ← 어떻게 보여야 하는지
```

`CLAUDE.md`도 프로젝트에 맞게 수정합니다 (기술 스택, CRITICAL 규칙 등).

### 2단계: Step 설계 (`/harness`)

Claude Code에서 `/harness` 슬래시 커맨드를 실행합니다.

Claude가 문서를 읽고 구현 단계를 설계합니다. 피드백을 주고받으며 step 구성을 확정합니다.

### 3단계: 파일 생성

승인 후 Claude가 아래 파일들을 자동 생성합니다:

```
phases/
├── index.json                 # 전체 phase 현황
└── {task-name}/
    ├── index.json             # step별 상태 추적
    ├── step0.md               # step 0 지시사항
    ├── step1.md               # step 1 지시사항
    └── ...
```

**`phases/index.json` 예시:**
```json
{
  "phases": [
    { "dir": "0-mvp", "status": "pending" }
  ]
}
```

**`phases/{task}/index.json` 예시:**
```json
{
  "project": "MyProject",
  "phase": "mvp",
  "steps": [
    { "step": 0, "name": "project-setup", "status": "pending" },
    { "step": 1, "name": "api-layer",     "status": "pending" },
    { "step": 2, "name": "ui",            "status": "pending" }
  ]
}
```

### 4단계: 실행

```bash
# 순차 실행
python3 scripts/execute.py 0-mvp

# 실행 후 원격 브랜치에 push
python3 scripts/execute.py 0-mvp --push
```

실행 중 터미널에 진행 상황이 실시간으로 표시됩니다:

```
============================================================
  Harness Step Executor
  Phase: mvp | Steps: 3
============================================================
  Branch: feat-mvp
◑ Step 1/2 (api-layer) [42s]
  ✓ Step 1: api-layer [67s]
  ✓ Step 2: ui [134s]

  All steps completed!
============================================================
  Phase 'mvp' completed!
============================================================
```

---

## Step 상태 관리

각 step은 다음 상태 중 하나를 가집니다:

| 상태 | 의미 |
|------|------|
| `pending` | 실행 대기 중 |
| `completed` | 성공적으로 완료 |
| `error` | 3회 재시도 후 실패 |
| `blocked` | 외부 개입 필요 (API 키, 수동 설정 등) |

### 에러 복구

**error 상태:**
```json
// phases/{task}/index.json 에서 해당 step 수정
{ "step": 2, "name": "ui", "status": "pending" }
// error_message 필드를 삭제하고 status를 "pending"으로 변경 후 재실행
```

**blocked 상태:**
```
1. blocked_reason에 적힌 사유를 해결 (예: .env에 API 키 추가)
2. status를 "pending"으로 변경, blocked_reason 삭제
3. python3 scripts/execute.py {task-name} 재실행
```

---

## 안전 설정 (`.claude/settings.json`)

Claude Code 훅이 두 가지 안전장치를 제공합니다:

| 훅 | 설명 |
|----|------|
| **PreToolUse** | `rm -rf`, `git push --force`, `git reset --hard`, `DROP TABLE` 등 위험 명령어 차단 |
| **Stop** | Claude 작업 완료 시 `npm run lint && npm run build && npm run test` 자동 실행 |

---

## 슬래시 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/harness` | 문서 탐색 → 논의 → Step 설계 → 파일 생성 전체 워크플로우 진행 |
| `/review` | 변경사항을 아키텍처·기술스택·테스트·CRITICAL 규칙 기준으로 체크리스트 리뷰 |

---

## 요구사항

- Python 3.8+
- [Claude Code CLI](https://claude.ai/code) (`claude` 명령어가 PATH에 있어야 함)
- Git
