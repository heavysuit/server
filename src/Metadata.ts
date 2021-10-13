export enum Trait {
  Mobility = 'Mobility',
  Armor = 'Armor',
  Firepower = 'Firepower',
  ECM = 'ECM',
  Efficiency = 'Efficiency',
  Weight = 'Weight',

  Legs = 'Legs',
  LeftArm = 'Left Arm',
  RightArm = 'Right Arm',
  Torso = 'Torso',
  Head = 'Head',
  Paint = 'Paint',
  POM = 'Place of Manufacture',
  Equipment = 'Equipment',

  DOM = 'Date of Manufacture',

  Generation = 'Generation',

  Stealth = 'Stealth',
  Recon = 'Recon',
  FirstStrike = 'First Strike',
  CloseQuarters = 'Close Quarters',
  ReflectiveArmor = 'Reflective Armor',
  ReactiveArmor = 'Reactive Armor',
}

export interface BaseAttribute {
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
  trait_type?: Trait;
  value: string | number;
}

export interface DateAttribute extends BaseAttribute {
  display_type: 'date';
  trait_type: Trait.DOM;
  value: number;
}

export interface TextAttribute extends BaseAttribute {
  trait_type:
    | Trait.Legs
    | Trait.LeftArm
    | Trait.RightArm
    | Trait.Torso
    | Trait.Head
    | Trait.POM
    | Trait.Paint;
  value: string;
}

export interface RankAttribute extends BaseAttribute {
  trait_type:
    | Trait.Mobility
    | Trait.Efficiency
    | Trait.Firepower
    | Trait.Armor
    | Trait.ECM
    | Trait.Weight;
  value: number;
}

export interface NumberAttribute extends BaseAttribute {
  display_type: 'number';
  trait_type: Trait.Generation;
  value: number;
}

export interface BoostAttribute extends BaseAttribute {
  display_type: 'boost_number';
  trait_type:
    | Trait.ReactiveArmor
    | Trait.ReflectiveArmor
    | Trait.Stealth
    | Trait.Recon
    | Trait.FirstStrike
    | Trait.CloseQuarters;
  value: number;
}

export type Attribute =
  | DateAttribute
  | TextAttribute
  | RankAttribute
  | NumberAttribute;

export interface AssetMetadata {
  name: string;
  image: string;
  description: string;
  external_url: string;
  background_color: string;
  animation_url: string;
  youtube_url?: string;
  attributes: Attribute[];
}
