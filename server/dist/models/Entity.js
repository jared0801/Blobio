"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = /** @class */ (function () {
    function Entity(params) {
        this.x = params.x;
        this.y = params.y;
        this.dirX = 0;
        this.dirY = 0;
        this.id = params.id;
        this.maxSpd = 10;
        this.curSpd = 10;
        this.radius = params.radius || 0;
    }
    Entity.prototype.update = function () {
        this.updatePosition();
    };
    Entity.prototype.updatePosition = function () {
        this.x += this.dirX * this.curSpd;
        if (this.x > 3008 || this.x < 0) {
            this.x -= this.dirX * this.curSpd;
        }
        this.y += this.dirY * this.curSpd;
        if (this.y > 3008 || this.y < 0) {
            this.y -= this.dirY * this.curSpd;
        }
    };
    Entity.prototype.getDistance = function (x, y) {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
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
