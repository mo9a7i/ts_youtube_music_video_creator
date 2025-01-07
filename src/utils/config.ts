import { Command } from 'commander';
import { VIDEO_PRESETS } from './video';

export interface CliOptions {
  input: string;
  output: string;
  resolution: string;
  duration: string;
  fps: string;
  preset: string;
  debug: boolean;
}

export function setupCli(): CliOptions {
  const program = new Command();

  program
    .name('audio-viz')
    .description('Generate audio visualization videos')
    .version('1.0.0')
    .requiredOption('-i, --input <path>', 'Input audio file path')
    .option('-o, --output <path>', 'Output video file path', 'output.mp4')
    .option('-r, --resolution <preset>', 'Video resolution preset', '1080p')
    .option('-d, --duration <seconds>', 'Duration to process in seconds (0 for full)', '10')
    .option('-f, --fps <number>', 'Frames per second', '15')
    .option('-p, --preset <preset>', 'Animation preset (0-3 or animation name)', '0')
    .option('--debug', 'Enable debug mode (save frames and raw files)', false);

  program.parse();
  return program.opts<CliOptions>();
} 