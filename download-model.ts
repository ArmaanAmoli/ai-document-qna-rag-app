import { Agent, setGlobalDispatcher } from 'undici';
import * as path from 'path';

// 1. Bypass Node's default 10-second fetch timeout limit (Set to 10 minutes)
setGlobalDispatcher(
  new Agent({
    connect: { timeout: 600000 },
    headersTimeout: 600000,
    bodyTimeout: 600000,
  })
);

// Now import the transformers library safely
import { pipeline, env } from '@huggingface/transformers';

async function main() {
  const modelName = 'Xenova/all-MiniLM-L6-v2';
  const localRoot = path.join(process.cwd(), 'models');

  console.log(`Preparing to download: ${modelName}`);
  console.log(`Target directory: ${localRoot}`);

  // 2. Explicitly point the cache and local paths to your project's models folder
  env.cacheDir = localRoot;
  env.localModelPath = localRoot;

  try {
    // 3. This triggers the download and auto-saves it under ./models/Xenova/all-MiniLM-L6-v2
    await pipeline('feature-extraction', modelName);

    console.log('\n✅ Success! Model files downloaded completely.');
    console.log(`Verify your files inside: ./models/${modelName}/`);
  } catch (error) {
    console.error('\n❌ Download failed:', error);
    process.exit(1);
  }
}

main();
