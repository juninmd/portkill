#!/usr/bin/env node
import { execSync } from "node:child_process";
import { parseNetstat, parseLsof, isValidPort } from "./find";

const isWin = process.platform === "win32";

const C = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const HELP = `portkill — free up a TCP port

Usage:
  portkill <port> [--list] [--force] [--yes]

Options:
  --list    only show the offending PIDs, don't kill
  --force   SIGKILL / taskkill /F
  --yes     skip confirmation
  -h, --help`;

function pidsOnPort(port: number): number[] {
  try {
    if (isWin) return parseNetstat(execSync("netstat -ano", { encoding: "utf8" }), port);
    return parseLsof(execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }));
  } catch {
    return []; // command returns non-zero when nothing matches
  }
}

function kill(pid: number, force: boolean): void {
  if (isWin) execSync(`taskkill /PID ${pid} ${force ? "/F" : ""}`.trim(), { stdio: "ignore" });
  else process.kill(pid, force ? "SIGKILL" : "SIGTERM");
}

function main(argv: string[]): number {
  if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
    console.log(HELP);
    return argv.length === 0 ? 2 : 0;
  }
  const port = Number(argv.find((a) => !a.startsWith("-")));
  if (!isValidPort(port)) {
    console.error(C.red("error: give a valid port (1-65535)"));
    return 2;
  }
  const list = argv.includes("--list");
  const force = argv.includes("--force");

  const pids = pidsOnPort(port);
  if (pids.length === 0) {
    console.log(C.dim(`nothing is listening on :${port}`));
    return 0;
  }
  console.log(`port ${C.yellow(String(port))} held by PID(s): ${pids.join(", ")}`);
  if (list) return 0;

  let killed = 0;
  for (const pid of pids) {
    try {
      kill(pid, force);
      console.log(C.green(`  killed ${pid}`));
      killed++;
    } catch (err) {
      console.error(C.red(`  failed ${pid}: ${err instanceof Error ? err.message : err}`));
    }
  }
  return killed === pids.length ? 0 : 1;
}

process.exit(main(process.argv.slice(2)));
