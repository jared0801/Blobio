import { PlayerDto } from "./Player";
import { FoodDto } from "./Food";
import { EnemyDto } from "./Enemy";

export class Entity {
    static initPack = { 
        player: [] as PlayerDto[],
        food: [] as FoodDto[],
        enemy: [] as EnemyDto[]
    };
    static removePack = { player: [] as any, food: [] as any, enemy: [] as any };
    x: number;
    y: number;
    id: string;
    dirX: number;
    dirY: number;
    maxSpd: number;
    curSpd: number;
    radius: number;
    constructor(params: any) {
        this.x = params.x;
        this.y = params.y;
        this.dirX = 0;
        this.dirY = 0;
        this.id = params.id;
        this.maxSpd = 10;
        this.curSpd = 10;
        this.radius = params.radius || 0;
    }

    update() {
        this.updatePosition();
    }

    updatePosition(): void {
        this.x += this.dirX * this.curSpd;
        if(this.x > 3008 || this.x < 0) {
            this.x -= this.dirX * this.curSpd;
        }
        this.y += this.dirY * this.curSpd;
        if(this.y > 3008 || this.y < 0) {
            this.y -= this.dirY * this.curSpd;
        }
    }

    getDistance(x: number, y: number): number {
        return Math.sqrt(Math.pow(this.x-x,2) + Math.pow(this.y-y,2));
    }
}