import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanRepos } from '../src/scanner.js';

test('scanRepos finds nested git repositories', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hindsight-scan-'));
  const repo = path.join(root, 'repo-a');
  const nested = path.join(root, 'nested', 'repo-b');

  await mkdir(path.join(repo, '.git'), { recursive: true });
  await mkdir(path.join(nested, '.git'), { recursive: true });
  await writeFile(path.join(root, 'plain.txt'), 'x');

  const repos = await scanRepos(root, 4);
  assert.deepEqual(new Set(repos), new Set([repo, nested]));
});
