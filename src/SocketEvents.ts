import socketio, { Socket } from 'socket.io';
import { Server } from 'http';
import { Player } from './models/Player';
import { Food } from './models/Food';
import { Enemy } from './models/Enemy';


export function connectIO(server: Server) {
    let io = socketio(server, {});

    io.sockets.on('connection', function(socket: Socket) {
    

        socket.on('signIn', data => {
            // Check if username is currently taken
            let valid = true;
            Player.list.forEach((p: Player) => {
                if(data.name === p.name) {
                    valid = false;
                    socket.emit('signInResponse', { success: false })
                }
            });

            // Connect new user & send init game data
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
    
        // Disconnect player
        socket.on('disconnect', () => {
            Player.onDisconnect(socket);
        });
    
        // Send chat message to all players
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

}

