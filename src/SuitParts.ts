import { Boost, Slot, Stat } from './AssetMetadata';

interface StatGenerator {
  min: number;
  max: number;
  probability?: number;
}

export interface SuitPart {
  name: string;
  slot: Slot;
  stats?: { [key in Stat]?: StatGenerator | number };
  boosts?: { [key in Boost]?: StatGenerator | number };
}

export const SuitParts: SuitPart[] = [
  {
    name: 'Yamato Mk. II Head',
    slot: Slot.Head,
    stats: {
      [Stat.Armor]: 10,
      [Stat.ECM]: 40,
      [Stat.EnergyDemand]: 20,
      [Stat.Weight]: 20,
      [Stat.Mobility]: 10,
    },
    boosts: {
      [Boost.ReflectiveArmor]: {
        min: 0,
        max: 20,
        probability: 0.3,
      },
    },
  },
];
