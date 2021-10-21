import { Suit, SuitPart } from './Suit';
import { Boost, Slot, Stat } from './Trait';

const totalWeight = 34.1;
const headRatio = 0.04;
const torsoRatio = 0.43;
const leftArmRatio = 0.08;
const rightArmRatio = 0.08;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Mo Wang Primary Sensor Array',
  slot: Slot.Head,
  stats: {
    [Stat.ECM]: { min: 10, max: 40 },
    [Stat.EnergyDemand]: 10,
    [Stat.Weight]: headRatio * totalWeight,
  },
  boosts: {
    [Boost.Recon]: { min: 10, max: 20, probability: 0.4 },
  },
};

const torso: SuitPart = {
  name: 'Mo Wang Pilot Core Reactor',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: { min: 10, max: 40 },
    [Stat.EnergyDemand]: { min: -50, max: -20 },
    [Stat.Weight]: torsoRatio * totalWeight,
  },
  boosts: {
    [Boost.ReactiveArmor]: { min: 10, max: 20, probability: 0.1 },
  },
};

const legs: SuitPart = {
  name: 'Mo Wang Long March Shock Absorber',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: { min: 30, max: 50 },
    [Stat.Mobility]: { min: 30, max: 50 },
    [Stat.Weight]: legsRatio * totalWeight,
  },
};

const leftArm: SuitPart = {
  name: 'Mo Wang Left Manipulator',
  slot: Slot.LeftArm,
  stats: {
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: leftArmRatio * totalWeight,
  },
};

const rightArm: SuitPart = {
  name: 'Mo Wang Right Manipulator',
  slot: Slot.RightArm,
  stats: {
    [Stat.EnergyDemand]: 5,
    [Stat.Weight]: rightArmRatio * totalWeight,
  },
};

export const MoWang = new Suit({
  name: 'Mo Wang',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 8.71,
  assetId: 'M3',
  dom: {
    min: new Date('2212/02/01').getTime(),
    max: new Date('2227/02/01').getTime(),
  },
  pom: ['Hanzhou, China', 'Shanghai, China'],
});
