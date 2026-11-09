import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

let uploadDirectory = '';
let app: import('fastify').FastifyInstance;

before(async () => {
  uploadDirectory = join(process.cwd(), '../../.data', `test-upload-${randomUUID()}`);
  await mkdir(uploadDirectory, { recursive: true });
  process.env.NODE_ENV = 'test';
  process.env.MEDIA_STORAGE_DIR = uploadDirectory;
  process.env.MEDIA_MAX_BYTES = '1048576';
  process.env.WEB_ORIGIN = 'http://localhost:3000';
  ({ app } = await import('./server'));
});

after(async () => {
  await app.close();
  await rm(uploadDirectory, { recursive: true, force: true });
});

describe('API environment boundary', () => {
  it('rejects invalid port values', () => {
    const schema = z.object({ PORT: z.coerce.number().int().min(1).max(65535) });
    assert.equal(schema.safeParse({ PORT: '99999' }).success, false);
    assert.equal(schema.safeParse({ PORT: '4000' }).success, true);
  });
});

describe('video upload API', () => {
  const headers = {
    'content-type': 'application/octet-stream',
    'x-file-name': encodeURIComponent('recording.mp4'),
    'x-media-type': 'video/mp4',
    origin: 'http://localhost:3000',
  };

  it('stores a valid MP4 upload and returns its metadata', async () => {
    const mp4Header = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0]);
    const response = await app.inject({ method: 'POST', url: '/v1/assets', headers, payload: mp4Header });
    const asset = response.json();

    assert.equal(response.statusCode, 201);
    assert.equal(asset.status, 'queued');
    assert.equal(asset.filename, 'recording.mp4');
    assert.deepEqual(await readFile(join(uploadDirectory, `${asset.id}.mp4`)), mp4Header);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:3000');

    const metadata = await app.inject({ method: 'GET', url: `/v1/assets/${asset.id}` });
    assert.equal(metadata.statusCode, 200);
    assert.equal(metadata.json().id, asset.id);
    assert.equal(metadata.json().status, 'queued');

    const job = await app.inject({ method: 'GET', url: `/v1/jobs/${asset.jobId}` });
    assert.equal(job.statusCode, 200);
    assert.equal(job.json().status, 'queued');
  });

  it('rejects bytes that do not match the claimed video type', async () => {
    const response = await app.inject({ method: 'POST', url: '/v1/assets', headers, payload: Buffer.from('not a video') });
    assert.equal(response.statusCode, 415);
  });

  it('rejects unsupported media types', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/assets',
      headers: { ...headers, 'x-media-type': 'image/jpeg' },
      payload: Buffer.from('image'),
    });
    assert.equal(response.statusCode, 415);
  });
});
