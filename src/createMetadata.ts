import { AssetMetadata, Trait } from './AssetMetadata';

export async function createMetadata(
  name: string,
  tokenId: string,
  mark: number = 1,
): Promise<AssetMetadata> {
  const filename = mark === 1 ? tokenId : `${tokenId}-${mark}`;
  return {
    name,
    description: 'This is a Heavy Suit.',
    external_url: `http://heavysuit.com/suit/${tokenId}`,
    image: `https://meta.heavysuit.com/gltf/thumbnails/${filename}.png`,
    animation_url: `https://meta.heavysuit.com/gltf/${filename}.gltf`,
    attributes: [
      {
        trait_type: Trait.Head,
        value: '',
      },
      {
        display_type: 'number',
        trait_type: Trait.Mark,
        value: 1,
      },
    ],
  };
}
