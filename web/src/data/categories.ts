import type { Category, Province, ReviewTag } from '../types'

export const PROVINCES: Province[] = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
]

export const CATEGORIES: Category[] = [
  { id: 'plumber', name: 'Plumber', description: 'Leaks, geysers, blocked drains, bathrooms' },
  { id: 'electrician', name: 'Electrician', description: 'Wiring, DB boards, COCs, fault finding' },
  { id: 'solar', name: 'Solar & Inverters', description: 'Panels, inverters, batteries, backup power' },
  { id: 'handyman', name: 'Handyman', description: 'Odd jobs, repairs, assembly, mounting' },
  { id: 'painter', name: 'Painter', description: 'Interior, exterior, waterproofing' },
  { id: 'builder', name: 'Builder', description: 'Extensions, renovations, paving, walls' },
  { id: 'gate-motor', name: 'Gate Motors & Garage Doors', description: 'Installs, repairs, remotes, batteries' },
  { id: 'locksmith', name: 'Locksmith', description: 'Lockouts, new locks, safes, security gates' },
  { id: 'gardener', name: 'Garden Services', description: 'Lawns, trimming, refuse removal, landscaping' },
  { id: 'cleaner', name: 'Cleaning', description: 'Home cleaning, carpets, move-in/out' },
  { id: 'pest-control', name: 'Pest Control', description: 'Termites, rodents, cockroaches, fumigation' },
  { id: 'pool', name: 'Pool Services', description: 'Cleaning, pumps, repairs, green pools' },
  { id: 'aircon', name: 'Aircon & Refrigeration', description: 'Installs, servicing, regassing' },
  { id: 'roofer', name: 'Roofing', description: 'Leaks, tiles, gutters, waterproofing' },
  { id: 'appliance', name: 'Appliance Repair', description: 'Fridges, washing machines, stoves' },
  { id: 'dstv', name: 'DSTV & TV Installers', description: 'Dish installs, aligning, TV mounting' },
  { id: 'movers', name: 'Movers', description: 'Home & office moves, bakkie hire' },
  { id: 'carpenter', name: 'Carpenter', description: 'Cupboards, doors, decking, kitchens' },
]

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export const REVIEW_TAGS: { id: ReviewTag; label: string }[] = [
  { id: 'on_time', label: 'On time' },
  { id: 'fair_price', label: 'Fair price' },
  { id: 'quality', label: 'Quality work' },
  { id: 'tidy', label: 'Tidy' },
  { id: 'communication', label: 'Good communication' },
  { id: 'friendly', label: 'Friendly' },
]

export interface Emergency {
  id: string
  label: string
  hint: string
  categoryId: string
}

export const EMERGENCIES: Emergency[] = [
  { id: 'burst-pipe', label: 'Burst pipe or geyser', hint: 'Water everywhere, leaking geyser', categoryId: 'plumber' },
  { id: 'no-power', label: 'No power', hint: 'Tripping DB, sparks, burning smell', categoryId: 'electrician' },
  { id: 'locked-out', label: 'Locked out', hint: 'Lost keys, broken lock', categoryId: 'locksmith' },
  { id: 'gate-stuck', label: 'Gate stuck', hint: 'Gate motor won’t open or close', categoryId: 'gate-motor' },
]
