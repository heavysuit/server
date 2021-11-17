import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 29.6;
const headRatio = 0.1;
const torsoRatio = 0.3;
const leftArmRatio = 0.1;
const rightArmRatio = 0.18;
const legsRatio = 1 - headRatio - torsoRatio - leftArmRatio - rightArmRatio;

const head: SuitPart = {
  name: 'Shaka Scanner',
  slot: Slot.Head,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Weight]: _(headRatio * totalWeight),
  },
  boosts: {
    [Boost.Recon]: _(10, 30, 0.3),
  },
  assetId: 'M9',
};

const torso: SuitPart = {
  name: 'Shaka Chest Plate',
  slot: Slot.Torso,
  stats: {
    [Stat.EnergyDemand]: _(5),
    [Stat.Armor]: _(10, 30),
    [Stat.Weight]: _(torsoRatio * totalWeight),
  },
  boosts: {
    [Boost.ReactiveArmor]: _(20, 30, 0.3),
  },
  assetId: 'M9',
};

const legs: SuitPart = {
  name: 'Shaka Leg Guard',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(20, 40),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M9',
};

const leftArm: SuitPart = {
  name: 'Shaka Arm-Mounted Grenade Launcher',
  slot: Slot.LeftArm,
  stats: {
    [Stat.EnergyDemand]: _(10),
    [Stat.Armor]: _(5, 10),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 40, 0.3),
    [Boost.ArmorPenetration]: _(10, 20),
  },
  assetId: 'M9',
};

const rightArm: SuitPart = {
  name: 'Shaka Anti-Armor Rifle',
  slot: Slot.RightArm,
  stats: {
    [Stat.Armor]: _(0, 5),
    [Stat.Firepower]: _(30, 40),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.ArmorPenetration]: _(5, 15, 0.7),
  },
  assetId: 'M9',
};

export const Shaka = new Suit({
  name: 'Shaka',
  parts: [head, torso, legs, leftArm, rightArm],
  height: 11.94,
  dom: _(new Date('2188/02/05').getTime(), new Date('2215/07/05').getTime()),
  pom: [
    'Cape Town, United African States',
    'Pretoria, United African States',
    'Abyssinia, United African States',
    'Mali, United African States',
    'Ghana, United African States',
    'Masvingo, United African States',
    'Maputo, United African States',
    'Mbanza-Kongo, United African States',
  ],
});
