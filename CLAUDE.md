# Todo Frontend — Claude Context

## 프로젝트 개요

Todo 앱의 Frontend 파트.
파트 간 직접 협업 없음. API Contract(specs/api-contract/openapi.yaml)만 공유.

## 기술 스택

- Framework: Next.js 14 (App Router)
- 상태관리: Zustand
- 스타일: Tailwind CSS
- API 타입: /generated/api-types.ts (openapi 자동생성, 직접 수정 금지)
- 패키지 매니저: pnpm

## 참조 문서 (구현 전 반드시 확인)

- 기능 스펙: /specs/features/
- API 계약: /specs/api-contract/openapi.yaml
- 아키텍처 결정: /specs/adr/

## 브랜치 전략

- prd: 최종 배포 (직접 커밋 금지)
- dev: 개발 통합 (직접 커밋 금지)
- feat/xxx: 기능 개발 → dev로 PR
- hotfix/xxx: 긴급 수정 → prd로 PR 후 dev 역머지
- refactor/xxx: 리팩토링 → dev로 PR

## 환경변수

- 로컬: .env.local (gitignore, .env.example 참고)
- dev 서버: 서버에 .env.dev 직접 배치
- prd 서버: 서버에 .env.prd 직접 배치
- 하드코딩 금지, 반드시 NEXT*PUBLIC* 환경변수 사용

## 코딩 규칙

### 컴포넌트

- Server Component 우선, 꼭 필요한 경우만 'use client' 사용
- 컴포넌트 생성 시 로딩/에러 상태 항상 함께 처리
- aria 속성 누락 금지

### API

- API 타입은 /generated/api-types.ts에서만 import
- API URL 하드코딩 금지, NEXT_PUBLIC_API_URL 사용
- API 호출은 /src/lib/api/ 디렉토리에서만 작성

### 스타일

- Tailwind CSS only, 인라인 style 금지
- 디자인 토큰은 tailwind.config.ts에서 관리

### 기타

- 스펙에 없는 기능 임의 추가 금지
- any 타입 사용 금지
- console.log 커밋 금지

## AI 지침

- 구현 전 /specs/features/ 해당 스펙 파일 먼저 확인할 것
- API 호출 코드 작성 전 openapi.yaml 확인할 것
- /generated/api-types.ts와 실제 API 응답이 다를 경우
  → 코드가 아닌 스펙 수정이 필요하다고 알려줄 것
- 컴포넌트 분리 기준: 100줄 초과 시 분리 검토
- 테스트 작성 시 /src/**tests**/ 디렉토리 사용

## 디렉토리 구조

src/
├── app/ ← Next.js App Router 페이지
├── components/
│ ├── ui/ ← 공통 UI 컴포넌트
│ └── features/ ← 기능별 컴포넌트
├── hooks/ ← 커스텀 훅
├── stores/ ← Zustand 스토어
├── lib/
│ └── api/ ← API 클라이언트
└── **tests**/ ← 테스트

generated/
└── api-types.ts ← openapi 자동생성 (수정 금지)

specs/ ← todo-spec submodule (수정 금지)
