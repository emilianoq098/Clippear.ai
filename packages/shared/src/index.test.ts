import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { healthResponseSchema } from './index.js';

describe('health response schema', () => {
  it('accepts the API health contract', () => {
    assert.equal(healthResponseSchema.safeParse({ status: 'ok', service: 'clipper-api' }).success, true);
  });

  it('rejects unknown status values', () => {
    assert.equal(healthResponseSchema.safeParse({ status: 'ready', service: 'clipper-api' }).success, false);
  });
});
