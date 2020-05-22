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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Entity_1 = require("./Entity");
var Player_1 = require("./Player");
var Food_1 = require("./Food");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var MAP_W = 4008;
var MAP_H = 4008;
var text = fs_1.default.readFileSync(path_1.default.join(__dirname, "../../names.txt"), "utf-8");
var botNames = text.split("\n");
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(params) {
        var _this = _super.call(this, params) || this;
        // this.radius = 32;
        _this.sight = 500;
        _this.inDanger = false;
        _this.wandering = 0;
        var name;
        do {
            name = botNames[Math.floor(Math.random() * botNames.length)];
        } while (Enemy.isNameTaken(name));
        _this.name = name;
        Enemy.list.set(_this.id, _this);
        Entity_1.Entity.initPack.enemy.push(_this.getInitPack());
        return _this;
    }
    Enemy.isNameTaken = function (name) {
        Enemy.list.forEach(function (e) {
            if (e.name === name)
                return true;
        });
        return false;
    };
    Enemy.onConnect = function () {
        new Enemy({
            radius: 32,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
    };
    Enemy.allInitPacks = function () {
        var enemies = [];
        Enemy.list.forEach(function (enemy) {
            enemies.push(enemy.getInitPack());
        });
        return enemies;
    };
    Enemy.allUpdatePacks = function () {
        var pack = [];
        Enemy.list.forEach(function (enemy) {
            if (enemy) {
                enemy.update();
                pack.push(enemy.getUpdatePack());
            }
        });
        return pack;
    };
    /**
     * Finds the coordinates for the center of all this enemies sprites
     * @function getSpriteCenter
     * @return { x: number, y: number }
     */
    Enemy.prototype.getSpriteCenter = function () {
        var x = 0;
        var y = 0;
        this.sprites.forEach(function (sprite) {
            x += sprite.x;
            y += sprite.y;
        });
        x /= this.sprites.length;
        y /= this.sprites.length;
        return {
            x: x,
            y: y
        };
    };
    Enemy.prototype.destroySprite = function (p) {
        var index = this.sprites.indexOf(p);
        this.sprites.splice(index, 1);
    };
    Enemy.prototype.respawn = function () {
        if (Enemy.list.delete(this.id)) {
            Entity_1.Entity.removePack.enemy.push(this.id);
        }
    };
    Enemy.prototype.getUpdatePack = function () {
        return {
            id: this.id,
            sprites: this.sprites
        };
    };
    Enemy.prototype.getInitPack = function () {
        return {
            id: this.id,
            sprites: this.sprites,
            name: this.name
        };
    };
    Enemy.prototype.calculateSpeed = function (mass) {
        return this.maxSpd - Math.log10(mass);
    };
    Enemy.prototype.splitPlayer = function () {
        var largest = this.createSprite(this.id);
        largest.mass = 0;
        this.sprites.forEach(function (p) {
            if (p.mass >= largest.mass)
                largest = p;
        });
        if (largest.mass < 20)
            return;
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
    Enemy.prototype.update = function () {
        var _this = this;
        var foundPlayer = false;
        if (this.wandering > 0)
            this.wandering--;
        if (this.sprites.length < 1) {
            this.respawn();
        }
        this.sprites.forEach(function (sprite) {
            sprite.curSpd = _this.calculateSpeed(sprite.mass);
            Player_1.Player.list.forEach(function (player) {
                player.sprites.forEach(function (pSprite) {
                    if (_this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius && Math.abs(sprite.mass - pSprite.mass) > 4) {
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
                    if (!_this.wandering && _this.getDistance(sprite, pSprite.x, pSprite.y) < _this.sight) {
                        // Enemy sees the player
                        foundPlayer = true;
                        if (pSprite.mass <= sprite.mass * 1.25) {
                            // chase/eat player
                            var dir = _this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                            sprite.dirX = dir.x;
                            sprite.dirY = dir.y;
                        }
                        else if (sprite.mass <= pSprite.mass * 1.25) {
                            // run from player
                            _this.inDanger = true;
                            var dir = _this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                            sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;
                        }
                    }
                });
            });
            Enemy.list.forEach(function (enemy) {
                enemy.sprites.forEach(function (eSprite) {
                    // Respawn / kill cell on collision
                    if (enemy != _this && _this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius && Math.abs(sprite.mass - eSprite.mass) > 4) {
                        if (eSprite.mass >= sprite.mass * 1.25) {
                            eSprite.radius += sprite.radius;
                            eSprite.mass += sprite.mass;
                            _this.destroySprite(sprite);
                        }
                    }
                    // Keep enemy sprites from getting too close
                    else if (eSprite !== sprite && _this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        if (sprite.mass <= eSprite.mass) {
                            var dir = _this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                            eSprite.x -= dir.x * eSprite.curSpd;
                            eSprite.y -= dir.y * eSprite.curSpd;
                        }
                    }
                    // Observe environment to chase / run from enemies
                    if (!_this.inDanger && !_this.wandering && _this.getDistance(sprite, eSprite.x, eSprite.y) < _this.sight) {
                        foundPlayer = true;
                        var dir = _this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                        if (eSprite.mass >= sprite.mass * 1.25) {
                            sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;
                            _this.inDanger = true;
                        }
                        else if (sprite.mass >= eSprite.mass * 1.25) {
                            // run towards enemy
                            sprite.dirX = dir.x;
                            sprite.dirY = dir.y;
                        }
                    }
                });
            });
            if (!foundPlayer) {
                _this.inDanger = false;
            }
            // find closest food
            var closest;
            var dist = Infinity;
            if (!_this.inDanger) {
                Food_1.Food.list.forEach(function (f) {
                    if (_this.getDistance(sprite, f.getSprite().x, f.getSprite().y) < dist) {
                        dist = _this.getDistance(sprite, f.getSprite().x, f.getSprite().y);
                        closest = f.getSprite();
                    }
                });
                if (closest) {
                    var dir = _this.dirTowards(sprite.x, sprite.y, closest.x, closest.y);
                    sprite.dirX = dir.x;
                    sprite.dirY = dir.y;
                }
            }
            _this.sprites.forEach(function (sprite) {
                if (sprite.mass > 200 && Math.random() < 0.1) {
                    _this.splitPlayer();
                }
                if (sprite.mass > 500) {
                    _this.destroySprite(sprite);
                }
            });
        });
        // Add some chance that the enemy won't do exactly as expected
        if (Math.random() < 0.005) {
            this.wandering = 200;
        }
        if (this.sprites.length < 5 && Math.random() < 0.001) {
            this.splitPlayer();
        }
        _super.prototype.update.call(this);
    };
    Enemy.list = new Map();
    return Enemy;
}(Entity_1.Entity));
exports.Enemy = Enemy;
