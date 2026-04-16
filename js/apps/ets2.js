function r(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function createEts2App() {
  const root = document.createElement("div");
  root.className = "ets2-app";

  const field = document.createElement("div");
  field.className = "ets2-field";

  const road = document.createElement("div");
  road.className = "ets2-road";

  const lanes = [];
  for (let i = 0; i < 3; i++) {
    const lane = document.createElement("div");
    lane.className = "ets2-lane";
    road.appendChild(lane);
    lanes.push(lane);
  }

  const player = document.createElement("div");
  player.className = "ets2-player";

  const overlay = document.createElement("div");
  overlay.className = "ets2-overlay";

  const overlayText = document.createElement("div");
  overlayText.className = "ets2-overlay-text";

  const overlayBtn = document.createElement("button");
  overlayBtn.className = "ets2-btn";
  overlayBtn.type = "button";

  overlay.appendChild(overlayText);
  overlay.appendChild(overlayBtn);

  field.appendChild(road);
  field.appendChild(player);
  field.appendChild(overlay);
  root.appendChild(field);

  let running = false;
  let playerLane = 1;
  let spawnId = null;
  let rafId = null;
  let lastT = 0;
  const obstacles = new Set();

  function showOverlay(text, btnText) {
    overlayText.textContent = text;
    overlayBtn.textContent = btnText;
    overlay.classList.remove("is-hidden");
  }

  function hideOverlay() {
    overlay.classList.add("is-hidden");
  }

  function clearTimers() {
    if (spawnId) clearInterval(spawnId);
    if (rafId) cancelAnimationFrame(rafId);
    spawnId = null;
    rafId = null;
  }

  function clearObstacles() {
    obstacles.forEach((ob) => ob.el.remove());
    obstacles.clear();
  }

  function endGame() {
    running = false;
    clearTimers();
    clearObstacles();
    showOverlay("ЛЕЕЕЕ, ЧУБЕР ОПЯТЬ СЛОМАЛ ФУРУ", "Заново");
  }

  function updatePlayerPos() {
    const laneW = lanes[0].clientWidth;
    player.style.left = playerLane * laneW + laneW / 2 + "px";
  }

  function moveLeft() {
    if (!running) return;
    if (playerLane > 0) {
      playerLane--;
      updatePlayerPos();
    }
  }

  function moveRight() {
    if (!running) return;
    if (playerLane < 2) {
      playerLane++;
      updatePlayerPos();
    }
  }

  function spawnObstacle() {
    if (!running) return;

    const lane = r(0, 2);
    const el = document.createElement("div");
    el.className = "ets2-obstacle";

    const laneW = lanes[0].clientWidth;
    el.style.left = lane * laneW + laneW / 2 + "px";
    el.style.top = "-60px";

    road.appendChild(el);

    const ob = { el, lane, y: -60, vy: 280 };
    obstacles.add(ob);

    if (obstacles.size > 15) {
      const first = obstacles.values().next().value;
      if (first) {
        obstacles.delete(first);
        first.el.remove();
      }
    }
  }

  function checkCollision() {
    const pRect = player.getBoundingClientRect();

    for (const ob of obstacles) {
      const oRect = ob.el.getBoundingClientRect();

      if (
        pRect.left < oRect.right &&
        pRect.right > oRect.left &&
        pRect.top < oRect.bottom &&
        pRect.bottom > oRect.top
      ) {
        endGame();
        return true;
      }
    }
    return false;
  }

  function loop(t) {
    if (!running) return;

    if (!lastT) lastT = t;
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    const fh = field.clientHeight;

    obstacles.forEach((ob) => {
      ob.y += ob.vy * dt;
      ob.el.style.top = ob.y + "px";

      if (ob.y > fh + 60) {
        obstacles.delete(ob);
        ob.el.remove();
      }
    });

    if (!checkCollision()) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function start() {
    running = true;
    playerLane = 1;
    lastT = 0;
    clearTimers();
    clearObstacles();
    hideOverlay();

    updatePlayerPos();

    spawnObstacle();
    spawnId = setInterval(spawnObstacle, 680);
    rafId = requestAnimationFrame(loop);
  }

  overlayBtn.addEventListener("click", start);

  field.addEventListener("pointerdown", (e) => {
    if (!running) return;
    const fw = field.clientWidth;
    if (e.offsetX < fw / 2) moveLeft();
    else moveRight();
  });

  document.addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft();
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight();
  });

  showOverlay("ETS2", "Начать");

  function cleanup() {
    running = false;
    clearTimers();
    clearObstacles();
  }

  return { el: root, cleanup };
}