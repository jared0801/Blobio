import { Entity } from './Entity';
import { Socket } from 'socket.io';
/**
 * Class representing player
 * @class
 * @augments Entity
 */
export declare class Player extends Entity {
    static list: Map<string, Player>;
    socket: Socket;
    mass: number;
    name: string;
    constructor(params: any);
    static onConnect(name: string, socket: Socket): void;
    static onDisconnect(socket: Socket): void;
    static allInitPacks(): {
        id: string;
        x: number;
        y: number;
        radius: number;
        mass: number;
        name: string;
    }[];
    static allUpdatePacks(): PlayerDto[];
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
    update(): void;
}
export interface PlayerDto {
    id: string;
    x: number;
    y: number;
    mass: number;
    radius: number;
}
