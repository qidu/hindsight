import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHeatmap } from '../src/heatmap.js';
import type { HeatmapRecord } from '../src/types.js';

const records: HeatmapRecord[] = [
  { weekday: 1, hour: 14, values: 5 },
  { weekday: 1, hour: 14, values: 3 },
  { weekday: 6, hour: 2, values: 10 },
];

test('buildHeatmap aggregates weekday and hour buckets', () => {
  const heatmap = buildHeatmap(records);

  assert.equal(heatmap.rows.length, 7);
  assert.equal(heatmap.columns.length, 24);
  assert.equal(heatmap.cells[1][14].values, 8);
  assert.equal(heatmap.cells[6][2].values, 10);
  assert.equal(heatmap.totalValues, 18);
  assert.equal(heatmap.maxValues, 10);
});
