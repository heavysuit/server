import { createStatGenerator as _, Suit, SuitPart } from './Suit';
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
    [Stat.ECM]: _(10, 40),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(headRatio * totalWeight),
  },
  boosts: {
    [Boost.Recon]: _(10, 20, 0.4),
  },
  assetId: 'M3',
};

const torso: SuitPart = {
  name: 'Mo Wang Pilot Core Reactor',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(10, 40),
    [Stat.EnergyDemand]: _(-50, -20),
    [Stat.Weight]: _(torsoRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(10, 20, 0.1),
  },
  assetId: 'M3',
};

const legs: SuitPart = {
  name: 'Mo Wang Long March Shock Absorber',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(30, 50),
    [Stat.Mobility]: _(30, 50),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M3',
};

const leftArm: SuitPart = {
  name: 'Mo Wang Left Manipulator',
  slot: Slot.LeftArm,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  assetId: 'M3',
};

const rightArm: SuitPart = {
  name: 'Mo Wang Right Manipulator',
  slot: Slot.RightArm,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  assetId: 'M3',
};

export const MoWang = new Suit({
  name: 'Mo Wang',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 8.71,
  dom: _(new Date('2212/02/01').getTime(), new Date('2227/02/01').getTime()),
  pom: ['Hanzhou, China', 'Shanghai, China', 'Nanjing, China'],
});
