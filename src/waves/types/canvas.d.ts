import { CanvasRenderingContext2D as NodeCanvasContext } from 'canvas';

declare global {
  interface CanvasRenderingContext2D extends NodeCanvasContext {
    getContextAttributes(): any;
    isPointInStroke(x: number, y: number): boolean;
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    filter: string;
  }
} 