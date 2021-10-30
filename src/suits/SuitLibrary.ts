import { strict as assert } from 'assert';
import { sample as fairSample } from 'lodash';
import { Valiant } from './M1-Valiant';
import { Haganenoken } from './M2-Haganenoken';
import { MoWang } from './M3-MoWang';
import { Inferno } from './M4-Inferno';
import { Suit } from './Suit';
import { Slot } from './Trait';

export const SuitLibrary: Suit[] = [Valiant, Haganenoken, MoWang, Inferno];

class UnfairDie {
  chances: number[];
  constructor(chances: number[]) {
    this.chances = chances;
  }

  roll(): number {
    let sum = 0;
    this.chances.forEach(function (chance) {
      sum += chance;
    });
    const rand = Math.random();
    let chance = 0;
    for (let i = 0; i < this.chances.length; i++) {
      chance += this.chances[i] / sum;
      if (rand < chance) {
        return i;
      }
    }

    // should never be reached unless sum of probabilities is less than 1
    // due to all being zero or some being negative probabilities
    return -1;
  }
}

class Sampler<T> {
  sources: T[];
  die: UnfairDie | null = null;

  constructor(sources: T[]) {
    this.sources = sources;
  }

  sample(): T {
    if (this.die) {
      const i = this.die.roll();
      return this.sources[i];
    } else {
      return fairSample(this.sources)!;
    }
  }
}

export function generateRandomSuit(
  suits: Suit[] = SuitLibrary,
  chances: number[] = [],
): Suit {
  assert(suits.length > 0);

  const sampler = new Sampler(suits);
  if (chances.length > 0) {
    assert(suits.length === chances.length, 'Invalid chances');
    sampler.die = new UnfairDie(chances);
  }

  const base = sampler.sample();

  let hasHead = !!base.parts.find((p) => p.slot === Slot.Head);

  const sources: Record<Slot, Suit | null> = {
    [Slot.Head]: hasHead
      ? fairSample(
          suits
            .filter((s) => s.parts.find((p) => p.slot === Slot.Head))
            .filter(Boolean),
        )!
      : null,
    [Slot.Torso]: base,
    [Slot.LeftArm]: sampler.sample(),
    [Slot.RightArm]: sampler.sample(),
    [Slot.Legs]: sampler.sample(),
  };

  const height =
    Math.round(
      ((sources[Slot.Head]?.height || 0) * 0.1 +
        (sources[Slot.Torso]?.height || 0) * 0.4 +
        (sources[Slot.Legs]?.height || 0) * 0.5) *
        100,
    ) / 100;

  const newSuit = new Suit({
    name: '',
    parts: Object.keys(sources)
      .map((k) => k as Slot)
      .map((s) => {
        const suit = sources[s];
        const part = suit?.parts.find((p) => p.slot === s);
        return part!;
      })
      .filter(Boolean),
    height,
    pom: [
      ...(sources[Slot.Torso]?.pom || []),
      ...(sources[Slot.Head]?.pom || []),
      ...(sources[Slot.Legs]?.pom || []),
    ],
    dom: base.dom,
  });

  return newSuit;
}
