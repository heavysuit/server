import { BodyNode } from '../shared/BodyNode';
import { AssetLibraryID } from './AssetLibrary';

export interface ModelManifest {
  assetId: AssetLibraryID;
  nodes: BodyNode[];
}
