import { Boost, Slot, Stat } from '../AssetMetadata';
import { Suit, SuitPart } from './Suit';

const totalWeight = 27.2;
const torsoRatio = 0.4;
const leftArmRatio = 0.2;
const rightArmRatio = 0.2;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Pilot Pit',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: { min: 5, max: 15 },
    [Stat.Weight]: torsoRatio * totalWeight,
  },
  boosts: {
    [Boost.ReflectiveArmor]: { min: 10, max: 10, probability: 0.4 },
  },
};

const legs: SuitPart = {
  name: 'Bipedal Actuator',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: 20,
    [Stat.Mobility]: { min: -30, max: -20 },
    [Stat.Weight]: legsRatio * totalWeight,
  },
};

const leftArm: SuitPart = {
  name: 'Dual Ordnance VT 76 mm',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: 30,
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: leftArmRatio * totalWeight,
  },
};

const rightArm: SuitPart = {
  name: 'Hypersonic SSM T-12',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: 25,
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: rightArmRatio * totalWeight,
  },
  boosts: {
    [Boost.FirstStrike]: { min: 10, max: 15, probability: 0.1 },
  },
};

export const Valiant: Suit = {
  name: 'Valiant',
  parts: [torso, legs, leftArm, rightArm],
  height: 9.37,
  asset: 'M1',
};
