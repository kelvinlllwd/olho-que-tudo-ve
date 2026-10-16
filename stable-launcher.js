const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const PROJECT = 'C:\\Users\\kelvi\\AppData\\Local\\Temp\\kilo\\olho-build';
const DEV_PORT = 3000;
const PROXY_PORT = 3000;

let nextServer = null;
let tunnel = null;
let tunnelUrl = null;
let nextReady = false;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isNextReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${DEV_PORT}/auth/login`, (res) => {
      resolve(res.statusCode === 200);
      req.destroy();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

async function waitForNext(maxTries = 40) {
  for (let i = 0; i < maxTries; i++) {
    if (await isNextReady()) { nextReady = true; return true; }
    log(`Waiting for Next.js... (${i + 1}/${maxTries})`);
    await sleep(2000);
  }
  return false;
}

function startNext() {
  return new Promise((resolve) => {
    log('Starting Next.js dev server...');
    nextServer = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT, shell: true, stdio: 'pipe', detached: true,
    });
    nextServer.stdout.on('data', (d) => {
      const out = d.toString();
      if (out.includes('Ready in')) log('Next.js server is ready');
    });
    nextServer.stderr.on('data', (d) => log(`Next.js stderr: ${d.toString().trim()}`));
    nextServer.on('exit', (code) => {
      log(`Next.js exited with code ${code}`);
      nextReady = false;
    });
    resolve();
  });
}

function startTunnel() {
  return new Promise((resolve, reject) => {
    log('Starting localtunnel...');
    tunnel = spawn('lt', ['--port', PROXY_PORT, '--print-requests'], {
      cwd: PROJECT, shell: true, stdio: 'pipe', detached: true,
    });
    tunnel.stdout.on('data', (d) => {
      const out = d.toString();
      process.stdout.write(out);
      const m = out.match(/url is:\s*(https:\/\/[^\s]+)/);
      if (m && !tunnelUrl) {
        tunnelUrl = m[1];
        log(`Tunnel URL: ${tunnelUrl}`);
        resolve(tunnelUrl);
      }
    });
    tunnel.stderr.on('data', (d) => process.stderr.write(d));
    tunnel.on('error', reject);
    tunnel.on('exit', (code) => {
      log(`Tunnel exited with code ${code}`);
    });
  });
}

async function restartEverything() {
  log('=== RESTARTING ALL COMPONENTS ===');
  if (tunnel) { try { tunnel.kill(); } catch(e) {} tunnel = null; }
  if (nextServer) { try { nextServer.kill(); } catch(e) {} nextServer = null; }
  await sleep(2000);
  await startNext();
  await waitForNext();
  if (nextReady) {
    try { await startTunnel(); } catch(e) { log(`Tunnel error: ${e.message}`); }
  }
}

async function main() {
  log('=== Olho Que Tudo Vê - Stable Launcher ===');

  // Kill existing
  try { execSync('taskkill /F /IM node.exe 2>nul', { stdio: 'ignore' }); } catch(e) {}
  await sleep(1000);

  // Start Next.js
  await startNext();
  const ready = await waitForNext();
  if (!ready) {
    log('ERROR: Next.js failed to start');
    process.exit(1);
  }

  // Start tunnel
  try {
    await startTunnel();
  } catch(e) {
    log(`Tunnel error: ${e.message}`);
  }

  log(`Site is live at: ${tunnelUrl || 'pending...'}`);
  log('Credentials: demo@olho.com / demo123');

  // Monitor - restart if anything dies
  setInterval(() => {
    if (nextServer && nextServer.exitCode !== null) {
      log('Next.js died! Restarting...');
      restartEverything().then(() => log('Restart complete'));
    }
  }, 10000);

  setInterval(() => {
    if (tunnel && tunnel.exitCode !== null) {
      log('Tunnel died! Restarting tunnel...');
      tunnel = null;
      sleep(2000).then(() => {
        if (nextReady) {
          startTunnel().catch(e => log(`Tunnel restart failed: ${e.message}`));
        }
      });
    }
  }, 5000);

  process.on('SIGINT', () => {
    log('Shutting down...');
    if (tunnel) tunnel.kill();
    if (nextServer) nextServer.kill();
    process.exit(0);
  });
}

main().catch(e => { log(`Fatal: ${e.message}`); process.exit(1); });