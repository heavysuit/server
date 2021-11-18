import { format } from 'date-fns';
import {
  Attribute,
  BoostAttribute,
  RankAttribute,
  TextAttribute,
  TokenMetadata
} from '../shared/TokenMetadata';
import { Boost, Stat, Trait } from '../shared/Trait';
import { Suit } from '../suits/Suit';
import { PAINT_COLOR } from '../utils/globals';

interface CreateTokenMetadataInputs {
  description?: string;
  suit: Suit;
  externalUrl: string;
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
    {
      trait_type: Trait.Paint,
      value: PAINT_COLOR,
    },
  ];

  return attributes;
}

export function createTokenMetadata({
  description,
  suit,
  externalUrl,
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

  const pom = attributes.find((a) => a.trait_type === Trait.POM);
  const place = pom ? pom.value : 'a classified location';
  const dom = attributes.find((a) => a.trait_type === Trait.DOM);
  const date = dom
    ? format(new Date(dom.value), 'MMMM do, y G')
    : 'an unknown date';

  const des =
    description ||
    `The ${suit.name} was assembled in ${place} on ${date}. It is one of 7777 unique Heavy Suits.`;

  return {
    name: suit.name,
    description: des,
    external_url: externalUrl,
    image: thumbnailUrl,
    animation_url: url,
    attributes,
  };
}
