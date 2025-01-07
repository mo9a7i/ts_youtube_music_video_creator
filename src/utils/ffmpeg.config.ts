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
      `-pixel_format rgba`,
    ],
    outputOptions: (duration: string) => [
      ...(hasGPU ? [
        '-c:v h264_nvenc',
        '-preset slow',
        '-b:v 20M',
        '-maxrate 25M',
        '-bufsize 20M',
        '-rc:v constqp',
        '-qp 18',
        '-profile:v high',
        '-spatial-aq 1',
        '-aq-strength 8',
        '-a53cc 0'
      ] : [
        '-c:v libx264',
        '-preset slow',
        '-profile:v high',
        '-crf 15',
        '-x264-params ref=6:qcomp=0.8:colorprim=bt709:transfer=bt709:colormatrix=bt709'
      ]),
      '-pix_fmt yuv420p',
      '-vf format=yuv420p,colorspace=bt709:iall=bt709:fast=1',
      `-t ${duration}`,
    ].filter(Boolean)
  };
} 