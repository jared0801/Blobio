import { Entity } from './Entity.js';

export class Enemy extends Entity {
    static list = {};
    static container = new PIXI.Container();
    constructor(params) {
        super(params);
        this.name = params.name || 'Bob';
        this.mass = params.mass;
        this.radius = params.radius;
        Enemy.list[this.id] = this;
        if(!this.getSprite())
            Enemy.container.addChild(this.sprite);
        this.nameText = new PIXI.Text(this.name);
        this.nameText.zIndex = 100;
        Enemy.container.sortableChildren = true;
        if(!this.getName())
            Enemy.container.addChild(this.nameText);
        //return this.sprite;

    }

    /*static getEnemy(id) {
        return Enemy.container.children.filter(children => children.id === id)[0];
    }*/

    getSprite() {
        return Enemy.container.children.filter(children => children.id === this.id)[0];
    }

    getName() {
        return Enemy.container.children.filter(children => children.text === this.name)[0];
    }
}