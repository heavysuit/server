import { gaussianRand } from './gaussianRand';

export function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + gaussianRand() * (end.getTime() - start.getTime()),
  );
}
