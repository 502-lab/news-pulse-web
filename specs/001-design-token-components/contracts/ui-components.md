# UI Component Library — Public Contract

**Version**: 001
**Export point**: `src/components/ui/index.ts`

이 문서는 `src/components/ui`의 공개 API를 정의한다. 002~007 화면 구현 시 이 계약만 참조하면 된다.

---

## Import 방법

```ts
import { Icon, Card, CardHead, CatBadge, BiasChip, StatCard,
         Segmented, StatusDot, EmptyState, NewsCard,
         ImgPlaceholder } from '@/components/ui';
```

---

## 컴포넌트 인터페이스

### `<Icon>`

```ts
interface IconProps {
  name: string;       // 지원 이름 목록은 아래 참조
  size?: number;      // 기본값: 18
  className?: string;
  stroke?: number;    // strokeWidth, 기본값: 2
}
```

**지원 아이콘 이름** (44개):
`grid` `trend` `scale` `file` `activity` `users` `lock` `search` `bell`
`chevron` `inbox` `sparkles` `ext` `check` `alert` `sliders` `clock`
`logout` `refresh` `filter` `bookmark` `more` `arrowleft` `chevright`
`arrowright` `mail` `eye` `eyeoff` `wifioff` `compass` `home` `ghost`
`cpu` `globe` `film` `heart` `car` `bank` `trophy` `headphones`
`play` `plus` `mic` `article`

미지원 이름 → 에러 없이 빈 `<span>` 반환.

---

### `<Card>`

```ts
interface CardProps {
  children: ReactNode;
  className?: string;
  pad?: boolean;    // 기본값: true  (false = 차트 풀블리드용, padding 없음)
  hover?: boolean;  // 기본값: false (true = 마우스오버 brand border + shadow)
}
```

---

### `<CardHead>`

```ts
interface CardHeadProps {
  title: string;
  sub?: string;       // 부제, 선택
  right?: ReactNode;  // 우측 영역 (버튼, Segmented 등)
}
```

---

### `<CatBadge>`

```ts
interface CatBadgeProps {
  cat: string;   // 빈 문자열 → 렌더 없음 / 미지원 값 → 폴백 색상
  sm?: boolean;  // 기본값: false (소형 뱃지)
}
```

---

### `<BiasChip>`

```ts
interface BiasChipProps {
  score: number;  // 음수=진보, 0=중립(수치 미표시), 양수=보수, ±10 경계
}
```

---

### `<StatCard>`

```ts
interface StatCardProps {
  data: StatCardData;   // src/types/news.ts 참조
  loading?: boolean;    // 기본값: false (true = shimmer skeleton)
}
```

---

### `<Segmented>`

```ts
type SegmentedOption = string | { v: string; label: string };

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';  // 기본값: 'md'
}
```

---

### `<StatusDot>`

```ts
type StatusType = 'running' | 'idle' | 'warning' | 'error';

interface StatusDotProps {
  status: StatusType;
}
```

---

### `<EmptyState>`

```ts
interface EmptyStateProps {
  title: string;
  sub: string;
  action?: ReactNode;  // CTA 버튼 등 선택
}
```

---

### `<NewsCard>`

```ts
interface NewsCardProps {
  a: NewsItem;              // src/types/news.ts 참조
  onOpen?: (a: NewsItem) => void;
  dense?: boolean;          // 기본값: false (true = p-3.5, false = p-4)
}
```

---

### `<ImgPlaceholder>`

```ts
interface ImgPlaceholderProps {
  label: string;
  className?: string;
  ratio?: string;  // CSS aspect-ratio (예: '16/8'). 미지정 시 height 기반
}
```

---

## 타입 export

```ts
// src/types/news.ts
export interface NewsItem { ... }
export interface StatCardData { ... }
```

```ts
// src/constants/categories.ts
export const CAT_COLOR: Record<string, { fg: string; bg: string; dot: string }>;
export const CAT_FALLBACK: { fg: string; bg: string; dot: string };
```
