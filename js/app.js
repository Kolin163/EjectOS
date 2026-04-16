import { runBoot } from "./boot.js";
import { registerApp } from "./wm.js";
import { initDesktop } from "./desktop.js";
import { createCalculatorApp } from "./apps/calc.js";
import { createTimerApp } from "./apps/timer.js";
import { createCsApp } from "./apps/cs.js";
import { createKabanosNinjaApp } from "./apps/kabanos-ninja.js";
import { createEts2App } from "./apps/ets2.js";

registerApp("calc", "Калькулятор", createCalculatorApp);
registerApp("timer", "Таймер", createTimerApp);
registerApp("cs", "CS?", createCsApp, { width: "min(580px, 96vw)" });
registerApp("kabanos-ninja", "Кабанос-Ниндзя", createKabanosNinjaApp, { width: "min(620px, 96vw)" });
registerApp("ets2", "ETS2", createEts2App, { width: "min(480px, 96vw)" });

window.addEventListener("DOMContentLoaded", () => {
  runBoot();
  initDesktop();
});