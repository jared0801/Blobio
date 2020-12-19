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
    Enemy.prototype.rejoinPlayer = function (sprite) {
        var parent = this.sprites.filter(function (spr) { return spr.id === sprite.id; })[0];
        parent.mass += sprite.mass;
        this.destroySprite(sprite);
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
        var mass = Math.max(1, Math.floor(largest.mass * portion));
        largest.mass = Math.max(1, largest.mass - mass);
        var curSpd = Math.random() * 8 + 2;
        var newOne = this.createSprite(this.id, x, y, mass, curSpd);
        // Reset split timer
        newOne.splitTime = 1000;
        newOne.splitParentId = largest.id;
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
        var target = { x: 0, y: 0 };
        // Decision loop (all sprites help make decision)
        this.sprites.forEach(function (sprite) {
            sprite.curSpd = _this.calculateSpeed(sprite.mass);
            Player_1.Player.list.forEach(function (player) {
                player.sprites.forEach(function (pSprite) {
                    if (_this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius) {
                        // Enemy and player sprites are colliding
                        if (pSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // player eats this sprite
                            pSprite.mass += sprite.mass;
                            _this.destroySprite(sprite);
                        }
                        else {
                            if (sprite.mass <= pSprite.mass) {
                                // move player away to prevent players stacking on top of each other
                                var dir = _this.dirTowards(pSprite.x, pSprite.y, sprite.x, sprite.y);
                                pSprite.x -= dir.x * 2;
                                pSprite.y -= dir.y * 2;
                            }
                        }
                    }
                    if (!_this.wandering && _this.getDistance(sprite, pSprite.x, pSprite.y) < _this.sight) {
                        // Enemy sees the player
                        foundPlayer = true;
                        //let dir = this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                        if (pSprite.mass <= sprite.mass * 1.25 && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // chase/eat player
                            /*sprite.dirX = dir.x;
                            sprite.dirY = dir.y;*/
                            target.x = pSprite.x;
                            target.y = pSprite.y;
                        }
                        else if (sprite.mass <= pSprite.mass * 1.25 && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // run from player
                            _this.inDanger = true;
                            target.x = pSprite.x;
                            target.y = pSprite.y;
                            /*sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;*/
                        }
                    }
                });
            });
            Enemy.list.forEach(function (enemy) {
                enemy.sprites.forEach(function (eSprite) {
                    if (_this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        // This enemies sprite and another enemies sprite are colliding
                        if (enemy != _this && eSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // other enemy eats this sprite
                            eSprite.mass += sprite.mass;
                            _this.destroySprite(sprite);
                        }
                        else if (eSprite !== sprite) {
                            if (sprite.mass <= eSprite.mass) {
                                // move other enemy away to prevent players stacking on top of each other
                                var dir = _this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                                eSprite.x -= dir.x * 2;
                                eSprite.y -= dir.y * 2;
                            }
                        }
                    }
                    // Observe environment to chase / run from enemies
                    if (!_this.wandering && _this.getDistance(sprite, eSprite.x, eSprite.y) < _this.sight) {
                        foundPlayer = true;
                        if (eSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // This enemy sees another enemy that can eat him and runs away
                            //let dir = this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                            //sprite.dirX = -dir.x;
                            //sprite.dirY = -dir.y;
                            target.x = eSprite.x;
                            target.y = eSprite.y;
                            _this.inDanger = true;
                        }
                        else if (sprite.mass >= eSprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // This enemy sees another enemy that he can eat and runs towards him
                            //let dir = this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                            //sprite.dirX = dir.x;
                            //sprite.dirY = dir.y;
                            target.x = eSprite.x;
                            target.y = eSprite.y;
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
            if (!_this.inDanger && !foundPlayer) {
                Food_1.Food.list.forEach(function (f) {
                    if (_this.getDistance(sprite, f.getSprite().x, f.getSprite().y) < dist) {
                        dist = _this.getDistance(sprite, f.getSprite().x, f.getSprite().y);
                        closest = f.getSprite();
                    }
                });
                if (closest) {
                    /*let dir = this.dirTowards(sprite.x, sprite.y, closest.x, closest.y);
                    sprite.dirX = dir.x;
                    sprite.dirY = dir.y;*/
                    target.x = closest.x;
                    target.y = closest.y;
                }
            }
            _this.sprites.forEach(function (sprite) {
                if (sprite.mass > 50 && Math.random() < 0.01) {
                    _this.splitPlayer();
                }
            });
            if (_this.getDistance(sprite, _this.getSpriteCenter().x, _this.getSpriteCenter().y) > sprite.radius * 3) {
                target.x = _this.getSpriteCenter().x;
                target.y = _this.getSpriteCenter().y;
            }
            if (sprite.splitParentId !== '') {
                if (sprite.splitTime > 0)
                    sprite.splitTime--;
                if (sprite.splitTime === 0) {
                    _this.rejoinPlayer(sprite);
                }
            }
        });
        // Action loop (all sprites move based on the target that was decided & their position)
        this.sprites.forEach(function (sprite) {
            var dir = _this.dirTowards(sprite.x, sprite.y, target.x, target.y);
            if (_this.inDanger) {
                sprite.dirX = -dir.x;
                sprite.dirY = -dir.y;
            }
            else {
                sprite.dirX = dir.x;
                sprite.dirY = dir.y;
            }
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
