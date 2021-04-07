import { Entity, EntitySprite } from './Entity';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Config } from '../config';
let config: Config = require("../config.json");

export class Food extends Entity {
    static list: Map<string, Food> = new Map();
    mass: number;
    constructor(params: any) {
        super(params);

        this.mass = 1;
        //this.id = '' + Math.random();
        Food.list.set(this.id, this);
        Entity.initPack.food.push(this.getInitPack());
    }

    static allInitPacks(): FoodDto[] {
        let food = [];
        for(let [id, f] of Food.list) {
            food.push(f.getInitPack());
        }
        return food;
    }

    static allUpdatePacks(): FoodDto[] {
        let pack: FoodDto[] = [];
        Food.list.forEach((food: Food) => {
            if(food) {
                food.update();
                pack.push(food.getUpdatePack());
            }
        });

        return pack;
    }

    static spawnRandomFood() {
        new Food({x: Math.floor(Math.random() * config.MAP_W), y: Math.floor(Math.random() * config.MAP_H)});
    }

    getInitPack() {
        return {
            id: this.id,
            sprites: this.sprites
        }
    }

    getUpdatePack() {
        return {
            id: this.id,
            sprites: this.sprites
        }
    }

    getSprite() {
        return this.sprites[0];
    }

    update() {
        Player.list.forEach((player: Player) => {
            player.sprites.forEach(pSprite => {
                if(this.getDistance(this.getSprite(), pSprite.x, pSprite.y) < pSprite.radius) {
                    pSprite.mass++;
                    if(Food.list.delete(this.id)) {
                        Entity.removePack.food.push(this.id);
                    }
                }
            });
        });

        
        Enemy.list.forEach((enemy: Enemy) => {
            enemy.sprites.forEach(eSprite => {
                if(this.getDistance(this.getSprite(), eSprite.x, eSprite.y) < eSprite.radius) {
                    eSprite.mass++;
                    if(Food.list.delete(this.id)) {
                        Entity.removePack.food.push(this.id);
                    }
                }
            });
        })
    }

}

export interface FoodDto {
    id: string,
    sprites: EntitySprite[]//Map<string, EntitySprite>
}