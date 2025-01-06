import { Command } from 'commander';
import { createCanvas } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { createWriteStream, readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AudioContext, AnalyserNode } from 'node-web-audio-api';
import { Wave } from './waves';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const program = new Command();

program
  .name('audio-viz')
  .description('Generate audio visualization videos')
  .version('1.0.0')
  .requiredOption('-i, --input <path>', 'Input audio file path')
  .option('-o, --output <path>', 'Output video file path', 'output.mp4')
  .option('-w, --width <number>', 'Video width', '1280')
  .option('-h, --height <number>', 'Video height', '720')
  .option('-d, --duration <seconds>', 'Duration to process in seconds (0 for full)', '10')
  .option('-f, --fps <number>', 'Frames per second', '15');

type AnimationType = keyof Wave['animations'];

async function main() {
  program.parse();
  const options = program.opts();
  console.log('Starting process with options:', options);
  
  // Ensure output directory exists
  const outDir = join(process.cwd(), 'output');
  const rawDir = join(outDir, 'raw');
  const mp4Dir = join(outDir, 'mp4');
  const imageDir = join(outDir, 'images');

  // Define all available animations
  const effects: Array<{ type: keyof Wave['animations'], output: string }> = [
    // { type: 'Circles' as AnimationType, output: join(mp4Dir, 'circles.mp4') },
    // { type: 'Arcs' as AnimationType, output: join(mp4Dir, 'arcs.mp4') },
    // { type: 'Square' as AnimationType, output: join(mp4Dir, 'square.mp4') },
    // { type: 'Shine' as AnimationType, output: join(mp4Dir, 'shine.mp4') },
    { type: 'Flower' as AnimationType, output: join(mp4Dir, 'flower.mp4') },
    // { type: 'Glob' as AnimationType, output: join(mp4Dir, 'glob.mp4') },
    // { type: 'Lines' as AnimationType, output: join(mp4Dir, 'lines.mp4') },
    // { type: 'Wave' as AnimationType, output: join(mp4Dir, 'wave.mp4') },
    // { type: 'Turntable' as AnimationType, output: join(mp4Dir, 'turntable.mp4') }
  ];

  
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }
  if (!existsSync(rawDir)) {
    mkdirSync(rawDir);
  }
  if (!existsSync(mp4Dir)) {
    mkdirSync(mp4Dir);
  }
  if (!existsSync(imageDir)) {
    mkdirSync(imageDir);
  }

  // Create audio context and analyzer
  const audioContext = new AudioContext();
  const audioFile = new Uint8Array(readFileSync(options.input)).buffer;
  const audioBuffer = await audioContext.decodeAudioData(audioFile);
  console.log('Audio Buffer:', {
    duration: audioBuffer.duration,
    numberOfChannels: audioBuffer.numberOfChannels,
    sampleRate: audioBuffer.sampleRate,
    length: audioBuffer.length
  });
  
  const analyser = audioContext.createAnalyser();
  analyser.minDecibels = -100;
  analyser.maxDecibels = -30;
  analyser.smoothingTimeConstant = 0.85;
  analyser.fftSize = 1024;
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  source.connect(audioContext.destination);
  source.start(0);
  console.log('Analyzer:', {
    fftSize: analyser.fftSize,
    frequencyBinCount: analyser.frequencyBinCount,
    minDecibels: analyser.minDecibels,
    maxDecibels: analyser.maxDecibels
  });

  // Process each effect
  for (const effect of effects) {
    console.log(`\nProcessing ${effect.type} visualization...`);
    
    const canvas = createCanvas(parseInt(options.width), parseInt(options.height));
    const ctx = canvas.getContext('2d');

    // Create Wave instance with analyzer
    const wave = new Wave(analyser, canvas);
    wave.setDefaultColors('white', 'white');
    
    // Set the animation with default colors
    wave.setAnimation(effect.type);

    // Create video stream
    const framesPath = join(rawDir, `${effect.type}.raw`);
    const videoStream = createWriteStream(framesPath);

    // Animation loop
    const totalFrames = Math.ceil(parseInt(options.duration) * parseInt(options.fps));
    const audioBufferData = new Uint8Array(analyser.frequencyBinCount);

    for (let frame = 0; frame < totalFrames; frame++) {
      analyser.getByteFrequencyData(audioBufferData);
      if (frame < 5) {
        console.log(`Frame ${frame} audio data:`, {
          min: Math.min(...audioBufferData),
          max: Math.max(...audioBufferData),
          avg: audioBufferData.reduce((a, b) => a + b, 0) / audioBufferData.length,
          firstFew: Array.from(audioBufferData.slice(0, 10)),
          nonZeroCount: audioBufferData.filter(v => v > 0).length,
          totalCount: audioBufferData.length,
          scale: Math.min(canvas.width, canvas.height)
        });
      }

      // Clear canvas and draw frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wave.draw(audioBufferData, ctx);

      // Save key frames as PNG for debugging
      if (frame === 0 || frame === Math.floor(totalFrames / 2) || frame === totalFrames - 1) {
        const pngBuffer = canvas.toBuffer('image/png');
        const framePath = join(imageDir, `${effect.type}-frame-${frame}.png`);
        writeFileSync(framePath, pngBuffer);
        console.log(`Saved debug frame: ${framePath}`);
      }

      // Write frame
      const frameBuffer = canvas.toBuffer('raw');
      if (!videoStream.write(frameBuffer)) {
        await new Promise(resolve => videoStream.once('drain', resolve));
      }

      if (frame % 10 === 0) {
        const progress = Math.round((frame / totalFrames) * 100);
        process.stdout.write(`\rProcessing frames: ${progress}% (${frame}/${totalFrames})`);
      }
    }

    await new Promise(resolve => videoStream.end(resolve));

    // Encode video using FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(framesPath)
        .inputOptions([
          `-f rawvideo`,
          `-pixel_format rgba`,
          `-video_size ${options.width}x${options.height}`,
          `-framerate ${options.fps}`,
        ])
        .input(options.input)
        .output(effect.output)
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-preset ultrafast',
          `-t ${options.duration}`,
        ])
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    console.log(`\nCompleted ${effect.type} visualization: ${effect.output}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 