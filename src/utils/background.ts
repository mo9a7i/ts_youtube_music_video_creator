import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import { join } from 'path';

const BACKGROUND_URL = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=70&w=3429&auto=format&fit=crop";

export async function createBackgroundBuffer(width: number, height: number, opacity: number = 0.5) {
  const bgCanvas = createCanvas(width, height);
  const bgCtx = bgCanvas.getContext('2d');
  
  try {
    const image = await loadImage(BACKGROUND_URL).catch(async () => {
      return await loadImage(join(process.cwd(), 'assets', 'background.jpg'));
    });
    
    // Scale image to cover canvas
    const scale = Math.max(width / image.width, height / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    
    // Center the image
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;
    
    // Draw image and overlay once
    bgCtx.drawImage(image, x, y, scaledWidth, scaledHeight);
    bgCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    bgCtx.fillRect(0, 0, width, height);
  } catch (error) {
    console.warn('Background image not found, using solid black background');
    bgCtx.fillStyle = 'black';
    bgCtx.fillRect(0, 0, width, height);
  }
  
  return bgCanvas;
} 