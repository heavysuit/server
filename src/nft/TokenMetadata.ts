import { Boost, OtherTrait, Slot, Stat } from '../suits/Trait';

export interface BaseAttribute {
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
  trait_type?: OtherTrait | Slot | Stat | Boost;
  value: string | number;
}

export interface DateAttribute extends BaseAttribute {
  display_type: 'date';
  trait_type: OtherTrait.DOM;
  value: number;
}

export interface TextAttribute extends BaseAttribute {
  trait_type: Slot | OtherTrait.POM | OtherTrait.Paint;
  value: string;
}

export interface RankAttribute extends BaseAttribute {
  trait_type: Stat;
  value: number;
}

export interface NumberAttribute extends BaseAttribute {
  display_type: 'number';
  trait_type: OtherTrait.Generation | OtherTrait.Mark;
  value: number;
}

export interface BoostAttribute extends BaseAttribute {
  display_type: 'boost_number';
  trait_type: Boost;
  value: number;
}

export type Attribute =
  | DateAttribute
  | TextAttribute
  | RankAttribute
  | BoostAttribute
  | NumberAttribute;

export interface TokenMetadata {
  name: string;
  image: string;
  description: string;
  external_url: string;
  background_color?: string;
  animation_url: string;
  youtube_url?: string;
  attributes: Attribute[];
}
