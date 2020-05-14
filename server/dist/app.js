"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = require("dotenv");
var socket_io_1 = __importDefault(require("socket.io"));
var Player_1 = require("./models/Player");
var Food_1 = require("./models/Food");
var Enemy_1 = require("./models/Enemy");
var Entity_1 = require("./models/Entity");
dotenv_1.config();
var app = express_1.default();
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
});
app.get('/register', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, '../../client/register.html'));
});
app.use('/client', express_1.default.static(path_1.default.join(__dirname, '../../client')));
var http = app.listen(5000, function () { return console.log('Server running'); });
var io = socket_io_1.default(http, {});
var LOGGED_IN = new Map();
var DEBUG = true;
io.sockets.on('connection', function (socket) {
    socket.on('signIn', function (data) {
        // Validate name
        var valid = true;
        Player_1.Player.list.forEach(function (p) {
            if (data.name === p.name) {
                valid = false;
                socket.emit('signInResponse', { success: false });
            }
        });
        if (valid) {
            Player_1.Player.onConnect(data.name, socket);
            socket.emit('init', {
                player: Player_1.Player.allInitPacks(),
                food: Food_1.Food.allInitPacks(),
                enemy: Enemy_1.Enemy.allInitPacks()
            });
            socket.emit('signInResponse', { success: true });
        }
    });
    socket.on('disconnect', function () {
        Player_1.Player.onDisconnect(socket);
        //io.sockets.emit('remove', { id: socket.id });
    });
    socket.on('sendMsgToServer', function (data) {
        var player = Player_1.Player.list.get(socket.id);
        if (player) {
            var playerName_1 = player.name;
            Player_1.Player.list.forEach(function (player) {
                player.socket.emit('addToChat', playerName_1 + ": " + data);
            });
        }
    });
});
setInterval(function () {
    // occasionally spawn enemy
    if (Math.random() < 0.01) {
        new Enemy_1.Enemy({
            x: Math.random() * 3008,
            y: Math.random() * 3008
        });
    }
    var updatePack = {
        player: Player_1.Player.allUpdatePacks(),
        food: Food_1.Food.allUpdatePacks(),
        enemy: Enemy_1.Enemy.allUpdatePacks()
    };
    // Send update pack to every player 
    Player_1.Player.list.forEach(function (player) {
        player.socket.emit('init', Entity_1.Entity.initPack);
        player.socket.emit('update', updatePack);
        player.socket.emit('remove', Entity_1.Entity.removePack);
    });
    Entity_1.Entity.initPack.player = [];
    Entity_1.Entity.initPack.food = [];
    Entity_1.Entity.initPack.enemy = [];
    Entity_1.Entity.removePack.player = [];
    Entity_1.Entity.removePack.food = [];
    Entity_1.Entity.removePack.enemy = [];
}, 1000 / 25);
