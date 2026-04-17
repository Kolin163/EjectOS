function r(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickPhrase() {
  return Math.random() < 0.78
    ? { text: "КС БУДЕТ?", type: "good" }
    : { text: "ГО ФАСИК", type: "bad" };
}

export function createCsApp() {
  const root = document.createElement("div");
  root.className = "cs-app";

  const field = document.createElement("div");
  field.className = "cs-field";

  const overlay = document.createElement("div");
  overlay.className = "cs-overlay";

  const overlayText = document.createElement("div");
  overlayText.className = "cs-overlay-text";
  
  const overlayStats = document.createElement("div");
  overlayStats.className = "cs-overlay-stats";

  const overlayBtn = document.createElement("button");
  overlayBtn.className = "cs-btn";
  overlayBtn.type = "button";

  overlay.appendChild(overlayText);
  overlay.appendChild(overlayStats);
  overlay.appendChild(overlayBtn);
  field.appendChild(overlay);
  root.appendChild(field);

  let running = false;
  let score = 0;
  let best = Number(localStorage.getItem("csBest") || 0);
  let spawnT = null;
  let failT = null;
  let current = null;

  function clearTimers() {
    if (spawnT) clearTimeout(spawnT);
    if (failT) clearTimeout(failT);
    spawnT = null;
    failT = null;
  }

  function removeCurrent() {
    if (current) current.remove();
    current = null;
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

  function endGame(reason) {
    running = false;
    clearTimers();
    removeCurrent();

    if (score > best) {
      best = score;
      localStorage.setItem("csBest", String(best));
    }

    showOverlay(reason, "Заново", `Счет: ${score}   Лучший: ${best}`);
  }

  function placeInField(el) {
    field.appendChild(el);
    const f = field.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const pad = 10;
    const maxX = Math.max(pad, f.width - b.width - pad);
    const maxY = Math.max(pad, f.height - b.height - pad);
    el.style.left = r(pad, Math.floor(maxX)) + "px";
    el.style.top = r(pad, Math.floor(maxY)) + "px";
  }

  function spawnNext() {
    if (!running) return;
    clearTimers();
    removeCurrent();

    const delay = r(260, 520);
    spawnT = setTimeout(() => {
      if (!running) return;

      const p = pickPhrase();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cs-phrase " + (p.type === "good" ? "is-good" : "is-bad");
      btn.textContent = p.text;

      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!running) return;

        if (p.type === "bad") {
          endGame("НУ РАЗ НАЖАЛ ЗНАЧИТ СОГЛАСЕН");
          return;
        }
        
        score++;
        spawnNext();
      });

      current = btn;
      placeInField(btn);

      if (p.type === "good") {
        failT = setTimeout(() => {
          if (!running) return;
          endGame("МОЛЧАНИЕ ЗНАК СОГЛАСИЯ");
        }, r(650, 1050));
      } else {
        failT = setTimeout(() => {
          if (!running) return;
          spawnNext();
        }, r(550, 950));
      }
    }, delay);
  }

  function startGame() {
    running = true;
    score = 0;
    hideOverlay();
    spawnNext();
  }

  overlayBtn.addEventListener("click", startGame);
  showOverlay("CS?", "Начать", `Лучший: ${best}`);

  function cleanup() {
    running = false;
    clearTimers();
    removeCurrent();
  }

  return { el: root, cleanup };
}