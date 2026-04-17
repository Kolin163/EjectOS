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

  const overlayStats = document.createElement("div");
  overlayStats.className = "ets2-overlay-stats";

  const overlayBtn = document.createElement("button");
  overlayBtn.className = "ets2-btn";
  overlayBtn.type = "button";

  overlay.appendChild(overlayText);
  overlay.appendChild(overlayStats);
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

  let distance = 0;
  let best = Number(localStorage.getItem("ets2Best") || 0);

  const obstacles = new Set();

  let laneW = 0;

  function updateLaneW() {
    laneW = Math.max(1, Math.floor(field.clientWidth / 3));
  }

  function xForLane(lane) {
    return lane * laneW + laneW / 2;
  }

  function updatePlayerPos() {
    updateLaneW();
    player.style.left = xForLane(playerLane) + "px";
  }

  function showOverlay(text, btnText, statsText = "") {
    overlayText.textContent = text;
    overlayBtn.textContent = btnText;
    overlayStats.textContent = statsText;
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

  function endGame(text) {
    running = false;
    clearTimers();

    const d = Math.floor(distance);
    if (d > best) {
      best = d;
      localStorage.setItem("ets2Best", String(best));
    }

    clearObstacles();

    showOverlay(
      text,
      "Заново",
      `Проехал: ${d}   Лучший: ${best}`
    );
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

    updateLaneW();

    const lane = r(0, 2);
    const el = document.createElement("div");
    el.className = "ets2-obstacle";

    el.style.left = xForLane(lane) + "px";
    el.style.top = "-80px";

    road.appendChild(el);

    const ob = { el, y: -80, lane, baseVy: r(240, 340) };
    obstacles.add(ob);

    if (obstacles.size > 18) {
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

    distance += 90 * dt;

    const fh = field.clientHeight;
    const speedBoost = Math.min(260, distance * 0.12);

    obstacles.forEach((ob) => {
      ob.y += (ob.baseVy + speedBoost) * dt;
      ob.el.style.top = ob.y + "px";

      if (ob.y > fh + 120) {
        obstacles.delete(ob);
        ob.el.remove();
      }
    });

    if (checkCollision()) {
      endGame("ЛЕЕЕЕ, ЧУБЕР ОПЯТЬ СЛОМАЛ ФУРУ");
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    running = true;
    playerLane = 1;
    lastT = 0;
    distance = 0;

    clearTimers();
    clearObstacles();
    hideOverlay();

    updatePlayerPos();
    spawnObstacle();

    spawnId = setInterval(spawnObstacle, 650);
    rafId = requestAnimationFrame(loop);
  }

  function onPointerDown(e) {
    if (!running) return;
    const rect = field.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) moveLeft();
    else moveRight();
  }

  function onKeyDown(e) {
    if (!running) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft();
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight();
  }

  function onResize() {
    updatePlayerPos();
  }

  overlayBtn.addEventListener("click", start);
  field.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);

  showOverlay("ETS2", "Начать", `Лучший: ${best}`);

  function cleanup() {
    running = false;
    clearTimers();
    clearObstacles();
    field.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
  }

  return { el: root, cleanup };
}