import { Entity, EntitySprite } from './Entity';
import { Enemy } from './Enemy';
import { Socket } from 'socket.io';

const MAP_W = 4008;
const MAP_H = 4008;
/**
 * Class representing player
 * @class
 * @augments Entity
 */
export class Player extends Entity {
    static list: Map<string, Player> = new Map();
    socket: Socket;
    name: string;
    constructor(params: any) {
        super(params);

        this.socket = params.socket;
        this.name = params.name;
        this.id = this.socket.id;
        
        Player.list.set(this.socket.id, this);
        Entity.initPack.player.push(this.getInitPack());
    }

    static onConnect(name: string, socket: Socket) {
        const newPlayer: Player = new Player({
            socket,
            name,
            radius: 32,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        
        newPlayer.socket.on('mouseMove', (data: { x: number; y: number; }) => {
            newPlayer.sprites.forEach(sprite => {
                let dirX = data.x - sprite.x;
                let dirY = data.y - sprite.y;
        
                let len = Math.sqrt(dirX * dirX + dirY * dirY);
                if(len < 1) {
                    dirX = 0;
                    dirY = 0;
                } else {
                    dirX /= len;
                    dirY /= len;
                }
        
                sprite.dirX = dirX;
                sprite.dirY = dirY;
            });
        });

        newPlayer.socket.on('space', () => {
            
            newPlayer.splitPlayer();
        });

        


        
        
    }

    static onDisconnect(socket: Socket) {
        console.log(socket.id + " just quit");
        if(Player.list.delete(socket.id)) {
            Entity.removePack.player.push(socket.id);
        }
    }

    static allInitPacks() {
        let players: PlayerDto[] = [];
        Player.list.forEach((player: Player) => {
            players.push(player.getInitPack());
        });
        return players;
    }

    static allUpdatePacks() {
        let pack: PlayerDto[] = [];
        Player.list.forEach((player: Player) => {
            if(player) {
                player.update();
                pack.push(player.getUpdatePack());
            }
        });

        return pack;
    }

    splitPlayer() {
        //if(p.mass < 20) return;

        let largest: EntitySprite = this.createSprite(this.id);
        largest.mass = 0;

        this.sprites.forEach(p => {
            if(p.mass >= largest.mass) largest = p;
        });

        const x = largest.x + largest.dirX * Math.random() * 50 + 10;
        const y = largest.y + largest.dirY * Math.random() * 50 + 10;
        
        const portion = Math.random() * 0.5 + 0.25;
        const radius = Math.max(1, Math.floor(largest.radius * portion));
        largest.radius = Math.max(1, largest.radius - radius);
        const mass = Math.max(1, Math.floor(largest.mass * portion));
        largest.mass = Math.max(1, largest.mass - mass);
        const curSpd = Math.random() * 8 + 2;
        const newOne: EntitySprite = this.createSprite(this.id, x, y, mass, radius, curSpd);

        this.sprites.push(newOne);
        
    }

    destroySprite(p: EntitySprite) {
        let index = this.sprites.indexOf(p);
        this.sprites.splice(index, 1);
        if(this.sprites.length < 1) this.respawn();
    }

    respawn() {
        const sprite = super.createSprite(
            this.id,
            Math.random() * MAP_W,
            Math.random() * MAP_H
        )
        this.sprites.push(sprite);
    }

    getUpdatePack() {
        return {
            id: this.id,
            sprites: this.sprites
        }
    }

    getInitPack() {
        return {
            id: this.id,
            sprites: this.sprites,
            name: this.name
        }
    }

    private calculateSpeed(mass: number): number {
        return this.maxSpd - 3*Math.log10(mass);
    }

    
    update() {
        this.sprites.forEach(sprite => {
            sprite.curSpd = this.calculateSpeed(sprite.mass);
            Player.list.forEach((player: Player) => {
                player.sprites.forEach(pSprite => {
                    if(player != this && this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius && Math.abs(sprite.mass - pSprite.mass) > 4) {
                        if(pSprite.mass >= sprite.mass * 1.25) {
                            pSprite.radius += sprite.radius;
                            pSprite.mass += sprite.mass;
                            this.destroySprite(sprite);
                        }
                    }
                    else if(pSprite !== sprite && this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius) {
                        if(sprite.mass <= pSprite.mass) {
                            const dir = this.dirTowards(pSprite.x, pSprite.y, sprite.x, sprite.y);
                            pSprite.x -= dir.x * 2;
                            pSprite.y -= dir.y * 2;
                        }
                    }
                });
            });
            
            Enemy.list.forEach((enemy: Enemy) => {
                enemy.sprites.forEach(eSprite => {
                    if(this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius && Math.abs(sprite.mass - eSprite.mass) > 4) {
                        if(eSprite.mass >= sprite.mass * 1.25) {
                            eSprite.radius += sprite.radius;
                            eSprite.mass += sprite.mass;
                            this.destroySprite(sprite);
                        }
                    }
                    
                    else if(eSprite !== sprite && this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        if(sprite.mass <= eSprite.mass) {
                            const dir = this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                            eSprite.x -= dir.x * eSprite.curSpd;
                            eSprite.y -= dir.y * eSprite.curSpd;
                        }
                    }
                });
            });
        });
        super.update();
    }
}

export interface PlayerDto {
    id: string,
    sprites: EntitySprite[] //Map<string, EntitySprite>
}