const COLS = 12;
const ROWS = 12;
const CELL = 40;

const canvas = document.getElementById('maze');
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
const ctx = canvas.getContext('2d');

const winOverlay = document.getElementById('win');
const winText = document.getElementById('win-text');
const winAudio = document.getElementById('win-audio');

let grid = [];
let player = { x: 0, y: 0 };

function makeCell(x, y) {
  return { x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
}

function generateMaze() {
  grid = [];
  for (let y = 0; y < ROWS; y++) {
    const row = [];
    for (let x = 0; x < COLS; x++) row.push(makeCell(x, y));
    grid.push(row);
  }

  const stack = [];
  let current = grid[0][0];
  current.visited = true;

  while (true) {
    const next = randomUnvisitedNeighbor(current);
    if (next) {
      next.visited = true;
      removeWallBetween(current, next);
      stack.push(current);
      current = next;
    } else if (stack.length) {
      current = stack.pop();
    } else {
      break;
    }
  }
}

function randomUnvisitedNeighbor(cell) {
  const { x, y } = cell;
  const candidates = [];
  if (y > 0 && !grid[y - 1][x].visited) candidates.push(grid[y - 1][x]);
  if (x < COLS - 1 && !grid[y][x + 1].visited) candidates.push(grid[y][x + 1]);
  if (y < ROWS - 1 && !grid[y + 1][x].visited) candidates.push(grid[y + 1][x]);
  if (x > 0 && !grid[y][x - 1].visited) candidates.push(grid[y][x - 1]);
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function removeWallBetween(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 1) {
    a.walls.right = false;
    b.walls.left = false;
  } else if (dx === -1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (dy === 1) {
    a.walls.bottom = false;
    b.walls.top = false;
  } else if (dy === -1) {
    a.walls.top = false;
    b.walls.bottom = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 2;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = grid[y][x];
      const px = x * CELL;
      const py = y * CELL;

      ctx.beginPath();
      if (cell.walls.top) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + CELL, py);
      }
      if (cell.walls.right) {
        ctx.moveTo(px + CELL, py);
        ctx.lineTo(px + CELL, py + CELL);
      }
      if (cell.walls.bottom) {
        ctx.moveTo(px, py + CELL);
        ctx.lineTo(px + CELL, py + CELL);
      }
      if (cell.walls.left) {
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + CELL);
      }
      ctx.stroke();
    }
  }

  const endX = (COLS - 1) * CELL + CELL / 2;
  const endY = (ROWS - 1) * CELL + CELL / 2;
  ctx.font = `${CELL * 0.7}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8e4d9';
  ctx.fillText('♡', endX, endY);

  const playerX = player.x * CELL + CELL / 2;
  const playerY = player.y * CELL + CELL / 2;
  ctx.beginPath();
  ctx.arc(playerX, playerY, CELL * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = '#e8e4d9';
  ctx.fill();
}

function move(dx, dy) {
  const cell = grid[player.y][player.x];
  if (dx === 1 && !cell.walls.right) player.x += 1;
  else if (dx === -1 && !cell.walls.left) player.x -= 1;
  else if (dy === 1 && !cell.walls.bottom) player.y += 1;
  else if (dy === -1 && !cell.walls.top) player.y -= 1;

  draw();
  checkWin();
}

function checkWin() {
  if (player.x === COLS - 1 && player.y === ROWS - 1) {
    showWin();
  }
}

function showWin() {
  winText.textContent = 'Hola Nini, te amo';
  winText.classList.remove('typing');
  void winText.offsetWidth;
  winText.classList.add('typing');

  winAudio.currentTime = 0;
  winAudio.play().catch(() => {});

  winOverlay.classList.remove('hidden');
}

function resetGame() {
  winOverlay.classList.add('hidden');
  winAudio.pause();
  winAudio.currentTime = 0;
  player = { x: 0, y: 0 };
  generateMaze();
  draw();
}

window.addEventListener('keydown', (e) => {
  const map = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
  };
  const dir = map[e.key];
  if (!dir) return;
  e.preventDefault();
  move(dir[0], dir[1]);
});

document.querySelectorAll('.dpad__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    move(Number(btn.dataset.dx), Number(btn.dataset.dy));
  });
});

document.getElementById('restart').addEventListener('click', resetGame);
document.getElementById('play-again').addEventListener('click', resetGame);

resetGame();
