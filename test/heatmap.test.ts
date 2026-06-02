import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHeatmap } from '../src/heatmap.js';
import type { CommitRecord } from '../src/types.js';

const records: CommitRecord[] = [
  { weekday: 1, hour: 14, commits: 1, linesChanged: 5 },
  { weekday: 1, hour: 14, commits: 2, linesChanged: 3 },
  { weekday: 6, hour: 2, commits: 1, linesChanged: 10 },
];

test('buildHeatmap aggregates weekday and hour buckets', () => {
  const heatmap = buildHeatmap(records);

  assert.equal(heatmap.rows.length, 7);
  assert.equal(heatmap.columns.length, 24);
  assert.equal(heatmap.cells[1][14].commits, 3);
  assert.equal(heatmap.cells[1][14].linesChanged, 8);
  assert.equal(heatmap.cells[6][2].commits, 1);
  assert.equal(heatmap.totalCommits, 4);
  assert.equal(heatmap.totalLinesChanged, 18);
  assert.equal(heatmap.maxCommits, 3);
  assert.equal(heatmap.maxLinesChanged, 10);
});
