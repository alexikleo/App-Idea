import {
  BrickWall,
  Bug,
  Drill,
  Fence,
  House,
  KeyRound,
  type LucideIcon,
  PaintRoller,
  Ruler,
  SatelliteDish,
  Snowflake,
  SprayCan,
  Sprout,
  Sun,
  Truck,
  WashingMachine,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  plumber: Wrench,
  electrician: Zap,
  solar: Sun,
  handyman: Drill,
  painter: PaintRoller,
  builder: BrickWall,
  'gate-motor': Fence,
  locksmith: KeyRound,
  gardener: Sprout,
  cleaner: SprayCan,
  'pest-control': Bug,
  pool: Waves,
  aircon: Snowflake,
  roofer: House,
  appliance: WashingMachine,
  dstv: SatelliteDish,
  movers: Truck,
  carpenter: Ruler,
}

export default function CategoryIcon({ id, className = 'size-5' }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Wrench
  return <Icon className={className} aria-hidden strokeWidth={1.8} />
}
