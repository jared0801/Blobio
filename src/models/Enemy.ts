import { Entity, EntitySprite } from './Entity';
import { Player } from './Player';
import { Food } from './Food';
import path from 'path';
import fs from 'fs';
import { Config } from '../config';
let config: Config = require("../config.json");

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
            x: Math.random() * config.MAP_W,
            y: Math.random() * config.MAP_H
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

    rejoinPlayer(sprite: EntitySprite) { 
        let mass = sprite.mass;
        this.destroySprite(sprite);
        let largest = this.getLargestSprite();

        largest.mass += mass;
        
    }

    splitPlayer() {

        let largest: EntitySprite = this.getLargestSprite();

        if(largest.mass < 20) return;

        const x = largest.x + largest.dirX * Math.random() * 50 + 10;
        const y = largest.y + largest.dirY * Math.random() * 50 + 10;
        
        const portion = Math.random() * 0.5 + 0.25;
        const mass = Math.max(1, Math.floor(largest.mass * portion));
        largest.mass = Math.max(1, largest.mass - mass);
        const curSpd = Math.random() * 8 + 2;
        const newOne: EntitySprite = this.createSprite(this.id, x, y, mass, curSpd);

        // Reset split timer
        newOne.splitTime = 1000;
        newOne.splitParentId = largest.id;

        this.sprites.push(newOne);
    }

    
    update() {
        let foundPlayer: boolean = false;
        
        if(this.wandering > 0) this.wandering--;

        
        if(this.sprites.length < 1) {
            this.respawn();
        }

        let target = { x: 0, y: 0 };

        // Decision loop (all sprites help make decision)
        this.sprites.forEach(sprite => {
            // Find speed based on mass
            sprite.curSpd = this.calculateSpeed(sprite.mass);


            Player.list.forEach((player: Player) => {
                player.sprites.forEach(pSprite => {
                    if(this.getDistance(sprite, pSprite.x, pSprite.y) < pSprite.radius + sprite.radius) {
                        // Enemy and player sprites are colliding
                        if(pSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // player eats this sprite
                            pSprite.mass += sprite.mass;
                            this.destroySprite(sprite);
                        } else {
                            if(sprite.mass <= pSprite.mass) {
                                // move player away to prevent players stacking on top of each other
                                const dir = this.dirTowards(pSprite.x, pSprite.y, sprite.x, sprite.y);
                                pSprite.x -= dir.x * 2;
                                pSprite.y -= dir.y * 2;
                            }
                        }
                    }
                    if(!this.wandering && this.getDistance(sprite, pSprite.x, pSprite.y) < this.sight) {
                        // Enemy sees the player
                        foundPlayer = true;
                        //let dir = this.dirTowards(sprite.x, sprite.y, pSprite.x, pSprite.y);
                        if(pSprite.mass <= sprite.mass * 1.25  && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // chase/eat player
                            /*sprite.dirX = dir.x;
                            sprite.dirY = dir.y;*/
                            target.x = pSprite.x;
                            target.y = pSprite.y;
                        } else if(sprite.mass <= pSprite.mass * 1.25  && Math.abs(sprite.mass - pSprite.mass) > 4) {
                            // run from player
                            this.inDanger = true;
                            target.x = pSprite.x;
                            target.y = pSprite.y;
                            /*sprite.dirX = -dir.x;
                            sprite.dirY = -dir.y;*/
                        }
                    }
          
                });
            });
            
            Enemy.list.forEach((enemy: Enemy) => {
                enemy.sprites.forEach(eSprite => {
                    if(this.getDistance(sprite, eSprite.x, eSprite.y) < eSprite.radius + sprite.radius) {
                        // This enemies sprite and another enemies sprite are colliding
                        if(enemy != this && eSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // other enemy eats this sprite
                            eSprite.mass += sprite.mass;
                            this.destroySprite(sprite);
                        } else if(eSprite !== sprite) {
                            if(sprite.mass <= eSprite.mass) {
                                // move other enemy away to prevent players stacking on top of each other
                                const dir = this.dirTowards(eSprite.x, eSprite.y, sprite.x, sprite.y);
                                eSprite.x -= dir.x * 2;
                                eSprite.y -= dir.y * 2;
                            }
                        }
                    }

                    // Observe environment to chase / run from enemies
                    if(!this.wandering && this.getDistance(sprite, eSprite.x, eSprite.y) < this.sight) {
                        foundPlayer = true;
                        if(eSprite.mass >= sprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // This enemy sees another enemy that can eat him and runs away
                            //let dir = this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                            //sprite.dirX = -dir.x;
                            //sprite.dirY = -dir.y;
                            target.x = eSprite.x;
                            target.y = eSprite.y;
                            this.inDanger = true;
                        } else if(sprite.mass >= eSprite.mass * 1.25 && Math.abs(sprite.mass - eSprite.mass) > 4) {
                            // This enemy sees another enemy that he can eat and runs towards him
                            //let dir = this.dirTowards(sprite.x, sprite.y, eSprite.x, eSprite.y);
                            //sprite.dirX = dir.x;
                            //sprite.dirY = dir.y;
                            target.x = eSprite.x;
                            target.y = eSprite.y;
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
            if(!this.inDanger && !foundPlayer) {
                Food.list.forEach(f => {
                    if(this.getDistance(sprite, f.getSprite().x, f.getSprite().y) < dist) {
                        dist = this.getDistance(sprite, f.getSprite().x, f.getSprite().y);
                        closest = f.getSprite();
                    }
                });
                if(closest) {
                    /*let dir = this.dirTowards(sprite.x, sprite.y, closest.x, closest.y);
                    sprite.dirX = dir.x;
                    sprite.dirY = dir.y;*/
                    target.x = closest.x;
                    target.y = closest.y;
                }

            }

            if(this.getDistance(sprite, this.getSpriteCenter().x, this.getSpriteCenter().y) > sprite.radius * 3) {
                target.x = this.getSpriteCenter().x;
                target.y = this.getSpriteCenter().y;
            }

            
            if(sprite.splitParentId !== '' && this.sprites.length > 1) {
                if(sprite.splitTime > 0) sprite.splitTime--;
                if(sprite.splitTime === 0) {
                    this.rejoinPlayer(sprite);
                }
            }

        });


        // Action loop (all sprites move based on the target that was decided & their position)
        this.sprites.forEach(sprite => {
            let dir = this.dirTowards(sprite.x, sprite.y, target.x, target.y);
            if(this.inDanger) {
                sprite.dirX = -dir.x;
                sprite.dirY = -dir.y;
            } else {
                sprite.dirX = dir.x;
                sprite.dirY = dir.y;
            }

            const splitProb = Math.random();
            if(sprite.mass > 20 &&
               (sprite.mass < 30 && splitProb < 0.0001) ||
               (sprite.mass < 100 && splitProb < 0.001) ||
               (sprite.mass < 500 && splitProb < 0.01) ||
               splitProb < 0.1) {
                this.splitPlayer();
            }
        });



        // Add some chance that the enemy won't do exactly as expected
        if(Math.random() < 0.005) {
            this.wandering = 200;
        }
        if(this.sprites.length < 5 && this.sprites.length > 0 && Math.random() < 0.0001) {
            this.splitPlayer();
        }
        super.update();
    }
}

export interface EnemyDto {
    id: string,
    sprites: EntitySprite[]//Map<string, EntitySprite>
}