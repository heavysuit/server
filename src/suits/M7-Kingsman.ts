import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 25.2;
const headRatio = 0.1;
const torsoRatio = 0.3;
const leftArmRatio = 0.18;
const rightArmRatio = 0.1;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Kingsman Visor',
  slot: Slot.Head,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(headRatio * totalWeight),
  },
  assetId: 'M7',
};

const torso: SuitPart = {
  name: 'Kingsman Chest Plate',
  slot: Slot.Torso,
  stats: {
    [Stat.EnergyDemand]: _(-5),
    [Stat.Armor]: _(20, 40),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.ECM]: _(5, 15),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(10, 20, 0.1),
  },
  assetId: 'M7',
};

const legs: SuitPart = {
  name: 'Kingsman Leg Guard',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(30, 40),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M7',
};

const leftArm: SuitPart = {
  name: 'Kingsman Shield of Honour',
  slot: Slot.LeftArm,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 40, 0.3),
    [Boost.ReactiveArmor]: _(20, 50, 0.5),
  },
  assetId: 'M7',
};

const rightArm: SuitPart = {
  name: 'Kingsman Right Hand',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(20),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 40, 0.3),
  },
  assetId: 'M7',
};

export const Kingsman = new Suit({
  name: 'Kingsman',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 10.86,
  dom: _(new Date('2171/08/09').getTime(), new Date('2227/04/20').getTime()),
  pom: [
    'Singapore, Pacific Commonwealth',
    'Sydney, Pacific Commonwealth',
    'Canberra, Pacific Commonwealth',
    'Darwin, Pacific Commonwealth',
    'Perth, Pacific Commonwealth',
    'Brisbane, Pacific Commonwealth',
    'Auckland, Pacific Commonwealth',
    'Wellington, Pacific Commonwealth',
  ],
});
