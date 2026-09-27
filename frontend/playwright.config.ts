import { defineConfig } from "@playwright/test";
import path from "node:path";
export default defineConfig({
  testDir: "./tests",
  testMatch: "workbench.spec.ts",
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:5175",
    channel: "msedge",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: `"${path.resolve("../.venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python")}" -m uvicorn app.main:app --app-dir .. --host 127.0.0.1 --port 8010`,
      url: "http://127.0.0.1:8010/health",
      env: { FINECON_DB_PATH: path.resolve(".test-data/e2e.sqlite3") },
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5175",
      url: "http://127.0.0.1:5175",
      env: { API_PROXY_TARGET: "http://127.0.0.1:8010" },
      reuseExistingServer: false,
    },
  ],
});
