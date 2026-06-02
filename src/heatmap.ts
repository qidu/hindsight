import type { CommitRecord, HeatmapCell, HeatmapData } from './types.js';

const ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLUMN_LABELS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));

export function buildHeatmap(records: CommitRecord[]): HeatmapData {
  const cells: HeatmapCell[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({ commits: 0, linesChanged: 0 })),
  );

  for (const record of records) {
    const cell = cells[record.weekday][record.hour];
    cell.commits += record.commits;
    cell.linesChanged += record.linesChanged;
  }

  let totalCommits = 0;
  let totalLinesChanged = 0;
  let maxCommits = 0;
  let maxLinesChanged = 0;

  for (const row of cells) {
    for (const cell of row) {
      totalCommits += cell.commits;
      totalLinesChanged += cell.linesChanged;
      maxCommits = Math.max(maxCommits, cell.commits);
      maxLinesChanged = Math.max(maxLinesChanged, cell.linesChanged);
    }
  }

  return {
    rows: ROW_LABELS,
    columns: COLUMN_LABELS,
    cells,
    totalCommits,
    totalLinesChanged,
    maxCommits,
    maxLinesChanged,
  };
}
