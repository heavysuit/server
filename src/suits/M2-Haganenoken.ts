import { createStatGenerator as _, Suit, SuitPart } from './Suit';
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
    [Stat.ECM]: _(20, 30),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(headRatio * totalWeight),
  },
  assetId: 'M2',
};

const torso: SuitPart = {
  name: 'Haganenoken Core Fighter',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(0, 30),
    [Stat.Weight]: _(torsoRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(10, 20, 0.1),
    [Boost.Recon]: _(20, 40, 0.2),
  },
  assetId: 'M2',
};

const legs: SuitPart = {
  name: 'Haganenoken Shinpuu Runners V4',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(20, 30),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M2',
};

const leftArm: SuitPart = {
  name: 'Haganenoken Left Fist',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(20),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 40, 0.3),
  },
  assetId: 'M2',
};

const rightArm: SuitPart = {
  name: 'Haganenoken Right Fist',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(20),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 40, 0.3),
  },
  assetId: 'M2',
};

export const Haganenoken = new Suit({
  name: 'Haganenoken',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 12.51,
  dom: _(new Date('2191/02/04').getTime(), new Date('2224/07/20').getTime()),
  pom: [
    'Yokohama, Japan',
    'Tokyo, Japan',
    'Nagoya, Japan',
    'Nagasaki, Japan',
    'Fukuoka, Japan',
  ],
});
