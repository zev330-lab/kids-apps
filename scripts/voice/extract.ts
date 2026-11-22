import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { catalog } from "./catalog";

const python = process.env.KOKORO_PYTHON || join(homedir(), "dev/kokoro/.venv/bin/python");
const result = spawnSync(python, ["scripts/voice/render.py"], {
  input: JSON.stringify(catalog),
  stdio: ["pipe", "inherit", "inherit"],
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
