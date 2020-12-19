import { Entity, EntitySprite } from './Entity';
export declare class Food extends Entity {
    static list: Map<string, Food>;
    mass: number;
    constructor(params: any);
    static allInitPacks(): FoodDto[];
    static allUpdatePacks(): FoodDto[];
    static spawnRandomFood(): void;
    getInitPack(): {
        id: string;
        sprites: EntitySprite[];
    };
    getUpdatePack(): {
        id: string;
        sprites: EntitySprite[];
    };
    getSprite(): EntitySprite;
    update(): void;
}
export interface FoodDto {
    id: string;
    sprites: EntitySprite[];
}
