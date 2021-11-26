export type TextureName =
  | 'jc1'
  | 'jc2'
  | 'jc3'
  | 'jc4'
  | 'jc5'
  | 'jc6'
  | 'gdr1'
  | 'gdr2'
  | 'gdr3'
  | 'gdr4'
  | 'gdr5'
  | 'unit00'
  | 'unit00-2'
  | 'unit01'
  | 'unit02'
  | 'original';

export const PaintName: Record<TextureName, string> = {
  jc1: 'Jungle Warfare',
  jc2: `Hunter's Acumen`,
  jc3: 'Digital Woodlands',
  jc4: `Wandering Muad'Dib`,
  jc5: 'Urban Digital',
  jc6: 'Urban Tactical Camo',
  gdr1: 'Ocean Green',
  gdr2: 'Halloween Dusk',
  gdr3: 'Synthwave Overdrive',
  gdr4: 'Yellow Menace',
  gdr5: 'Fire and Ice',
  unit00: 'Ayanami Blue',
  'unit00-2': 'Unit-00',
  unit01: 'Unit-01',
  unit02: 'Unit-02',
  original: 'Factory Design',
};
