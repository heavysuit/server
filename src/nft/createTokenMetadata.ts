import { Suit } from '../suits/Suit';
import { Boost, Stat, Trait } from '../suits/Trait';
import {
  Attribute,
  BoostAttribute,
  RankAttribute,
  TextAttribute,
  TokenMetadata
} from './TokenMetadata';

interface CreateTokenMetadataInputs {
  description?: string;
  tokenId: string;
  suit: Suit;
  thumbnailUrl: string;
  url: string;
  mark?: number;
  generation?: number;
}

export function createTokenAttributes(suit: Suit): Attribute[] {
  const slotAttributes = suit.parts.map(
    (p): TextAttribute => ({
      trait_type: p.slot,
      value: `${p.name}`,
    }),
  );

  const boosts = suit.getBoosts();
  const boostAttributes = Object.values(Boost)
    .map((b) => b as Boost)
    .map(
      (b): BoostAttribute => ({
        display_type: 'boost_number',
        trait_type: b,
        value: boosts[b] || 0,
      }),
    )
    .filter((attr) => attr.value > 0);

  const stats = suit.getStats();
  const rankAttributes = Object.values(Stat)
    .map((s) => s as Stat)
    .map(
      (s): RankAttribute => ({
        trait_type: s,
        value: stats[s],
      }),
    );

  const attributes: Attribute[] = [
    {
      display_type: 'date',
      trait_type: Trait.DOM,
      value: suit.getDOM().getTime(),
    },
    {
      trait_type: Trait.POM,
      value: suit.getPOM(),
    },
    ...slotAttributes,
    ...rankAttributes,
    ...boostAttributes,
  ];

  return attributes;
}

export function createTokenMetadata({
  description = 'This is a Heavy Suit.',
  tokenId,
  suit,
  thumbnailUrl,
  url,
  mark = 1,
  generation = 1,
}: CreateTokenMetadataInputs): TokenMetadata {
  const attributes: Attribute[] = [
    {
      display_type: 'number',
      trait_type: Trait.Generation,
      value: generation,
    },
    {
      display_type: 'number',
      trait_type: Trait.Mark,
      value: mark,
    },
    ...createTokenAttributes(suit),
  ];

  return {
    name: suit.name,
    description,
    external_url: `http://heavysuit.com/suit/${tokenId}`,
    image: thumbnailUrl,
    animation_url: url,
    attributes,
  };
}
