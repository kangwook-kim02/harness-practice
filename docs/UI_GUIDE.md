# UI 디자인 가이드

## 디자인 원칙
1. 신뢰감 — 부동산 플랫폼처럼 깔끔하고 안정적으로 보여야 한다. 화려한 장식은 신뢰를 낮춘다.
2. 정보 밀도 — 매물 목록과 상세 정보를 한눈에 파악할 수 있도록 레이아웃을 설계한다.
3. 상태 명확성 — 인증 상태(미인증/대기중/인증완료), 매물 상태(공개/비공개)를 뱃지로 즉시 인지할 수 있어야 한다.

## AI 슬롭 안티패턴 — 하지 마라
| 금지 사항 | 이유 |
|-----------|------|
| backdrop-filter: blur() | glass morphism은 AI 템플릿의 가장 흔한 징후 |
| gradient-text (배경 그라데이션 텍스트) | AI가 만든 SaaS 랜딩의 1번 특징 |
| "Powered by AI" 배지 | 기능이 아니라 장식. 사용자에게 가치 없음 |
| box-shadow 글로우 애니메이션 | 네온 글로우 = AI 슬롭 |
| 보라/인디고 브랜드 색상 | "AI = 보라색" 클리셰 |
| 모든 카드에 동일한 rounded-2xl | 균일한 둥근 모서리는 템플릿 느낌 |
| 배경 gradient orb (blur-3xl 원형) | 모든 AI 랜딩 페이지에 있는 장식 |

## 색상
### 배경
| 용도 | 값 |
|------|------|
| 페이지 | #ffffff |
| 카드 | #f9fafb |
| 구분선 | #e5e7eb |

### 텍스트
| 용도 | 값 |
|------|------|
| 주 텍스트 | text-gray-900 |
| 본문 | text-gray-700 |
| 보조 | text-gray-500 |
| 비활성 | text-gray-400 |

### 데이터/시맨틱 색상
| 용도 | 값 |
|------|------|
| 포인트/액션 | #2563eb (blue-600) |
| 성공/인증완료 | #16a34a (green-600) |
| 경고/대기중 | #d97706 (amber-600) |
| 에러/거절 | #dc2626 (red-600) |

## 컴포넌트
### 매물 카드
```
rounded-lg bg-gray-50 border border-gray-200 p-5 hover:shadow-sm transition-shadow
```

### 버튼
```
Primary: rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700
Secondary: rounded-lg border border-gray-300 text-gray-700 px-4 py-2 hover:bg-gray-50
Danger: rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700
```

### 입력 필드
```
rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500
```

### 인증 상태 뱃지
```
미인증:   text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2 py-0.5
대기중:   text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5
인증완료: text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5
거절:     text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5
```

## 레이아웃
- 전체 너비: max-w-5xl
- 정렬: 좌측 정렬 기본. 중앙 정렬 금지 (로그인 폼 제외)
- 간격: gap-4, 섹션 간 space-y-8

## 타이포그래피
| 용도 | 스타일 |
|------|--------|
| 페이지 제목 | text-2xl font-semibold text-gray-900 |
| 카드 제목 | text-base font-medium text-gray-900 |
| 본문 | text-sm text-gray-700 leading-relaxed |
| 보조 정보 | text-sm text-gray-500 |
| 가격 | text-lg font-semibold text-gray-900 |

## 애니메이션
- hover:shadow-sm transition-shadow (카드 호버)
- transition-colors (버튼 색상 전환)
- 그 외 모든 애니메이션 금지

## 아이콘
- SVG 인라인, strokeWidth 1.5
- 아이콘을 둥근 배경 박스로 감싸지 않는다
