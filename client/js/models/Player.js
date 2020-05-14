import { Entity } from './Entity.js';

export class Player extends Entity {
    static list = {};
    static container = new PIXI.Container();
    constructor(params) {
        super(params);
        this.name = params.name;
        this.mass = params.mass;
        this.radius = params.radius;
        //this.playerContainer = new PIXI.Container();
        //this.playerContainer.addChild(this.sprite);
        //Player.container.addChild(this.playerContainer);
        Player.list[this.id] = this;
        if(!this.getSprite())
            Player.container.addChild(this.sprite);
        this.nameText = new PIXI.Text(this.name);
        if(!this.getName())
            Player.container.addChild(this.nameText);
        //return this.sprite;

    }

    /*static getPlayer(id) {
        return Player.container.children.filter(children => children.id === id)[0];
    }*/

    getSprite() {
        return Player.container.children.filter(children => children.id === this.id)[0];
    }

    getName() {
        return Player.container.children.filter(children => children.text === this.name)[0];
    }
}