export function createTimerApp() {
  const root = document.createElement("div");
  root.className = "timer-app";

  const q = document.createElement("div");
  q.className = "timer-question";
  q.textContent = "Когда будут настолки?";

  const row = document.createElement("div");
  row.className = "timer-row";

  const actions = document.createElement("div");
  actions.className = "timer-actions";

  const btn = document.createElement("button");
  btn.className = "timer-btn";
  btn.type = "button";
  btn.textContent = "Ускорить время";

  actions.appendChild(btn);

  const pattern = "??:??:??";
  let spans = [];
  let tickId = null;

  function renderRow() {
    row.innerHTML = "";
    spans = [];
    for (const ch of pattern) {
      const s = document.createElement("span");
      s.className = "timer-char";
      if (ch === ":") {
        s.textContent = ":";
        s.classList.add("is-sep");
      } else {
        s.textContent = "?";
      }
      row.appendChild(s);
      spans.push(s);
    }
  }

  function flippable() {
    return spans.filter((s) => !s.classList.contains("is-sep"));
  }

  function step() {
    const f = flippable();
    const available = f.filter((s) => !s.classList.contains("is-flipped"));
    if (!available.length) return;
    const el = available[Math.floor(Math.random() * available.length)];
    el.classList.add("is-flipped");
  }

  function start() {
    stop();
    tickId = setInterval(step, 1000);
  }

  function stop() {
    if (tickId) clearInterval(tickId);
    tickId = null;
  }

  btn.addEventListener("click", () => {
    flippable().forEach((s) => s.classList.toggle("is-flipped"));
  });

  root.appendChild(q);
  root.appendChild(row);
  root.appendChild(actions);

  renderRow();
  start();

  return { el: root, cleanup: stop };
}