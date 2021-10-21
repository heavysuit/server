import { Suit, SuitPart } from './Suit';
import { Boost, Slot, Stat } from './Trait';

const totalWeight = 30.2;
const headRatio = 0.1;
const torsoRatio = 0.4;
const leftArmRatio = 0.1;
const rightArmRatio = 0.1;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Haganenoken Head',
  slot: Slot.Head,
  stats: {
    [Stat.ECM]: { min: 0, max: 20 },
    [Stat.EnergyDemand]: 10,
    [Stat.Weight]: headRatio * totalWeight,
  },
};

const torso: SuitPart = {
  name: 'Haganenoken Core Fighter',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: { min: 0, max: 30 },
    [Stat.Weight]: torsoRatio * totalWeight,
  },
  boosts: {
    [Boost.ReactiveArmor]: { min: 10, max: 20, probability: 0.1 },
    [Boost.Recon]: { min: 20, max: 40, probability: 0.2 },
  },
};

const legs: SuitPart = {
  name: 'Haganenoken Shinpuu Runners V4',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: 20,
    [Stat.Mobility]: { min: 20, max: 30 },
    [Stat.Weight]: legsRatio * totalWeight,
  },
};

const leftArm: SuitPart = {
  name: 'Haganenoken Left Fist',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: 20,
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: leftArmRatio * totalWeight,
  },
  boosts: {
    [Boost.CloseQuarters]: { min: 10, max: 40, probability: 0.3 },
  },
};

const rightArm: SuitPart = {
  name: 'Haganenoken Right Fist',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: 20,
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: rightArmRatio * totalWeight,
  },
  boosts: {
    [Boost.CloseQuarters]: { min: 10, max: 40, probability: 0.3 },
  },
};

export const Haganenoken = new Suit({
  name: 'Haganenoken',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 12.51,
  assetId: 'M2',
  dom: {
    min: new Date('2191/02/04').getTime(),
    max: new Date('2224/07/20').getTime(),
  },
  pom: ['Yokohama, Japan', 'Tokyo, Japan', 'Nagoya, Japan'],
});
