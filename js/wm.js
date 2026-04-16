let zTop = 5000;
const registry = new Map();

function getWM() {
  return document.getElementById("wm");
}

function createWindow(title, bodyEl, onDestroy, options) {
  const wm = getWM();
  if (!wm) return null;

  const overlay = document.createElement("div");
  overlay.className = "win-overlay";
  overlay.style.zIndex = String(++zTop);

  const win = document.createElement("div");
  win.className = "win";
  win.tabIndex = -1;

  if (options && options.className) win.classList.add(options.className);
  if (options && options.width) win.style.width = options.width;
  if (options && options.height) win.style.height = options.height;

  const titlebar = document.createElement("div");
  titlebar.className = "win-titlebar";

  const t = document.createElement("div");
  t.className = "win-title";
  t.textContent = title;

  const close = document.createElement("button");
  close.className = "win-close";
  close.type = "button";
  close.textContent = "X";

  const body = document.createElement("div");
  body.className = "win-body";
  body.appendChild(bodyEl);

  titlebar.appendChild(t);
  titlebar.appendChild(close);
  win.appendChild(titlebar);
  win.appendChild(body);
  overlay.appendChild(win);
  wm.appendChild(overlay);

  wm.style.pointerEvents = "auto";

  let destroyed = false;

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (typeof onDestroy === "function") onDestroy();
    overlay.remove();
    if (!wm.querySelector(".win-overlay")) wm.style.pointerEvents = "none";
  }

  close.addEventListener("click", destroy);

  overlay.addEventListener("pointerdown", (e) => {
    overlay.style.zIndex = String(++zTop);
    if (e.target === overlay) destroy();
  });

  win.addEventListener("keydown", (e) => {
    if (e.key === "Escape") destroy();
  });

  requestAnimationFrame(() => win.focus());

  return { destroy };
}

export function registerApp(id, title, factory, options = null) {
  registry.set(id, { title, factory, options });
}

export function openApp(id) {
  const entry = registry.get(id);

  if (!entry) {
    const stub = document.createElement("div");
    stub.textContent = "Скоро";
    createWindow(id || "App", stub);
    return;
  }

  const created = entry.factory();
  const bodyEl = created && created.el ? created.el : created;
  const cleanup = created && created.cleanup ? created.cleanup : null;

  if (!bodyEl) return;
  createWindow(entry.title, bodyEl, cleanup, entry.options);
}