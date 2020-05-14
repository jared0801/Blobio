import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import { config } from 'dotenv';
import socketio, { Server, Socket } from 'socket.io';
import { Player, PlayerDto } from './models/Player';
import { Food, FoodDto } from './models/Food';
import { Enemy, EnemyDto } from './models/Enemy';
import { Entity } from './models/Entity';

config();

const app: Application = express();


app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

app.get('/register', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/register.html'));
});

app.use('/client', express.static(path.join(__dirname, '../../client')));

const http = app.listen(5000, () => console.log('Server running'));

let io: Server = socketio(http, {});

let LOGGED_IN: Map<string, Player> = new Map();

const DEBUG = true;

io.sockets.on('connection', function(socket: Socket) {
    

    socket.on('signIn', data => {
        // Validate name
        let valid = true;
        Player.list.forEach((p: Player) => {
            if(data.name === p.name) {
                valid = false;
                socket.emit('signInResponse', { success: false })
            }
        });
        if(valid) {
            Player.onConnect(data.name, socket);
            socket.emit('init', {
                player: Player.allInitPacks(),
                food: Food.allInitPacks(),
                enemy: Enemy.allInitPacks()
            });
            socket.emit('signInResponse', { success: true });
        }
    });

    socket.on('disconnect', () => {
        Player.onDisconnect(socket);
        //io.sockets.emit('remove', { id: socket.id });
    });

    socket.on('sendMsgToServer', data => {
        let player = Player.list.get(socket.id);
        if(player) {
            let playerName = player.name;
            Player.list.forEach(player => {
                player.socket.emit('addToChat', playerName + ": " + data);
            });
        }
    });
});

setInterval(function() {
    
    // occasionally spawn enemy
    if(Math.random() < 0.01) {
        new Enemy({
            x: Math.random() * 3008,
            y: Math.random() * 3008
        });
    }

    
    let updatePack = {
        player: Player.allUpdatePacks(),
        food: Food.allUpdatePacks(),
        enemy: Enemy.allUpdatePacks()
    }

    // Send update pack to every player 
    Player.list.forEach((player: Player) => {
        player.socket.emit('init', Entity.initPack);
        player.socket.emit('update', updatePack);
        player.socket.emit('remove', Entity.removePack);
    });
    Entity.initPack.player = [];
    Entity.initPack.food = [];
    Entity.initPack.enemy = [];
    Entity.removePack.player = [];
    Entity.removePack.food = [];
    Entity.removePack.enemy = [];

}, 1000/25);