import { sample } from 'lodash';
import { AssetID } from '../gltf/AssetLibrary';
import { gaussianRand } from '../utils/gaussianRand';
import { randomDate } from '../utils/randomDate';
import { Boost, Slot, Stat } from './Trait';

interface StatGenerator {
  min: number;
  max: number;
  probability?: number;
}

function generateStat(g: StatGenerator | number): number {
  if (typeof g === 'number') {
    return g;
  }

  return g.probability && Math.random() > g.probability
    ? 0
    : g.min + gaussianRand() * (g.max - g.min);
}

export interface SuitPart {
  name: string;
  slot: Slot;
  stats?: { [key in Stat]?: StatGenerator | number };
  boosts?: { [key in Boost]?: StatGenerator | number };
  assetId?: AssetID;
}

export interface SuitProps {
  name: string;
  parts: SuitPart[];
  height: number;
  assetId: AssetID;
  dom: StatGenerator | number;
  pom: string[] | string;
}

export class Suit implements SuitProps {
  name: string = '';
  parts: SuitPart[] = [];
  height: number = 0;
  assetId: AssetID = 'Generated';
  dom: StatGenerator | number = 0;
  pom: string[] | string = '';

  constructor(props: SuitProps) {
    Object.assign(this, props);
  }

  getDOM(): Date {
    if (typeof this.dom === 'number') {
      return new Date(this.dom);
    }
    return randomDate(new Date(this.dom.min), new Date(this.dom.max));
  }

  getPOM(): string {
    if (typeof this.pom === 'string') {
      return this.pom;
    }
    return sample(this.pom) || '';
  }

  getStat(stat: Stat): number {
    let s = 0;
    for (const p of this.parts) {
      if (p.stats && stat in p.stats) {
        const s_ = p.stats[stat];
        if (s_) {
          s += generateStat(s_);
        }
      }
    }
    return s;
  }

  getStats(): Record<Stat, number> {
    const stats: Record<Stat, number> = {
      [Stat.Armor]: 50 + this.getStat(Stat.Armor),
      [Stat.ECM]: 50 + this.getStat(Stat.ECM),
      [Stat.EnergyDemand]: 50 + this.getStat(Stat.EnergyDemand),
      [Stat.Firepower]: 50 + this.getStat(Stat.Firepower),
      [Stat.Mobility]: 50 + this.getStat(Stat.Mobility),
      [Stat.Height]: this.height,
      [Stat.Weight]: this.getStat(Stat.Weight),
    };
    return stats;
  }

  getBoosts(): Partial<Record<Boost, number>> {
    const boosts: Partial<Record<Boost, number>> = {};

    for (const p of this.parts) {
      for (const key in p.boosts) {
        const boost = key as Boost;
        const b_ = generateStat(p.boosts[boost] || 0);
        if (b_) {
          boosts[boost] = (boosts[boost] || 0) + b_;
        }
      }
    }

    return boosts;
  }
}
