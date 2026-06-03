"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHeatmap = buildHeatmap;
var ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var COLUMN_LABELS = Array.from({ length: 24 }, function (_, hour) { return String(hour).padStart(2, '0'); });
function buildHeatmap(records) {
    var cells = Array.from({ length: 7 }, function () {
        return Array.from({ length: 24 }, function () { return ({ values: 0 }); });
    });
    for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
        var record = records_1[_i];
        cells[record.weekday][record.hour].values += record.values;
    }
    var totalValues = 0;
    var maxValues = 0;
    for (var _a = 0, cells_1 = cells; _a < cells_1.length; _a++) {
        var row = cells_1[_a];
        for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
            var cell = row_1[_b];
            totalValues += cell.values;
            maxValues = Math.max(maxValues, cell.values);
        }
    }
    return {
        rows: ROW_LABELS,
        columns: COLUMN_LABELS,
        cells: cells,
        totalValues: totalValues,
        maxValues: maxValues,
    };
}
