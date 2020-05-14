import { Entity } from './Entity';
export declare class Enemy extends Entity {
    static list: Map<string, Enemy>;
    mass: number;
    name: string;
    sight: number;
    constructor(params: any);
    static isNameTaken(name: string): boolean;
    static onConnect(name: string): void;
    static onDisconnect(id: string): void;
    static allInitPacks(): {
        id: string;
        x: number;
        y: number;
        radius: number;
        mass: number;
        name: string;
    }[];
    static allUpdatePacks(): EnemyDto[];
    respawn(): void;
    getUpdatePack(): {
        id: string;
        x: number;
        y: number;
        mass: number;
        radius: number;
    };
    getInitPack(): {
        id: string;
        x: number;
        y: number;
        radius: number;
        mass: number;
        name: string;
    };
    private calculateSpeed;
    dirTowards(x: number, y: number): {
        x: number;
        y: number;
    };
    update(): void;
}
export interface EnemyDto {
    id: string;
    x: number;
    y: number;
    mass: number;
    radius: number;
}
