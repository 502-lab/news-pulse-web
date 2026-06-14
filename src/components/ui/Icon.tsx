import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Film,
  Filter,
  Ghost,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  Home,
  Inbox,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Mic,
  Minus,
  MoreHorizontal,
  Newspaper,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  WifiOff,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

type LucideComponent = ComponentType<LucideProps>;

const LUCIDE_MAP: Record<string, LucideComponent> = {
  grid: LayoutGrid,
  trend: TrendingUp,
  scale: Scale,
  file: FileText,
  activity: Activity,
  pulse: Activity,
  users: Users,
  lock: Lock,
  search: Search,
  bell: Bell,
  chevron: ChevronDown,
  inbox: Inbox,
  sparkles: Sparkles,
  ext: ExternalLink,
  check: Check,
  alert: AlertTriangle,
  sliders: SlidersHorizontal,
  clock: Clock,
  logout: LogOut,
  refresh: RefreshCw,
  filter: Filter,
  bookmark: Bookmark,
  more: MoreHorizontal,
  trash: Trash2,
  arrowright: ArrowRight,
  mail: Mail,
  eye: Eye,
  eyeoff: EyeOff,
  wifioff: WifiOff,
  compass: Compass,
  home: Home,
  ghost: Ghost,
  cpu: Cpu,
  globe: Globe,
  film: Film,
  heart: Heart,
  car: Car,
  bank: Landmark,
  trophy: Trophy,
  headphones: Headphones,
  help: HelpCircle,
  play: Play,
  plus: Plus,
  mic: Mic,
  article: FileText,
  calendar: Calendar,
  download: Download,
  barchart: BarChart3,
  // aliases
  Newspaper,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LayoutDashboard,
  Loader2,
  TrendingUp,
  Scale,
  Activity,
  Users,
};

const CUSTOM_ICONS: Record<string, string> = {
  arrowleft: 'M19 12H5M12 19l-7-7 7-7',
  chevright: 'M9 18l6-6-6-6',
  spark2: 'M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3z',
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  stroke?: number;
}

export default function Icon({ name, size = 18, className, stroke = 2 }: IconProps) {
  const LucideIcon = LUCIDE_MAP[name];
  if (LucideIcon) {
    return <LucideIcon size={size} className={className} strokeWidth={stroke} aria-hidden="true" />;
  }

  const customPath = CUSTOM_ICONS[name];
  if (customPath) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d={customPath} />
      </svg>
    );
  }

  return <span className={className} />;
}
