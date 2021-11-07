import path from 'path';

export type AssetName = string;

export function getLocalPath(assetName: AssetName) {
  return path.join(__dirname, `../../assets/${assetName}/${assetName}.gltf`);
}

export type AssetLibraryID = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7';
