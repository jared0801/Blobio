import { PlayerDto } from "./Player";
import { FoodDto } from "./Food";
import { EnemyDto } from "./Enemy";
import { Config } from '../config';
let config: Config = require("../config.json");

//const config.MAP_W = 8008;
//const config.MAP_H = 8008;

export interface EntitySprite {
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    curSpd: number,
    radius: number,
    mass: number,
    id: string,
    parentId: string,
    splitTime: number,
    splitParentId: string
}

export class Entity {
    static initPack = { 
        player: [] as PlayerDto[],
        food: [] as FoodDto[],
        enemy: [] as EnemyDto[]
    };
    static removePack = { player: [] as string[], food: [] as string[], enemy: [] as string[] };  
    sprites: EntitySprite[];
    id: string;
    maxSpd: number;
    constructor(params: any) {
        this.sprites = [];

        this.id = params.id || '' + Math.random();
        if(params.socket) {
            // Real player: override id with socket id
            this.id = params.socket.id
        }
        this.maxSpd = 10;

        const sprite = this.createSprite(this.id, params.x, params.y, 1);
        this.sprites.push(sprite);
    }

    createSprite(pid: string, x=0, y=0, mass=1, curSpd=10): EntitySprite {
        return {
            x,
            y,
            dirX: 0,
            dirY: 0,
            curSpd,
            radius: 31 + mass,
            mass,
            id: '' + Math.random(),
            parentId: pid,
            splitTime: -1,
            splitParentId: ''
        }
    }

    protected calculateSpeed(mass: number): number {
        return this.maxSpd - 3*Math.log10(mass);
    }

    update() {
        this.updatePosition();
    }

    updatePosition(): void {
        this.sprites.forEach(sprite => {
            sprite.x += sprite.dirX * sprite.curSpd;
            if(sprite.x > config.MAP_W) sprite.x = config.MAP_W;
            if(sprite.x < 0) sprite.x = 0;

            sprite.y += sprite.dirY * sprite.curSpd;
            if(sprite.y > config.MAP_H) sprite.y = config.MAP_H;
            if(sprite.y < 0) sprite.y = 0;

            sprite.radius = 31 + (sprite.mass / 4);
            if(this.sprites.length > 1) {
                if(sprite.radius > 500) {
                    sprite.radius = 500;
                }
            } else {
                if(sprite.radius > 600) {
                    sprite.radius = 600;
                }
            }
        });
    }

    dirTowards(srcX: number, srcY: number, tarX: number, tarY: number): { x: number, y: number } {
        let dirX = tarX - srcX;
        let dirY = tarY - srcY;
        let len = Math.sqrt(dirX * dirX + dirY * dirY);
        if(len < 1) {
            dirX = 0;
            dirY = 0;
        } else {
            dirX /= len;
            dirY /= len;
        }
        return { x: dirX, y: dirY };
    }

    getDistanceFromAll(x: number, y: number): number[] {
        return Array.from(this.sprites.values()).map(sprite => {
            return Math.sqrt(Math.pow(sprite.x-x,2) + Math.pow(sprite.y-y,2))
        });
    }

    /**
     * Finds the coordinates for the center of all this players sprites
     * @function getSpriteCenter
     * @return { x: number, y: number }
     */
    getSpriteCenter() {
        let x = 0;
        let y = 0;
        this.sprites.forEach(sprite => {
            x += sprite.x;
            y += sprite.y;
        });
        x /= this.sprites.length;
        y /= this.sprites.length;
        return {
            x,
            y
        }
    }

    getDistance(sprite: EntitySprite, x: number, y: number): number {
        return Math.sqrt(Math.pow(sprite.x-x,2) + Math.pow(sprite.y-y,2))
    }

    getMass(): number {
        let totalMass = 0;
        this.sprites.forEach(sprite => {
            totalMass += sprite.mass;
        });
        return totalMass;
    }

    getLargestSprite(): EntitySprite {
        let largest: EntitySprite = this.sprites[0];

        this.sprites.forEach(p => {
            if(p.mass >= largest.mass) largest = p;
        });

        return largest;
    }
}