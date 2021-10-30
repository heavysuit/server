import path from 'path';

export type AssetName = string;

export function getLocalPath(assetName: AssetName) {
  return path.join(__dirname, `../../assets/${assetName}/${assetName}.gltf`);
}

export const AssetLibrary = {
  M1: getLocalPath('M1'),
  M2: getLocalPath('M2'),
  M3: getLocalPath('M3'),
  M4: getLocalPath('M4'),
};

export type AssetLibraryID = keyof typeof AssetLibrary;
