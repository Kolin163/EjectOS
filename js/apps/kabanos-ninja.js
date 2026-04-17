function r(min, max) {
  return min + Math.random() * (max - min);
}

export function createKabanosNinjaApp() {
  const root = document.createElement("div");
  root.className = "kn-app";

  const field = document.createElement("div");
  field.className = "kn-field";

  const overlay = document.createElement("div");
  overlay.className = "kn-overlay";

  const overlayText = document.createElement("div");
  overlayText.className = "kn-overlay-text";

  const overlayStats = document.createElement("div");
  overlayStats.className = "kn-overlay-stats";

  const overlayBtn = document.createElement("button");
  overlayBtn.className = "kn-btn";
  overlayBtn.type = "button";

  overlay.appendChild(overlayText);
  overlay.appendChild(overlayStats);
  overlay.appendChild(overlayBtn);
  field.appendChild(overlay);
  root.appendChild(field);

  let running = false;
  let score = 0;
  let best = Number(localStorage.getItem("knBest") || 0);
  let missed = 0;

  let spawnId = null;
  let rafId = null;
  let lastT = 0;

  const items = new Set();

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

  function clearItems() {
    items.forEach((it) => it.el.remove());
    items.clear();
  }

  function endGame(text) {
    running = false;
    clearTimers();
    clearItems();

    if (score > best) {
      best = score;
      localStorage.setItem("knBest", String(best));
    }

    showOverlay(text, "Заново", `Поймано: ${score}   Лучший: ${best}`);
  }

  function spawnOne() {
    if (!running) return;

    const el = document.createElement("img");
    el.className = "kn-kabanos";
    el.src = "img/kabanos.png";
    el.alt = "";
    el.draggable = false;

    field.appendChild(el);

    const fw = field.clientWidth;
    const fh = field.clientHeight;

    const bw = el.getBoundingClientRect().width || 50;
    const pad = 6;

    const x = Math.max(pad, Math.min(fw - bw - pad, r(pad, fw - bw - pad)));
    const y = -r(60, 160);
    const vy = r(160, 320);
    const rot = r(-80, 80);

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = `rotate(${rot}deg)`;

    const it = { el, y, vy, rot, rotSpeed: r(-25, 25) };

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!running) return;
      items.delete(it);
      el.remove();
      score += 1;
    });

    items.add(it);

    if (items.size > 30) {
      const first = items.values().next().value;
      if (first) {
        items.delete(first);
        first.el.remove();
      }
    }
  }

  function loop(t) {
    if (!running) return;

    if (!lastT) lastT = t;
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    const fh = field.clientHeight;

    items.forEach((it) => {
      it.y += it.vy * dt;
      it.rot += it.rotSpeed * dt;

      it.el.style.top = it.y + "px";
      it.el.style.transform = `rotate(${it.rot}deg)`;

      const h = it.el.getBoundingClientRect().height || 120;

      if (it.y > fh + h) {
        items.delete(it);
        it.el.remove();
        missed += 1;
        if (missed >= 10) endGame("КАБАНОСЫ УПАЛИ");
      }
    });

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    running = true;
    score = 0;
    missed = 0;
    lastT = 0;

    clearTimers();
    clearItems();
    hideOverlay();

    spawnOne();
    spawnId = setInterval(spawnOne, 520);
    rafId = requestAnimationFrame(loop);
  }

  overlayBtn.addEventListener("click", start);

  showOverlay("КАБАНОС-НИНДЗЯ", "Начать", `Лучший: ${best}`);

  function cleanup() {
    running = false;
    clearTimers();
    clearItems();
  }

  return { el: root, cleanup };
}