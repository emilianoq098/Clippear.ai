import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

describe('API environment boundary', () => {
  it('rejects invalid port values', () => {
    const schema = z.object({ PORT: z.coerce.number().int().min(1).max(65535) });
    assert.equal(schema.safeParse({ PORT: '99999' }).success, false);
    assert.equal(schema.safeParse({ PORT: '4000' }).success, true);
  });
});
