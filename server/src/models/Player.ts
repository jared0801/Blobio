import { Entity } from './Entity';
import { Enemy } from './Enemy';
import { Socket } from 'socket.io';

const MAP_W = 3008;
const MAP_H = 3008;
/**
 * Class representing player
 * @class
 * @augments Entity
 */
export class Player extends Entity {
    static list: Map<string, Player> = new Map();
    socket: Socket;
    mass: number;
    name: string;
    constructor(params: any) {
        super(params);

        this.socket = params.socket;
        this.mass = 1;
        this.radius = 32;
        this.name = params.name;
        
        Player.list.set(this.socket.id, this);
        Entity.initPack.player.push(this.getInitPack());
    }

    static onConnect(name: string, socket: Socket) {
        const newPlayer: Player = new Player({
            socket,
            name,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        
        newPlayer.socket.on('mouseMove', (data: { x: number; y: number; }) => {

            let dirX = data.x - newPlayer.x;
            let dirY = data.y - newPlayer.y;
            //newPlayer.targetX = data.x;
            //newPlayer.targetY = data.y;
    
            let len = Math.sqrt(dirX * dirX + dirY * dirY);
            if(len < 1) {
                dirX = 0;
                dirY = 0;
            } else {
                dirX /= len;
                dirY /= len;
            }
    
            newPlayer.dirX = dirX;
            newPlayer.dirY = dirY;
        });

        
        
    }

    static onDisconnect(socket: Socket) {
        console.log(Player.list);
        console.log(socket.id + " just quit");
        if(Player.list.delete(socket.id)) {
            Entity.removePack.player.push(socket.id);
        }
    }

    static allInitPacks() {
        let players = [];
        for(let [id, p] of Player.list) {
            players.push(p.getInitPack());
        }
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

    respawn() {
        this.x = Math.random() * MAP_W;
        this.y = Math.random() * MAP_H;
        this.radius = 32;
        this.mass = 1;
    }

    getUpdatePack() {
        return {
            id: this.socket.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            radius: this.radius,
        }
    }

    getInitPack() {
        return {
            id: this.socket.id,
            x: this.x,
            y: this.y,
            radius: this.radius,
            mass: this.mass,
            name: this.name
        }
    }

    private calculateSpeed() {
        return this.maxSpd - Math.log10(this.mass);
    }

    
    update() {
        super.update();
        this.curSpd = this.calculateSpeed();
        Player.list.forEach((player: Player) => {
            if(player != this && this.getDistance(player.x, player.y) < player.radius + this.radius && Math.abs(this.mass - player.mass) > 4) {
                if(this.mass >= player.mass * 1.25) {
                    this.radius += player.mass;
                    this.mass += player.mass;
                    player.respawn();
                } else if(player.mass >= this.mass * 1.25) {
                    player.radius += this.mass;
                    player.mass += this.mass;
                    this.respawn();
                }
            }
        });
        
        Enemy.list.forEach((enemy: Enemy) => {
            if(this.getDistance(enemy.x, enemy.y) < enemy.radius + this.radius && Math.abs(this.mass - enemy.mass) > 4) {
                if(this.mass >= enemy.mass * 1.25) {
                    this.radius += enemy.mass;
                    this.mass += enemy.mass;
                    enemy.respawn();
                } else if(enemy.mass >= this.mass * 1.25) {
                    enemy.radius += this.mass;
                    enemy.mass += this.mass;
                    this.respawn();
                }
            }
        });
    }
}

export interface PlayerDto {
    id: string,
    x: number,
    y: number,
    mass: number,
    radius: number
}