import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeRepos } from '../src/analyzer.js';

test('analyzeRepos returns weekday and hour buckets', async () => {
  const records = await analyzeRepos('.', { days: 30, depth: 0 });

  assert.ok(Array.isArray(records));
  for (const record of records) {
    assert.ok(record.weekday >= 0 && record.weekday <= 6);
    assert.ok(record.hour >= 0 && record.hour <= 23);
    assert.equal(record.commits, 1);
    assert.ok(record.linesChanged >= 0);
  }
});
