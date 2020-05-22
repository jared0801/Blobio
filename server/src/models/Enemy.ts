import { Entity, EntitySprite } from './Entity';
import { Player } from './Player';
import { Food } from './Food';
import path from 'path';
import fs from 'fs';

const MAP_W = 4008;
const MAP_H = 4008;

let text = fs.readFileSync(path.join(__dirname, "../../names.txt"), "utf-8");
let botNames = text.split("\n");

export class Enemy extends Entity {
    static list: Map<string, Enemy> = new Map();
    name: string;
    sight: number;
    inDanger: boolean;
    wandering: number;
    constructor(params: any) {
        super(params);

        // this.radius = 32;
        this.sight = 500;
        this.inDanger = false;
        this.wandering = 0;

        let name;
        do {
            name = botNames[Math.floor(Math.random() * botNames.length)];
        } while(Enemy.isNameTaken(name))
        this.name = name;
        
        Enemy.list.set(this.id, this);
        Entity.initPack.enemy.push(this.getInitPack());
    }

    static isNameTaken(name: string): boolean {
        Enemy.list.forEach(e => {
            if(e.name === name) return true;
        });
        return false;
    }

    static onConnect() {
        new Enemy({
            radius: 32,
            x: Math.random() * MAP_W,
            y: Math.random() * MAP_H
        });
        
    }

    static allInitPacks() {
        let enemies: EnemyDto[] = [];
        Enemy.list.forEach((enemy: Enemy) => {
            enemies.push(enemy.getInitPack());
        })
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

    /**
     * Finds the coordinates for the center of all this enemies sprites
     * @function getSpriteCenter
     * @return { x: number, y: number }
     */
    getSpriteCenter() {
        let x = 0;
        let y = 0;
        this.sprites.forEach(sprite => {
            x += sprite.x;
            y += sprite.y;
        });
        x /= this.sprites.length;
        y /= this.sprites.length;
        return {
            x,
            y
        }
    }

    
    destroySprite(p: EntitySprite) {
        let index = this.sprites.indexOf(p);
        this.sprites.splice(index, 1);
    }

    respawn() {
        if(Enemy.list.delete(this.id)) {
            Entity.removePack.enemy.push(this.id);
        }
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
        return this.maxSpd - Math.log10(mass);
    }

    splitPlayer() {

        let largest: EntitySprite = this.createSprite(this.id);
        largest.mass = 0;

        this.sprites.forEach(p => {
            if(p.mass >= largest.mass) largest = p;
        });

        if(largest.mass < 20) return;

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

    
    update() {
        let foundPlayer: boolean = false;
        
        if(this.wandering > 0) this.wandering--;

        
        if(this.sprites.length < 1) {
            this.respawn();
        }

        this.sprites.forEach(sprite => {
            sprite.curSpd = this.calculateSpeed(sprite.mass);
            Player.list.forEach((player: Player) => {
                player.sprites.forEach(pSprite => {
                    if(this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius && Math.abs(sprite.mass - pSprite.mass) > 4) {
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
                    if(!this.wandering && this.getDistance(sprite, pSprite.x, pSprite.y) < this.sight) {
                        // Enemy sees the player
                        foundPlayer = true;
                        if(pSprite.mass <= sprite.mass * 1.25) {
                            // chase/eat player
                            let dir = this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                            sprite.dirX = dir.x;
                            sprite.dirY = dir.y;
                        } else if(sprite.mass <= pSprite.mass * 1.25) {
                            // run from player
                            this.inDanger = true;
                            let dir = this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                            sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;
                        }
                    }

                    
          
                });
            });
            
            Enemy.list.forEach((enemy: Enemy) => {
                enemy.sprites.forEach(eSprite => {
                    // Respawn / kill cell on collision
                    if(enemy != this && this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius && Math.abs(sprite.mass - eSprite.mass) > 4) {
                        if(eSprite.mass >= sprite.mass * 1.25) {
                            eSprite.radius += sprite.radius;
                            eSprite.mass += sprite.mass;
                            this.destroySprite(sprite);
                        }
                    }
                    // Keep enemy sprites from getting too close
                    else if(eSprite !== sprite && this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        if(sprite.mass <= eSprite.mass) {
                            const dir = this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                            eSprite.x -= dir.x * eSprite.curSpd;
                            eSprite.y -= dir.y * eSprite.curSpd;
                        }
                    }

                    // Observe environment to chase / run from enemies
                    if(!this.inDanger && !this.wandering && this.getDistance(sprite, eSprite.x, eSprite.y) < this.sight) {
                        foundPlayer = true;
                        let dir = this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                        if(eSprite.mass >= sprite.mass * 1.25) {
                            sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;
                            this.inDanger = true;
                        } else if(sprite.mass >= eSprite.mass * 1.25) {
                            // run towards enemy
                            sprite.dirX = dir.x;
                            sprite.dirY = dir.y;
                        }
                    }
                });
            });

            
            if(!foundPlayer) {
                this.inDanger = false;
            }

            

            // find closest food
            
            let closest: any;
            let dist = Infinity;
            if(!this.inDanger) {
                Food.list.forEach(f => {
                    if(this.getDistance(sprite, f.getSprite().x, f.getSprite().y) < dist) {
                        dist = this.getDistance(sprite, f.getSprite().x, f.getSprite().y);
                        closest = f.getSprite();
                    }
                });
                if(closest) {
                    let dir = this.dirTowards(sprite.x, sprite.y, closest.x, closest.y);
                    sprite.dirX = dir.x;
                    sprite.dirY = dir.y;
                }

            }

            this.sprites.forEach(sprite => {
                if(sprite.mass > 200 && Math.random() < 0.1) {
                    this.splitPlayer();
                }
                if(sprite.mass > 500) {
                    this.destroySprite(sprite);
                }
            });
        });
        // Add some chance that the enemy won't do exactly as expected
        if(Math.random() < 0.005) {
            this.wandering = 200;
        }
        if(this.sprites.length < 5 && Math.random() < 0.001) {
            this.splitPlayer();
        }
        super.update();
    }
}

export interface EnemyDto {
    id: string,
    sprites: EntitySprite[]//Map<string, EntitySprite>
}