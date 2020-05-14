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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Entity_1 = require("./Entity");
var Player_1 = require("./Player");
var Food_1 = require("./Food");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var text = fs_1.default.readFileSync(path_1.default.join(__dirname, "../../names.txt"), "utf-8");
var botNames = text.split("\n");
var MAP_W = 3008;
var MAP_H = 3008;
var update_count = 0;
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy(params) {
        var _this = _super.call(this, params) || this;
        _this.mass = 1;
        _this.radius = 32;
        _this.sight = 500;
        var name;
        do {
            name = botNames[Math.floor(Math.random() * botNames.length)];
        } while (Enemy.isNameTaken(name));
        _this.name = name;
        _this.dirX = Math.random();
        _this.dirY = Math.random();
        _this.id = '' + Math.random();
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
    Enemy.onConnect = function (name) {
        var newEnemy = new Enemy({
            name: name,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        /*newEnemy.socket.on('mouseMove', (data: { x: number; y: number; }) => {

            let dirX = data.x - newEnemy.x;
            let dirY = data.y - newEnemy.y;
            //newEnemy.targetX = data.x;
            //newEnemy.targetY = data.y;
    
            let len = Math.sqrt(dirX * dirX + dirY * dirY);
            if(len < 1) {
                dirX = 0;
                dirY = 0;
            } else {
                dirX /= len;
                dirY /= len;
            }
    
            newEnemy.dirX = dirX;
            newEnemy.dirY = dirY;
        });*/
    };
    Enemy.onDisconnect = function (id) {
        if (Enemy.list.delete(id)) {
            Entity_1.Entity.removePack.enemy.push(id);
        }
    };
    Enemy.allInitPacks = function () {
        var e_1, _a;
        var enemies = [];
        try {
            for (var _b = __values(Enemy.list), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), id = _d[0], e = _d[1];
                enemies.push(e.getInitPack());
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
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
    Enemy.prototype.respawn = function () {
        this.x = Math.random() * MAP_W;
        this.y = Math.random() * MAP_H;
        this.radius = 32;
        this.mass = 1;
    };
    Enemy.prototype.getUpdatePack = function () {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            radius: this.radius,
        };
    };
    Enemy.prototype.getInitPack = function () {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            mass: this.mass,
            name: this.name
        };
    };
    Enemy.prototype.calculateSpeed = function () {
        return this.maxSpd - Math.log10(this.mass);
    };
    Enemy.prototype.dirTowards = function (x, y) {
        var dirX = x - this.x;
        var dirY = y - this.y;
        var len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len < 1) {
            dirX = 0;
            dirY = 0;
        }
        else {
            dirX /= len;
            dirY /= len;
        }
        return { x: dirX, y: dirY };
    };
    Enemy.prototype.update = function () {
        var _this = this;
        //this.updatePosition();
        update_count++;
        var danger = false;
        this.curSpd = this.calculateSpeed();
        Player_1.Player.list.forEach(function (player) {
            // Handle collision with player
            if (_this.getDistance(player.x, player.y) < player.radius + _this.radius && Math.abs(_this.mass - player.mass) > 4) {
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
            // Choose direction based on distance to players
            if (_this.getDistance(player.x, player.y) < _this.sight) {
                // Enemy sees the player
                if (player.mass <= _this.mass * 1.25) {
                    // chase/eat player
                    danger = true;
                    var dir = _this.dirTowards(player.x, player.y);
                    _this.dirX = dir.x;
                    _this.dirY = dir.y;
                }
                else if (_this.mass <= player.mass * 1.25) {
                    // run from player
                    danger = true;
                    var dir = _this.dirTowards(player.x, player.y);
                    _this.dirX = -dir.x;
                    _this.dirY = -dir.y;
                }
            }
        });
        Enemy.list.forEach(function (enemy) {
            if (enemy != _this && _this.getDistance(enemy.x, enemy.y) < enemy.radius + _this.radius && Math.abs(_this.mass - enemy.mass) > 4) {
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
            if (_this.getDistance(enemy.x, enemy.y) < _this.sight) {
                // run from enemy
                danger = true;
                var dir = _this.dirTowards(enemy.x, enemy.y);
                if (enemy.mass >= _this.mass * 1.25) {
                    // run from enemy
                    _this.dirX = -dir.x;
                    _this.dirY = -dir.y;
                }
                else if (_this.mass >= enemy.mass * 1.25) {
                    _this.dirX = dir.x;
                    _this.dirY = dir.y;
                }
            }
        });
        // find closest food
        var closest;
        var dist = Infinity;
        if (!danger || Math.random() < 0.2) {
            Food_1.Food.list.forEach(function (f) {
                if (_this.getDistance(f.x, f.y) < dist) {
                    dist = _this.getDistance(f.x, f.y);
                    closest = f;
                }
            });
            if (closest) {
                var dir = this.dirTowards(closest.x, closest.y);
                this.dirX = dir.x;
                this.dirY = dir.y;
            }
        }
        /*if(Math.random() < 0.01) {
            this.dirX = Math.random() * 2 - 1;
            this.dirY = Math.random() * 2 - 1;
        }*/
        /*if(!this.dirX && !this.dirY) {
            this.dirX = Math.random() * 2 - 1;
            this.dirY = Math.random() * 2 - 1;
        }*/
        _super.prototype.updatePosition.call(this);
    };
    Enemy.list = new Map();
    return Enemy;
}(Entity_1.Entity));
exports.Enemy = Enemy;
