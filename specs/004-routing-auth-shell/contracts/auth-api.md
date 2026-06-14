# Auth API Contract: 004 라우팅·인증 골격

> 출처: `spec/api-contract/openapi.yaml` — 이 문서는 요약본이다.
> 실제 타입은 `/generated/api-types.ts`를 사용한다.

## 사용 엔드포인트

### POST /api/v1/auth/login
- **용도**: 이메일+비밀번호 로그인
- **인증**: 불필요 (`security: []`)
- **요청**: `{ email: string, password: string }`
- **응답 200**: `{ account: AccountSummary, tokens: TokenPair }`
- **응답 401**: 잘못된 자격증명·계정 미존재·계정 잠금 (계정 열거 방지로 동일 메시지)
- **응답 422**: 소셜 전용 계정에 이메일 로그인 시도 (`code: SOCIAL_ONLY_ACCOUNT`)
- **주의**: 연속 5회 실패 시 계정 30분 잠금

### POST /api/v1/auth/refresh
- **용도**: 액세스 토큰 갱신 (Rotation)
- **인증**: 불필요 (`security: []`)
- **요청**: `{ refreshToken: string }`
- **응답 200**: `{ tokens: TokenPair }` — 새 토큰 쌍 (기존 refreshToken 즉시 무효화)
- **응답 401**: 만료·무효 refreshToken
- **주의**: 이미 무효화된 토큰 재사용 감지 시 해당 family 전체 세션 무효화 → 강제 로그아웃 트리거

### POST /api/v1/auth/logout
- **용도**: 현재 세션(refreshToken) 무효화
- **인증**: accessToken 필요
- **요청**: `{ refreshToken: string }`
- **응답 204**: 성공 (no content)
- **주의**: 해당 기기 세션만 무효화, 다른 기기 세션 유지

### GET /api/v1/me
- **용도**: 현재 인증 계정 요약 조회 (세션 복원, 게이트 상태 확인)
- **인증**: accessToken 필요
- **응답 200**: `AccountSummary`
- **응답 401**: 만료 → 인터셉터가 자동 갱신 후 재시도
- **응답 403**: 이메일 미인증 계정 (`code: EMAIL_NOT_VERIFIED`)
- **주의**: 이메일 미인증 계정은 403 반환 — 이를 게이트에서 별도 처리 필요

## 프론트엔드 에러 처리 매핑

| HTTP 상태 | code | 프론트 처리 |
|---|---|---|
| 401 | - | 인터셉터 자동 갱신 → 실패 시 로그아웃 |
| 403 | `EMAIL_NOT_VERIFIED` | /verify-email 게이트로 안내 |
| 422 | `SOCIAL_ONLY_ACCOUNT` | 로그인 폼에 소셜 로그인 안내 메시지 |
| 5xx | - | 에러 메시지 + 재시도 버튼 |

## 소셜 로그인 (범위 외 — 슬롯만)

`/api/v1/auth/social/{provider}/authorize` 및 callback은 005 auth spec에서 구현.
이 단계에서는 라우트 슬롯(`/auth/callback`)만 등록한다.
