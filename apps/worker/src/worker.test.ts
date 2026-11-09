import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

let selectCandidates: typeof import('./worker').selectCandidates;
let processJob: typeof import('./worker').processJob;
const testDataDirectory = join(process.cwd(), '../../.data', `worker-test-${randomUUID()}`);
const testStorageDirectory = join(testDataDirectory, 'uploads');
const testJobsDirectory = join(testDataDirectory, 'jobs');

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MEDIA_STORAGE_DIR = testStorageDirectory;
  delete process.env.OPENAI_API_KEY;
  await mkdir(testJobsDirectory, { recursive: true });
  ({ selectCandidates, processJob } = await import('./worker'));
});

after(async () => {
  await rm(testDataDirectory, { recursive: true, force: true });
});

describe('highlight candidate validation', () => {
  it('sorts valid clips by score and ignores duplicates and invalid indices', () => {
    const clips = selectCandidates({ clips: [
      { chunkIndex: 0, title: 'Idea', reason: 'Clara y útil', score: 74 },
      { chunkIndex: 1, title: 'Remate', reason: 'Cierra con humor', score: 93 },
      { chunkIndex: 1, title: 'Duplicado', reason: 'Repite el mismo bloque', score: 99 },
      { chunkIndex: 4, title: 'Fuera de rango', reason: 'No existe', score: 100 },
    ] }, 2, 5);

    assert.deepEqual(clips.map((clip) => clip.chunkIndex), [1, 0]);
  });

  it('drops malformed model output instead of creating unsafe clip paths', () => {
    const clips = selectCandidates({ clips: [
      { chunkIndex: -1, title: 'Invalid', reason: 'Negative index', score: 90 },
      { chunkIndex: 0, title: '', reason: 'Empty title', score: 90 },
      { chunkIndex: 0, title: 'Too much', reason: 'Invalid score', score: 101 },
    ] }, 1, 5);

    assert.deepEqual(clips, []);
  });

  it('consumes a queued job and records a setup error without an API key', async () => {
    const id = randomUUID();
    const jobPath = join(testJobsDirectory, `${id}.json`);
    await writeFile(jobPath, JSON.stringify({
      id,
      assetId: id,
      status: 'queued',
      progress: 0,
      stage: 'queued',
      clips: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    await processJob(jobPath);
    const job = JSON.parse(await readFile(jobPath, 'utf8')) as { status: string; error?: string };
    assert.equal(job.status, 'failed');
    assert.match(job.error ?? '', /OPENAI_API_KEY/);
  });
});
