import { Entity, EntitySprite } from './Entity';
import { Socket } from 'socket.io';
/**
 * Class representing player
 * @class
 * @augments Entity
 */
export declare class Player extends Entity {
    static list: Map<string, Player>;
    socket: Socket;
    name: string;
    constructor(params: any);
    static onConnect(name: string, socket: Socket): void;
    static onDisconnect(socket: Socket): void;
    static allInitPacks(): PlayerDto[];
    static allUpdatePacks(): PlayerDto[];
    splitPlayer(): void;
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
    update(): void;
}
export interface PlayerDto {
    id: string;
    sprites: EntitySprite[];
}
