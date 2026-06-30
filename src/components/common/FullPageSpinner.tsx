import { Icon } from "@/components/ui";

export default function FullPageSpinner() {
  return (
    <div
      role="status"
      aria-label="페이지 로딩 중"
      className="flex h-screen items-center justify-center bg-canvas"
    >
      <Icon
        name="Loader2"
        size={32}
        className="animate-spin text-brand"
        aria-hidden="true"
      />
    </div>
  );
}
