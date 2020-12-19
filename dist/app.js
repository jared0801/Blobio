"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = require("dotenv");
var Player_1 = require("./models/Player");
var Food_1 = require("./models/Food");
var Enemy_1 = require("./models/Enemy");
var Entity_1 = require("./models/Entity");
var routes_1 = require("./routes");
var SocketEvents_1 = require("./SocketEvents");
dotenv_1.config();
var app = express_1.default();
var port = process.env.PORT || 5000;
app.use('/', routes_1.router);
var http = app.listen(port, function () { return console.log('Server running'); });
SocketEvents_1.connectIO(http);
var topScores = [];
setInterval(function () {
    update();
}, 1000 / 25);
function update() {
    // occasionally spawn enemy
    if (Math.random() < 0.005 && Enemy_1.Enemy.list.size < 100) {
        // Spawn between 3 and 10 enemies
        var rand = Math.floor(Math.random() * 8) + 3;
        for (var i = 0; i < rand; i++) {
            Enemy_1.Enemy.onConnect();
        }
    }
    // occasionally spawn food
    if (Math.random() < 0.5 && Food_1.Food.list.size < 200) {
        Food_1.Food.spawnRandomFood();
    }
    else if (Math.random() < 0.05 && Food_1.Food.list.size < 500) {
        Food_1.Food.spawnRandomFood();
    }
    topScores = [];
    // Get new top players
    Player_1.Player.list.forEach(function (player) {
        topScores.push({
            name: player.name,
            score: player.getMass()
        });
    });
    // Include bots in top players list
    Enemy_1.Enemy.list.forEach(function (enemy) {
        topScores.push({
            name: enemy.name,
            score: enemy.getMass()
        });
    });
    topScores = topScores.sort(function (a, b) {
        return b.score - a.score;
    }).slice(0, 10);
    updateClients();
}
function updateClients() {
    var updatePack = {
        player: Player_1.Player.allUpdatePacks(),
        food: Food_1.Food.allUpdatePacks(),
        enemy: Enemy_1.Enemy.allUpdatePacks(),
        topScores: topScores
    };
    //if(updatePack.player[0])
    //console.log(updatePack.player[0].sprites);
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
}
