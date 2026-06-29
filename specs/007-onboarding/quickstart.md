# Quickstart: 007 온보딩 (W-12)

## 전제조건

- `pnpm dev` 실행 중 (`http://localhost:5173/`)
- 백엔드 `http://15.165.196.248:8080` 가동 중
- **온보딩 미완료 계정** (또는 아래 수동 초기화 방법)

### 온보딩 미완료 상태로 초기화

이미 온보딩을 완료한 계정은 `GateRoute`가 `/home`으로 보내므로 `/onboarding` 접근 불가.  
개발 중에는 `AuthProvider`를 통해 세션이 복원되는 순간 `user.onboardingCompleted`가 설정됨.  
**임시 방법**: `localStorage`에서 `newsift-refresh-token` 키를 삭제 후 새 계정으로 가입.

---

## S-1. 온보딩 플로우 전체 확인

1. 미가입 이메일로 회원가입 또는 `onboardingCompleted=false` 계정 로그인
2. `/onboarding` 자동 이동 확인 (`GateRoute` 동작)
3. 데스크탑 카드 레이아웃 확인 (좌측 navy 레일 + 우측 콘텐츠)
4. 1단계: 닉네임 비어있으면 "다음" 비활성 → 입력 후 활성
5. 2단계: 토픽 2개 → "다음" 비활성, 3개 → 활성
6. 3단계: "건너뛰기" 클릭 → 4단계 이동, 키워드 선택 없음
7. 4단계: "건너뛰기" 클릭 → 5단계 이동
8. 5단계: 음성 캐릭터 선택, 재생 버튼 비활성 확인, "앱에서 미리듣기" 문구 확인
9. "Newsift 시작하기" 클릭 → `/home` 이동
10. 다시 `/onboarding` 접근 → `/home` 리다이렉트 확인 (재진입 방지)

---

## S-2. 개별 단계 검증

| 단계 | 검증 항목 |
|---|---|
| 1 (프로필) | 닉네임 12자 초과 입력 불가, 글자수 카운터 실시간 갱신 |
| 2 (관심사) | 토픽 카드 선택/해제 토글, 체크 배지 나타남/사라짐 |
| 3 (키워드) | 그룹별 태그 선택, 팔로우 카운트 표시, 건너뛰기 동작 |
| 4 (읽는 방식) | 요약 깊이 단일 선택, 소비 모드 단일 선택 |
| 5 (브리핑) | 시간 선택, 음성 선택, 앱 버튼 disabled, 푸시 토글 |

---

## S-3. API 저장 확인

1. 5단계 완료 후 "Newsift 시작하기" 클릭
2. 브라우저 DevTools → Network → `POST /api/v1/me/onboarding` 요청 확인
3. Request body에 `categories`(min 3), `nickname`, `voiceEnabled`(boolean) 포함 확인
4. 응답 `200 OK`
5. `GET /api/v1/me` 재조회 → `onboardingCompleted: true` 확인

---

## S-4. 저장 실패 재시도 확인

1. DevTools → Network → `POST /api/v1/me/onboarding` 요청을 Block URL로 차단
2. "Newsift 시작하기" 클릭
3. 에러 메시지 표시 + 버튼 재활성 확인
4. Block 해제 후 재클릭 → 성공 + `/home` 이동

---

## S-5. 레이아웃 검증 (SC-006)

- viewport 1280px 이상에서 `OnboardingDesktop` 레이아웃 (`max-w-[940px]` 중앙 카드) 확인
- 카드 높이 `min(680px, 92vh)` 동작 (작은 뷰포트에서 92vh로 제한)
- 좌측 레일 `w-[260px]` navy 배경, 단계 상태(완료/현재/대기) 시각 확인
- 1280px 미만에서 레이아웃 깨짐 없음 (데스크탑 전용이나 최소 읽기 가능해야 함)
