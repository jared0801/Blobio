import { PlayerDto } from "./Player";
import { FoodDto } from "./Food";
import { EnemyDto } from "./Enemy";
export declare class Entity {
    static initPack: {
        player: PlayerDto[];
        food: FoodDto[];
        enemy: EnemyDto[];
    };
    static removePack: {
        player: any;
        food: any;
        enemy: any;
    };
    x: number;
    y: number;
    id: string;
    dirX: number;
    dirY: number;
    maxSpd: number;
    curSpd: number;
    radius: number;
    constructor(params: any);
    update(): void;
    updatePosition(): void;
    getDistance(x: number, y: number): number;
}
