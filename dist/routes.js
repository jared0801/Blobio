"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
exports.router = express_1.default.Router({ mergeParams: true });
exports.router.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
});
exports.router.get('/register', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../../client/register.html'));
});
exports.router.use('/client', express_1.default.static(path_1.default.join(__dirname, '../../client')));
