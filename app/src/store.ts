import { Drizzle } from '@drizzle/store';
import HeavySuit from './contracts/HeavySuit.json';

export const drizzle = new Drizzle({
  contracts: [HeavySuit as any],
});
