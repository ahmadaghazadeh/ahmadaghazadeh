import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const mode = process.argv[2];
if (!["dev", "start"].includes(mode)) throw new Error("Expected dev or start.");
const firstPort = Number(process.env.PORT || 3000);
if (!Number.isInteger(firstPort) || firstPort < 1 || firstPort > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

async function available(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", error => {
      if (["EADDRINUSE", "EACCES"].includes(error.code)) resolve(false);
      else reject(error);
    });
    server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
  });
}

let port = firstPort;
while (port < Math.min(firstPort + 100, 65536) && !(await available(port))) port++;
if (port >= Math.min(firstPort + 100, 65536)) throw new Error("No available local port found. Set PORT to another range.");
if (port !== firstPort) console.log(`Port ${firstPort} is unavailable or reserved. Using ${port}.`);
const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), mode, "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port), NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${port}` },
});
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", code => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
