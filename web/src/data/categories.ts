import type { Category, Province } from '../types'

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
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Leaks, geysers, blocked drains, bathrooms' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, DB boards, COCs, fault finding' },
  { id: 'solar', name: 'Solar & Inverters', icon: '☀️', description: 'Panels, inverters, batteries, backup power' },
  { id: 'handyman', name: 'Handyman', icon: '🛠️', description: 'Odd jobs, repairs, assembly, mounting' },
  { id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior, exterior, waterproofing' },
  { id: 'builder', name: 'Builder', icon: '🧱', description: 'Extensions, renovations, paving, walls' },
  { id: 'gate-motor', name: 'Gate Motors & Garage Doors', icon: '🚪', description: 'Installs, repairs, remotes, batteries' },
  { id: 'locksmith', name: 'Locksmith', icon: '🔑', description: 'Lockouts, new locks, safes, security gates' },
  { id: 'gardener', name: 'Garden Services', icon: '🌿', description: 'Lawns, trimming, refuse removal, landscaping' },
  { id: 'cleaner', name: 'Cleaning', icon: '🧽', description: 'Home cleaning, carpets, move-in/out' },
  { id: 'pest-control', name: 'Pest Control', icon: '🐜', description: 'Termites, rodents, cockroaches, fumigation' },
  { id: 'pool', name: 'Pool Services', icon: '🏊', description: 'Cleaning, pumps, repairs, green pools' },
  { id: 'aircon', name: 'Aircon & Refrigeration', icon: '❄️', description: 'Installs, servicing, regassing' },
  { id: 'roofer', name: 'Roofing', icon: '🏠', description: 'Leaks, tiles, gutters, waterproofing' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', description: 'Fridges, washing machines, stoves' },
  { id: 'dstv', name: 'DSTV & TV Installers', icon: '📡', description: 'Dish installs, aligning, TV mounting' },
  { id: 'movers', name: 'Movers', icon: '🚚', description: 'Home & office moves, bakkie hire' },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚', description: 'Cupboards, doors, decking, kitchens' },
]

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
