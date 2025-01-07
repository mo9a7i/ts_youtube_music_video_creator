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
  dirs: { outDir: string, rawDir: string | null, imageDir: string | null, mp4Dir: string }
) {
  const { outDir, rawDir, imageDir, mp4Dir } = dirs;
  const startTime = Date.now();
  const fileTimestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/[T.]/g, '-').slice(0, 15);
  const { width, height, label } = getVideoPreset(options.resolution);
  console.log(`\nGenerating ${label} video...`);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create background buffer once
  const backgroundBuffer = await createBackgroundBuffer(canvas.width, canvas.height);
  
  // Pre-allocate buffers
  const audioBufferData = new Uint8Array(analyser.frequencyBinCount);
  const frameBuffer = Buffer.allocUnsafe(canvas.width * canvas.height * 4); // RGBA

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
  const totalFrames = Math.ceil(parseInt(options.duration) * parseInt(options.fps));
  const frameProgress = new ProgressBar(totalFrames, 'Frame Processing');

  for (let frame = 0; frame < totalFrames; frame++) {
    analyser.getByteFrequencyData(audioBufferData);
  
    // Clear canvas and draw background first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundBuffer, 0, 0);
    ctx.globalAlpha = 0.9;  // Slight transparency for better blending
    
    // Draw animation on top
    wave.draw(audioBufferData, ctx);
    ctx.globalAlpha = 1.0;  // Reset alpha

    // Save key frames as PNG if debug mode is enabled
    if (options.debug && (frame === 0 || frame === Math.floor(totalFrames / 2) || frame === totalFrames - 1)) {
      const pngBuffer = canvas.toBuffer('image/png');
      const framePath = join(imageDir!, `${fileTimestamp}-frame-${frame}.png`);
      writeFile(framePath, pngBuffer);
      console.log(`Saved debug frame: ${framePath}`);
    }

    // Write frame more efficiently
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frameBuffer.set(imageData.data);
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
      .outputOptions(ffmpegConfig.outputOptions(options.duration))
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