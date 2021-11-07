import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 49.5;
const headRatio = 0.1;
const torsoRatio = 0.4;
const leftArmRatio = 0.1;
const rightArmRatio = 0.3;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Spade C2 Cyclopic Wide-band Detector',
  slot: Slot.Head,
  stats: {
    [Stat.ECM]: _(10, 20),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(headRatio * totalWeight),
  },
  assetId: 'M6',
};

const torso: SuitPart = {
  name: 'Spade C2 Fusion Reactor',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(10, 20),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.EnergyDemand]: _(-50, -20),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(10, 20, 0.1),
  },
  assetId: 'M6',
};

const legs: SuitPart = {
  name: 'Spade C2 Dash-Enhanced Balancer',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(25),
    [Stat.Mobility]: _(20, 50),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M6',
};

const leftArm: SuitPart = {
  name: 'Spade C2 Offspring Co. ArmPen Minigun',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(30, 40),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.ArmorPenetration]: _(10, 20, 0.2),
  },
  assetId: 'M6',
};

const rightArm: SuitPart = {
  name: 'Spade C2 Burst Powerfist',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(10, 20),
    [Stat.EnergyDemand]: _(20),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(30, 50, 0.5),
    [Boost.ReactiveArmor]: _(10, 20, 0.3),
  },
  assetId: 'M6',
};

export const SpadeC2 = new Suit({
  name: 'Spade C2',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 19.49,
  dom: _(new Date('2198/05/01').getTime(), new Date('2213/01/21').getTime()),
  pom: [
    'Sheffield, Royal Britannia',
    'Bristol, Royal Britannia',
    'Cambridge, Royal Britannia',
    'Liverpool, Royal Britannia',
    'Northampton, Royal Britannia',
  ],
});
