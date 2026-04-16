export function createCalculatorApp() {
  const root = document.createElement("div");
  root.className = "calc";

  const display = document.createElement("input");
  display.className = "calc-display";
  display.type = "text";
  display.inputMode = "none";
  display.autocomplete = "off";
  display.spellcheck = false;
  display.readOnly = true;

  const keys = document.createElement("div");
  keys.className = "calc-keys";

  let expr = "";

  function setExpr(v) {
    expr = v;
    display.value = expr;
  }

  function press(key) {
    if (key === "AC") {
      setExpr("");
      return;
    }
    if (key === "=") {
      display.value = "52";
      expr = "";
      return;
    }
    setExpr(expr + key);
  }

  const layout = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "AC", "+",
    "="
  ];

  layout.forEach((k) => {
    const b = document.createElement("button");
    b.className = "calc-btn";
    b.type = "button";
    b.textContent = k;
    if (k === "=") b.classList.add("wide");
    b.addEventListener("click", () => press(k));
    keys.appendChild(b);
  });

  root.appendChild(display);
  root.appendChild(keys);

  root.addEventListener("keydown", (e) => {
    const k = e.key;

    if (k === "Enter") {
      e.preventDefault();
      press("=");
      return;
    }

    if (k === "Backspace") {
      e.preventDefault();
      setExpr(expr.slice(0, -1));
      return;
    }

    const allowed = "0123456789.+-*/";
    if (allowed.includes(k)) {
      e.preventDefault();
      press(k);
      return;
    }

    if (k.toLowerCase() === "c") {
      e.preventDefault();
      press("AC");
    }
  });

  root.tabIndex = 0;
  requestAnimationFrame(() => root.focus());

  return root;
}