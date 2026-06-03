import test from 'node:test';
import assert from 'node:assert/strict';
import { getAnsiColor, renderHeatmapPanel } from '../src/tui.js';
import type { HeatmapData } from '../src/types.js';

const heatmap: HeatmapData = {
  rows: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  columns: Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')),
  cells: Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ values: 0 })),
  ),
  totalValues: 12,
  maxValues: 8,
};

heatmap.cells[1][9].values = 8;
heatmap.cells[4][17].values = 4;

test('getAnsiColor maps values to the expected ramp', () => {
  assert.equal(getAnsiColor(0, 8), '\x1b[38;2;22;27;34m');
  assert.equal(getAnsiColor(1, 8), '\x1b[38;2;144;202;249m');
  assert.equal(getAnsiColor(3, 8), '\x1b[38;2;66;165;245m');
  assert.equal(getAnsiColor(5, 8), '\x1b[38;2;30;136;229m');
  assert.equal(getAnsiColor(8, 8), '\x1b[38;2;21;101;192m');
});

test('renderHeatmapPanel renders a weekly grid', () => {
  const output = renderHeatmapPanel(heatmap);

  assert.match(output, /Values \(12 total\)/);
  assert.match(output, /00  02  04  06/);
  assert.match(output, /Mon .*\x1b\[38;2;21;101;192m■\x1b\[0m/);
  assert.match(output, /Thu .*\x1b\[38;2;30;136;229m■\x1b\[0m/);
});
