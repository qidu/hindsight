"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnsiColor = getAnsiColor;
exports.renderHeatmapPanel = renderHeatmapPanel;
exports.runTui = runTui;
exports.main = main;
var node_readline_1 = require("node:readline");
var node_url_1 = require("node:url");
var analyzer_js_1 = require("./analyzer.js");
var heatmap_js_1 = require("./heatmap.js");
var ROW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var EMPTY_COLOR = '\x1b[38;2;22;27;34m';
var VALUE_COLORS = [
    '\x1b[38;2;144;202;249m',
    '\x1b[38;2;66;165;245m',
    '\x1b[38;2;30;136;229m',
    '\x1b[38;2;21;101;192m',
];
var RESET = '\x1b[0m';
var ALT_SCREEN = '\x1b[?1049h';
var EXIT_ALT_SCREEN = '\x1b[?1049l';
var HIDE_CURSOR = '\x1b[?25l';
var SHOW_CURSOR = '\x1b[?25h';
var CLEAR_SCREEN = '\x1b[2J\x1b[H';
var CELL = '■';
function getMetricValue(heatmap, metric) {
    return metric === 'commits' ? heatmap.totalCommits : heatmap.totalLinesChanged;
}
function getMetricMax(heatmap, metric) {
    return metric === 'commits' ? heatmap.maxCommits : heatmap.maxLinesChanged;
}
function getCellValue(heatmap, row, column, metric) {
    return heatmap.cells[row][column][metric];
}
function getAnsiColor(value, maxValue) {
    if (value <= 0 || maxValue <= 0) {
        return EMPTY_COLOR;
    }
    var ratio = value / maxValue;
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
function renderHeatmapPanel(heatmap, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var metric = (_a = options.metric) !== null && _a !== void 0 ? _a : 'commits';
    var title = (_b = options.title) !== null && _b !== void 0 ? _b : (metric === 'commits' ? 'Commits' : 'Lines Changed');
    var total = getMetricValue(heatmap, metric);
    var maxValue = getMetricMax(heatmap, metric);
    var lines = [];
    lines.push("  ".concat(title, " (").concat(total, " total)"));
    lines.push("     ".concat(heatmap.columns.join(' ')));
    for (var rowIndex = 0; rowIndex < ROW_LABELS.length; rowIndex += 1) {
        var label = ROW_LABELS[rowIndex].padEnd(3, ' ');
        var cells = [];
        for (var columnIndex = 0; columnIndex < heatmap.columns.length; columnIndex += 1) {
            var value = getCellValue(heatmap, rowIndex, columnIndex, metric);
            cells.push("".concat(getAnsiColor(value, maxValue)).concat(CELL).concat(RESET));
        }
        lines.push("  ".concat(label, " ").concat(cells.join(' ')));
    }
    lines.push('');
    lines.push('  Press q or Esc to quit');
    return lines.join('\n');
}
function parseArgs(argv) {
    var analyzeOptions = {};
    var path = '.';
    var metric = 'commits';
    for (var i = 0; i < argv.length; i += 1) {
        var arg = argv[i];
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
                .map(function (author) { return author.trim(); })
                .filter(Boolean);
            i += 1;
            continue;
        }
        if (arg === '--metric' && argv[i + 1]) {
            var value = argv[i + 1];
            metric = value === 'linesChanged' ? 'linesChanged' : 'commits';
            i += 1;
            continue;
        }
    }
    return { path: path, analyzeOptions: analyzeOptions, metric: metric };
}
function writeFrame(frame) {
    process.stdout.write("".concat(CLEAR_SCREEN).concat(frame));
}
function runInteractivePanel(frame) {
    return __awaiter(this, void 0, void 0, function () {
        var finished, resolveDone, cleanup, onResize, onKeypress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!process.stdin.isTTY || !process.stdout.isTTY) {
                        process.stdout.write("".concat(frame, "\n"));
                        return [2 /*return*/];
                    }
                    node_readline_1.default.emitKeypressEvents(process.stdin);
                    process.stdin.setRawMode(true);
                    process.stdin.resume();
                    process.stdout.write("".concat(ALT_SCREEN).concat(HIDE_CURSOR));
                    finished = false;
                    resolveDone = null;
                    cleanup = function () {
                        if (finished) {
                            return;
                        }
                        finished = true;
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                        process.stdin.off('keypress', onKeypress);
                        process.stdout.off('resize', onResize);
                        process.stdout.write("".concat(SHOW_CURSOR).concat(EXIT_ALT_SCREEN));
                        resolveDone === null || resolveDone === void 0 ? void 0 : resolveDone();
                    };
                    onResize = function () {
                        writeFrame(frame);
                    };
                    onKeypress = function (_str, key) {
                        if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
                            cleanup();
                        }
                    };
                    process.stdin.on('keypress', onKeypress);
                    process.stdout.on('resize', onResize);
                    writeFrame(frame);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            resolveDone = resolve;
                            process.stdin.once('end', cleanup);
                            process.stdin.once('close', cleanup);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runTui(path_1) {
    return __awaiter(this, arguments, void 0, function (path, analyzeOptions, options) {
        var records, heatmap, frame;
        if (analyzeOptions === void 0) { analyzeOptions = {}; }
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, analyzer_js_1.analyzeRepos)(path, analyzeOptions)];
                case 1:
                    records = _a.sent();
                    heatmap = (0, heatmap_js_1.buildHeatmap)(records);
                    frame = renderHeatmapPanel(heatmap, options);
                    return [4 /*yield*/, runInteractivePanel(frame)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, arguments, void 0, function (argv) {
        var _a, path, analyzeOptions, metric;
        if (argv === void 0) { argv = process.argv.slice(2); }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = parseArgs(argv), path = _a.path, analyzeOptions = _a.analyzeOptions, metric = _a.metric;
                    return [4 /*yield*/, runTui(path, analyzeOptions, { metric: metric })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
if (process.argv[1] === (0, node_url_1.fileURLToPath)(import.meta.url)) {
    void main();
}
