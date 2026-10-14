const { app, BrowserWindow, dialog, ipcMain, safeStorage } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

let serverProcess;

function configPath() {
  return path.join(app.getPath("userData"), "deepseek-config.bin");
}

function readDeepSeekConfig() {
  try {
    if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(configPath())) return null;
    return JSON.parse(safeStorage.decryptString(fs.readFileSync(configPath())));
  } catch {
    return null;
  }
}

function restartApp() {
  setTimeout(() => {
    app.relaunch();
    app.exit(0);
  }, 350);
}

ipcMain.handle("deepseek:status", () => {
  const config = readDeepSeekConfig();
  return { configured: Boolean(config?.apiKey), model: config?.model || "deepseek-chat" };
});

ipcMain.handle("deepseek:save", (_event, value) => {
  const apiKey = String(value?.apiKey || "").trim();
  const model = String(value?.model || "deepseek-chat");
  if (!apiKey) throw new Error("API Key 不能为空。");
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Windows 安全存储当前不可用。");
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(configPath(), safeStorage.encryptString(JSON.stringify({ apiKey, model })));
  restartApp();
  return { ok: true };
});

ipcMain.handle("deepseek:delete", () => {
  fs.rmSync(configPath(), { force: true });
  restartApp();
  return { ok: true };
});

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The local Mia English server did not start in time.");
}

async function createWindow() {
  const port = await getFreePort();
  const root = app.getAppPath();
  const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  const config = path.join(root, "dist", "server", "wrangler.json");
  const stateDir = path.join(app.getPath("userData"), "worker-state");
  const deepseek = readDeepSeekConfig();

  serverProcess = spawn(
    process.execPath,
    [wrangler, "dev", "--config", config, "--local", "--persist-to", stateDir, "--ip", "127.0.0.1", "--port", String(port), "--inspector-port", "0"],
    {
      cwd: root,
      windowsHide: true,
      stdio: "ignore",
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        ...(deepseek?.apiKey ? {
          DEEPSEEK_API_KEY: deepseek.apiKey,
          DEEPSEEK_MODEL: deepseek.model || "deepseek-chat",
        } : {}),
      },
    },
  );

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);

  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: "Mia English",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  await window.loadURL(url);
}

app.whenReady().then(() => {
  createWindow().catch((error) => {
    dialog.showErrorBox("Mia English 启动失败", String(error));
    app.quit();
  });
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
