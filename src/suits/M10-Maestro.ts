import { Boost, Slot, Stat } from '../shared/Trait';
import { createStatGenerator as _, Suit, SuitPart } from './Suit';

const totalWeight = 41.2;
const torsoRatio = 0.4;
const leftArmRatio = 0.1;
const rightArmRatio = 0.1;
const legsRatio = 1 - torsoRatio - leftArmRatio - rightArmRatio;

const torso: SuitPart = {
  name: 'Maestro Battery Platform',
  slot: Slot.Torso,
  stats: {
    [Stat.EnergyDemand]: _(10),
    [Stat.Armor]: _(20, 40),
    [Stat.Weight]: _(torsoRatio * totalWeight),
  },
  boosts: {
    [Boost.FirstStrike]: _(10, 20, 0.4),
  },
  assetId: 'M10',
};

const legs: SuitPart = {
  name: 'Maestro Anti-Recoil Stabilizer',
  slot: Slot.Legs,
  stats: {
    [Stat.EnergyDemand]: _(20),
    [Stat.Mobility]: _(5, 10),
    [Stat.Weight]: _(legsRatio * totalWeight),
  },
  assetId: 'M10',
};

const leftArm: SuitPart = {
  name: 'Maestro Left Arm',
  slot: Slot.LeftArm,
  stats: {
    [Stat.EnergyDemand]: _(10),
    [Stat.Armor]: _(5, 10),
    [Stat.Weight]: _(leftArmRatio * totalWeight),
  },
  assetId: 'M10',
};

const rightArm: SuitPart = {
  name: 'Maestro Mounted Shotgun',
  slot: Slot.RightArm,
  stats: {
    [Stat.Armor]: _(5, 10),
    [Stat.Firepower]: _(20, 40),
    [Stat.EnergyDemand]: _(10),
    [Stat.Weight]: _(rightArmRatio * totalWeight),
  },
  boosts: {
    [Boost.CloseQuarters]: _(10, 30, 0.3),
  },
  assetId: 'M10',
};

export const Maestro = new Suit({
  name: 'Maestro',
  parts: [torso, legs, leftArm, rightArm],
  height: 13.57,
  dom: _(new Date('2197/05/15').getTime(), new Date('2227/12/28').getTime()),
  pom: [
    'Buenos Aires, Argentina',
    'La Paz, Bolivia',
    'Santiago, Chile',
    'Bogotá, Colombia',
    'El Zonte, El Salvador',
    'Cusco, Peru',
  ],
});
