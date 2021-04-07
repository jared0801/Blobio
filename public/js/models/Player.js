/**
 * Represents all game players
 */
export class Player {
    static list = {};
    static container = new PIXI.Container();
    /**
     * @param { name: string, id: string, texture: PIXI.Texture, sprites: EntitySprite[], x: number, y: number } params
     * NOTE: EntitySprites are converted into PIXI.Sprites and stored in Player.list
     */
    constructor(params) {
        this.name = params.name;
        this.id = params.id;
        this.sprites = [];
        this.texture = params.texture;
        
        params.sprites.forEach(gameData => {
            this.newSprite(gameData);
        })
        this.mass = 0;

        Player.list[this.id] = this;

    }

    /**
     * Finds the coordinates for the center of all this players sprites
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

    /**
     * Updates a player (& all it's sprites) based on EntitySprite information from the server
     * @function update
     * @param { id: string, sprites: EntitySprite[] } pack
     */
    update(pack) {
        let newMass = 0;
        let updated_sprites = [];
        for(let i = 0; i < pack.sprites.length; i++) {
            const packData = pack.sprites[i];
            let p = this.getSprite(packData.id);
            updated_sprites.push(packData.id);
            newMass += packData.mass;
            if(!p) {
                // new sprite
                if(packData) {
                    this.newSprite(packData);
                }
            } else {
                if(p.x !== undefined) {
                    p.x = packData.x;
                    let name = this.getName(p.id);
                    if (name) name.x = packData.x - name.width / 2;
                }
                if(p.y !== undefined) {
                    p.y = packData.y;
                    let name = this.getName(p.id);
                    if(name) name.y = packData.y - name.height / 2;
                }
                if(p.radius !== undefined) {
                    p.radius = packData.radius;
                    p.scale.set(p.radius / 32, p.radius / 32);
                }
                if(p.mass !== undefined) {
                    p.mass = packData.mass;
                }
            }
        }

        //delete removed sprites
        let removed_sprites = this.sprites.filter(s => !updated_sprites.includes(s.id));

        removed_sprites.forEach(s => {
            this.removeSprite(s)
        });
        this.mass = newMass;
    }

    /**
     * Removes a player from the static Player list and ensures all of its sprites are removed from the stage
     * @function remove
     */
    remove() {
        Player.container.children.forEach(child => {
            if(child.parentId === this.id) {
                this.removeSprite(child);
            }
        });
        delete Player.list[this.id];
    }

    /**
     * Creates an additional character sprite & name text for this player
     * @function newSprite
     * @param { EntitySprite } gameData   Player update data from the server
     * @return { PIXI.Sprite }            This players newly created sprite
     */
    newSprite(gameData) {
        let sprite = PIXI.Sprite.from(this.texture);
        sprite.anchor.set(0.5);
        sprite = Object.assign(sprite, gameData)
        this.mass += sprite.mass;
        this.sprites.push(sprite);
        
        const nameText = new PIXI.Text(this.name);
        nameText.id = gameData.id;
        Player.container.addChild(sprite);
        Player.container.addChild(nameText);
        return sprite;
    }

    /**
     * Removes a given character sprite & name text for this player
     * @function removeSprite
     * @param { PIXI.Sprite } sprite   Player sprite to be removed
     */
    removeSprite(sprite) {
        const index = this.sprites.indexOf(sprite);
        this.sprites.splice(index, 1);
        Player.container.removeChild(sprite);
        const name = this.getName(sprite.id);
        Player.container.removeChild(name);
    }

    /**
     * Returns all characters sprites associated with this player
     * @function getSprites
     * @return { PIXI.Sprite[] }       All of this player's character sprites
     */
    getSprites() {
        return this.sprites;
    }

    /**
     * Returns one character sprite associated with this player
     * @function getSprite
     * @param { string } spriteId      The id of the specific character sprite to return
     * @return { PIXI.Sprite }         One of this player's character sprites
     */
    getSprite(spriteId) {
        return this.sprites.filter(children => children.parentId === this.id && children.id === spriteId)[0];
    }

    /**
     * Returns all name text sprites associated with this player
     * @function getNames
     * @return { PIXI.Text[] }       All of this player's name text sprites
     */
    getNames() {
        return Player.container.children.filter(children => children.text === this.name);
    }

    /**
     * Returns one name text sprite associated with this player
     * @function getName
     * @param { string } spriteId    The id of the specific name text sprite to return
     * @return { PIXI.Text }         One of this player's name text sprites
     */
    getName(spriteId) {
        return Player.container.children.filter(children => children.id === spriteId && children.text === this.name)[0];
    }
}