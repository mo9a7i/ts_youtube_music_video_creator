export interface VideoPreset {
  width: number;
  height: number;
  label: string;
}

export const VIDEO_PRESETS: Record<string, VideoPreset> = {
  '360p': { width: 640, height: 360, label: 'SD (360p)' },
  '480p': { width: 854, height: 480, label: 'SD (480p)' },
  '720p': { width: 1280, height: 720, label: 'HD (720p)' },
  '1080p': { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  '1440p': { width: 2560, height: 1440, label: 'QHD (1440p)' },
  '2160p': { width: 3840, height: 2160, label: '4K UHD (2160p)' },
  '4320p': { width: 7680, height: 4320, label: '8K UHD (4320p)' }
};

export function getVideoPreset(preset: string): VideoPreset {
  const videoPreset = VIDEO_PRESETS[preset];
  if (!videoPreset) {
    throw new Error(`Invalid video preset. Available presets: ${Object.keys(VIDEO_PRESETS).join(', ')}`);
  }
  return videoPreset;
} 