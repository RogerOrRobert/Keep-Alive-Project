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
var express = require("express");
var pm2Lib_1 = require("./pm2Lib");
var socketIO_1 = require("./socketIO");
var exec = require('child_process').exec;
var fs = require('fs');
var app = express();
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.redirect('/index.html');
});
app.get('/miners', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = res).json;
                return [4 /*yield*/, pm2Lib_1.default.getProcesses()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.put('/miners/:filename/:action', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, filename, action, configFile, fileData, _b, _c, _d, _e, _f, _g, _h, error_1;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 9, , 10]);
                _a = req.params, filename = _a.filename, action = _a.action;
                configFile = 'src/aplications.json';
                fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                _b = action;
                switch (_b) {
                    case 'start': return [3 /*break*/, 1];
                    case 'restart': return [3 /*break*/, 3];
                    case 'stop': return [3 /*break*/, 5];
                }
                return [3 /*break*/, 7];
            case 1:
                _d = (_c = res).json;
                return [4 /*yield*/, pm2Lib_1.default.startProcess(filename)];
            case 2:
                _d.apply(_c, [_j.sent()]);
                return [3 /*break*/, 8];
            case 3:
                _f = (_e = res).json;
                return [4 /*yield*/, pm2Lib_1.default.restartProcess(filename)];
            case 4:
                _f.apply(_e, [_j.sent()]);
                return [3 /*break*/, 8];
            case 5:
                _h = (_g = res).json;
                return [4 /*yield*/, pm2Lib_1.default.stopProcess(filename)];
            case 6:
                _h.apply(_g, [_j.sent()]);
                return [3 /*break*/, 8];
            case 7: return [2 /*return*/, res.status(400).json({ message: "".concat(action, " is not supported!") })];
            case 8: return [3 /*break*/, 10];
            case 9:
                error_1 = _j.sent();
                res.status(500).json({ message: (error_1[0] || error_1).message });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
app.use(express.json());
app.post('/setStoreEnable', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var field, configFile, fileData;
    return __generator(this, function (_a) {
        field = req.body;
        if (field && field.enabled !== undefined) {
            configFile = 'src/aplications.json';
            fileData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            fileData.enabled = field.enabled;
            try {
                fs.writeFileSync(configFile, JSON.stringify(fileData, null, 2));
                res.status(200).send('Configuración guardada correctamente.');
            }
            catch (error) {
                console.error('Error al escribir en el archivo:', error);
                res.status(500).send('Error interno del servidor al guardar la configuración.');
            }
        }
        else {
            res.status(400).send('Solicitud incorrecta: Propiedad "enabled" no encontrada en la solicitud.');
        }
        return [2 /*return*/];
    });
}); });
var PORT = process.env.PORT || 3000;
var httpServer = app.listen(PORT, function () {
    console.log("[Server] Listening on :".concat(PORT));
});
socketIO_1.default.init(httpServer);
