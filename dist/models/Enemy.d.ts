import { Entity, EntitySprite } from './Entity';
export declare class Enemy extends Entity {
    static list: Map<string, Enemy>;
    name: string;
    sight: number;
    inDanger: boolean;
    wandering: number;
    constructor(params: any);
    static isNameTaken(name: string): boolean;
    static onConnect(): void;
    static allInitPacks(): EnemyDto[];
    static allUpdatePacks(): EnemyDto[];
    /**
     * Finds the coordinates for the center of all this enemies sprites
     * @function getSpriteCenter
     * @return { x: number, y: number }
     */
    getSpriteCenter(): {
        x: number;
        y: number;
    };
    destroySprite(p: EntitySprite): void;
    respawn(): void;
    getUpdatePack(): {
        id: string;
        sprites: EntitySprite[];
    };
    getInitPack(): {
        id: string;
        sprites: EntitySprite[];
        name: string;
    };
    private calculateSpeed;
    rejoinPlayer(sprite: EntitySprite): void;
    splitPlayer(): void;
    update(): void;
}
export interface EnemyDto {
    id: string;
    sprites: EntitySprite[];
}
