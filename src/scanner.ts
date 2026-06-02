import { readdir } from 'node:fs/promises';
import path from 'node:path';

async function isGitRepo(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory() && entry.name === '.git');
  } catch {
    return false;
  }
}

async function walk(root: string, depth: number, maxDepth: number, repos: string[]): Promise<void> {
  if (depth > maxDepth) {
    return;
  }

  if (await isGitRepo(root)) {
    repos.push(root);
  }

  if (depth === maxDepth) {
    return;
  }

  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.git') {
      continue;
    }

    await walk(path.join(root, entry.name), depth + 1, maxDepth, repos);
  }
}

export async function scanRepos(root: string, maxDepth = 3): Promise<string[]> {
  const repos: string[] = [];
  await walk(path.resolve(root), 0, maxDepth, repos);
  return repos;
}
