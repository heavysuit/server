import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 42.6;
const torsoRatio = 0.4;
const leftArmRatio = 0.2;
const rightArmRatio = 0.3;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Golden Boy Fusion Reactor',
  slot: Slot.Torso,
  stats: {
    [Stat.ECM]: _(10, 20),
    [Stat.Armor]: _(10, 20),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.EnergyDemand]: _(-50, -20),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(10, 20, 0.1),
  },
  assetId: 'M12',
};

const legs: SuitPart = {
  name: 'Golden Boy Dash-Enhanced Balancer',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(25),
    [Stat.Mobility]: _(20, 50),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M12',
};

const leftArm: SuitPart = {
  name: 'Golden Boy Excalibur Energy Blade',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(30, 40),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
    [Stat.Armor]: _(10, 20),
  },
  boosts: {
    [Boost.ArmorPenetration]: _(10, 20, 0.2),
    [Boost.CloseQuarters]: _(10, 40),
    [Boost.ReactiveArmor]: _(10, 20, 0.3),
  },
  assetId: 'M12',
};

const rightArm: SuitPart = {
  name: 'Golden Boy Typhoon Tri-Gun',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(10, 20),
    [Stat.EnergyDemand]: _(20),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  assetId: 'M12',
};

export const GoldenBoy = new Suit({
  name: 'Golden Boy',
  parts: [torso, legs, leftArm, rightArm],
  height: 14.39,
  dom: _(new Date('2203/04/01').getTime(), new Date('2227/05/11').getTime()),
  pom: [
    'London, Royal Britannia',
    'Bristol, Royal Britannia',
    'Cambridge, Royal Britannia',
    'Liverpool, Royal Britannia',
    'Northampton, Royal Britannia',
    'Glasgow, Royal Britannia',
  ],
});
