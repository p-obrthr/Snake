class Board {
    app: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    static CELL_SIZE = 25; // 800/32
    static BOARD_SIZE = 32;

    constructor(canvasId: string) {
        this.app = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.app) throw new Error(`canvas with id ${canvasId} not found`);
        this.ctx = this.app.getContext('2d')!;
        this.app.width = Board.CELL_SIZE * Board.BOARD_SIZE;
        this.app.height = Board.CELL_SIZE * Board.BOARD_SIZE;
        this.clearBoard();
    }

    clearBoard() {
        this.ctx.fillStyle = '#303030';
        this.ctx.fillRect(0, 0, this.app.width, this.app.height);
    }

    draw(x: number, y: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, Board.CELL_SIZE, Board.CELL_SIZE);
    }
}

class Player {
    board: Board;
    x: number;
    y: number;
    color: string;

    constructor(board: Board, color: string, startX: number, startY: number) {
        this.board = board;
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.draw();
    }

    draw() {
        this.board.draw(this.x, this.y, this.color);
    }

    updatePosition(x: number, y: number) {
        this.board.draw(this.x, this.y, "#303030");
        this.x = x;
        this.y = y;
        this.draw();
    }
}

class Game {
    board: Board;
    players: { [id: number]: Player } = {};
    socket: WebSocket;

    static keys: { [code: number]: [number, number] } = {
        37: [-1, 0], // left
        38: [0, -1], // up
        39: [1, 0],  // right
        40: [0, 1]   // down
    };

    constructor(canvasId: string) {
        this.board = new Board(canvasId);
        this.socket = new WebSocket('ws://localhost:8080');
        this.init();
    }

    init() {
        this.socket.onopen = () => {
            console.log('connected to WebSocket server');
            this.socket.send(JSON.stringify({ type: 'new_player' }));
        };

        this.socket.onmessage = (event: MessageEvent) => this.handleServerMessage(event);
        this.socket.onerror = (error) => {
            console.error('websocket error:', error);
        };

        document.addEventListener('keydown', (e) => {
            if (!(e.keyCode in Game.keys)) return;
            const direction = Game.keys[e.keyCode];
            this.socket.send(JSON.stringify({ type: 'move', direction }));
        });
    }

    handleServerMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'init':
                data.players.forEach((playerData: any) => {
                    this.players[playerData.id] = new Player(this.board, playerData.color, playerData.x, playerData.y);
                });
                break;
            case 'new_player':
                this.players[data.player.id] = new Player(this.board, data.player.color, data.player.x, data.player.y);
                break;
            case 'move':
                this.updatePlayerPosition(data.id, data.x, data.y);
                break;
            case 'player_left':
                if (this.players[data.id]) {
                    delete this.players[data.id];
                    this.board.clearBoard(); 
                    for (let id in this.players) this.players[id].draw();
                }
                break;
        }
    }

    updatePlayerPosition(id: number, x: number, y: number) {
        const player = this.players[id];
        if (player) player.updatePosition(x, y);
    }
}

new Game('app');
