import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Clipper landing foundation', () => {
  it('keeps the initial product principles explicit', async () => {
    const { readFile } = await import('node:fs/promises');
    const page = await readFile(new URL('../components/Landing.tsx', import.meta.url), 'utf8');
    assert.match(page, /Find the/);
    assert.match(page, /Encontrá lo/);
    assert.match(page, /Pay for what you process/);
  });
});
