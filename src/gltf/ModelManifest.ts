export enum BodyNode {
  Torso = 'TORSO',
  ArmL = 'ARM_L',
  ArmR = 'ARM_R',
  Head = 'HEAD',
  Legs = 'LEGS',
}

export enum JointNode {
  Neck = 'Neck',
  ShoulderL = 'Shoulder_L',
  ShoulderR = 'Shoulder_R',
  Hip = 'Hip',
}

export type AssetMap = Record<string, string>;

export interface ModelManifest {
  modelName: string;
  localPath: string;
  nodes: BodyNode[];
  assetMap?: AssetMap;
}
