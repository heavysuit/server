import { Boost, Slot, Stat } from '../AssetMetadata';

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
  asset?: string;
}

export interface Suit {
  name: string;
  parts: SuitPart[];
  height: number;
  asset: string;
}
