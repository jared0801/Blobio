import { Player } from './models/Player.js';
import { Food } from './models/Food.js';
import { UI } from './UI.js';

export class Game {
    constructor(pixiApp) {
        this.socket = io();
        this.resources = pixiApp.loader.resources;
        this.app = pixiApp;
        this.ui = new UI(this.socket);

        this.app.stage.addChild(Food.container);
        this.app.stage.addChild(Player.container);
        this.app.stage.addChild(UI.container);

        
        this.keyCommands();

        // Init pack: contains all data (large, only sent once)
        this.socket.on('init', data => {
            for(let i = 0; i < data.player.length; i++) {  
                const pack = data.player[i];
                if(pack && !Player.list[pack.id]) {              
                    new Player({
                        id: pack.id,
                        name: pack.name,
                        sprites: pack.sprites,
                        texture: this.resources.player.texture
                    });
                }
            }
            for(let i = 0; i < data.food.length; i++) {
                new Food(data.food[i]);
            }
            for(let i = 0; i < data.enemy.length; i++) {
                const pack = data.enemy[i];
                if(pack && !Player.list[pack.id]) {
                    new Player({
                        id: pack.id,
                        name: pack.name || 'Bob',
                        sprites: pack.sprites,
                        texture: this.resources.player.texture
                    })
                }
            }
        });
        // Update pack: difference at each frame
        this.socket.on('update', data => {
            //console.log(data.topScores);
            this.ui.updateTopScores(data.topScores);
            for(let i = 0; i < data.player.length; i++) {
                const pack = data.player[i];
                let player = Player.list[pack.id];
                //console.log(player);
                if(player) {
                    player.update(pack);
                    if(pack.id === this.socket.id && player.mass > 120) {
                        this.app.stage.scale.set(0.8, 0.8);
                    }
                    if(pack.id === this.socket.id && player.mass > 480) {
                        this.app.stage.scale.set(0.6, 0.6);
                    }
                    if(pack.id === this.socket.id && player.mass > 960) {
                        this.app.stage.scale.set(0.5, 0.5);
                    }
                }
            }
            for(let i = 0; i < data.enemy.length; i++) {
                const pack = data.enemy[i];
                let enemy = Player.list[pack.id];
                if(enemy) {
                    enemy.update(pack);
                }
            }
            for(let i = 0; i < data.food.length; i++) {
                const pack = data.food[i];
                let food = Food.list[pack.id];
                if(food) {
                    food.update(pack);
                }
            }

            // Adjust game camera according to the current player
            const currentPlayer = Player.list[this.socket.id];
            if(currentPlayer) {
                const centerOfPlayer = currentPlayer.getSpriteCenter();
                if(centerOfPlayer) {
                    // Update score dialog location
                    const scoreX = centerOfPlayer.x - (this.app.renderer.width/2) / this.app.stage.scale.x;
                    const scoreY = centerOfPlayer.y - (this.app.renderer.height/2) / this.app.stage.scale.y;
                    this.ui.moveScore(scoreX, scoreY);

                    const score = Player.list[this.socket.id].mass;
                    this.ui.changeScore('Mass: ' + score);

                    // Center camera on current player
                    this.app.stage.pivot.x = centerOfPlayer.x;
                    this.app.stage.pivot.y = centerOfPlayer.y;
                    this.app.stage.position.x = this.app.renderer.width / 2;
                    this.app.stage.position.y = this.app.renderer.height / 2;
                }
            }
        });

        // Remove pack: id to remove
        this.socket.on('remove', data => {
            for(let i = 0; i < data.player.length; i++) {
                const id = data.player[i];
                const player = Player.list[id];
                if(player) player.remove();
            }
            for(let i = 0; i < data.enemy.length; i++) {
                const id = data.enemy[i];
                const enemy = Player.list[id];
                if(enemy) enemy.remove();
            }
            for(let i = 0; i < data.food.length; i++) {
                const id = data.food[i];
                const food = Food.list[id];
                if(food) food.remove();
            }
        });

    }


    keyCommands() {
        // Watch mouse movement to update player direction
        document.getElementById('canvas').onmousemove = e => {
            const rect = e.target.getBoundingClientRect()
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const localCoords = this.app.stage.toLocal({x, y});
            this.socket.emit('mouseMove', localCoords);
        }

        // Watch for space key press to allow player to attempt splitting apart
        document.getElementById('canvas').onkeyup = e => {
            if(e.key === ' ') {
                this.socket.emit('space');
            }
            if(e.key == '1') {
                this.socket.emit('grow');
            }
        }

        // Prevent scrolling when canvas is targetted
        document.getElementById('canvas').onkeydown = e => {
            if(e.key === ' ') {
                e.preventDefault();
            }
        }
    }
}
