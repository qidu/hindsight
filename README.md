# Hindsight

Hindsight is a small npm library for scanning git repositories, building weekday/hour heatmap data, and rendering weekly TUI panels.

## Install

```bash
npm install hindsight
```

## API

- `scanRepos(root, maxDepth?)` — find git repositories under a directory
- `analyzeRepo(repoPath, options?)` — analyze one repo into weekday/hour records
- `analyzeRepos(rootPath, options?)` — analyze all repos under a root
- `buildHeatmap(records)` — build a 7×24 heatmap matrix
- `renderHeatmapPanel(heatmap, options?)` — render a weekly terminal panel as text

## Demo

```ts
import { buildHeatmap } from 'hindsight';
import { renderHeatmapPanel } from './src/tui.js';

const records = [
  { weekday: 1, hour: 9, commits: 3, linesChanged: 42 },
  { weekday: 1, hour: 9, commits: 1, linesChanged: 8 },
  { weekday: 2, hour: 14, commits: 2, linesChanged: 19 },
  { weekday: 4, hour: 17, commits: 4, linesChanged: 73 },
  { weekday: 6, hour: 2, commits: 1, linesChanged: 5 },
];

const heatmap = buildHeatmap(records);

console.log(renderHeatmapPanel(heatmap, { metric: 'commits', title: 'Example Commits' }));
console.log('');
console.log(renderHeatmapPanel(heatmap, { metric: 'linesChanged', title: 'Example Lines Changed' }));
```

Or run the bundled demo:

```bash
npx tsx demo.ts
```

Or launch the interactive TUI:

```bash
npm run tui -- --path .
```

## Development

```bash
npm run build
npm test
npm run tui -- --path .
```
