export class Entity {
    constructor(params) {
        // Sprite
        this.sprite = PIXI.Sprite.from(params.texture);
        this.sprite.id = params.id;
        this.sprite.x = params.x || 0;
        this.sprite.y = params.y || 0;
        this.sprite.anchor.set(0.5);

        this.id = params.id;

    }

    getSprite() {
        return this.sprite;
    }
}