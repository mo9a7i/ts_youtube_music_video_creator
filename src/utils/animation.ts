import { createCanvas } from 'canvas';
import { Wave } from '../waves';
import { presets } from './presets';
import { join } from 'path';
import { createFileStream, writeFile } from './fs';
import ffmpeg from 'fluent-ffmpeg';
import { createFFmpegConfig } from './ffmpeg.config';
import type { CliOptions } from './config';
import { createBackgroundBuffer } from './background';
import { ProgressBar } from './progress';
import { getVideoPreset } from './video';

export async function processAnimation(
  options: CliOptions,
  analyser: AnalyserNode,
  audioBuffer: AudioBuffer,
  dirs: { outDir: string, rawDir: string | null, imageDir: string | null, mp4Dir: string }
) {
  const { outDir, rawDir, imageDir, mp4Dir } = dirs;
  const startTime = Date.now();
  const fileTimestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/[T.]/g, '-').slice(0, 15);
  const { width, height, label } = getVideoPreset(options.resolution);
  console.log(`\nGenerating ${label} video...`);

  // Calculate duration based on audio length if duration is 0
  const duration = parseInt(options.duration) === 0 
    ? Math.ceil(audioBuffer.duration)  // Use full audio length
    : parseInt(options.duration);      // Use specified duration

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create background buffer once
  const backgroundBuffer = await createBackgroundBuffer(canvas.width, canvas.height);
  
  // Pre-allocate buffers
  const audioBufferData = new Uint8Array(analyser.frequencyBinCount);
  const frameBuffer = Buffer.allocUnsafe(canvas.width * canvas.height * 4);

  const wave = new Wave(analyser, canvas);
  
  if (options.preset && presets[options.preset]) {
    presets[options.preset](wave);
  } else {
    wave.setAnimation('Wave');
    wave.setDefaultColors('white', 'white');
  }

  const framesPath = options.debug ? join(rawDir!, `${fileTimestamp}-output.raw`) : join(outDir, 'temp.raw');
  const videoStream = createFileStream(framesPath);

  // Animation loop
  const totalFrames = Math.ceil(duration * parseInt(options.fps));
  const frameProgress = new ProgressBar(totalFrames, 'Frame Processing');

  // Reuse objects to reduce GC pressure
  let imageData = ctx.createImageData(canvas.width, canvas.height);

  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  const writeQueue: Buffer[] = [];
  
  async function processFrame(frameIndex: number, buffer: Buffer) {
    analyser.getByteFrequencyData(audioBufferData);

    // Clear canvas and draw background first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundBuffer, 0, 0);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    // Draw animation on top
    wave.draw(audioBufferData, ctx);

    // Save debug frames
    if (options.debug && (frameIndex === 0 || frameIndex === Math.floor(totalFrames / 2) || frameIndex === totalFrames - 1)) {
      const pngBuffer = canvas.toBuffer('image/png');
      const framePath = join(imageDir!, `${fileTimestamp}-frame-${frameIndex}.png`);
      writeFile(framePath, pngBuffer);
      console.log(`Saved debug frame: ${framePath}`);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    buffer.set(imageData.data);
    return buffer;
  }

  function drainQueue() {
    while (writeQueue.length && videoStream.writableLength < CHUNK_SIZE) {
      const chunk = writeQueue.shift();
      if (!videoStream.write(chunk)) break;
    }
  }
  
  videoStream.on('drain', drainQueue);

  for (let frame = 0; frame < totalFrames; frame++) {
    analyser.getByteFrequencyData(audioBufferData);
    
    // Clear canvas and draw background first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundBuffer, 0, 0);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    // Draw animation on top
    wave.draw(audioBufferData, ctx);

    // Get frame data
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frameBuffer.set(imageData.data);
    
    // Write frame
    if (!videoStream.write(frameBuffer)) {
      await new Promise(resolve => videoStream.once('drain', resolve));
    }

    frameProgress.update(frame);
  }

  frameProgress.complete();

  // Wait for stream to finish
  await new Promise(resolve => videoStream.end(resolve));

  // Encode video using FFmpeg
  const encodingProgress = new ProgressBar(100, 'Video Encoding');
  let encodingPercent = 0;
  const ffmpegConfig = await createFFmpegConfig();

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(framesPath)
      .inputOptions([
        ...ffmpegConfig.inputOptions,
        `-video_size ${width}x${height}`,
        `-framerate ${options.fps}`,
      ])
      .input(options.input)
      .output(join(mp4Dir, `${fileTimestamp}-${options.preset || 'wave'}.mp4`))
      .videoCodec('libx264')
      .outputOptions(ffmpegConfig.outputOptions(duration.toString()))
      .on('progress', (progress) => {
        encodingPercent = Math.min(99, Math.round(progress.percent || 0));
        encodingProgress.update(encodingPercent);
      })
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  encodingProgress.update(100);  // Ensure we show 100%
  encodingProgress.complete();

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\nTotal time: ${totalTime.toFixed(2)}s`);

  return framesPath;
} 