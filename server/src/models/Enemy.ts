import { Entity } from './Entity';
import { Player } from './Player';
import { Food } from './Food';
import path from 'path';
import fs from 'fs';

let text = fs.readFileSync(path.join(__dirname, "../../names.txt"), "utf-8");
let botNames = text.split("\n")

const MAP_W: number = 3008;
const MAP_H: number = 3008;

let update_count = 0;

export class Enemy extends Entity {
    static list: Map<string, Enemy> = new Map();
    mass: number;
    name: string;
    sight: number;
    constructor(params: any) {
        super(params);

        this.mass = 1;
        this.radius = 32;
        this.sight = 500;

        let name;
        do {
            name = botNames[Math.floor(Math.random() * botNames.length)];
        } while(Enemy.isNameTaken(name))
        this.name = name;

        this.dirX = Math.random();
        this.dirY = Math.random();

        this.id = '' + Math.random();
        
        Enemy.list.set(this.id, this);
        Entity.initPack.enemy.push(this.getInitPack());
    }

    static isNameTaken(name: string): boolean {
        Enemy.list.forEach(e => {
            if(e.name === name) return true;
        });
        return false;
    }

    static onConnect(name: string) {
        const newEnemy: Enemy = new Enemy({
            name,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        
        /*newEnemy.socket.on('mouseMove', (data: { x: number; y: number; }) => {

            let dirX = data.x - newEnemy.x;
            let dirY = data.y - newEnemy.y;
            //newEnemy.targetX = data.x;
            //newEnemy.targetY = data.y;
    
            let len = Math.sqrt(dirX * dirX + dirY * dirY);
            if(len < 1) {
                dirX = 0;
                dirY = 0;
            } else {
                dirX /= len;
                dirY /= len;
            }
    
            newEnemy.dirX = dirX;
            newEnemy.dirY = dirY;
        });*/

        
        
    }

    static onDisconnect(id: string) {
        if(Enemy.list.delete(id)) {
            Entity.removePack.enemy.push(id);
        }
    }

    static allInitPacks() {
        let enemies = [];
        for(let [id, e] of Enemy.list) {
            enemies.push(e.getInitPack());
        }
        return enemies;
    }

    static allUpdatePacks() {
        let pack: EnemyDto[] = [];
        Enemy.list.forEach((enemy: Enemy) => {
            if(enemy) {
                enemy.update();
                pack.push(enemy.getUpdatePack());
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
            id: this.id,
            x: this.x,
            y: this.y,
            mass: this.mass,
            radius: this.radius,
        }
    }

    getInitPack() {
        return {
            id: this.id,
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

    dirTowards(x: number, y: number): { x: number, y: number } {
        let dirX = x - this.x;
        let dirY = y - this.y;
        let len = Math.sqrt(dirX * dirX + dirY * dirY);
        if(len < 1) {
            dirX = 0;
            dirY = 0;
        } else {
            dirX /= len;
            dirY /= len;
        }
        return { x: dirX, y: dirY };
    }

    
    update() {
        //this.updatePosition();
        update_count++;
        let danger: boolean = false;

        this.curSpd = this.calculateSpeed();
        Player.list.forEach((player: Player) => {
            // Handle collision with player
            if(this.getDistance(player.x, player.y) < player.radius + this.radius && Math.abs(this.mass - player.mass) > 4) {
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


            // Choose direction based on distance to players

            if(this.getDistance(player.x, player.y) < this.sight) {
                // Enemy sees the player
                if(player.mass <= this.mass * 1.25) {
                    // chase/eat player
                        danger = true;
                        let dir = this.dirTowards(player.x, player.y);
                        this.dirX = dir.x;
                        this.dirY = dir.y;
                } else if(this.mass <= player.mass * 1.25) {
                    // run from player
                        danger = true;
                        let dir = this.dirTowards(player.x, player.y);
                        this.dirX = -dir.x;
                        this.dirY = -dir.y;
                }
            }
        });
        
        Enemy.list.forEach((enemy: Enemy) => {
            if(enemy != this && this.getDistance(enemy.x, enemy.y) < enemy.radius + this.radius && Math.abs(this.mass - enemy.mass) > 4) {
                if(this.mass >= enemy.mass * 1.25) {
                    this.radius += enemy.mass;
                    this.mass += enemy.mass;
                    enemy.respawn();
                } else if (enemy.mass >= this.mass * 1.25) {
                    enemy.radius += this.mass;
                    enemy.mass += this.mass;
                    this.respawn();
                }
            }

            

            if(this.getDistance(enemy.x, enemy.y) < this.sight) {
                    // run from enemy
                    danger = true;
                    let dir = this.dirTowards(enemy.x, enemy.y);
                    if(enemy.mass >= this.mass * 1.25) {
                        // run from enemy
                        this.dirX = -dir.x;
                        this.dirY = -dir.y;
                    } else if(this.mass >= enemy.mass * 1.25) {
                        this.dirX = dir.x;
                        this.dirY = dir.y;
                    }
            }

            
        });

        // find closest food
        let closest: any;
        let dist = Infinity;
        if(!danger || Math.random() < 0.2) {
            Food.list.forEach(f => {
                if(this.getDistance(f.x, f.y) < dist) {
                    dist = this.getDistance(f.x, f.y);
                    closest = f;
                }
            });
            if(closest) {
                let dir = this.dirTowards(closest.x, closest.y);
                this.dirX = dir.x;
                this.dirY = dir.y;
            }

        }

        /*if(Math.random() < 0.01) {
            this.dirX = Math.random() * 2 - 1;
            this.dirY = Math.random() * 2 - 1;
        }*/
        /*if(!this.dirX && !this.dirY) {
            this.dirX = Math.random() * 2 - 1;
            this.dirY = Math.random() * 2 - 1;
        }*/


        super.updatePosition();
    }

    /*updatePosition() {
        this.x += 1;
        this.y += 1;
    }*/
}

export interface EnemyDto {
    id: string,
    x: number,
    y: number,
    mass: number,
    radius: number
}