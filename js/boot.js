function buildCells(bar) {
  bar.innerHTML = "";
  const w = bar.getBoundingClientRect().width || 300;
  const cellStep = 18;
  const count = Math.max(16, Math.min(42, Math.floor(w / cellStep)));
  const cells = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "boot-cell";
    bar.appendChild(el);
    cells.push(el);
  }
  return cells;
}

export function runBoot() {
  const boot = document.getElementById("boot");
  const bar = document.getElementById("boot-bar");
  const percentEl = document.getElementById("boot-percent");
  if (!boot || !bar || !percentEl) return;

  let cells = [];
  let total = 0;
  let filled = 0;
  let done = false;

  function setup() {
    if (done) return;
    cells = buildCells(bar);
    total = cells.length;
    filled = 0;
    percentEl.textContent = "0%";
  }

  requestAnimationFrame(() => {
    setup();

    const timer = setInterval(() => {
      const step = Math.random() < 0.2 ? 2 : 1;

      for (let i = 0; i < step && filled < total; i++) {
        cells[filled].classList.add("filled");
        filled++;
      }

      const pct = Math.round((filled / total) * 100);
      percentEl.textContent = pct + "%";

      if (filled >= total) {
        done = true;
        clearInterval(timer);

        setTimeout(() => {
          boot.classList.add("hide");
          setTimeout(() => boot.remove(), 350);
        }, 450);
      }
    }, 70);
  });

  window.addEventListener("resize", () => {
    if (!done) setup();
  });
}