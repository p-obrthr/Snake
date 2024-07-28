class Board {
    canvas;
    ctx;
    static CELL_SIZE: number;
    static BOARD_SIZE = 32;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`cavas err with id ${canvasId} not found`);

        this.canvas.width = 800;
        this.canvas.height = this.canvas.width;
        Board.CELL_SIZE = this.canvas.width / Board.BOARD_SIZE;

        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!this.ctx) throw new Error('could not initialize 2D context');
        
        this.clearBoard();
    }

    clearBoard() {
        this.ctx.fillStyle = '#303030';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(x: number, y: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, Board.CELL_SIZE, Board.CELL_SIZE);
    }
}

class Snake {
    x: number;
    y: number;
    board;
    body;
    direction;

    constructor(board: Board) {
        this.board = board;
        this.body = [];
        this.direction = 38; 
        this.x = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.y = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.body.push({ x: this.x, y: this.y });
        this.board.draw(this.x, this.y, 'green');
    }

    setDirection(newDirection: number) {
        this.direction = newDirection;
    }

    move() {
        const [dx, dy] = Game.keys[this.direction];
        this.x += dx * Board.CELL_SIZE;
        this.y += dy * Board.CELL_SIZE;

        if (this.isCollision()) {
            return false;
        }

        this.board.draw(this.x, this.y, 'green');
        this.body.unshift({ x: this.x, y: this.y });

        return true;
    }

    isCollision() {
        return (
            this.x < 0 || this.y < 0 ||
            this.x >= this.board.canvas.width || this.y >= this.board.canvas.height
        );
    }
}

class Apple{
    x: number = 0;
    y: number = 0;
    board;

    constructor(board: Board) {
        this.board = board;
        this.spawn();
    }

    spawn() {
        console.log('draw apple');
        this.x = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.y = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.board.draw(this.x, this.y, 'red');
    }

}

class Game {
    board;
    player;
    apple;
    isRunning = false;
    sleepTime = 400;

    static keys: {[code: number]: number[]} = {
        37: [-1, 0], // left
        38: [0, -1], // up
        39: [1, 0], // right
        40: [0, 1]  // down
    }

    constructor(canvasId: string) {
        this.board = new Board(canvasId);
        this.player = new Snake(this.board);
        this.apple = new Apple(this.board);
        
        this.init();
    }

    init() {
        this.board.canvas.addEventListener('keydown', (e) => {
            this.player.setDirection(e.keyCode);
        });
        this.run();
    }


    async run() {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        await sleep(1000);
        this.isRunning = true;
        while (this.isRunning) {
            if (!this.player.move()) {
                this.isRunning = false;
                alert('game over');
                break;
            }
            this.checkApple();
            await sleep(this.sleepTime);
        }
    }

    checkApple() {
        const head = this.player.body[0];
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.apple.spawn();
            this.sleepTime *= 0.9;
        } else {
            const tail = this.player.body.pop();
            if(!tail) throw new Error(`tail error`);
            this.board.draw(tail.x, tail.y, '#303030');
        }
    }
}

new Game('app');

