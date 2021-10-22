import { BodyNode } from '../gltf/ModelManifest';

export enum Slot {
  Legs = 'Legs',
  LeftArm = 'Left Arm',
  RightArm = 'Right Arm',
  Torso = 'Torso',
  Head = 'Head',
}

export enum Stat {
  Mobility = 'Mobility',
  Armor = 'Armor',
  Firepower = 'Firepower',
  ECM = 'ECM',
  EnergyDemand = 'Energy Demand',
  Weight = 'Weight',
  Height = 'Height',
}

export enum Boost {
  Stealth = 'Stealth',
  Recon = 'Recon',
  FirstStrike = 'First Strike',
  CloseQuarters = 'Close Quarters',
  ReflectiveArmor = 'Reflective Armor',
  ReactiveArmor = 'Reactive Armor',
}

export enum OtherTrait {
  Paint = 'Paint',
  POM = 'Place of Manufacture',
  DOM = 'Date of Manufacture',
  Generation = 'Generation',
  Mark = 'Mark',
}

export const Trait = {
  ...Slot,
  ...Stat,
  ...Boost,
  ...OtherTrait,
};

export function slotToNode(slot: Slot): BodyNode {
  switch (slot) {
    case Slot.Head:
      return BodyNode.Head;
    case Slot.LeftArm:
      return BodyNode.ArmL;
    case Slot.RightArm:
      return BodyNode.ArmR;
    case Slot.Legs:
      return BodyNode.Legs;
    case Slot.Torso:
      return BodyNode.Torso;
    default:
      throw new Error();
  }
}
