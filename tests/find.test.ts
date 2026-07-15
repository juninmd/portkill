import { test, expect } from "bun:test";
import { parseNetstat, parseLsof, isValidPort } from "../src/find";

const NETSTAT = `
Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
  TCP    127.0.0.1:3000         127.0.0.1:54321        ESTABLISHED     999
  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       6789
  TCP    [::]:3000              [::]:0                 LISTENING       12345
  UDP    0.0.0.0:3000           *:*                                    111
`;

test("parseNetstat finds only LISTENING PIDs for the port (deduped)", () => {
  expect(parseNetstat(NETSTAT, 3000).sort()).toEqual([12345]);
  expect(parseNetstat(NETSTAT, 8080)).toEqual([6789]);
  expect(parseNetstat(NETSTAT, 9999)).toEqual([]);
});

test("parseNetstat ignores ESTABLISHED and UDP", () => {
  expect(parseNetstat(NETSTAT, 3000)).not.toContain(999);
  expect(parseNetstat(NETSTAT, 3000)).not.toContain(111);
});

test("parseLsof reads bare PIDs and dedupes", () => {
  expect(parseLsof("4021\n4021\n5533\n")).toEqual([4021, 5533]);
  expect(parseLsof("")).toEqual([]);
});

test("isValidPort bounds", () => {
  expect(isValidPort(3000)).toBe(true);
  expect(isValidPort(0)).toBe(false);
  expect(isValidPort(70000)).toBe(false);
  expect(isValidPort(NaN)).toBe(false);
});
