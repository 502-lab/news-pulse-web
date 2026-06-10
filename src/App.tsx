import { useState } from 'react';
import {
  Icon,
  Card,
  CardHead,
  CatBadge,
  BiasChip,
  StatCard,
  Segmented,
  StatusDot,
  EmptyState,
  NewsCard,
} from '@/components/ui';

export default function App() {
  const [seg, setSeg] = useState('week');
  const mockNews = {
    id: '1',
    title: '인공지능이 뉴스 편집을 대체할 수 있을까? 전문가들의 다양한 의견',
    source: '테크크런치',
    cat: '기술',
    bias: -23,
    time: '3시간 전',
    reads: 1240,
  };

  return (
    <div className="p-8 bg-canvas min-h-screen space-y-6">
      <Card>
        <CardHead title="Icon 시스템" />
        <div className="flex flex-wrap gap-3">
          {[
            'grid', 'trend', 'scale', 'file', 'activity', 'users', 'lock', 'search', 'bell',
            'chevron', 'inbox', 'sparkles', 'ext', 'check', 'alert', 'sliders', 'clock',
            'logout', 'refresh', 'filter', 'bookmark', 'more', 'arrowleft', 'chevright',
            'arrowright', 'mail', 'eye', 'eyeoff', 'wifioff', 'compass', 'home', 'ghost',
            'cpu', 'globe', 'film', 'heart', 'car', 'bank', 'trophy', 'headphones',
            'play', 'plus', 'mic', 'article',
          ].map((n) => (
            <div key={n} className="flex flex-col items-center gap-1 text-[10px] text-ink-400">
              <Icon name={n} size={20} className="text-ink-600" />
              <span>{n}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="CatBadge" />
        <div className="flex flex-wrap gap-2">
          {['기술', '경제', '정치', '스포츠', '문화', '알수없음', ''].map((c, i) => (
            <CatBadge key={i} cat={c} />
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="BiasChip" />
        <div className="flex gap-3">
          <BiasChip score={-23} />
          <BiasChip score={0} />
          <BiasChip score={41} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          loading
          data={{ label: '로딩중', sub: '...', value: 0, delta: 0, fmt: 'int', icon: 'activity', tone: 'brand' }}
        />
        <StatCard
          data={{ label: '오늘의 기사', sub: '전일 대비 +12%', value: 2840, delta: 12.3, fmt: 'int', icon: 'file', tone: 'ok' }}
        />
      </div>

      <Card>
        <CardHead title="Segmented" />
        <div className="flex gap-4">
          <Segmented options={['today', 'week', 'month']} value={seg} onChange={setSeg} size="sm" />
          <Segmented
            options={[{ v: 'a', label: '항목 A' }, { v: 'b', label: '항목 B' }]}
            value="a"
            onChange={() => {}}
            size="md"
          />
        </div>
      </Card>

      <Card>
        <CardHead title="StatusDot" />
        <div className="flex gap-6">
          {(['running', 'idle', 'warning', 'error'] as const).map((s) => (
            <StatusDot key={s} status={s} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <NewsCard a={mockNews} onOpen={(a) => alert(a.id)} />
        <NewsCard a={{ ...mockNews, cat: '경제', bias: 15 }} dense />
      </div>

      <EmptyState
        title="검색 결과 없음"
        sub="다른 키워드로 검색해보세요."
        action={
          <button type="button" className="px-4 py-2 bg-brand text-white rounded-btn text-sm">
            홈으로
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Card pad={false} className="h-24 stripes">
          <div className="p-4 text-ink-400 text-sm">pad=false (차트용)</div>
        </Card>
        <Card hover className="h-24 flex items-center justify-center text-ink-400 text-sm">
          hover=true 마우스 올려보세요
        </Card>
      </div>
    </div>
  );
}
