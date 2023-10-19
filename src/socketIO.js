"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var pm2Lib_1 = require("./pm2Lib");
var SocketIO = /** @class */ (function () {
    function SocketIO() {
    }
    SocketIO.prototype.init = function (httpServer) {
        var _this = this;
        if (this.io !== undefined) {
            throw new Error('Socket server already defined!');
        }
        this.io = new socket_io_1.Server(httpServer);
        pm2Lib_1.default.onLogOut(function (procLog) {
            var _a;
            (_a = _this.io) === null || _a === void 0 ? void 0 : _a.emit("".concat(procLog.process.name, ":out_log"), procLog);
        });
    };
    return SocketIO;
}());
exports.default = new SocketIO();
