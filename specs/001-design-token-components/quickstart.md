# Quickstart Validation Guide: 디자인 토큰 & 컴포넌트 시스템

**목적**: Task 001-01~001-15 완료 후, 모든 산출물이 올바르게 동작하는지 검증하는 실행 가이드.

---

## 전제 조건

- `pnpm install` 완료
- `lucide-react` 설치 확인: `pnpm list lucide-react`
- `index.html`에 Pretendard CDN link 태그 존재 확인

---

## 1. 빌드 검증

```bash
# TypeScript 타입 에러 0건 확인
pnpm tsc --noEmit

# 빌드 에러 0건 확인
pnpm build
```

**기대 결과**: 에러 없이 완료.

---

## 2. 개발 서버 기동

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173` 열기.

---

## 3. 컴포넌트 시각 검증

`src/App.tsx`를 임시로 아래 내용으로 교체해 모든 컴포넌트를 한 화면에서 확인한다. 검증 후 원래 내용으로 복원.

```tsx
// 임시 검증용 — 검증 완료 후 삭제
import { Icon, Card, CardHead, CatBadge, BiasChip, StatCard,
         Segmented, StatusDot, EmptyState, NewsCard } from '@/components/ui';
import { useState } from 'react';

export default function App() {
  const [seg, setSeg] = useState('week');
  const mockNews = {
    id: '1', title: '인공지능이 뉴스 편집을 대체할 수 있을까? 전문가들의 다양한 의견',
    source: '테크크런치', cat: '기술', bias: -23, time: '3시간 전', reads: 1240
  };

  return (
    <div className="p-8 bg-canvas min-h-screen space-y-6">
      {/* 아이콘 44개 */}
      <Card><CardHead title="Icon 시스템" />
        <div className="flex flex-wrap gap-3">
          {['grid','trend','scale','file','activity','users','lock','search','bell',
            'chevron','inbox','sparkles','ext','check','alert','sliders','clock',
            'logout','refresh','filter','bookmark','more','arrowleft','chevright',
            'arrowright','mail','eye','eyeoff','wifioff','compass','home','ghost',
            'cpu','globe','film','heart','car','bank','trophy','headphones',
            'play','plus','mic','article'].map(n => (
            <div key={n} className="flex flex-col items-center gap-1 text-[10px] text-ink-400">
              <Icon name={n} size={20} className="text-ink-600" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* CatBadge — 5종 + 폴백 + 빈 문자열 */}
      <Card><CardHead title="CatBadge" />
        <div className="flex flex-wrap gap-2">
          {['기술','경제','정치','스포츠','문화','알수없음',''].map((c,i) =>
            <CatBadge key={i} cat={c} />
          )}
        </div>
      </Card>

      {/* BiasChip — 진보/중립/보수 */}
      <Card><CardHead title="BiasChip" />
        <div className="flex gap-3">
          <BiasChip score={-23} />
          <BiasChip score={0} />
          <BiasChip score={41} />
        </div>
      </Card>

      {/* StatCard — loading 및 실제 */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard loading data={{ label:'로딩중', sub:'...', value:0, delta:0, fmt:'int', icon:'activity', tone:'brand' }} />
        <StatCard data={{ label:'오늘의 기사', sub:'전일 대비 +12%', value:2840, delta:12.3, fmt:'int', icon:'file', tone:'ok' }} />
      </div>

      {/* Segmented */}
      <Card><CardHead title="Segmented" />
        <div className="flex gap-4">
          <Segmented options={['today','week','month']} value={seg} onChange={setSeg} size="sm" />
          <Segmented options={[{v:'a',label:'항목 A'},{v:'b',label:'항목 B'}]} value="a" onChange={()=>{}} size="md" />
        </div>
      </Card>

      {/* StatusDot */}
      <Card><CardHead title="StatusDot" />
        <div className="flex gap-6">
          {(['running','idle','warning','error'] as const).map(s =>
            <StatusDot key={s} status={s} />
          )}
        </div>
      </Card>

      {/* NewsCard — 기본 + dense */}
      <div className="grid grid-cols-2 gap-4">
        <NewsCard a={mockNews} onOpen={(a) => alert(a.id)} />
        <NewsCard a={{...mockNews, cat:'경제', bias:15}} dense />
      </div>

      {/* EmptyState */}
      <EmptyState title="검색 결과 없음" sub="다른 키워드로 검색해보세요."
        action={<button className="px-4 py-2 bg-brand text-white rounded-btn text-sm">홈으로</button>} />

      {/* Card — pad=false, hover=true */}
      <div className="grid grid-cols-2 gap-4">
        <Card pad={false} className="h-24 bg-stripes"><div className="p-4 text-ink-400 text-sm">pad=false (차트용)</div></Card>
        <Card hover className="h-24 flex items-center justify-center text-ink-400 text-sm">hover=true 마우스 올려보세요</Card>
      </div>
    </div>
  );
}
```

---

## 4. 검증 체크리스트

### 토큰
- [ ] `bg-brand` 클래스 → `#6366F1` 배경색 렌더링
- [ ] `rounded-card` → 12px border-radius
- [ ] `shadow-cardhover` → hover 시 brand 색조 그림자
- [ ] 브라우저 폰트 inspector에서 Pretendard Variable 로드 확인

### 아이콘
- [ ] 44개 아이콘 모두 아이콘 영역에 표시됨
- [ ] `name="nonexistent"` → 빈 공간, 에러 없음

### CatBadge
- [ ] 기술(인디고), 경제(시안), 정치(앰버), 스포츠(그린), 문화(핑크) 색상 확인
- [ ] `cat="알수없음"` → 회색 폴백
- [ ] `cat=""` → 렌더 없음 (빈칸)

### BiasChip
- [ ] `-23` → "진보 -23" (파란색)
- [ ] `0` → "중립" (수치 없음, 회색)
- [ ] `41` → "보수 +41" (빨간색)

### StatCard
- [ ] loading=true → shimmer skeleton 3개 영역
- [ ] loading=false → 수치 2,840 / delta +12.3% 녹색 ▲
- [ ] delta 음수 → 빨간색 ▼

### Segmented
- [ ] sm/md 두 사이즈 높이 차이 확인
- [ ] 탭 클릭 시 활성 탭 흰색 배경 전환

### StatusDot
- [ ] running → 녹색 + ping 애니메이션
- [ ] idle → 회색, 애니메이션 없음
- [ ] warning → 앰버 + ping
- [ ] error → 빨간색 + ping

### NewsCard
- [ ] 기본 버전: ImgPlaceholder + CatBadge + BiasChip + 제목(2줄 clamp) + 메타
- [ ] 긴 제목 → 2줄 이후 말줄임 확인
- [ ] 클릭 시 alert(id) 동작 (onOpen 콜백)
- [ ] dense=true → 패딩 더 좁음

### EmptyState
- [ ] 아이콘 + 제목 + 설명 + "홈으로" 버튼 표시
- [ ] fadeup 애니메이션 (새로고침 후 확인)

### Card 변형
- [ ] pad=false → 내부 padding 없이 stripes 패턴이 엣지까지 채워짐
- [ ] hover=true → 마우스오버 시 border 색상 + 그림자 전환

---

## 5. TypeScript 최종 확인

```bash
pnpm tsc --noEmit
```

에러 0건이면 Task 001 완료.
