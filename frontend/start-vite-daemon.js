import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteBin = path.join(__dirname, 'node_modules', '.bin', 'vite');

const child = spawn(viteBin, ['--host', '0.0.0.0', '--port', '3000'], {
  cwd: __dirname,
  detached: true,
  stdio: 'ignore'
});

child.unref();
console.log(`Vite detached daemon launched with PID ${child.pid}`);
