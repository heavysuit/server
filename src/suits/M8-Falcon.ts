import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 25.2;
const headRatio = 0.1;
const torsoRatio = 0.2;
const leftArmRatio = 0.25;
const rightArmRatio = 0.25;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Falcon Cockpit',
  slot: Slot.Head,
  stats: {
    [Stat.Firepower]: _(5),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(headRatio * totalWeight),
    [Stat.ECM]: _(5, 15),
  },
  boosts: {
    [Boost.Recon]: _(10, 20, 0.3),
  },
  assetId: 'M8',
};

const torso: SuitPart = {
  name: 'Falcon Fuselage',
  slot: Slot.Torso,
  stats: {
    [Stat.EnergyDemand]: _(-5),
    [Stat.Armor]: _(20, 40),
    [Stat.Weight]: _(torsoRatio * totalWeight),
    [Stat.Mobility]: _(10, 20),
    [Stat.ECM]: _(5, 15),
  },
  assetId: 'M8',
};

const legs: SuitPart = {
  name: 'Falcon Twin Stabilizers',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(10, 20),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M8',
};

const leftArm: SuitPart = {
  name: 'Falcon Left Scramjet Aerofoil',
  slot: Slot.LeftArm,
  stats: {
    [Stat.Firepower]: _(5),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
    [Stat.Mobility]: _(20, 40),
    [Stat.ECM]: _(0, 15),
  },
  boosts: {
    [Boost.Recon]: _(10, 20, 0.5),
  },
  assetId: 'M8',
};

const rightArm: SuitPart = {
  name: 'Falcon Right Scramjet Aerofoil',
  slot: Slot.RightArm,
  stats: {
    [Stat.Firepower]: _(5),
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
    [Stat.Mobility]: _(20, 40),
    [Stat.ECM]: _(0, 15),
  },
  boosts: {
    [Boost.Recon]: _(10, 20, 0.5),
  },
  assetId: 'M8',
};

export const Falcon = new Suit({
  name: 'Falcon',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 7.26,
  dom: _(new Date('2171/08/09').getTime(), new Date('2227/04/20').getTime()),
  pom: [
    'Incheon, Joseon',
    'Kaesong, Joseon',
    'Seoul, Joseon',
    'Pyongyang, Joseon',
    'Taipei, Taiwan',
    'Singapore, Pacific Commonwealth',
    'Bangkok, Thailand',
  ],
});
