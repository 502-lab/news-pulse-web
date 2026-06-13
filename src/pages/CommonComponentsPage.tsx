import { useState } from 'react';
import {
  Icon, Card, CardHead, CatBadge, BiasChip, StatCard, Segmented,
  StatusDot, EmptyState, NewsCard, Button, Toggle, showToast, ToastHost,
} from '@/components/ui';
import type { StatCardData } from '@/types/news';

/* ── 토큰 데이터 ── */
const COLORS = [
  {
    group: 'Primary — Brand',
    rows: [
      { name: 'brand', hex: '#6366F1', use: 'primary 액션·링크·활성탭' },
      { name: 'brand-600', hex: '#5457E5', use: 'primary hover' },
      { name: 'brand-700', hex: '#4548C9', use: 'primary pressed' },
      { name: 'brand-50', hex: '#EEF0FF', use: 'primary 배경(칩·뱃지)' },
      { name: 'brand-100', hex: '#E0E2FF', use: 'primary 연한 배경' },
    ],
  },
  {
    group: 'Neutral — Ink',
    rows: [
      { name: 'ink', hex: '#0F172A', use: '본문·제목 텍스트' },
      { name: 'ink-700', hex: '#334155', use: '보조 텍스트(진함)' },
      { name: 'ink-500', hex: '#64748B', use: '보조 텍스트' },
      { name: 'ink-400', hex: '#94A3B8', use: '캡션·placeholder' },
      { name: 'ink-300', hex: '#CBD5E1', use: '비활성·아이콘' },
      { name: 'ink-200', hex: '#E2E8F0', use: '보더' },
      { name: 'ink-100', hex: '#F1F5F9', use: '구분선·트랙 배경' },
      { name: 'canvas', hex: '#F8FAFC', use: '페이지 배경' },
    ],
  },
  {
    group: 'Navy — Dark Surface',
    rows: [
      { name: 'navy', hex: '#0F172A', use: '사이드바·다크 배너' },
      { name: 'navy-800', hex: '#1E293B', use: '다크 hover' },
      { name: 'navy-600', hex: '#475569', use: '다크 위 보조 텍스트' },
    ],
  },
  {
    group: 'Semantic',
    rows: [
      { name: 'cyan', hex: '#06B6D4', use: 'accent(공유·보조 지표)' },
      { name: 'ok', hex: '#10B981', use: '성공·정상·증가' },
      { name: 'warn', hex: '#F59E0B', use: '경고·대기' },
      { name: 'danger', hex: '#EF4444', use: '에러·위험·감소' },
    ],
  },
  {
    group: 'Category',
    rows: [
      { name: '기술', hex: '#6366F1', use: '기술 카테고리' },
      { name: '경제', hex: '#06B6D4', use: '경제 카테고리' },
      { name: '정치', hex: '#F59E0B', use: '정치 카테고리' },
      { name: '스포츠', hex: '#10B981', use: '스포츠 카테고리' },
      { name: '문화', hex: '#EC4899', use: '문화 카테고리' },
    ],
  },
  {
    group: 'Bias',
    rows: [
      { name: 'bias-left', hex: '#3B82F6', use: '진보 성향' },
      { name: 'bias-neutral', hex: '#64748B', use: '중립' },
      { name: 'bias-right', hex: '#EF4444', use: '보수 성향' },
    ],
  },
];

const TYPE_SCALE: [string, number, number, number, string][] = [
  ['display-lg', 34, 800, 1.25, '인증/브리핑 헤드라인 (.display)'],
  ['display',    27, 800, 1.25, '기사 상세 제목'],
  ['heading',    19, 800, 1.3,  '섹션·패널 제목'],
  ['title',      16, 800, 1.3,  '헤더 제목·카드 제목'],
  ['subtitle',   15, 700, 1.4,  '카드 헤더'],
  ['body-lg',    15, 500, 1.85, '기사 본문'],
  ['body',       14, 500, 1.6,  '기본 본문·카드 텍스트'],
  ['body-sm',    13, 500, 1.5,  '메타·보조 본문'],
  ['caption',    12, 500, 1.4,  '캡션·부제·라벨'],
  ['micro',      11, 700, 1.3,  '뱃지·태그·오버라인'],
  ['numeric',    14, 700, 1.0,  '수치 (tabular-nums)'],
];

const RADIUS_TOKENS = [
  { name: 'input', px: 4, use: '인풋' },
  { name: 'btn',   px: 6, use: '버튼·칩·태그' },
  { name: 'card',  px: 8, use: '카드·패널' },
];

const SHADOW_TOKENS = [
  { name: 'shadow-card',      val: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)', use: '카드 기본' },
  { name: 'shadow-cardhover', val: '0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.08)', use: '카드 hover' },
  { name: 'shadow-pop',       val: '0 8px 28px rgba(15,23,42,.16)', use: '모달·드롭다운·토스트' },
];

const ALL_ICONS = [
  'grid', 'trend', 'scale', 'file', 'activity', 'pulse', 'users', 'lock', 'search', 'bell',
  'chevron', 'inbox', 'sparkles', 'ext', 'check', 'alert', 'sliders', 'clock', 'logout',
  'refresh', 'filter', 'bookmark', 'more', 'trash', 'arrowleft', 'chevright', 'arrowright',
  'mail', 'eye', 'eyeoff', 'wifioff', 'compass', 'home', 'ghost', 'cpu', 'globe', 'film',
  'heart', 'car', 'bank', 'trophy', 'headphones', 'help', 'play', 'plus', 'mic', 'article',
  'calendar', 'download', 'barchart', 'spark2',
];

const STAT_CARDS: StatCardData[] = [
  { label: '오늘 수집 기사', sub: 'Articles collected', value: 1284, delta: 12.4, fmt: 'int', icon: 'inbox',    tone: 'brand' },
  { label: 'AI 요약 완료',   sub: 'Summaries done',    value: 1107, delta: 8.1,  fmt: 'int', icon: 'sparkles', tone: 'cyan'  },
  { label: '가용성 (Uptime)', sub: 'Last 30 days',     value: 99.82, delta: 0.06, fmt: 'pct', icon: 'pulse',   tone: 'ok'   },
  { label: '구독자',          sub: 'Active subscribers', value: 8432, delta: 3.7, fmt: 'int', icon: 'users',   tone: 'warn'  },
];

const MOCK_ARTICLE = {
  id: 'a1',
  cat: '기술',
  title: '삼성전자, 차세대 2nm GAA 공정 양산 공식화… 파운드리 점유율 반등 노린다',
  source: '연합뉴스',
  time: '12분 전',
  bias: -6,
  reads: 24100,
};

const TOC = [
  ['colors',    '컬러'],
  ['type',      '타이포그래피'],
  ['tokens',    '스페이싱·반경·그림자'],
  ['icons',     '아이콘'],
  ['buttons',   '버튼'],
  ['inputs',    '인풋·폼'],
  ['badges',    '뱃지·칩·상태'],
  ['tabs',      '탭·세그먼트'],
  ['cards',     '카드'],
  ['feedback',  '피드백'],
];

/* ── 헬퍼 컴포넌트 ── */
function Section({ id, n, title, desc, children }: {
  id: string; n: string; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-20">
      <div className="flex items-baseline gap-3 mb-1.5">
        <span className="text-[12px] font-extrabold tnum text-brand bg-brand-50 rounded-md w-7 h-7 inline-flex items-center justify-center shrink-0">
          {n}
        </span>
        <h2 className="text-[22px] font-extrabold text-ink tracking-tight">{title}</h2>
      </div>
      {desc && (
        <p className="text-[13.5px] text-ink-500 mb-6 ml-10 max-w-2xl leading-relaxed">{desc}</p>
      )}
      <div className="ml-10">{children}</div>
    </section>
  );
}

function Demo({ children, dark, label }: { children: React.ReactNode; dark?: boolean; label?: string }) {
  return (
    <div className="mb-6">
      {label && (
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">{label}</div>
      )}
      <div className={`rounded-card border border-ink-200 p-5 flex flex-wrap items-center gap-4 ${dark ? 'bg-navy' : 'bg-canvas'}`}>
        {children}
      </div>
    </div>
  );
}

function SpecLine({ name, props, variants, states, note }: {
  name: string; props?: string; variants?: string; states?: string; note?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[12px]">
      <span className="font-mono font-bold text-ink bg-ink-100 rounded px-2 py-0.5">{name}</span>
      {variants && <span className="text-ink-500"><b className="text-ink-700">variants:</b> {variants}</span>}
      {states && <span className="text-ink-500"><b className="text-ink-700">states:</b> {states}</span>}
      {props && <span className="text-ink-500"><b className="text-ink-700">props:</b> <span className="font-mono">{props}</span></span>}
      {note && <span className="text-ink-400">{note}</span>}
    </div>
  );
}

/* ── 인터랙티브 서브컴포넌트 ── */
function SegDemo() {
  const [v, setV] = useState('7일');
  return <Segmented value={v} onChange={setV} options={['오늘', '7일', '30일']} />;
}

function ToggleDemo() {
  const [on, setOn] = useState(true);
  return <Toggle on={on} onChange={setOn} aria-label="알림 설정" />;
}

function NewsCardSkeleton() {
  return (
    <div className="bg-white border border-ink-200 rounded-card shadow-card overflow-hidden">
      <div className="skel w-full" style={{ aspectRatio: '16/8' }} />
      <div className="p-4">
        <div className="skel h-4 w-14 rounded mb-3" />
        <div className="skel h-4 w-full rounded mb-2" />
        <div className="skel h-4 w-3/4 rounded mb-4" />
        <div className="skel h-3 w-28 rounded" />
      </div>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function CommonComponentsPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-200">
        <div className="max-w-[1080px] mx-auto px-8 h-16 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Icon name="sparkles" size={17} className="text-white" />
          </div>
          <div>
            <div className="text-[16px] font-extrabold tracking-tight leading-none">
              Newsift — Component Library
            </div>
            <div className="text-[11.5px] text-ink-400 mt-1">
              공통 컴포넌트 · 디자인 토큰 · 웹 전용 · Pretendard
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-8 py-10 flex gap-10">
        {/* 본문 */}
        <main className="flex-1 min-w-0">
          {/* 안내 배너 */}
          <p className="text-[13.5px] text-ink-600 leading-relaxed mb-10 bg-brand-50/50 border border-brand/15 rounded-card p-4">
            이 페이지는 <b>실제 프로젝트에서 사용되는</b> 공통 컴포넌트와 디자인 토큰 카탈로그입니다.
            각 컴포넌트의 <b>variant · size · 상태 · props</b>를 함께 표기했어요.
          </p>

          {/* ── 1. 컬러 ── */}
          <Section id="colors" n="1" title="컬러"
            desc="의미 기반 컬러 시스템. Tailwind 토큰명 기준 (bg-brand, text-ink-500 등으로 사용).">
            {COLORS.map(({ group, rows }) => (
              <div key={group} className="mb-6">
                <div className="text-[12.5px] font-bold text-ink-600 mb-2.5">{group}</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {rows.map(({ name, hex, use }) => (
                    <div key={name} className="flex items-center gap-3 border border-ink-200 rounded-btn p-2">
                      <span
                        className="w-10 h-10 rounded-md border border-ink-200/60 shrink-0"
                        style={{ background: hex }}
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-[12.5px] font-bold text-ink">{name}</div>
                        <div className="font-mono text-[11px] text-ink-400 uppercase">
                          {hex} · <span className="font-sans normal-case">{use}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {/* ── 2. 타이포그래피 ── */}
          <Section id="type" n="2" title="타이포그래피"
            desc="폰트: Pretendard(본문·전체). 헤드라인은 .display 클래스. 수치는 .tnum(tabular-nums).">
            <div className="border border-ink-200 rounded-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-ink-50/60 text-[11px] font-bold text-ink-400 uppercase tracking-wide">
                    <th className="px-4 py-2.5">토큰</th>
                    <th className="px-3 py-2.5">size</th>
                    <th className="px-3 py-2.5">weight</th>
                    <th className="px-3 py-2.5">line</th>
                    <th className="px-3 py-2.5">미리보기</th>
                  </tr>
                </thead>
                <tbody>
                  {TYPE_SCALE.map(([tok, size, weight, lh, use]) => (
                    <tr key={tok} className="border-t border-ink-100">
                      <td className="px-4 py-3 align-top">
                        <div className="font-mono text-[12px] font-bold text-ink">text-{tok}</div>
                        <div className="text-[11px] text-ink-400 mt-0.5">{use}</div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-ink-500 tnum align-top">{size}px</td>
                      <td className="px-3 py-3 font-mono text-[12px] text-ink-500 tnum align-top">{weight}</td>
                      <td className="px-3 py-3 font-mono text-[12px] text-ink-500 tnum align-top">{lh}</td>
                      <td className="px-3 py-3 text-ink align-top" style={{ fontSize: Math.min(size, 22), fontWeight: weight, lineHeight: lh }}>
                        Newsift 뉴스 1,284
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── 3. 스페이싱·반경·그림자 ── */}
          <Section id="tokens" n="3" title="스페이싱 · 반경 · 그림자"
            desc="4px 베이스 스페이싱. radius·elevation 토큰.">
            <Demo label="Border radius">
              {RADIUS_TOKENS.map(({ name, px, use }) => (
                <div key={name} className="text-center">
                  <div
                    className="w-14 h-14 bg-brand-50 border border-brand/30"
                    style={{ borderRadius: px }}
                  />
                  <div className="text-[11px] font-semibold text-ink mt-2">{name}</div>
                  <div className="font-mono text-[10px] text-ink-400">{px}px · {use}</div>
                </div>
              ))}
            </Demo>
            <Demo label="Shadow / elevation">
              {SHADOW_TOKENS.map(({ name, val, use }) => (
                <div key={name} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-card" style={{ boxShadow: val }} />
                  <div className="text-[11px] font-semibold text-ink mt-3">{name}</div>
                  <div className="text-[10px] text-ink-400">{use}</div>
                </div>
              ))}
            </Demo>
          </Section>

          {/* ── 4. 아이콘 ── */}
          <Section id="icons" n="4" title="아이콘"
            desc="Lucide 기반 stroke 아이콘. 기본 stroke=2, size=18. &lt;Icon name size stroke className /&gt;">
            <SpecLine name="<Icon>" props="name, size=18, stroke=2, className" note="currentColor 상속" />
            <Demo>
              {ALL_ICONS.map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5 w-14">
                  <Icon name={n} size={20} className="text-ink-700" />
                  <span className="font-mono text-[9.5px] text-ink-400 text-center break-all">{n}</span>
                </div>
              ))}
            </Demo>
          </Section>

          {/* ── 5. 버튼 ── */}
          <Section id="buttons" n="5" title="버튼"
            desc="primary / secondary / ghost / danger. size = md(기본) · sm.">
            <SpecLine
              name="<Button>"
              variants="primary · secondary · ghost · danger"
              states="default · hover · disabled"
              props="variant, size, icon, disabled, onClick"
            />
            <Demo>
              <Button variant="primary" icon="bell">지금 발송</Button>
              <Button variant="secondary" icon="filter">필터</Button>
              <Button variant="ghost">건너뛰기</Button>
              <Button variant="danger">비활성화</Button>
              <Button variant="primary" disabled>가입하기</Button>
            </Demo>
            <Demo label="size sm">
              <Button variant="primary" size="sm">저장</Button>
              <Button variant="secondary" size="sm" icon="download">CSV</Button>
            </Demo>
          </Section>

          {/* ── 6. 인풋·폼 ── */}
          <Section id="inputs" n="6" title="인풋 · 폼"
            desc="텍스트·검색 인풋, 체크박스, 라디오, 토글. focus=brand ring. error=danger border.">
            <SpecLine
              name="Input"
              states="default · focus(ring brand) · error(border danger)"
              props="icon, placeholder, value, error"
            />
            <Demo>
              <div className="relative w-56">
                <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  placeholder="기사·키워드 검색"
                  className="w-full bg-ink-50 border border-ink-200 rounded-btn pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <input
                placeholder="you@example.com"
                className="w-48 bg-white border border-ink-200 rounded-btn px-3 py-2 text-[13px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
              <input
                placeholder="에러 상태"
                className="w-40 bg-white border border-danger rounded-btn px-3 py-2 text-[13px] focus:outline-none"
              />
            </Demo>
            <Demo label="checkbox · radio · toggle">
              <span className="inline-flex items-center gap-2 text-[13px]">
                <span className="w-[18px] h-[18px] rounded-[5px] bg-brand border border-brand flex items-center justify-center">
                  <Icon name="check" size={12} className="text-white" stroke={3} />
                </span>
                선택됨
              </span>
              <span className="inline-flex items-center gap-2 text-[13px]">
                <span className="w-[18px] h-[18px] rounded-[5px] bg-white border border-ink-300" />
                미선택
              </span>
              <span className="inline-flex items-center gap-2 text-[13px]">
                <span className="w-[18px] h-[18px] rounded-full border-2 border-brand flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                </span>
                라디오 on
              </span>
              <ToggleDemo />
              <Toggle on={false} aria-label="비활성 토글" />
            </Demo>
            <Demo label="태그 인풋">
              <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-ink-200 rounded-btn w-72">
                {['jiwoo.kim@gmail.com', '광고'].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand bg-brand-50 rounded px-2 py-1"
                  >
                    {t}
                    <span className="text-brand/60">✕</span>
                  </span>
                ))}
                <input
                  placeholder="입력 후 Enter"
                  className="flex-1 min-w-[100px] text-[12.5px] focus:outline-none bg-transparent"
                />
              </div>
            </Demo>
          </Section>

          {/* ── 7. 뱃지·칩·상태 ── */}
          <Section id="badges" n="7" title="뱃지 · 칩 · 상태"
            desc="카테고리 뱃지(5색), 편향칩(진보/중립/보수), 상태 닷(4종), Role 뱃지.">
            <SpecLine name="<CatBadge>" variants="기술·경제·정치·스포츠·문화" props="cat, sm" />
            <SpecLine name="<BiasChip>" variants="진보(<-10) · 중립 · 보수(>10)" props="score(-100..100)" />
            <SpecLine name="<StatusDot>" variants="running · idle · warning · error" props="status" />
            <Demo>
              {['기술', '경제', '정치', '스포츠', '문화'].map((c) => (
                <CatBadge key={c} cat={c} />
              ))}
              <CatBadge cat="기술" sm />
            </Demo>
            <Demo>
              <BiasChip score={-32} />
              <BiasChip score={3} />
              <BiasChip score={38} />
              <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold rounded-full px-2 py-0.5 text-brand bg-brand-50">
                USER
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold rounded-full px-2 py-0.5 text-danger bg-danger/10">
                <Icon name="lock" size={10} />ADMIN
              </span>
            </Demo>
            <Demo>
              {(['running', 'idle', 'warning', 'error'] as const).map((s) => (
                <StatusDot key={s} status={s} />
              ))}
            </Demo>
          </Section>

          {/* ── 8. 탭·세그먼트 ── */}
          <Section id="tabs" n="8" title="탭 · 세그먼트"
            desc="Segmented(기간/역할 토글), 필터 칩 탭(카테고리), 언더라인 탭.">
            <SpecLine name="<Segmented>" props="options, value, onChange, size='md'|'sm'" note="배경 pill 슬라이드" />
            <Demo>
              <SegDemo />
              <div className="inline-flex p-0.5 bg-ink-100 rounded-btn">
                <span className="rounded-[5px] px-3 py-1 text-[12.5px] font-semibold bg-white text-ink shadow-sm">USER</span>
                <span className="rounded-[5px] px-3 py-1 text-[12.5px] font-semibold text-ink-500">ADMIN</span>
              </div>
            </Demo>
            <Demo label="필터 칩 탭">
              <span className="px-3.5 py-1.5 rounded-btn text-[13px] font-semibold bg-brand text-white">전체</span>
              {['기술', '경제', '정치'].map((c) => (
                <span key={c} className="px-3.5 py-1.5 rounded-btn text-[13px] font-semibold bg-white border border-ink-200 text-ink-500">{c}</span>
              ))}
            </Demo>
            <Demo label="언더라인 탭">
              <div className="flex gap-0">
                <span className="relative px-3.5 py-2 text-[14px] font-bold text-brand">
                  대시보드
                  <span className="absolute left-2 right-2 -bottom-1 h-[2.5px] rounded-full bg-brand" />
                </span>
                <span className="px-3.5 py-2 text-[14px] font-bold text-ink-400">트렌드</span>
                <span className="px-3.5 py-2 text-[14px] font-bold text-ink-400">편향 분석</span>
              </div>
            </Demo>
          </Section>

          {/* ── 9. 카드 ── */}
          <Section id="cards" n="9" title="카드"
            desc="범용 카드 셸(Card+CardHead), 지표 카드(StatCard), 뉴스 카드. hover=border brand + shadow.">
            <SpecLine name="<Card> / <CardHead>" props="pad=true, hover=false / title, sub, right" />
            <SpecLine
              name="<StatCard>"
              props="data{icon,label,sub,value,delta,fmt,tone}, loading"
              states="default · loading(skeleton)"
            />
            <div className="grid grid-cols-4 gap-4 mb-4">
              {STAT_CARDS.map((d) => (
                <StatCard key={d.label} data={d} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {STAT_CARDS.map((d) => (
                <StatCard key={d.label + '-sk'} data={d} loading />
              ))}
            </div>
            <div className="max-w-xs mb-4">
              <Card hover>
                <CardHead
                  title="패널 제목"
                  sub="Subtitle"
                  right={<span className="text-[11px] text-ink-400">우측 영역</span>}
                />
                <div className="h-14 stripes rounded-md flex items-center justify-center">
                  <span className="font-mono text-[11px] text-ink-400">content</span>
                </div>
              </Card>
            </div>
            <SpecLine name="<NewsCard>" props="a(article), onOpen, dense" note="썸네일+뱃지+제목+메타+북마크" />
            <div className="grid grid-cols-2 gap-4">
              <NewsCard a={MOCK_ARTICLE} onOpen={() => {}} />
              <NewsCardSkeleton />
            </div>
          </Section>

          {/* ── 10. 피드백 ── */}
          <Section id="feedback" n="10" title="피드백"
            desc="Toast(하단중앙·자동소멸), 스켈레톤(shimmer), 빈상태(EmptyState).">
            <SpecLine name="showToast(msg, {icon, tone})" note="ToastHost를 앱 루트에 1개 마운트" />
            <SpecLine name="<EmptyState>" props="title, sub, action?" />
            <Demo>
              <button
                onClick={() => showToast('북마크에 저장했어요', { icon: 'bookmark', tone: 'ok' })}
                className="inline-flex items-center gap-2 bg-navy text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-pop cursor-pointer"
              >
                <Icon name="check" size={15} className="text-ok" />
                Toast 미리보기 (클릭)
              </button>
              <span className="skel h-9 w-40 rounded-btn inline-block" />
              <span className="skel h-5 w-24 rounded inline-block" />
              <span className="skel h-3 w-32 rounded inline-block" />
            </Demo>
            <Demo label="빈 상태 (EmptyState)">
              <div className="w-full max-w-md mx-auto">
                <EmptyState
                  title="결과가 없어요"
                  sub="다른 키워드로 검색하거나 필터를 바꿔보세요."
                  action={
                    <Button variant="secondary" size="sm">필터 초기화</Button>
                  }
                />
              </div>
            </Demo>
          </Section>

          <footer className="border-t border-ink-200 pt-6 mt-12 text-[12px] text-ink-400">
            Newsift Component Library · 프로젝트 공통 컴포넌트 카탈로그 · 웹 전용
          </footer>
        </main>

        {/* 우측 TOC */}
        <aside className="hidden xl:block w-44 shrink-0">
          <nav className="sticky top-24 flex flex-col gap-0.5">
            <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wider mb-2">목차</div>
            {TOC.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-[12.5px] text-ink-500 hover:text-brand py-1 px-2 rounded-md hover:bg-brand-50 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      <ToastHost />
    </div>
  );
}
