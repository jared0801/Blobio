import express, { Application } from 'express';
import { config } from 'dotenv';
import { Player } from './models/Player';
import { Food } from './models/Food';
import { Enemy } from './models/Enemy';
import { Entity } from './models/Entity';
import { router } from './routes';
import { connectIO } from './SocketEvents';

config();

const app: Application = express();

app.use('/', router);

const http = app.listen(5000, () => console.log('Server running'));

connectIO(http);

let topScores: { name: string, score: number }[] = [];



setInterval(function() {
    update();
}, 1000/25);


function update() {
    // occasionally spawn enemy
    if(Enemy.list.size > 40)
        console.log(Enemy.list.size);
    if(Math.random() < 0.01 && Enemy.list.size < 100) {
        Enemy.onConnect();
    }

    // occasionally spawn food
    if(Math.random() < 0.5 && Food.list.size < 200) {
        Food.spawnRandomFood();
    } else if(Math.random() < 0.05 && Food.list.size < 500) {
        Food.spawnRandomFood();
    }

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
        })
    });
    
    topScores = topScores.sort((a, b) => {
        return b.score - a.score;
    }).slice(0, 10);


    updateClients();
    
}


function updateClients() {
    let updatePack = {
        player: Player.allUpdatePacks(),
        food: Food.allUpdatePacks(),
        enemy: Enemy.allUpdatePacks(),
        topScores: topScores
    }
    //if(updatePack.player[0])
        //console.log(updatePack.player[0].sprites);

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