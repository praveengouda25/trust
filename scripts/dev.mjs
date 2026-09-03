import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const nodeCommand = process.execPath;
const children = [
  spawn(nodeCommand, [resolve(root, "node_modules/vite/bin/vite.js"), "dev"], {
    cwd: root,
    stdio: "inherit",
  }),
  spawn(nodeCommand, [resolve(root, "latest_ERP/node_modules/vite/bin/vite.js"), "dev"], {
    cwd: resolve(root, "latest_ERP"),
    stdio: "inherit",
  }),
];

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
  process.exit(code);
}

for (const child of children) {
  child.on("error", () => shutdown(1));
  child.on("exit", (code, signal) => {
    if (!shuttingDown && (code ?? 1) !== 0) shutdown(code ?? 1);
    else if (!shuttingDown && signal) shutdown(1);
  });
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());