import { Icon } from '@/components/ui';

export default function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <Icon name="Loader2" size={32} className="animate-spin text-brand" />
    </div>
  );
}
