import { Boost, Slot, Stat } from '../AssetMetadata';
import { Suit, SuitPart } from './Suit';

const totalWeight = 30.2;
const headRatio = 0.1;
const torsoRatio = 0.4;
const leftArmRatio = 0.1;
const rightArmRatio = 0.1;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Head',
  slot: Slot.Head,
  stats: {
    [Stat.ECM]: { min: 0, max: 20 },
    [Stat.EnergyDemand]: 10,
    [Stat.Weight]: headRatio * totalWeight,
  },
};

const torso: SuitPart = {
  name: 'Core Fighter',
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
  name: 'Shinpuu Runners V4',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: 20,
    [Stat.Mobility]: { min: 20, max: 30 },
    [Stat.Weight]: legsRatio * totalWeight,
  },
};

const leftArm: SuitPart = {
  name: 'Left Fist',
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
  name: 'Right Fist',
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

export const Haganenoken: Suit = {
  name: 'Haganenoken',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 12.51,
  asset: 'M2',
};
