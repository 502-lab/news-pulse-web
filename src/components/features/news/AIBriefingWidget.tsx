import { Card, CardHead } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import type { AIBriefing } from '@/mocks/newsHome.mock';

interface AIBriefingWidgetProps {
  briefing: AIBriefing;
}

export default function AIBriefingWidget({ briefing }: AIBriefingWidgetProps) {
  return (
    <Card>
      <CardHead
        title="오늘의 AI 브리핑"
        right={
          <span className="text-brand">
            <Icon name="sparkles" size={16} />
          </span>
        }
      />
      <ul className="flex flex-col gap-2.5">
        {briefing.sentences.map((sentence, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-ink-700 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0" />
            <span>{sentence}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-ink-300">{briefing.generatedAt}</p>
    </Card>
  );
}
