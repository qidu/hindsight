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
- `buildHeatmap(records)` — build a 7×24 heatmap matrix from `{ weekday, hour, values }` records
- `renderHeatmapPanel(heatmap, options?)` — render a weekly terminal panel as text

## Use from source

If you're working in this repository, import the source modules directly:

```ts
import { analyzeRepo } from './src/analyzer.js';
import { buildHeatmap } from './src/heatmap.js';
import { renderHeatmapPanel } from './src/tui.js';

const exampleRecords = [
  { weekday: 1, hour: 9, values: 42 },
  { weekday: 1, hour: 9, values: 8 },
  { weekday: 2, hour: 14, values: 19 },
  { weekday: 4, hour: 17, values: 73 },
  { weekday: 6, hour: 2, values: 5 },
];

const exampleHeatmap = buildHeatmap(exampleRecords);
const commitRecords = await analyzeRepo('.');

const commitHeatmap = buildHeatmap(
  commitRecords.map((record) => ({
    weekday: record.weekday,
    hour: record.hour,
    values: record.commits,
  })),
);

const linesChangedHeatmap = buildHeatmap(
  commitRecords.map((record) => ({
    weekday: record.weekday,
    hour: record.hour,
    values: record.linesChanged,
  })),
);

console.log(renderHeatmapPanel(exampleHeatmap, { title: 'Example Values' }));
console.log('');
console.log(renderHeatmapPanel(commitHeatmap, { title: 'Example Commits' }));
console.log('');
console.log(renderHeatmapPanel(linesChangedHeatmap, { title: 'Example Lines Changed' }));
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
