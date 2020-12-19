import socketio, { Socket } from 'socket.io';
import { Server } from 'http';
import { Player } from './models/Player';
import { Food } from './models/Food';
import { Enemy } from './models/Enemy';


export function connectIO(server: Server) {
    let io = socketio(server, {});

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
                //console.log(Enemy.allInitPacks()[0].sprites);
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

}

