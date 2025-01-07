import { AudioContext } from 'node-web-audio-api';

interface AudioSetup {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  audioBuffer: AudioBuffer;
}

export async function setupAudio(audioData: Buffer): Promise<AudioSetup> {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(new Uint8Array(audioData).buffer);
  
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

  return { audioContext, analyser, audioBuffer };
} 