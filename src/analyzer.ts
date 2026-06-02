import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AnalyzeOptions, CommitRecord, Hour, Weekday } from './types.js';
import { scanRepos } from './scanner.js';

const execFileAsync = promisify(execFile);

function bucketFromDate(date: Date): { weekday: Weekday; hour: Hour } {
  return {
    weekday: date.getDay() as Weekday,
    hour: date.getHours() as Hour,
  };
}

function normalizeDays(days?: number): number {
  return Number.isFinite(days) && (days ?? 0) > 0 ? Math.floor(days ?? 0) : 365;
}

function normalizeDepth(depth?: number): number {
  return Number.isFinite(depth) && (depth ?? 0) > 0 ? Math.floor(depth ?? 0) : 3;
}

export async function analyzeRepo(repoPath: string, options: AnalyzeOptions = {}): Promise<CommitRecord[]> {
  const days = normalizeDays(options.days);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const args = [
    '-C',
    repoPath,
    'log',
    '--date=iso-strict',
    `--since=${since.toISOString()}`,
    '--numstat',
    '--format=%H%x1f%an%x1f%ad',
  ];

  const { stdout } = await execFileAsync('git', args, { maxBuffer: 1024 * 1024 * 50 });
  const allowedAuthors = options.authors?.length ? new Set(options.authors) : null;
  const records: CommitRecord[] = [];

  let current: { author: string; date: Date; linesChanged: number } | null = null;

  const flush = () => {
    if (!current) {
      return;
    }

    if (allowedAuthors && !allowedAuthors.has(current.author)) {
      current = null;
      return;
    }

    const { weekday, hour } = bucketFromDate(current.date);
    records.push({
      weekday,
      hour,
      commits: 1,
      linesChanged: current.linesChanged,
    });
    current = null;
  };

  for (const line of stdout.split('\n')) {
    if (!line) {
      continue;
    }

    if (line.includes('\x1f')) {
      flush();
      const parts = line.split('\x1f');
      const author = parts[1];
      const dateString = parts[2];
      current = {
        author,
        date: new Date(dateString),
        linesChanged: 0,
      };
      continue;
    }

    const match = line.match(/^(\d+|-)\s+(\d+|-)\s+/);
    if (!match || !current) {
      continue;
    }

    const insertions = match[1] === '-' ? 0 : Number(match[1]);
    const deletions = match[2] === '-' ? 0 : Number(match[2]);
    current.linesChanged += insertions + deletions;
  }

  flush();
  return records;
}

export async function analyzeRepos(rootPath: string, options: AnalyzeOptions = {}): Promise<CommitRecord[]> {
  const repos = await scanRepos(rootPath, normalizeDepth(options.depth));
  const all: CommitRecord[] = [];

  for (const repo of repos) {
    const records = await analyzeRepo(repo, options);
    all.push(...records);
  }

  return all;
}
