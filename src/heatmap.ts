import type { HeatmapCell, HeatmapData, HeatmapRecord } from './types.js';

const ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const COLUMN_LABELS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));

export function buildHeatmap(records: HeatmapRecord[]): HeatmapData {
  const cells: HeatmapCell[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ values: 0 })),
  );

  for (const record of records) {
    cells[record.weekday][record.hour].values += record.values;
  }

  let totalValues = 0;
  let maxValues = 0;

  for (const row of cells) {
    for (const cell of row) {
      totalValues += cell.values;
      maxValues = Math.max(maxValues, cell.values);
    }
  }

  return {
    rows: ROW_LABELS,
    columns: COLUMN_LABELS,
    cells,
    totalValues,
    maxValues,
  };
}
