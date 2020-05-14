import { Entity } from './Entity';
export declare class Food extends Entity {
    static list: Map<string, Food>;
    mass: number;
    constructor(params: any);
    static allInitPacks(): FoodDto[];
    static allUpdatePacks(): FoodDto[];
    static spawnRandomFood(): void;
    getInitPack(): {
        id: string;
        x: number;
        y: number;
    };
    getUpdatePack(): {
        id: string;
        x: number;
        y: number;
    };
    update(): void;
}
export interface FoodDto {
    id: string;
    x: number;
    y: number;
}
