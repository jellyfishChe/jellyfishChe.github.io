// moving.js
(()=>{
  let W ;
  let H ;
  let N ; 
  let SIZE ;
  
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const infoEl = document.getElementById('info');
  const envW = document.getElementById('envW');
  const envH = document.getElementById('envH');
  const envN = document.getElementById('envN');
  const envSize = document.getElementById('envSize'); 
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedRange = document.getElementById('speedRange');

  let people = [];
  let running = false;
  let raf = null;
  let steps = 0;

  class Person{
    constructor(x,y){
      this.x = x;
      this.y = y;
      this.size = SIZE;
      this.color = '#0077cc';
      // initialize with a random unit moving vector
      const a = Math.random()*Math.PI*2;
      this.vx = Math.cos(a);
      this.vy = Math.sin(a);
    }

    proposeMove(grid, colsG, rowsG, cellSize, peopleArr, timeScale){
      // new moving vector = current vector + random unit vector, then normalize
      const a = Math.random()*Math.PI*2;
      const rx = Math.cos(a);
      const ry = Math.sin(a);

      let nxv = this.vx + rx;
      let nyv = this.vy + ry;
      const len = Math.hypot(nxv, nyv) || 1;
      nxv /= len; nyv /= len; // normalized to unit vector

      // movement distance per step (unit) scaled by timeScale control
      const dist = 1 * timeScale;
      const nx = this.x + nxv * dist;
      const ny = this.y + nyv * dist;

        // if next position would cross border, reverse the moving vector
        if(nx < 0 || nx > W - this.size || ny < 0 || ny > H - this.size){
          nxv = -nxv; nyv = -nyv;
          // recompute next position after reversing
          const rx = this.x + nxv * dist;
          const ry = this.y + nyv * dist;
          // clamp reversed position to border
          var cx = Math.max(0, Math.min(W - this.size, rx));
          var cy = Math.max(0, Math.min(H - this.size, ry));
        } else {
          // clamp normally
          var cx = Math.max(0, Math.min(W - this.size, nx));
          var cy = Math.max(0, Math.min(H - this.size, ny));
        }

      // check hitbox collision with neighbors via uniform grid
      const cellX = Math.floor(cx / cellSize);
      const cellY = Math.floor(cy / cellSize);
      for(let dy=-1; dy<=1; dy++){
        for(let dx=-1; dx<=1; dx++){
          const nxCell = cellX + dx;
          const nyCell = cellY + dy;
          if(nxCell < 0 || nyCell < 0 || nxCell >= colsG || nyCell >= rowsG) continue;
          const bucket = grid[nyCell * colsG + nxCell];
          if(!bucket) continue;
          for(let k=0;k<bucket.length;k++){
            const o = peopleArr[bucket[k]];
            if(o === this) continue;
            if(cx < o.x + o.size && cx + this.size > o.x && cy < o.y + o.size && cy + this.size > o.y){
              return false;
            }
          }
        }
      }

      // accept move and update velocity to the normalized vector
      this.vx = nxv; this.vy = nyv;
      this.x = cx; this.y = cy;
      return true;
    }
  }

  function init(){
    // read environment inputs (if present)
    if(envW) W = Math.max(100, parseInt(envW.value) || W);
    if(envH) H = Math.max(100, parseInt(envH.value) || H);
    if(envN) N = Math.max(1, parseInt(envN.value) || N);
    if(envSize) SIZE = Math.max(1, parseInt(envSize.value) || SIZE);

    // apply canvas size
    canvas.width = W;
    canvas.height = H;

    people = [];
    // place people on a simple grid to avoid initial overlaps
    const cols = Math.max(1, Math.ceil(Math.sqrt(N * W / H)));
    const rows = Math.max(1, Math.ceil(N/cols));
    const cellW = W / cols;
    const cellH = H / rows;
    let placed = 0;
    for(let r=0;r<rows && placed<N;r++){
      for(let c=0;c<cols && placed<N;c++){
        // choose a random position inside the cell, but keep margin for SIZE
        let x;
        if(cellW > SIZE) x = Math.min(W - SIZE, c * cellW + Math.random() * (cellW - SIZE));
        else x = Math.min(W - SIZE, c * cellW);

        let y;
        if(cellH > SIZE) y = Math.min(H - SIZE, r * cellH + Math.random() * (cellH - SIZE));
        else y = Math.min(H - SIZE, r * cellH);

        people.push(new Person(x,y));
        placed++;
      }
    }
    steps = 0;
    draw();
    updateInfo();
  }

  function step(){
    const timeScale = parseFloat(speedRange.value);
    // build uniform grid for neighbor queries
    const cellSize = Math.max(SIZE * 2, 8);
    const colsG = Math.max(1, Math.ceil(W / cellSize));
    const rowsG = Math.max(1, Math.ceil(H / cellSize));
    const grid = new Array(colsG * rowsG);
    for(let i=0;i<grid.length;i++) grid[i] = [];
    for(let i=0;i<people.length;i++){
      const p = people[i];
      const gx = Math.min(colsG-1, Math.max(0, Math.floor(p.x / cellSize)));
      const gy = Math.min(rowsG-1, Math.max(0, Math.floor(p.y / cellSize)));
      grid[gy * colsG + gx].push(i);
    }

    // iterate people in random order to reduce order bias
    const order = people.map((_,i)=>i).sort(()=>Math.random()-0.5);
    for(const idx of order){
      const p = people[idx];
      p.proposeMove(grid, colsG, rowsG, cellSize, people, timeScale);
    }
    steps++;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // draw people
    for(const p of people){
      ctx.fillStyle = p.color || '#60a5fa';
      // draw scaled for visibility
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  function loop(){
    step();
    draw();
    updateInfo();
    if(running) raf = requestAnimationFrame(loop);
  }

  function updateInfo(){
    infoEl.textContent = `W=${W} H=${H} N=${people.length} size=${SIZE} steps=${steps}`;
  }

  startBtn.addEventListener('click',()=>{
    if(!running){ running = true; raf = requestAnimationFrame(loop); }
  });
  pauseBtn.addEventListener('click',()=>{
    running = false; if(raf) cancelAnimationFrame(raf); raf = null;
  });
  resetBtn.addEventListener('click',()=>{
    running = false; if(raf) cancelAnimationFrame(raf); raf = null; init();
  });

  // initialize
  init();
})();
