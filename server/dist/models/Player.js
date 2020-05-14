"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Entity_1 = require("./Entity");
var Enemy_1 = require("./Enemy");
var MAP_W = 3008;
var MAP_H = 3008;
/**
 * Class representing player
 * @class
 * @augments Entity
 */
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(params) {
        var _this = _super.call(this, params) || this;
        _this.socket = params.socket;
        _this.mass = 1;
        _this.radius = 32;
        _this.name = params.name;
        Player.list.set(_this.socket.id, _this);
        Entity_1.Entity.initPack.player.push(_this.getInitPack());
        return _this;
    }
    Player.onConnect = function (name, socket) {
        var newPlayer = new Player({
            socket: socket,
            name: name,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        newPlayer.socket.on('mouseMove', function (data) {
            var dirX = data.x - newPlayer.x;
            var dirY = data.y - newPlayer.y;
            //newPlayer.targetX = data.x;
            //newPlayer.targetY = data.y;
            var len = Math.sqrt(dirX * dirX + dirY * dirY);
            if (len < 1) {
                dirX = 0;
                dirY = 0;
            }
            else {
                dirX /= len;
                dirY /= len;
            }
            newPlayer.dirX = dirX;
            newPlayer.dirY = dirY;
        });
    };
    Player.onDisconnect = function (socket) {
        console.log(Player.list);
        console.log(socket.id + " just quit");
        if (Player.list.delete(socket.id)) {
            Entity_1.Entity.removePack.player.push(socket.id);
        }
    };
    Player.allInitPacks = function () {
        var e_1, _a;
        var players = [];
        try {
            for (var _b = __values(Player.list), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), id = _d[0], p = _d[1];
                players.push(p.getInitPack());
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return players;
    };
    Player.allUpdatePacks = function () {
        var pack = [];
        Player.list.forEach(function (player) {
            if (player) {
                player.update();
                pack.push(player.getUpdatePack());
            }
        });
        return pack;
    };
    Player.prototype.respawn = function () {
        this.x = Math.random() * MAP_W;
        this.y = Math.random() * MAP_H;
        this.radius = 32;
        this.mass = 1;
    };
    Player.prototype.getUpdatePack = function () {
        return {
            id: this.socket.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            radius: this.radius,
        };
    };
    Player.prototype.getInitPack = function () {
        return {
            id: this.socket.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            mass: this.mass,
            name: this.name
        };
    };
    Player.prototype.calculateSpeed = function () {
        return this.maxSpd - Math.log10(this.mass);
    };
    Player.prototype.update = function () {
        var _this = this;
        _super.prototype.update.call(this);
        this.curSpd = this.calculateSpeed();
        Player.list.forEach(function (player) {
            if (player != _this && _this.getDistance(player.x, player.y) < player.radius + _this.radius && Math.abs(_this.mass - player.mass) > 4) {
                if (_this.mass >= player.mass * 1.25) {
                    _this.radius += player.mass;
                    _this.mass += player.mass;
                    player.respawn();
                }
                else if (player.mass >= _this.mass * 1.25) {
                    player.radius += _this.mass;
                    player.mass += _this.mass;
                    _this.respawn();
                }
            }
        });
        Enemy_1.Enemy.list.forEach(function (enemy) {
            if (_this.getDistance(enemy.x, enemy.y) < enemy.radius + _this.radius && Math.abs(_this.mass - enemy.mass) > 4) {
                if (_this.mass >= enemy.mass * 1.25) {
                    _this.radius += enemy.mass;
                    _this.mass += enemy.mass;
                    enemy.respawn();
                }
                else if (enemy.mass >= _this.mass * 1.25) {
                    enemy.radius += _this.mass;
                    enemy.mass += _this.mass;
                    _this.respawn();
                }
            }
        });
    };
    Player.list = new Map();
    return Player;
}(Entity_1.Entity));
exports.Player = Player;
