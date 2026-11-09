import { randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import Fastify from 'fastify';
import { z } from 'zod';

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default('127.0.0.1'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  MEDIA_STORAGE_DIR: z.string().default('../../.data/uploads'),
  MEDIA_MAX_BYTES: z.coerce.number().int().min(1_048_576).max(1_073_741_824).default(262_144_000),
});

const environment = environmentSchema.parse(process.env);
const storageDirectory = resolve(process.cwd(), environment.MEDIA_STORAGE_DIR);
const jobsDirectory = resolve(storageDirectory, '../jobs');
const videoTypes = new Map([
  ['video/mp4', '.mp4'],
  ['video/quicktime', '.mov'],
  ['video/webm', '.webm'],
]);
export const app = Fastify({ logger: true, bodyLimit: environment.MEDIA_MAX_BYTES });

app.addContentTypeParser('application/octet-stream', (_request, payload, done) => {
  done(null, payload);
});

app.addHook('onRequest', async (request, reply) => {
  const origin = request.headers.origin;
  if (origin === environment.WEB_ORIGIN) {
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Vary', 'Origin');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, X-Media-Type');
  }

  if (request.method === 'OPTIONS') return reply.code(204).send();
});

app.get('/health', async () => ({ status: 'ok', service: 'clipper-api' }));

app.post('/v1/assets', async (request, reply) => {
  const encodedName = request.headers['x-file-name'];
  const declaredType = request.headers['x-media-type'];
  if (typeof encodedName !== 'string' || typeof declaredType !== 'string') {
    return reply.code(400).send({ error: 'Missing file name or media type.' });
  }

  let originalName: string;
  try {
    originalName = decodeURIComponent(encodedName);
  } catch {
    return reply.code(400).send({ error: 'Invalid file name.' });
  }

  const safeName = basename(originalName).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 180);
  const extension = videoTypes.get(declaredType.toLowerCase());
  if (!safeName || !extension) {
    return reply.code(415).send({ error: 'Upload an MP4, MOV, or WebM video.' });
  }

  const id = randomUUID();
  const temporaryPath = resolve(storageDirectory, `${id}.uploading`);
  const mediaPath = resolve(storageDirectory, `${id}${extension}`);
  let sizeBytes = 0;
  const fileHeader = Buffer.alloc(12);
  let headerBytes = 0;
  const sizeLimit = environment.MEDIA_MAX_BYTES;
  const sizeGuard = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      sizeBytes += chunk.length;
      if (sizeBytes > sizeLimit) callback(new Error('MEDIA_SIZE_LIMIT'));
      else {
        const remainingHeader = fileHeader.length - headerBytes;
        const copiedBytes = Math.min(remainingHeader, chunk.length);
        chunk.copy(fileHeader, headerBytes, 0, copiedBytes);
        headerBytes += copiedBytes;
        callback(null, chunk);
      }
    },
  });

  await mkdir(storageDirectory, { recursive: true });
  try {
    await pipeline(request.body as Readable, sizeGuard, createWriteStream(temporaryPath, { flags: 'wx' }));
    if (sizeBytes === 0) throw new Error('EMPTY_MEDIA');
    const isMp4Container = headerBytes >= 8 && fileHeader.toString('ascii', 4, 8) === 'ftyp';
    const isWebmContainer = headerBytes >= 4 && fileHeader.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if ((extension === '.webm' && !isWebmContainer) || (extension !== '.webm' && !isMp4Container)) throw new Error('INVALID_MEDIA');
    await rename(temporaryPath, mediaPath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    const message = error instanceof Error ? error.message : '';
    if (message === 'MEDIA_SIZE_LIMIT') return reply.code(413).send({ error: 'Video exceeds the upload size limit.' });
    if (message === 'EMPTY_MEDIA') return reply.code(400).send({ error: 'The uploaded video is empty.' });
    if (message === 'INVALID_MEDIA') return reply.code(415).send({ error: 'The file contents do not match an MP4, MOV, or WebM video.' });
    request.log.warn({ error }, 'Media upload failed');
    return reply.code(400).send({ error: 'Could not receive this video.' });
  }

  const asset = {
    id,
    filename: safeName,
    mediaType: declaredType.toLowerCase(),
    sizeBytes,
    status: 'queued' as const,
    uploadedAt: new Date().toISOString(),
  };
  const job = {
    id,
    assetId: id,
    status: 'queued' as const,
    progress: 0,
    stage: 'queued',
    clips: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await mkdir(jobsDirectory, { recursive: true });
  await writeFile(resolve(storageDirectory, `${id}.json`), JSON.stringify(asset, null, 2), 'utf8');
  await writeFile(resolve(jobsDirectory, `${id}.json`), JSON.stringify(job, null, 2), 'utf8');
  return reply.code(201).send({ ...asset, jobId: id });
});

app.get<{ Params: { id: string } }>('/v1/assets/:id', async (request, reply) => {
  if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) return reply.code(400).send({ error: 'Invalid asset id.' });
  try {
    const asset = await readFile(resolve(storageDirectory, `${request.params.id}.json`), 'utf8');
    const job = await readFile(resolve(jobsDirectory, `${request.params.id}.json`), 'utf8');
    return { ...JSON.parse(asset), status: JSON.parse(job).status, jobId: request.params.id };
  } catch {
    return reply.code(404).send({ error: 'Asset not found.' });
  }
});

app.get<{ Params: { id: string } }>('/v1/jobs/:id', async (request, reply) => {
  if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) return reply.code(400).send({ error: 'Invalid job id.' });
  try {
    return JSON.parse(await readFile(resolve(jobsDirectory, `${request.params.id}.json`), 'utf8'));
  } catch {
    return reply.code(404).send({ error: 'Job not found.' });
  }
});

app.get<{ Params: { id: string; clipId: string } }>('/v1/jobs/:id/clips/:clipId', async (request, reply) => {
  const { id, clipId } = request.params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^clip-[0-9a-f-]{36}$/.test(clipId)) {
    return reply.code(400).send({ error: 'Invalid clip id.' });
  }
  try {
    const job = JSON.parse(await readFile(resolve(jobsDirectory, `${id}.json`), 'utf8')) as {
      status: string;
      clips: { id: string; filename: string }[];
    };
    const clip = job.clips.find((item) => item.id === clipId);
    if (job.status !== 'completed' || !clip) return reply.code(404).send({ error: 'Clip not found.' });
    const clipPath = resolve(storageDirectory, 'clips', id, clip.filename);
    return reply
      .type('video/mp4')
      .header('Content-Disposition', `attachment; filename="${clipId}.mp4"`)
      .send(createReadStream(clipPath));
  } catch {
    return reply.code(404).send({ error: 'Clip not found.' });
  }
});

const start = async () => {
  try {
    await app.listen({ port: environment.PORT, host: environment.HOST });
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};

if (process.env.NODE_ENV !== 'test') void start();
