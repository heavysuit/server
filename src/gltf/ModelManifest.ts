export enum BodyNode {
  Torso = 'Torso',
  ArmL = 'Arm_L',
  ArmR = 'Arm_R',
  Head = 'Head',
  Legs = 'Legs',
}

export type AssetMap = Record<string, string>;

export interface ModelManifest {
  modelName: string;
  localPath: string;
  nodes: BodyNode[];
  assetMap?: AssetMap;
}
