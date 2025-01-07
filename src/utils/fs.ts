import { mkdirSync, existsSync, unlinkSync, createWriteStream, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { WriteStream } from 'fs';

interface OutputDirs {
  outDir: string;
  rawDir: string | null;
  imageDir: string | null;
  mp4Dir: string;
}

export function setupOutputDirectories(debug: boolean): OutputDirs {
  const outDir = join(process.cwd(), 'output');
  const rawDir = debug ? join(outDir, 'raw') : null;
  const imageDir = debug ? join(outDir, 'images') : null;
  const mp4Dir = join(outDir, 'mp4');

  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }
  if (debug) {
    if (!existsSync(rawDir!)) mkdirSync(rawDir!);
    if (!existsSync(imageDir!)) mkdirSync(imageDir!);
  }
  if (!existsSync(mp4Dir)) {
    mkdirSync(mp4Dir);
  }

  return { outDir, rawDir, imageDir, mp4Dir };
}

export function cleanupTempFile(filePath: string) {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export function createFileStream(filePath: string): WriteStream {
  return createWriteStream(filePath);
}

export function readFile(filePath: string): Buffer {
  return readFileSync(filePath);
}

export function writeFile(filePath: string, data: Buffer | string) {
  writeFileSync(filePath, data);
} 