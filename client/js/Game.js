import { Player } from './models/Player.js';
import { Food } from './models/Food.js';
import { Enemy } from './models/Enemy.js';
let chatText = document.getElementById('chatText');
let chatInput = document.getElementById('chatInput');
let chatForm = document.getElementById('chatForm');

let signInDiv = document.getElementById('signDiv');
let gameDiv = document.getElementById('gameDiv');
let signInBtn = document.getElementById('signDiv-signIn');
let signInName = document.getElementById('signDiv-name');


// Key codes
let KeyCodes = {
    'right': 68, // maps to the d key
    'down': 83, // maps to s
    'left': 65, // maps to a
    'up': 87 // maps to w
}

export class Game {
    constructor(pixiApp) {
        this.socket = io();
        this.resources = pixiApp.loader.resources;
        this.app = pixiApp;
        this.app.stage.addChild(Food.container);
        this.app.stage.addChild(Player.container);
        this.app.stage.addChild(Enemy.container);

        // Score text
        this.scoreText = new PIXI.Text("Mass: 1");
        //this.scoreText.anchor.set(0.5);
        this.app.stage.addChild(this.scoreText);

        
        this.keyCommands();

        signInBtn.onclick = () => {
            this.socket.emit('signIn', { name: signInName.value });
        }

        this.socket.on('signInResponse', data => {
            if(data.success) {
                signInDiv.style.display = 'none';
                gameDiv.style.opacity = '1';
            } else {
                alert('That name is currently taken. Try another one!');
            }
        });

        this.socket.on('addToChat', data => {
            chatText.innerHTML += '<div>' + data + '</div>';
        });

        chatForm.onsubmit = e => {
            e.preventDefault();
            this.socket.emit('sendMsgToServer', chatInput.value);
            chatInput.value = '';
        }

        // Init pack: contains all data (large, only sent once)
        this.socket.on('init', data => {
            for(let i = 0; i < data.player.length; i++) {
                data.player[i].texture = this.resources.player.texture;
                new Player(data.player[i]);
            }
            for(let i = 0; i < data.food.length; i++) {
                let rand5 = Math.floor(Math.random() * 5);

                data.food[i].texture = Food.types[rand5];
                new Food(data.food[i]);
            }
            for(let i = 0; i < data.enemy.length; i++) {
                data.enemy[i].texture = this.resources.player.texture;
                new Enemy(data.enemy[i]);
            }
        });

        // Update pack: difference at each frame
        this.socket.on('update', data => {
            for(let i = 0; i < data.player.length; i++) {
                const pack = data.player[i];
                let p = Player.list[pack.id];
                if(p) {
                    if(p.getSprite().x !== undefined) {
                        p.getSprite().x = pack.x;
                        p.getName().x = pack.x - p.getName().width / 2;
                    }
                    if(p.getSprite().y !== undefined) {
                        p.getSprite().y = pack.y;
                        p.getName().y = pack.y - p.radius / 2;
                    }
                    if(p.mass !== undefined) {
                        p.mass = pack.mass;
                    }
                    if(p.radius !== undefined) {
                        p.radius = pack.radius;
                        p.getSprite().scale.x = p.radius / 32;
                        p.getSprite().scale.y = p.radius / 32;
                    }
                }
            }
            for(let i = 0; i < data.enemy.length; i++) {
                const pack = data.enemy[i];
                let e = Enemy.list[pack.id];
                if(e) {
                    if(e.getSprite().x !== undefined) {
                        e.getSprite().x = pack.x;
                        e.getName().x = pack.x - e.getName().width / 2;
                    }
                    if(e.getSprite().y !== undefined) {
                        e.getSprite().y = pack.y;
                        e.getName().y = pack.y - e.radius / 2;
                    }
                    if(e.mass !== undefined) {
                        e.mass = pack.mass;
                    }
                    if(e.radius !== undefined) {
                        e.radius = pack.radius;
                        e.getSprite().scale.x = e.radius / 32;
                        e.getSprite().scale.y = e.radius / 32;
                    }
                }
            }
            for(let i = 0; i < data.food.length; i++) {
                const pack = data.food[i];
                let f = Food.list[pack.id];
                if(f) {
                    if(f.getSprite().x !== undefined) {
                        f.getSprite().x = pack.x;
                    }
                    if(f.getSprite().y !== undefined) {
                        f.getSprite().y = pack.y;
                    }
                }
            }

            const currentPlayer = Player.list[this.socket.id].getSprite();
            if(currentPlayer) {
                this.scoreText.x = currentPlayer.x - this.app.renderer.width/2;
                this.scoreText.y = currentPlayer.y - this.app.renderer.height/2;
                const score = Player.list[this.socket.id].mass;
                this.scoreText.text = 'Mass: ' + score;
                //this.scoreText.text = "Score: " + currentPlayer.mass - 1;
                this.app.stage.pivot.x = currentPlayer.x;
                this.app.stage.pivot.y = currentPlayer.y;
                this.app.stage.position.x = this.app.renderer.width / 2;
                this.app.stage.position.y = this.app.renderer.height / 2;
            }
        });

        // Remove pack: id to remove
        this.socket.on('remove', data => {
            //console.log(Player.list);
            for(let i = 0; i < data.player.length; i++) {
                const remove = Player.list[data.player[i]];
                if(!remove) {
                    console.log(data.player);
                    console.log(i);
                    console.log(data.player[i]);
                }
                Player.container.removeChild(remove.getSprite());
                Player.container.removeChild(remove.getName());
                delete Player.list[data.player[i]];
            }
            for(let i = 0; i < data.enemy.length; i++) {
                const remove = Enemy.list[data.enemy[i]];
                Enemy.container.removeChild(remove.getSprite());
                Enemy.container.removeChild(remove.getName());
                delete Enemy.list[data.player[i]];
            }
            for(let i = 0; i < data.food.length; i++) {
                const remove = Food.list[data.food[i]].getSprite();
                Food.container.removeChild(remove);
                delete Food.list[data.food[i]];
            }
        });

    }

    keyCommands() {

        document.getElementById('canvas').onmousemove = e => {
            const rect = e.target.getBoundingClientRect()
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const localCoords = this.app.stage.toLocal({x, y});
            this.socket.emit('mouseMove', localCoords);
        }
    }
}