// Battleship rules against a simple computer. Pure functions, so they can be tested in node.
export const SIZE = 8;
export const FLEET = [4, 3, 2];

export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); // 0 water, 1 ship, 2 hit, 3 miss
}

// Places the fleet randomly. Returns board with ships as 1.
export function placeFleet(rng = Math.random) {
  const board = emptyBoard();
  for (const len of FLEET) {
    for (let tries = 0; tries < 500; tries++) {
      const horiz = rng() < 0.5;
      const r = Math.floor(rng() * SIZE), c = Math.floor(rng() * SIZE);
      const cells = [];
      for (let i = 0; i < len; i++) {
        const rr = horiz ? r : r + i, cc = horiz ? c + i : c;
        if (rr >= SIZE || cc >= SIZE || board[rr][cc] !== 0) { cells.length = 0; break; }
        cells.push([rr, cc]);
      }
      if (cells.length === len) { cells.forEach(([rr, cc]) => (board[rr][cc] = 1)); break; }
    }
  }
  return board;
}

// Fires at (r, c) on the target board. Returns { result: 'hit'|'miss'|'sunk'|'repeat', board }.
export function fire(board, r, c) {
  const cell = board[r][c];
  if (cell === 2 || cell === 3) return { result: 'repeat', board };
  const next = board.map((row) => row.slice());
  if (cell === 1) {
    next[r][c] = 2;
    const sunk = !floodHasShip(next, r, c);
    return { result: sunk ? 'sunk' : 'hit', board: next };
  }
  next[r][c] = 3;
  return { result: 'miss', board: next };
}

// After a hit, is there still a ship cell connected (same row/column run) to this hit?
function floodHasShip(board, r, c) {
  // a ship is a straight run; check the four directions for contiguous ship cells
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const seen = new Set([r + ',' + c]), stack = [[r, c]];
  while (stack.length) {
    const [y, x] = stack.pop();
    for (const [dy, dx] of dirs) {
      const ny = y + dy, nx = x + dx;
      if (ny < 0 || nx < 0 || ny >= SIZE || nx >= SIZE) continue;
      const key = ny + ',' + nx;
      if (seen.has(key)) continue;
      if (board[ny][nx] === 1) return true;
      if (board[ny][nx] === 2) { seen.add(key); stack.push([ny, nx]); }
    }
  }
  return false;
}

export const allSunk = (board) => board.every((row) => row.every((v) => v !== 1));

// Computer picks a cell it has not fired at, preferring cells next to hits.
export function chooseShot(board, rng = Math.random) {
  const open = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 0 || board[r][c] === 1) open.push([r, c]);
  const near = open.filter(([r, c]) => [[0,1],[0,-1],[1,0],[-1,0]].some(([dy, dx]) => {
    const y = r + dy, x = c + dx;
    return y >= 0 && x >= 0 && y < SIZE && x < SIZE && board[y][x] === 2;
  }));
  const pool = near.length ? near : open;
  return pool[Math.floor(rng() * pool.length)];
}

// Score: fewer shots is better. 100 per enemy ship cell is the base, minus shots taken.
export function scoreFor(shots, won) {
  if (!won) return 0;
  return Math.max(0, 200 - shots * 4);
}
