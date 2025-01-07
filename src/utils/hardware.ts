import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function hasNvidiaGPU(): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('nvidia-smi');
      return stdout.toLowerCase().includes('nvidia');
    } else {
      const { stdout } = await execAsync('lspci | grep -i nvidia');
      return stdout.length > 0;
    }
  } catch {
    return false;
  }
} 