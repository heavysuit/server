import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 42.4;
const torsoRatio = 0.4;
const leftArmRatio = 0.1;
const rightArmRatio = 0.1;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Centurion Fortified Body',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(30, 40),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.Mobility]: _(-30),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(5, 20),
  },
  assetId: 'M5',
};

const legs: SuitPart = {
  name: 'Centurion Quadruped Walker',
  slot: Slot.Legs,
  stats: {
    [Stat.Armor]: _(20, 30),
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(20, 30),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(5, 10),
  },
  assetId: 'M5',
};

const leftArm: SuitPart = {
  name: 'Centurion Gladius Blaster',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(10, 15),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(5, 10),
  },
  assetId: 'M5',
};

const rightArm: SuitPart = {
  name: 'Centurion Gladius Blaster',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(10, 15),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(5, 10),
  },
  assetId: 'M5',
};

export const Centurion = new Suit({
  name: 'Centurion',
  parts: [torso, legs, leftArm, rightArm],
  height: 9.02,
  dom: _(new Date('2179/01/01').getTime(), new Date('2195/11/01').getTime()),
  pom: [
    'Essen, European Federation',
    'Dortmund, European Federation',
    'Stuttgart, European Federation',
    'Maranello, European Federation',
    'Toulouse, European Federation',
  ],
});
