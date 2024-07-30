class Board {
    app;
    canvas;
    ctx;
    static CELL_SIZE: number;
    static BOARD_SIZE = 32;

    constructor(canvasId: string) {
        this.app = document.getElementById(canvasId); 

        this.canvas = this.app as HTMLCanvasElement;
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

class GameObject {
    board;
    x;
    y;
    color;

    constructor(board: Board, color: string) {
        this.board = board
        this.x = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.y = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.color = color;
        this.init()
    }

    init() {
        this.draw();
    }

    draw() {
        this.board.draw(this.x, this.y, this.color);
    }
}

class Snake extends GameObject{
    body: { x: number, y: number}[] = [];
    direction;

    constructor(board: Board) {
        super(board, 'green')
        this.body.push({ x: this.x, y: this.y });
        this.direction = 0; 
    }

    setDirection(newDirection: number) {
        if(this.body.length > 1 && Math.abs(newDirection - this.direction) === 2) 
            return;
        this.direction = newDirection;
    }

    move() {
        const directionKey = Game.keys[this.direction];
        if (!directionKey) return false;

        const [dx, dy] = directionKey;
        this.x += dx * Board.CELL_SIZE;
        this.y += dy * Board.CELL_SIZE;

        if (this.checkCollision()) return false;

        this.draw();
        this.body.unshift({ x: this.x, y: this.y });

        return true;
    }

    checkCollision() {
        return (
            // collision with wall
            this.x < 0 || 
            this.y < 0 ||
            this.x >= this.board.canvas.width || 
            this.y >= this.board.canvas.height ||
            // collision own body
            this.body.some(pair => pair.x === this.x && pair.y === this.y)
        );
    }
}

class Apple extends GameObject{

    constructor(board: Board) {
        super(board, 'red')
    }

    spawn() {
        this.x = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.y = Math.floor(Math.random() * Board.BOARD_SIZE) * Board.CELL_SIZE;
        this.draw();
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
        this.board.canvas.focus();
        this.board.canvas.addEventListener('keydown', (e) => {

            if(!(e.keyCode in Game.keys)) return
            this.player.setDirection(e.keyCode);
            if(!this.isRunning) this.run();
        });
    }


    async run() {
        const startText = document.getElementById('startText');
        if(startText) startText.innerText = '';
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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

