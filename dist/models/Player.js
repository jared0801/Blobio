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
Object.defineProperty(exports, "__esModule", { value: true });
var Entity_1 = require("./Entity");
var Enemy_1 = require("./Enemy");
var MAP_W = 4008;
var MAP_H = 4008;
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
        _this.name = params.name;
        _this.id = _this.socket.id;
        Player.list.set(_this.socket.id, _this);
        Entity_1.Entity.initPack.player.push(_this.getInitPack());
        return _this;
    }
    Player.onConnect = function (name, socket) {
        var newPlayer = new Player({
            socket: socket,
            name: name,
            radius: 32,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        newPlayer.socket.on('mouseMove', function (data) {
            newPlayer.sprites.forEach(function (sprite) {
                var dirX = data.x - sprite.x;
                var dirY = data.y - sprite.y;
                var len = Math.sqrt(dirX * dirX + dirY * dirY);
                if (len < 1) {
                    dirX = 0;
                    dirY = 0;
                }
                else {
                    dirX /= len;
                    dirY /= len;
                }
                sprite.dirX = dirX;
                sprite.dirY = dirY;
            });
        });
        newPlayer.socket.on('space', function () {
            newPlayer.splitPlayer();
        });
    };
    Player.onDisconnect = function (socket) {
        console.log(socket.id + " just quit");
        if (Player.list.delete(socket.id)) {
            Entity_1.Entity.removePack.player.push(socket.id);
        }
    };
    Player.allInitPacks = function () {
        var players = [];
        Player.list.forEach(function (player) {
            players.push(player.getInitPack());
        });
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
    Player.prototype.splitPlayer = function () {
        //if(p.mass < 20) return;
        var largest = this.createSprite(this.id);
        largest.mass = 0;
        this.sprites.forEach(function (p) {
            if (p.mass >= largest.mass)
                largest = p;
        });
        var x = largest.x + largest.dirX * Math.random() * 50 + 10;
        var y = largest.y + largest.dirY * Math.random() * 50 + 10;
        var portion = Math.random() * 0.5 + 0.25;
        var radius = Math.max(1, Math.floor(largest.radius * portion));
        largest.radius = Math.max(1, largest.radius - radius);
        var mass = Math.max(1, Math.floor(largest.mass * portion));
        largest.mass = Math.max(1, largest.mass - mass);
        var curSpd = Math.random() * 8 + 2;
        var newOne = this.createSprite(this.id, x, y, mass, radius, curSpd);
        this.sprites.push(newOne);
    };
    Player.prototype.destroySprite = function (p) {
        var index = this.sprites.indexOf(p);
        this.sprites.splice(index, 1);
        if (this.sprites.length < 1)
            this.respawn();
    };
    Player.prototype.respawn = function () {
        var sprite = _super.prototype.createSprite.call(this, this.id, Math.random() * MAP_W, Math.random() * MAP_H);
        this.sprites.push(sprite);
    };
    Player.prototype.getUpdatePack = function () {
        return {
            id: this.id,
            sprites: this.sprites
        };
    };
    Player.prototype.getInitPack = function () {
        return {
            id: this.id,
            sprites: this.sprites,
            name: this.name
        };
    };
    Player.prototype.calculateSpeed = function (mass) {
        return this.maxSpd - 3 * Math.log10(mass);
    };
    Player.prototype.update = function () {
        var _this = this;
        this.sprites.forEach(function (sprite) {
            sprite.curSpd = _this.calculateSpeed(sprite.mass);
            Player.list.forEach(function (player) {
                player.sprites.forEach(function (pSprite) {
                    if (player != _this && _this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius && Math.abs(sprite.mass - pSprite.mass) > 4) {
                        if (pSprite.mass >= sprite.mass * 1.25) {
                            pSprite.radius += sprite.radius;
                            pSprite.mass += sprite.mass;
                            _this.destroySprite(sprite);
                        }
                    }
                    else if (pSprite !== sprite && _this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius) {
                        if (sprite.mass <= pSprite.mass) {
                            var dir = _this.dirTowards(pSprite.x, pSprite.y, sprite.x, sprite.y);
                            pSprite.x -= dir.x * 2;
                            pSprite.y -= dir.y * 2;
                        }
                    }
                });
            });
            Enemy_1.Enemy.list.forEach(function (enemy) {
                enemy.sprites.forEach(function (eSprite) {
                    if (_this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius && Math.abs(sprite.mass - eSprite.mass) > 4) {
                        if (eSprite.mass >= sprite.mass * 1.25) {
                            eSprite.radius += sprite.radius;
                            eSprite.mass += sprite.mass;
                            _this.destroySprite(sprite);
                        }
                    }
                    else if (eSprite !== sprite && _this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        if (sprite.mass <= eSprite.mass) {
                            var dir = _this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                            eSprite.x -= dir.x * eSprite.curSpd;
                            eSprite.y -= dir.y * eSprite.curSpd;
                        }
                    }
                });
            });
        });
        _super.prototype.update.call(this);
    };
    Player.list = new Map();
    return Player;
}(Entity_1.Entity));
exports.Player = Player;
