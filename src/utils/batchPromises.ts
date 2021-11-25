import _ from 'lodash';

export async function batchPromises<T>(
  promises: PromiseLike<T>[],
  batchSize = 4,
): Promise<T[]> {
  const batches = _.chunk(promises, batchSize);
  const results: T[] = [];
  for (const batch of batches) {
    const r = await Promise.all(batch);
    results.push(...r);
  }
  return results;
}
