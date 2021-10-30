import path from 'path';

export const AssetLibrary = {
  M1: path.join(__dirname, '../../assets/M1/M1.gltf'),
  M2: path.join(__dirname, '../../assets/M2/M2.gltf'),
  M3: path.join(__dirname, '../../assets/M3/M3.gltf'),
  M4: path.join(__dirname, '../../assets/M4/M4.gltf'),
  Generated: path.join(__dirname, '../../assets/Generated/Generated.gltf'),
};

export type AssetID = keyof typeof AssetLibrary;