import { createStatGenerator as _, Suit, SuitPart } from './Suit';
import { Boost, Slot, Stat } from './Trait';

const totalWeight = 32.4;
const torsoRatio = 0.4;
const leftArmRatio = 0.2;
const rightArmRatio = 0.2;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Inferno Light Artillery Chassis',
  slot: Slot.Torso,
  stats: {
    [Stat.Armor]: _(5, 15),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.EnergyDemand]: _(-20),
    [Stat.Firepower]: _(40),
    [Stat.Mobility]: _(-20),
  },
  boosts: {
    [Boost.ReflectiveArmor]: _(10, 10, 0.4),
  },
  assetId: 'M4',
};

const legs: SuitPart = {
  name: 'Inferno Stabilizer',
  slot: Slot.Legs,
  stats: {
    [Stat.Armor]: _(5, 10),
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(-10, 0),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M4',
};

const leftArm: SuitPart = {
  name: 'Inferno Hybrid Flame Cannon',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(40),
    [Stat.EnergyDemand]: _(25),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 15, 0.2),
  },
  assetId: 'M4',
};

const rightArm: SuitPart = {
  name: 'Inferno Hybrid Flame Cannon',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(40),
    [Stat.EnergyDemand]: _(25),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 15, 0.2),
  },
  assetId: 'M4',
};

export const Inferno = new Suit({
  name: 'Inferno',
  parts: [torso, legs, leftArm, rightArm],
  height: 9.45,
  dom: _(new Date('2189/05/21').getTime(), new Date('2211/11/11').getTime()),
  pom: [
    'Alaska, Canada',
    'Toronto, Canada',
    'Vancouver, Canada',
    'Portland, New California',
    'Seattle, New California',
  ],
});
