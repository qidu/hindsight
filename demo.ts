import { buildHeatmap } from './src/heatmap.js';
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
