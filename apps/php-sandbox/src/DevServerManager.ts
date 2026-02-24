import { spawn, ChildProcess } from 'child_process';

interface ManagerConfig {
  phpPort: number;
  vitePort: number;
}

export class DevServerManager {
  private phpProcess: ChildProcess | null = null;
  private viteProcess: ChildProcess | null = null;

  constructor(private config: ManagerConfig) {}

  getCommands() {
    return {
      php: `php -S localhost:${this.config.phpPort}`,
      vite: `vite --port ${this.config.vitePort}`,
    };
  }

  async start() {
    const commands = this.getCommands();

    console.log(`Starting PHP server on port ${this.config.phpPort}...`);
    this.phpProcess = spawn('php', ['-S', `localhost:${this.config.phpPort}`], {
      stdio: 'inherit',
      shell: true,
    });

    console.log(`Starting Vite server on port ${this.config.vitePort}...`);
    this.viteProcess = spawn('npx', ['vite', '--port', this.config.vitePort.toString()], {
      stdio: 'inherit',
      shell: true,
    });

    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  stop() {
    console.log('Stopping servers...');
    this.phpProcess?.kill();
    this.viteProcess?.kill();
    process.exit();
  }
}
