/**
 * Represents food that make players grow big and strong
 */
export class Food {
    static list = {};
    static container = new PIXI.Container();
    // Different texture colors for each piece of food
    static types = [
        'food-blue',
        'food-green',
        'food-purple',
        'food-red',
        'food-yellow'
    ];
    /**
     * @param { id: string, x: number, y: number } params 
     */
    constructor(params) {
        
        // Randomly choose a color for this foods texture
        let rand5 = Math.floor(Math.random() * 5);
        this.type = Food.types[rand5];

        this.sprite = PIXI.Sprite.from(this.type);
        this.sprite.parentId = params.id;
        this.sprite.x = params.x || 0;
        this.sprite.y = params.y || 0;
        this.sprite.anchor.set(0.5);

        this.id = params.id;

        Food.list[this.id] = this;
        Food.container.addChild(this.sprite);

    }

    /**
     * Updates a piece of food (& it's sprite) based on EntitySprite information from the server
     * @function update
     * @param { id: string, sprites: EntitySprite[] } pack
     * Note: Food currently only has one sprite
     */
    update(pack) {
        if(this.sprite.x !== undefined) {
            this.sprite.x = pack.sprites[0].x;
        }
        if(this.sprite.y !== undefined) {
            this.sprite.y = pack.sprites[0].y;
        }
    }

    /**
     * Removes a piece of food from the static Food list and ensures its sprite is removed from the stage
     * @function remove
     */
    remove() {
        Food.container.removeChild(this.sprite);
        delete Food.list[this.id];
    }

    /**
     * Returns the sprite associated with this food
     * @function getSprite
     * @return { PIXI.Sprite }  This food items sprite
     */
    getSprite() {
        return this.sprite;
    }
}