import { openApp } from "./wm.js";

export function initDesktop() {
  const desktop = document.getElementById("desktop");
  if (!desktop) return;

  let selected = null;
  let lastTapIcon = null;
  let lastTapTime = 0;
  const doubleTapMs = 420;

  function setSelected(icon) {
    if (selected === icon) return;
    if (selected) selected.classList.remove("is-selected");
    selected = icon;
    if (selected) selected.classList.add("is-selected");
  }

  function clearSelected() {
    if (!selected) return;
    selected.classList.remove("is-selected");
    selected = null;
  }

  desktop.addEventListener("pointerdown", (e) => {
    const icon = e.target.closest(".desktop-icon");
    if (!icon) clearSelected();
  });

  desktop.addEventListener("pointerup", (e) => {
    const icon = e.target.closest(".desktop-icon");
    if (!icon) return;

    setSelected(icon);

    const now = performance.now();
    if (lastTapIcon === icon && now - lastTapTime <= doubleTapMs) {
      lastTapIcon = null;
      lastTapTime = 0;
      openApp(icon.dataset.app || "");
      return;
    }

    lastTapIcon = icon;
    lastTapTime = now;
  });
}