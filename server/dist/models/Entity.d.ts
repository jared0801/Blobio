import { PlayerDto } from "./Player";
import { FoodDto } from "./Food";
import { EnemyDto } from "./Enemy";
export interface EntitySprite {
    x: number;
    y: number;
    dirX: number;
    dirY: number;
    curSpd: number;
    radius: number;
    mass: number;
    id: string;
    parentId: string;
}
export declare class Entity {
    static initPack: {
        player: PlayerDto[];
        food: FoodDto[];
        enemy: EnemyDto[];
    };
    static removePack: {
        player: string[];
        food: string[];
        enemy: string[];
    };
    sprites: EntitySprite[];
    id: string;
    maxSpd: number;
    constructor(params: any);
    createSprite(pid: string, x?: number, y?: number, mass?: number, radius?: number, curSpd?: number): EntitySprite;
    update(): void;
    updatePosition(): void;
    dirTowards(srcX: number, srcY: number, tarX: number, tarY: number): {
        x: number;
        y: number;
    };
    getDistanceFromAll(x: number, y: number): number[];
    getDistance(sprite: EntitySprite, x: number, y: number): number;
    getMass(): number;
}
