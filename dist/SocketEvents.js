"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var Player_1 = require("./models/Player");
var Food_1 = require("./models/Food");
var Enemy_1 = require("./models/Enemy");
function connectIO(server) {
    var io = socket_io_1.default(server, {});
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
                //console.log(Enemy.allInitPacks()[0].sprites);
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
}
exports.connectIO = connectIO;
