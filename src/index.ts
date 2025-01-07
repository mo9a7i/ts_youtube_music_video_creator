import { setupCli } from './utils/config';
import { setupAudio } from './utils/audio';
import { processAnimation } from './utils/animation';
import { setupOutputDirectories, cleanupTempFile, readFile } from './utils/fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function main() {
  const options = setupCli();
  console.log('Starting process with options:', options);
  
  const dirs = setupOutputDirectories(options.debug);
  const audioData = readFile(options.input);
  const { analyser, audioBuffer } = await setupAudio(audioData);
  
  const framesPath = await processAnimation(options, analyser, audioBuffer, dirs);
  
  if (!options.debug) {
    if (framesPath) {
      cleanupTempFile(framesPath);
    }
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 