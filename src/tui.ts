import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { analyzeRepos } from './analyzer.js';
import { buildHeatmap } from './heatmap.js';
import type { AnalyzeOptions, HeatmapData } from './types.js';

export interface TuiOptions {
  title?: string;
}

const ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const EMPTY_COLOR = '\x1b[38;2;22;27;34m';
const VALUE_COLORS = [
  '\x1b[38;2;144;202;249m',
  '\x1b[38;2;66;165;245m',
  '\x1b[38;2;30;136;229m',
  '\x1b[38;2;21;101;192m',
] as const;
const RESET = '\x1b[0m';
const ALT_SCREEN = '\x1b[?1049h';
const EXIT_ALT_SCREEN = '\x1b[?1049l';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_SCREEN = '\x1b[2J\x1b[H';
const CELL = '■';

function getMetricValue(heatmap: HeatmapData): number {
  return heatmap.totalValues;
}

function getMetricMax(heatmap: HeatmapData): number {
  return heatmap.maxValues;
}

function getCellValue(heatmap: HeatmapData, row: number, column: number): number {
  return heatmap.cells[row][column].values;
}

export function getAnsiColor(value: number, maxValue: number): string {
  if (value <= 0 || maxValue <= 0) {
    return EMPTY_COLOR;
  }

  const ratio = value / maxValue;

  if (ratio < 0.25) {
    return VALUE_COLORS[0];
  }

  if (ratio < 0.5) {
    return VALUE_COLORS[1];
  }

  if (ratio < 0.75) {
    return VALUE_COLORS[2];
  }

  return VALUE_COLORS[3];
}

export function renderHeatmapPanel(heatmap: HeatmapData, options: TuiOptions = {}): string {
  const title = options.title ?? 'Values';
  const total = getMetricValue(heatmap);
  const maxValue = getMetricMax(heatmap);

  const lines: string[] = [];
  lines.push(`  ${title} (${total} total)`);
  lines.push(`     ${heatmap.columns.filter((_, index) => index % 2 === 0).join('  ')}`);

  for (let rowIndex = 0; rowIndex < ROW_LABELS.length; rowIndex += 1) {
    const label = ROW_LABELS[rowIndex].padEnd(3, ' ');
    const cells: string[] = [];

    for (let columnIndex = 0; columnIndex < heatmap.columns.length; columnIndex += 1) {
      const value = getCellValue(heatmap, rowIndex, columnIndex);
      cells.push(`${getAnsiColor(value, maxValue)}${CELL}${RESET}`);
    }

    lines.push(`  ${label} ${cells.join(' ')}`);
  }

  lines.push('');
  lines.push('  Press q or Esc to quit');
  return lines.join('\n');
}

function parseArgs(argv: string[]): { path: string; analyzeOptions: AnalyzeOptions } {
  const analyzeOptions: AnalyzeOptions = {};
  let path = '.';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--path' && argv[i + 1]) {
      path = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--days' && argv[i + 1]) {
      analyzeOptions.days = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--depth' && argv[i + 1]) {
      analyzeOptions.depth = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--authors' && argv[i + 1]) {
      analyzeOptions.authors = argv[i + 1]
        .split(',')
        .map((author) => author.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
  }

  return { path, analyzeOptions };
}

function writeFrame(frame: string): void {
  process.stdout.write(`${CLEAR_SCREEN}${frame}`);
}

async function runInteractivePanel(frame: string): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    process.stdout.write(`${frame}\n`);
    return;
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write(`${ALT_SCREEN}${HIDE_CURSOR}`);

  let finished = false;
  let resolveDone: (() => void) | null = null;

  const cleanup = () => {
    if (finished) {
      return;
    }

    finished = true;
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.off('keypress', onKeypress);
    process.stdout.off('resize', onResize);
    process.stdout.write(`${SHOW_CURSOR}${EXIT_ALT_SCREEN}`);
    resolveDone?.();
  };

  const onResize = () => {
    writeFrame(frame);
  };

  const onKeypress = (_str: string, key: readline.Key) => {
    if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      cleanup();
    }
  };

  process.stdin.on('keypress', onKeypress);
  process.stdout.on('resize', onResize);
  writeFrame(frame);

  await new Promise<void>((resolve) => {
    resolveDone = resolve;
    process.stdin.once('end', cleanup);
    process.stdin.once('close', cleanup);
  });
}

export async function runTui(path: string, analyzeOptions: AnalyzeOptions = {}, options: TuiOptions = {}): Promise<void> {
  const records = await analyzeRepos(path, analyzeOptions);
  const heatmap = buildHeatmap(
    records.map((record) => ({
      weekday: record.weekday,
      hour: record.hour,
      values: record.commits + record.linesChanged,
    })),
  );
  const frame = renderHeatmapPanel(heatmap, options);
  await runInteractivePanel(frame);
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  const { path, analyzeOptions } = parseArgs(argv);
  await runTui(path, analyzeOptions);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}
