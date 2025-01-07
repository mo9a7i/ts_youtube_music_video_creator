import { hasNvidiaGPU } from './hardware';

export interface FFmpegConfig {
  inputOptions: string[];
  outputOptions: (duration: string) => string[];
}

export async function createFFmpegConfig(): Promise<FFmpegConfig> {
  const hasGPU = await hasNvidiaGPU();
  if (hasGPU) {
    console.log('\nNVIDIA GPU detected - Using hardware acceleration (NVENC)');
  } else {
    console.log('\nNo NVIDIA GPU detected - Using CPU encoding (libx264)');
  }

  return {
    inputOptions: [
      `-f rawvideo`,
      `-pixel_format bgra`,
    ],
    outputOptions: (duration: string) => [
      ...(hasGPU ? [
        '-c:v h264_nvenc',
        '-preset slow',
        '-b:v 20M',
        '-maxrate 25M',
        '-bufsize 20M',
        '-rc:v vbr',
        '-qmin 0',
        '-qmax 24',
        '-profile:v high'
      ] : [
        '-c:v libx264',
        '-preset slow',
        '-profile:v high',
        '-crf 15',
        '-x264-params ref=6:qcomp=0.8'
      ]),
      '-pix_fmt yuv420p',
      `-t ${duration}`,
    ].filter(Boolean)
  };
} 