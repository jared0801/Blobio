import { Entity } from './Entity';
import { Player, PlayerDto } from './Player';
import { Enemy, EnemyDto } from './Enemy';

export class Food extends Entity {
    static list: Map<string, Food> = new Map();
    mass: number;
    constructor(params: any) {
        super(params);

        this.mass = 1;
        this.id = '' + Math.random();
        Food.list.set(this.id, this);
        Entity.initPack.food.push(this.getInitPack());
    }

    static allInitPacks(): FoodDto[] {
        let food = [];
        for(let [id, p] of Food.list) {
            food.push(p.getInitPack());
        }
        return food;
    }

    static allUpdatePacks(): FoodDto[] {
        if(Math.random() < 0.1 && Food.list.size < 100) {
            Food.spawnRandomFood();
        } else if(Math.random() < 0.01 && Food.list.size < 500) {
            Food.spawnRandomFood();
        }

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
        new Food({x: Math.floor(Math.random() * 3008), y: Math.floor(Math.random() * 3008)});
    }

    getInitPack() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        }
    }

    getUpdatePack() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        }
    }

    update() {
        Player.list.forEach((player: PlayerDto) => {
            if(this.getDistance(player.x, player.y) < player.radius) {
                player.mass++;
                player.radius++;
                Food.list.delete(this.id);
                Entity.removePack.food.push(this.id);
            }
        });

        
        Enemy.list.forEach((enemy: EnemyDto) => {
            if(this.getDistance(enemy.x, enemy.y) < enemy.radius) {
                enemy.mass++;
                enemy.radius++;
                Food.list.delete(this.id);
                Entity.removePack.food.push(this.id);
            }
        })
    }

}

export interface FoodDto {
    id: string,
    x: number,
    y: number
}