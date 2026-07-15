# 🔪 portkill

`EADDRINUSE` again? Find and kill whatever process is squatting on a TCP port — **cross-platform** (Windows `netstat`+`taskkill`, macOS/Linux `lsof`+signals), zero dependencies.

```bash
portkill 3000            # kill the listener on :3000 (SIGTERM)
portkill 3000 --force    # SIGKILL / taskkill /F
portkill 8080 --list     # just show the PID(s), kill nothing
```

## Behavior
- Resolves the PID(s) **listening** on the port (ignores ESTABLISHED/UDP noise).
- Lists them, then terminates; `--force` for a hard kill.
- Exit 0 when the port is freed (or was already free), non-zero if a kill fails.

## Dev
```bash
bun install
bun test              # OS-output parsers are unit-tested
bun run build         # tsdown → dist/cli.js
```

The fiddly bit — parsing `netstat`/`lsof` output — lives in `src/find.ts` and is fully unit-tested with captured fixtures.

MIT.
