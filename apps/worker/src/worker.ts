import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

function integerEnvironment(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer from ${min} to ${max}.`);
  return value;
}

const environment = {
  MEDIA_STORAGE_DIR: process.env.MEDIA_STORAGE_DIR || '../../.data/uploads',
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg',
  FFPROBE_PATH: process.env.FFPROBE_PATH || 'ffprobe',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_TRANSCRIPTION_MODEL: process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-transcribe',
  OPENAI_SELECTION_MODEL: process.env.OPENAI_SELECTION_MODEL || 'gpt-6-luna',
  CLIP_COUNT: integerEnvironment('CLIP_COUNT', 5, 1, 10),
  CHUNK_SECONDS: integerEnvironment('CHUNK_SECONDS', 45, 20, 60),
  MAX_VIDEO_SECONDS: integerEnvironment('MAX_VIDEO_SECONDS', 7200, 60, 14400),
};
const storageDirectory = resolve(process.cwd(), environment.MEDIA_STORAGE_DIR);
const jobsDirectory = resolve(storageDirectory, '../jobs');
const clipsDirectory = resolve(storageDirectory, 'clips');
const audioWorkDirectory = resolve(storageDirectory, '../worker-tmp');
const videoExtensions: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
};

type Clip = {
  id: string;
  filename: string;
  title: string;
  reason: string;
  score: number;
  startSeconds: number;
  endSeconds: number;
};

type Job = {
  id: string;
  assetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  clips: Clip[];
  error?: string;
  createdAt: string;
  updatedAt: string;
};

type TranscriptChunk = { chunkIndex: number; startSeconds: number; text: string };
type Candidate = { chunkIndex: number; title: string; reason: string; score: number };

export function selectCandidates(value: unknown, chunkCount: number, limit: number): Candidate[] {
  if (!value || typeof value !== 'object' || !('clips' in value) || !Array.isArray(value.clips)) {
    throw new Error('Highlight analysis returned an invalid structure.');
  }
  const seen = new Set<number>();
  const candidates: Candidate[] = [];
  for (const item of value.clips) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<Candidate>;
    if (!Number.isInteger(candidate.chunkIndex) || (candidate.chunkIndex ?? -1) < 0 || (candidate.chunkIndex ?? chunkCount) >= chunkCount) continue;
    if (typeof candidate.title !== 'string' || candidate.title.length < 1 || candidate.title.length > 80) continue;
    if (typeof candidate.reason !== 'string' || candidate.reason.length < 1 || candidate.reason.length > 240) continue;
    if (!Number.isInteger(candidate.score) || (candidate.score ?? 0) < 1 || (candidate.score ?? 101) > 100) continue;
    const chunkIndex = candidate.chunkIndex as number;
    if (seen.has(chunkIndex)) continue;
    seen.add(chunkIndex);
    candidates.push(candidate as Candidate);
  }
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function saveJob(job: Job): Promise<void> {
  job.updatedAt = new Date().toISOString();
  const destination = join(jobsDirectory, `${job.id}.json`);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(job, null, 2), 'utf8');
  await rename(temporary, destination);
}

async function runCommand(binary: string, args: string[]): Promise<string> {
  return new Promise((resolveOutput, reject) => {
    const child = spawn(binary, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (value: string) => { stdout += value; });
    child.stderr.setEncoding('utf8').on('data', (value: string) => { stderr = (stderr + value).slice(-5000); });
    child.once('error', (error) => reject(new Error(`Could not start ${binary}: ${error.message}`)));
    child.once('close', (code) => code === 0 ? resolveOutput(stdout) : reject(new Error(`${binary} exited with code ${code}: ${stderr.trim()}`)));
  });
}

async function transcribeChunk(path: string): Promise<string> {
  const bytes = await readFile(path);
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(bytes)], { type: 'audio/mpeg' }), basename(path));
  form.set('model', environment.OPENAI_TRANSCRIPTION_MODEL);
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${environment.OPENAI_API_KEY}` },
    body: form,
  });
  if (!response.ok) throw new Error(`Transcription provider returned HTTP ${response.status}.`);
  const result = await response.json() as { text?: string };
  return result.text?.trim() ?? '';
}

async function rankHighlights(chunks: TranscriptChunk[]): Promise<Candidate[]> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${environment.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: environment.OPENAI_SELECTION_MODEL,
      store: false,
      instructions: [
        'Act as a short-form video editor. Select the most shareable, self-contained moments from these timestamped transcript chunks.',
        'Prefer a strong hook, clear insight, surprising turn, useful advice, humor, or emotional energy.',
        'Avoid introductions, filler, repeated ideas, and clips that need context from other chunks.',
        'Return only chunk indices that exist in the input. Do not invent quotes or events.',
        `Select at most ${environment.CLIP_COUNT} moments. Score each from 1 to 100 and explain briefly in Spanish.`,
      ].join(' '),
      input: JSON.stringify(chunks),
      text: {
        format: {
          type: 'json_schema',
          name: 'clip_highlights',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              clips: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    chunkIndex: { type: 'integer' },
                    title: { type: 'string' },
                    reason: { type: 'string' },
                    score: { type: 'integer' },
                  },
                  required: ['chunkIndex', 'title', 'reason', 'score'],
                  additionalProperties: false,
                },
              },
            },
            required: ['clips'],
            additionalProperties: false,
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`Highlight analysis provider returned HTTP ${response.status}.`);

  const result = await response.json() as {
    output?: { content?: { type?: string; text?: string }[] }[];
  };
  const text = result.output?.flatMap((item) => item.content ?? []).find((item) => item.type === 'output_text')?.text;
  if (!text) throw new Error('Highlight analysis returned no structured result.');
  return selectCandidates(JSON.parse(text), chunks.length, environment.CLIP_COUNT);
}

async function createVideoClips(job: Job): Promise<Clip[]> {
  const asset = JSON.parse(await readFile(join(storageDirectory, `${job.assetId}.json`), 'utf8')) as {
    mediaType: string;
  };
  const extension = videoExtensions[asset.mediaType];
  if (!extension) throw new Error('Unsupported video format.');
  const sourcePath = join(storageDirectory, `${job.assetId}${extension}`);
  const audioDirectory = join(audioWorkDirectory, job.id);
  const outputDirectory = join(clipsDirectory, job.id);
  await mkdir(audioDirectory, { recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  const probe = await runCommand(environment.FFPROBE_PATH, [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', sourcePath,
  ]);
  const duration = Number((JSON.parse(probe) as { format?: { duration?: string } }).format?.duration);
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('The source video has no readable duration.');
  if (duration > environment.MAX_VIDEO_SECONDS) throw new Error('Video is longer than the 2-hour local processing limit.');

  await saveJob({ ...job, progress: 10, stage: 'extracting_audio' });
  const audioPattern = join(audioDirectory, 'chunk-%04d.mp3');
  await runCommand(environment.FFMPEG_PATH, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', sourcePath,
    '-map', '0:a:0', '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libmp3lame', '-b:a', '64k',
    '-f', 'segment', '-segment_time', String(environment.CHUNK_SECONDS), '-reset_timestamps', '1', audioPattern,
  ]);

  const audioFiles = (await readdir(audioDirectory)).filter((name) => name.endsWith('.mp3')).sort();
  if (!audioFiles.length) throw new Error('No audio track was found to analyze.');
  const transcriptChunks: TranscriptChunk[] = [];
  for (const [chunkIndex, filename] of audioFiles.entries()) {
    const text = await transcribeChunk(join(audioDirectory, filename));
    transcriptChunks.push({ chunkIndex, startSeconds: chunkIndex * environment.CHUNK_SECONDS, text });
    await saveJob({
      ...job,
      progress: 15 + Math.round(((chunkIndex + 1) / audioFiles.length) * 55),
      stage: 'transcribing',
    });
  }
  if (!transcriptChunks.some((chunk) => chunk.text)) throw new Error('The video did not produce a usable transcript.');

  await saveJob({ ...job, progress: 75, stage: 'ranking_highlights' });
  const candidates = await rankHighlights(transcriptChunks);
  if (!candidates.length) throw new Error('No suitable clips were found in this video.');

  const clips: Clip[] = [];
  for (const candidate of candidates) {
    const sourceStart = candidate.chunkIndex * environment.CHUNK_SECONDS;
    const startSeconds = Math.max(0, sourceStart - 1.5);
    const endSeconds = Math.min(duration, sourceStart + environment.CHUNK_SECONDS + 1.5);
    const id = `clip-${randomUUID()}`;
    const filename = `${id}.mp4`;
    await runCommand(environment.FFMPEG_PATH, [
      '-hide_banner', '-loglevel', 'error', '-y', '-ss', startSeconds.toFixed(3), '-i', sourcePath,
      '-t', (endSeconds - startSeconds).toFixed(3), '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart', join(outputDirectory, filename),
    ]);
    clips.push({
      id,
      filename,
      title: candidate.title,
      reason: candidate.reason,
      score: candidate.score,
      startSeconds,
      endSeconds,
    });
    await saveJob({ ...job, progress: 75 + Math.round((clips.length / candidates.length) * 25), stage: 'rendering_clips' });
  }
  await rm(audioDirectory, { recursive: true, force: true });
  return clips;
}

export async function processJob(jobPath: string): Promise<void> {
  let job: Job;
  try {
    job = JSON.parse(await readFile(jobPath, 'utf8')) as Job;
  } catch {
    console.error(`Skipping unreadable job file ${basename(jobPath)}.`);
    return;
  }
  if (job.status !== 'queued') return;

  let lock;
  const lockPath = join(jobsDirectory, `${job.id}.lock`);
  try {
    lock = await open(lockPath, 'wx');
  } catch {
    try {
      const lockAge = Date.now() - (await stat(lockPath)).mtimeMs;
      if (lockAge > 60 * 60 * 1000) {
        await rm(lockPath, { force: true });
        lock = await open(lockPath, 'wx');
      }
    } catch {
      return;
    }
  }

  try {
    if (!environment.OPENAI_API_KEY) throw new Error('Configure OPENAI_API_KEY in the worker environment to analyze clips.');
    job.status = 'processing';
    job.progress = 2;
    job.stage = 'starting';
    await saveJob(job);
    const clips = await createVideoClips(job);
    job.status = 'completed';
    job.progress = 100;
    job.stage = 'completed';
    job.clips = clips;
    await saveJob(job);
    console.info(`Job ${job.id} completed with ${clips.length} clips.`);
  } catch (error) {
    job.status = 'failed';
    job.stage = 'failed';
    job.error = error instanceof Error ? error.message.slice(0, 300) : 'Video processing failed.';
    await saveJob(job);
    console.error(`Job ${job.id} failed: ${job.error}`);
  } finally {
    await lock?.close();
    await rm(lockPath, { force: true });
  }
}

async function recoverInterruptedJobs(): Promise<void> {
  await mkdir(jobsDirectory, { recursive: true });
  for (const filename of await readdir(jobsDirectory)) {
    if (!filename.endsWith('.json')) continue;
    const path = join(jobsDirectory, filename);
    try {
      const job = JSON.parse(await readFile(path, 'utf8')) as Job;
      if (job.status === 'processing') {
        job.status = 'queued';
        job.progress = 0;
        job.stage = 'queued';
        await saveJob(job);
      }
    } catch {
      console.error(`Could not recover ${filename}.`);
    }
  }
}

let polling = false;
let stopping = false;
const pollJobs = async () => {
  if (polling || stopping) return;
  polling = true;
  try {
    for (const filename of await readdir(jobsDirectory).catch(() => [])) {
      if (filename.endsWith('.json')) await processJob(join(jobsDirectory, filename));
      if (stopping) break;
    }
  } catch (error) {
    console.error('Queue poll failed:', error);
  } finally {
    polling = false;
  }
};

const start = async () => {
  await recoverInterruptedJobs();
  console.info(`Clipper worker ready; queue directory: ${jobsDirectory}`);
  if (!environment.OPENAI_API_KEY) console.warn('OPENAI_API_KEY is not configured; queued jobs will report a setup error.');
  const timer = setInterval(() => { void pollJobs(); }, 1500);
  void pollJobs();
  const stop = () => {
    stopping = true;
    clearInterval(timer);
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
};

if (process.env.NODE_ENV !== 'test') {
  void start().catch((error: unknown) => {
    console.error('Worker could not start:', error);
    process.exitCode = 1;
  });
}
