import { strict as assert } from 'assert';
import { sample } from 'lodash';
import { AssetLibraryID } from '../gltf/AssetLibrary';
import { ModelManifest } from '../gltf/ModelManifest';
import { gaussianRand } from '../utils/gaussianRand';
import { randomDate } from '../utils/randomDate';
import { Boost, Slot, slotToNode, Stat } from './Trait';

export class StatGenerator {
  min: number;
  max: number;
  probability: number;

  constructor(_min: number, _max: number = 0, _probability = 1.0) {
    this.min = _min;
    this.max = _probability >= 1 ? _min : _max;
    this.probability = _probability;
  }

  generate(): number {
    return Math.random() > this.probability
      ? 0
      : this.min + gaussianRand() * (this.max - this.min);
  }
}

export function createStatGenerator(
  _min: number,
  _max: number = 0,
  _probability = 1.0,
): StatGenerator {
  return new StatGenerator(_min, _max, _probability);
}

export interface SuitPart {
  name: string;
  slot: Slot;
  stats?: { [key in Stat]?: StatGenerator };
  boosts?: { [key in Boost]?: StatGenerator };
  assetId: AssetLibraryID;
}

export interface SuitProps {
  name: string;
  parts: SuitPart[];
  height: number;
  dom: StatGenerator;
  pom: string[];
}

export class Suit implements SuitProps {
  name: string = '';
  parts: SuitPart[] = [];
  height: number = 0;
  dom: StatGenerator = new StatGenerator(0);
  pom: string[] = [];

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
    assert(this.pom.length > 0);
    return sample(this.pom)!;
  }

  getStat(stat: Stat): number {
    let s = 0;
    for (const p of this.parts) {
      if (p.stats && stat in p.stats) {
        const s_ = p.stats[stat]?.generate() || 0;
        s += s_;
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
      if (!p.boosts) {
        continue;
      }
      for (const key in p.boosts) {
        const boost = key as Boost;
        boosts[boost] = Math.round(
          (boosts[boost] || 0) + (p.boosts[boost]?.generate() || 0),
        );
      }
    }

    return boosts;
  }

  toManifests(): ModelManifest[] {
    let raw = this.parts.map((p) => {
      return {
        assetId: p.assetId,
        nodes: [slotToNode(p.slot)],
      };
    });

    const processed: ModelManifest[] = [];

    while (raw.length > 0) {
      const curr = raw.pop()!;
      for (const other of raw) {
        if (other.assetId === curr.assetId) {
          curr.nodes.push(...other.nodes);
        }
      }
      processed.push(curr);
      raw = raw.filter((m) => m.assetId !== curr.assetId);
    }
    return processed;
  }
}
