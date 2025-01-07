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
import { spawn } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { StreamServer } from './stream-server';
import { Readable } from 'stream';

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

  const duration = parseInt(options.duration) === 0 
    ? Math.ceil(audioBuffer.duration)  
    : parseInt(options.duration);      

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

  let videoStream;
  let ffmpegProcess;
  let framesPath: string | null = null;

  if (options.stream) {
    const ffmpegConfig = await createFFmpegConfig();
    const streamServer = new StreamServer();
    const streamUrl = streamServer.start();
    
    ffmpegProcess = spawn(ffmpegInstaller.path, [
      '-f', 'rawvideo',
      '-pixel_format', 'rgba',
      '-video_size', `${width}x${height}`,
      '-framerate', options.fps,
      '-i', '-',
      '-c:v', ffmpegConfig.outputOptions(duration.toString()).includes('h264_nvenc') ? 'h264_nvenc' : 'libx264',
      '-preset', 'slow',
      '-profile:v', 'high',
      ...(ffmpegConfig.outputOptions(duration.toString()).includes('h264_nvenc') ? [
        '-rc:v', 'constqp',
        '-qp', '18',
        '-spatial-aq', '1',
        '-aq-strength', '8'
      ] : [
        '-crf', '15',
        '-x264-params', 'ref=6:qcomp=0.8'
      ]),
      '-pix_fmt', 'yuv420p',
      '-f', 'mpegts',
      'pipe:1'  // Output to stdout
    ]);

    // Pipe FFmpeg output to stream server
    streamServer.setStream(ffmpegProcess.stdout as Readable);
    videoStream = ffmpegProcess.stdin;

    console.log('\nOpen this URL in your media player:');
    console.log(streamUrl);
  } else {
    framesPath = options.debug ? join(rawDir!, `${fileTimestamp}-output.raw`) : join(outDir, 'temp.raw');
    videoStream = createFileStream(framesPath);
  }

  // Animation loop
  const totalFrames = Math.ceil(duration * parseInt(options.fps));
  const frameProgress = new ProgressBar(totalFrames, 'Frame Processing');

  // Reuse objects to reduce GC pressure
  let imageData = ctx.createImageData(canvas.width, canvas.height);

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

    // Add timestamp overlay
    const currentTime = (frame / parseInt(options.fps)).toFixed(1);
    ctx.font = `${Math.max(24, height / 40)}px Arial`;  // Scale font with resolution
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    const text = `${currentTime}s`;
    const padding = width * 0.02;  // 2% padding from edges
    const yPos = height * 0.05;    // 5% from top
    ctx.strokeText(text, width - padding, yPos);
    ctx.fillText(text, width - padding, yPos);

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
  if (!options.stream) {
    const encodingProgress = new ProgressBar(100, 'Video Encoding');
    let encodingPercent = 0;
    const ffmpegConfig = await createFFmpegConfig();

    if (!framesPath) throw new Error('Frames path is null');

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
  }

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\nTotal time: ${totalTime.toFixed(2)}s`);

  return options.stream ? null : framesPath;
}