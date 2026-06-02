export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Hour = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export interface CommitStat {
  commits: number;
  linesChanged: number;
}

export interface CommitRecord {
  weekday: Weekday;
  hour: Hour;
  commits: number;
  linesChanged: number;
}

export interface AnalyzeOptions {
  days?: number;
  depth?: number;
  authors?: string[];
}

export interface HeatmapCell {
  commits: number;
  linesChanged: number;
}

export interface HeatmapData {
  rows: readonly string[];
  columns: readonly string[];
  cells: HeatmapCell[][];
  totalCommits: number;
  totalLinesChanged: number;
  maxCommits: number;
  maxLinesChanged: number;
}
