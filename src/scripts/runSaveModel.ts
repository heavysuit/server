import { strict as assert } from 'assert';
import { saveModel } from '../gltf/saveModel';

export async function runSaveModel(): Promise<void> {
  const filePath = process.argv[process.argv.length - 1];
  const modelName = process.argv[process.argv.length - 2];
  assert(
    !modelName.includes('runSaveModel.ts') &&
      !filePath.includes('runSaveModel.ts'),
    'Invalid arguments',
  );

  console.log('Saving', modelName, 'from', filePath);

  await saveModel(modelName, filePath);

  process.exit(0);
}

runSaveModel();
