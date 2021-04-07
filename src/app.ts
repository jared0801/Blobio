import express, { Application } from 'express';
import { config } from 'dotenv';
import { Player } from './models/Player';
import { Food } from './models/Food';
import { Enemy } from './models/Enemy';
import { Entity } from './models/Entity';
import { router } from './routes';
import { connectIO } from './SocketEvents';

// Setup dotenv
config();

// Create express app
const app: Application = express();
const port = process.env.PORT || 5000;

// Initialize router
app.use('/', router);

// Start server
const http = app.listen(port, () => console.log(`Server running on port ${port}`));

// Connect socketio to the web server
connectIO(http);

// Store all top scores
let topScores: { name: string, score: number }[] = [];

// Start game loop
setInterval(function() {
    update();
}, 1000/25);


// Called each frame
function update() {
    // Occasionally spawn enemy
    if(Math.random() < 0.005 && Enemy.list.size < 100) {
        // Spawn between 3 and 10 enemies
        const rand = Math.floor(Math.random() * 8) + 3
        for(let i = 0; i < rand; i++) {
            Enemy.onConnect();
        }
    }

    // Occasionally spawn food
    if(Math.random() < 0.5 && Food.list.size < 200) {
        Food.spawnRandomFood();
    } else if(Math.random() < 0.05 && Food.list.size < 500) {
        Food.spawnRandomFood();
    }

    // Reset top scores
    topScores = [];

    // Get new top players
    Player.list.forEach(player => {
        topScores.push({
            name: player.name,
            score: player.getMass()
        });
    });
    // Include bots in top players list
    Enemy.list.forEach(enemy => {
        topScores.push({
            name: enemy.name,
            score: enemy.getMass()
        });
    });
    
    // Only show top 10 scores
    topScores = topScores.sort((a, b) => {
        return b.score - a.score;
    }).slice(0, 10);


    updateClients();
    
}


function updateClients() {
    // Create packet of data to send to players
    let updatePack = {
        player: Player.allUpdatePacks(),
        food: Food.allUpdatePacks(),
        enemy: Enemy.allUpdatePacks(),
        topScores: topScores
    }

    // Send update pack to every player 
    Player.list.forEach((player: Player) => {
        player.socket.emit('init', Entity.initPack );
        player.socket.emit('update', updatePack);
        player.socket.emit('remove', Entity.removePack);
    });
    Entity.initPack.player = [];
    Entity.initPack.food = [];
    Entity.initPack.enemy = [];
    Entity.removePack.player = [];
    Entity.removePack.food = [];
    Entity.removePack.enemy = [];
}