"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MAP_W = 4008;
var MAP_H = 4008;
var Entity = /** @class */ (function () {
    function Entity(params) {
        this.sprites = [];
        this.id = params.id || '' + Math.random();
        if (params.socket) {
            // Real player: override id with socket id
            this.id = params.socket.id;
        }
        this.maxSpd = 10;
        var sprite = this.createSprite(this.id, params.x, params.y, 1);
        this.sprites.push(sprite);
    }
    Entity.prototype.createSprite = function (pid, x, y, mass, curSpd) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (mass === void 0) { mass = 1; }
        if (curSpd === void 0) { curSpd = 10; }
        return {
            x: x,
            y: y,
            dirX: 0,
            dirY: 0,
            curSpd: curSpd,
            radius: 31 + mass,
            mass: mass,
            id: '' + Math.random(),
            parentId: pid,
            splitTime: -1,
            splitParentId: ''
        };
    };
    Entity.prototype.update = function () {
        this.updatePosition();
    };
    Entity.prototype.updatePosition = function () {
        this.sprites.forEach(function (sprite) {
            sprite.x += sprite.dirX * sprite.curSpd;
            if (sprite.x > MAP_W)
                sprite.x = MAP_W;
            if (sprite.x < 0)
                sprite.x = 0;
            sprite.y += sprite.dirY * sprite.curSpd;
            if (sprite.y > MAP_H)
                sprite.y = MAP_H;
            if (sprite.y < 0)
                sprite.y = 0;
            sprite.radius = 31 + sprite.mass;
        });
    };
    Entity.prototype.dirTowards = function (srcX, srcY, tarX, tarY) {
        var dirX = tarX - srcX;
        var dirY = tarY - srcY;
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
    Entity.prototype.getDistanceFromAll = function (x, y) {
        return Array.from(this.sprites.values()).map(function (sprite) {
            return Math.sqrt(Math.pow(sprite.x - x, 2) + Math.pow(sprite.y - y, 2));
        });
    };
    /**
     * Finds the coordinates for the center of all this players sprites
     * @function getSpriteCenter
     * @return { x: number, y: number }
     */
    Entity.prototype.getSpriteCenter = function () {
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
    Entity.prototype.getDistance = function (sprite, x, y) {
        return Math.sqrt(Math.pow(sprite.x - x, 2) + Math.pow(sprite.y - y, 2));
    };
    Entity.prototype.getMass = function () {
        var totalMass = 0;
        this.sprites.forEach(function (sprite) {
            totalMass += sprite.mass;
        });
        return totalMass;
    };
    Entity.initPack = {
        player: [],
        food: [],
        enemy: []
    };
    Entity.removePack = { player: [], food: [], enemy: [] };
    return Entity;
}());
exports.Entity = Entity;
