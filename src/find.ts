// Pure parsers for OS "who owns this port" command output. No child_process here.

/** Parse Windows `netstat -ano` output → PIDs listening on `port`. */
export function parseNetstat(output: string, port: number): number[] {
  const pids = new Set<number>();
  for (const line of output.split(/\r?\n/)) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 5) continue;
    const [proto, local, , state, pidStr] = cols as [string, string, string, string, string];
    if (!/^tcp/i.test(proto)) continue;
    // local address ends with :<port>
    if (!local.endsWith(`:${port}`)) continue;
    if (!/^listen/i.test(state)) continue;
    const pid = Number(pidStr);
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

/** Parse `lsof -ti tcp:<port>` output (bare PIDs, one per line). */
export function parseLsof(output: string): number[] {
  const pids = new Set<number>();
  for (const line of output.split(/\r?\n/)) {
    const pid = Number(line.trim());
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  return [...pids];
}

export function isValidPort(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 65535;
}
