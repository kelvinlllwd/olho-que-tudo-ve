const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3000;
const PROJECT = 'C:\\Users\\kelvi\\AppData\\Local\\Temp\\kilo\\olho-build';
const TUNNEL_CMD = 'lt';
const TUNNEL_ARGS = ['--port', PORT, '--print-requests'];

let nextServer = null;
let tunnel = null;
let tunnelUrl = null;

function log(msg) {
  console.log(`[proxy] ${new Date().toISOString()} ${msg}`);
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    log('Starting Next.js production server...');
    nextServer = spawn('npx', ['next', 'start', '--port', PORT], {
      cwd: PROJECT,
      shell: true,
      stdio: 'pipe',
      detached: true,
    });

    let output = '';
    nextServer.stdout.on('data', (d) => {
      output += d.toString();
      if (output.includes('Ready') || output.includes('Local:')) {
        log('Next.js server is ready');
        resolve();
      }
    });

    nextServer.stderr.on('data', (d) => {
      log(`Next.js stderr: ${d.toString()}`);
    });

    nextServer.on('error', reject);

    nextServer.stdout.pipe(process.stdout);
    nextServer.stderr.pipe(process.stderr);

    // Timeout fallback
    setTimeout(() => {
      log('Next.js server started (timeout fallback)');
      resolve();
    }, 15000);
  });
}

function startTunnel() {
  return new Promise((resolve, reject) => {
    log('Starting localtunnel...');
    tunnel = spawn(TUNNEL_CMD, TUNNEL_ARGS, {
      cwd: PROJECT,
      shell: true,
      stdio: 'pipe',
      detached: true,
    });

    tunnel.stdout.on('data', (d) => {
      const out = d.toString();
      process.stdout.write(out);
      const match = out.match(/url is:\s*(https:\/\/[^\s]+)/);
      if (match && !tunnelUrl) {
        tunnelUrl = match[1];
        log(`Tunnel URL: ${tunnelUrl}`);
        resolve(tunnelUrl);
      }
    });

    tunnel.stderr.on('data', (d) => {
      process.stderr.write(d);
    });

    tunnel.on('error', reject);
    tunnel.on('exit', (code) => {
      log(`Tunnel exited with code ${code}`);
    });
  });
}

async function restartTunnel() {
  if (tunnel) {
    try { tunnel.kill(); } catch (e) {}
    tunnel = null;
  }
  tunnelUrl = null;
  await sleep(2000);
  try {
    await startTunnel();
  } catch (e) {
    log(`Tunnel restart failed: ${e.message}`);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  log('=== Olho Que Tudo Vê - Production Launcher ===');

  // Step 1: Build production
  log('Building production app...');
  const build = spawn('npx', ['next', 'build'], {
    cwd: PROJECT,
    shell: true,
    stdio: 'inherit',
  });
  await new Promise((resolve) => {
    build.on('exit', (code) => {
      log(`Build finished with code ${code}`);
      resolve();
    });
  });

  // Step 2: Start Next.js production server
  await startNextServer();
  await sleep(2000);

  // Step 3: Start tunnel
  try {
    await startTunnel();
  } catch (e) {
    log(`Tunnel start failed: ${e.message}`);
  }

  log(`Site is live at: ${tunnelUrl || 'tunnel pending...'}`);
  log('Credentials: demo@olho.com / demo123');

  // Step 4: Monitor and auto-restart tunnel
  setInterval(() => {
    if (tunnel && tunnel.exitCode !== null) {
      log('Tunnel died, restarting...');
      restartTunnel();
    }
  }, 5000);

  // Step 5: Monitor Next.js server
  setInterval(() => {
    if (nextServer && nextServer.exitCode !== null) {
      log('Next.js server died, restarting...');
      startNextServer().then(startTunnel);
    }
  }, 10000);

  // Handle process exit
  process.on('SIGINT', () => {
    log('Shutting down...');
    if (tunnel) tunnel.kill();
    if (nextServer) nextServer.kill();
    process.exit(0);
  });
}

main().catch(e => {
  log(`Fatal error: ${e.message}`);
  process.exit(1);
});