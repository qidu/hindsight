"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHeatmap = buildHeatmap;
var ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var COLUMN_LABELS = Array.from({ length: 24 }, function (_, hour) { return String(hour).padStart(2, '0'); });
function buildHeatmap(records) {
    var cells = Array.from({ length: 7 }, function () {
        return Array.from({ length: 24 }, function () { return ({ commits: 0, linesChanged: 0 }); });
    });
    for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var record = records_1[_i];
        var cell = cells[record.weekday][record.hour];
        cell.commits += record.commits;
        cell.linesChanged += record.linesChanged;
    }
    var totalCommits = 0;
    var totalLinesChanged = 0;
    var maxCommits = 0;
    var maxLinesChanged = 0;
    for (var _a = 0, cells_1 = cells; _a < cells_1.length; _a++) {
        var row = cells_1[_a];
        for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
            var cell = row_1[_b];
            totalCommits += cell.commits;
            totalLinesChanged += cell.linesChanged;
            maxCommits = Math.max(maxCommits, cell.commits);
            maxLinesChanged = Math.max(maxLinesChanged, cell.linesChanged);
        }
    }
    return {
        rows: ROW_LABELS,
        columns: COLUMN_LABELS,
        cells: cells,
        totalCommits: totalCommits,
        totalLinesChanged: totalLinesChanged,
        maxCommits: maxCommits,
        maxLinesChanged: maxLinesChanged,
    };
}
