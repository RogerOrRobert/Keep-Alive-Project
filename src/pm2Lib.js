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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var pm2 = require("pm2");
var util_1 = require("util");
var fs = require('fs');
var Pm2Lib = /** @class */ (function () {
    function Pm2Lib() {
        this.SCRIPT_PATH = "C:/Users/rlpro/dev/pm2/ts-pm2-ui/src/";
        this.MINERS = ['miner01.js']; //, 'miner02.js'];
    }
    Pm2Lib.prototype.getProcesses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var processes, _i, _a, miner, proc;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        processes = [];
                        _i = 0, _a = this.MINERS;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        miner = _a[_i];
                        return [4 /*yield*/, (0, util_1.promisify)(pm2.describe).call(pm2, miner)];
                    case 2:
                        proc = (_b.sent())[0];
                        if (proc) {
                            processes.push(proc);
                        }
                        else {
                            processes.push({
                                name: miner,
                                pm2_env: {
                                    status: 'stopped',
                                },
                            });
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, processes];
                }
            });
        });
    };
    Pm2Lib.prototype.onLogOut = function (onLog) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.bus) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, util_1.promisify)(pm2.launchBus).call(pm2)];
                    case 1:
                        _a.bus = _b.sent();
                        _b.label = 2;
                    case 2:
                        this.bus.on('log:out', function (procLog) {
                            onLog(procLog);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Pm2Lib.prototype.startProcess = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var proc, configFile, fileData;
            return __generator(this, function (_a) {
                proc = this.getStartOptions(filename);
                configFile = 'src/aplications.json';
                fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                /* if(fileData.enabled){
                  return promisify<StartOptions, Proc>(pm2.start).call(pm2, proc);
                }
                else{
                  return promisify(pm2.stop).call(pm2, filename);
                } */
                return [2 /*return*/, (0, util_1.promisify)(pm2.start).call(pm2, proc)];
            });
        });
    };
    Pm2Lib.prototype.restartProcess = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, util_1.promisify)(pm2.restart).call(pm2, filename)];
            });
        });
    };
    Pm2Lib.prototype.stopProcess = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, util_1.promisify)(pm2.stop).call(pm2, filename)];
            });
        });
    };
    Pm2Lib.prototype.getStartOptions = function (filename) {
        var alias = filename.replace('.js', '');
        return {
            script: "".concat(this.SCRIPT_PATH, "/").concat(filename),
            name: filename,
            log_date_format: 'YYYY-MM-DD HH:mm Z',
            output: "".concat(this.SCRIPT_PATH, "/").concat(alias, ".stdout.log"),
            error: "".concat(this.SCRIPT_PATH, "/").concat(alias, ".stderr.log"),
            exec_mode: 'cluster',
        };
    };
    return Pm2Lib;
}());
exports.default = new Pm2Lib();
