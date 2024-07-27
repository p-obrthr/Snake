const BOARD_ROWS = 32;
const BOARD_COLS = BOARD_ROWS;

const canvasId = "app";
const app = document.getElementById(canvasId) as HTMLCanvasElement;

if(app === null)
    throw new Error(`cavasId ${canvasId}`);

app.width = 800;
app.height = app.width;
const ctx = app.getContext("2d");

if(ctx === null)
    throw new Error(`could not initilaize 2d context`);

const keys: { [code: number]: number[] } = {
    37: [-1, 0], //left
    38: [0, -1], //up
    39: [1, 0], //right
    40: [0, 1] //down
}

app.addEventListener('keydown', (e) => {
    move(keys[e.keyCode]);
    // alert(`${e.keyCode} pressed`)
});

ctx.fillStyle = '#303030';
ctx.fillRect(0, 0, app.width, app.height);
console.log(ctx);

const CELL_WIDTH = app.width/BOARD_COLS;
const CELL_HEIGHT = app.height/BOARD_ROWS;

// random start positions
let x = Math.floor(Math.random() * 32)*CELL_WIDTH
let y = Math.floor(Math.random() * 32)*CELL_HEIGHT

ctx.fillStyle = 'green';
ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

function move (keys: number[]) {
    if(ctx === null) return;   
    ctx.fillStyle = '#303030';
    ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

    x += keys[0]*CELL_WIDTH;
    y += keys[1]*CELL_HEIGHT;

    ctx.fillStyle = 'green'
    ctx.fillRect(x , y, CELL_WIDTH, CELL_HEIGHT);
}
