import WebSocket, { Server } from 'ws';

const wss = new Server({ port: 8080 });

let clients: { [id: number]: WebSocket } = {};
let players: { [id: number]: { id: number, color: string, x: number, y: number } } = {};
const colors = ['green', 'red', 'blue', 'yellow', 'black'];
const keys: { [code: number]: [number, number] } = {
    37: [-1, 0], // left
    38: [0, -1], // up
    39: [1, 0],  // right
    40: [0, 1]   // down
};

wss.on('connection', (ws: WebSocket) => {
    const playerId = Object.keys(clients).length;
    clients[playerId] = ws;

    const playerData = {
        id: playerId,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.floor(Math.random() * 32) * 25,
        y: Math.floor(Math.random() * 32) * 25
    };

    players[playerId] = playerData;

    ws.send(JSON.stringify({
        type: 'init',
        players: Object.values(players)
    }));


    console.log(`player ${playerId} entered`);
    broadcast(JSON.stringify({ type: 'new_player', player: playerData }), playerId);

    ws.on('message', (message) => {
        const msg = JSON.parse(message.toString());

        if (!msg || msg.type !== 'move') return;

        playerData.x += msg.direction[0] * 25;
        playerData.y += msg.direction[1] * 25;

        players[playerId] = { ...playerData };

        // console.log(`player ${playerId} moved`);
        broadcast(JSON.stringify({ type: 'move', id: playerId, x: playerData.x, y: playerData.y }));
        
    });

    ws.on('close', () => {
        console.log(`player ${playerId} disconnected`);
        delete clients[playerId];
        delete players[playerId];

        broadcast(JSON.stringify({ type: 'player_left', id: playerId }));
    });
});

function broadcast(message: string, exceptId?: number) {
    Object.entries(clients).forEach(([id, client]) => {
        if (Number(id) !== exceptId) client.send(message);
    });
}
