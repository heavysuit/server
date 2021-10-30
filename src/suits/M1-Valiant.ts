import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 27.2;
const torsoRatio = 0.4;
const leftArmRatio = 0.2;
const rightArmRatio = 0.2;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Valiant Pilot Pit',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(5, 15),
    [Stat.Weight]: _(torsoRatio * totalWeight),
  },
  boosts: {
    [Boost.ReflectiveArmor]: _(10, 10, 0.4),
  },
  assetId: 'M1',
};

const legs: SuitPart = {
  name: 'Valiant Bipedal Actuator',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(-30, -20),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M1',
};

const leftArm: SuitPart = {
  name: 'Valiant Dual Ordnance VT 76 mm',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(30),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  assetId: 'M1',
};

const rightArm: SuitPart = {
  name: 'Valiant Hypersonic SSM T-12',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(25),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.FirstStrike]: _(10, 15, 0.1),
  },
  assetId: 'M1',
};

export const Valiant = new Suit({
  name: 'Valiant',
  parts: [torso, legs, leftArm, rightArm],
  height: 9.37,
  dom: _(new Date('2185/01/12').getTime(), new Date('2202/05/23').getTime()),
  pom: [
    'Old New York, Free States',
    'Toronto, Canada',
    'San Francisco, New California',
    'San Diego, New California',
    'Detroit, Continental Republic',
    'Seattle, New California',
  ],
});
