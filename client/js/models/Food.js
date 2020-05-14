import { Entity } from './Entity.js';

export class Food extends Entity {
    static list = {};
    static container = new PIXI.Container();
    static types = [
        'food-blue',
        'food-green',
        'food-purple',
        'food-red',
        'food-yellow'
    ];
    constructor(params) {
        super(params);

        Food.list[this.id] = this;
        Food.container.addChild(this.sprite);

        //return this.sprite;

    }

    /*static getFood(id) {
        return Food.container.children.filter(children => children.id === id)[0];
    }*/

    getSprite() {
        return Food.container.children.filter(children => children.id === this.id)[0];
    }
}