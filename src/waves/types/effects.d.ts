import { CanvasRenderingContext2D } from 'canvas';

export type FillOption = string | { gradient: string[], rotate?: number } | { image: string };

export type Glow = { 
  strength: number; 
  color: string; 
};
export interface IGlobOptions extends IPolygonOptions {
  count: number;
  diameter: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  mirroredX?: boolean;
}
export interface IFlowerOptions extends IPolygonOptions {
  count: number;
  diameter: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  rotate: number;
}

export interface IShineOptions extends ILineOptions {
  count: number;
  diameter: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  rotate: number;
  offset?: boolean;
}

export interface ISquareOptions extends ILineOptions {
  count: number;
  diameter: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
}

export interface ITurntableOptions extends IPolygonOptions {
  count: number;
  cubeHeight: number;
  diameter: number;
  gap: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  rotate: number;
}

export interface IWaveOptions extends IPolygonOptions {
  count: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  center?: boolean;
  mirroredX?: boolean;
  mirroredY?: boolean;
}


export interface ICubesOptions extends IRectangleOptions {
  count: number;
  cubeHeight: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  gap: number;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  center?: boolean;
  mirroredX?: boolean;
  mirroredY?: boolean;
}

export interface IArcOptions {
  glow?: Glow;
  lineColor?: FillOption;
  lineWidth?: number;
  rounded?: boolean;
}
//////////////////////////

export interface IArcsOptions extends IArcOptions, ICircleOptions {
  count?: number;
  diameter?: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
}


/////////////////////////////////
export interface ICircleOptions {
  fillColor?: FillOption;
  glow?: Glow;
  lineColor?: FillOption;
  lineWidth?: number;
}

export interface ICirclesOptions extends ICircleOptions {
  count: number;
  diameter: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
}

export interface ILineOptions {
  glow?: Glow;
  lineColor?: FillOption;
  lineWidth?: number;
  fillColor?: FillOption;
  rounded?: boolean;
}

export interface ILinesOptions extends ILineOptions {
  count: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  center?: boolean;
  mirroredX?: boolean;
  mirroredY?: boolean;
}

interface IGradient {
  gradient: string[];
  rotate?: number;
}

export type ColorValue = string | { gradient: string[]; rotate?: number };

export interface IPolygonOptions {
  lineColor?: ColorValue;
  fillColor?: ColorValue;
  lineWidth?: number;
  glow?: {
    strength: number;
    color: string;
  };
  rounded?: boolean;
}

export interface IRectangleOptions {
  glow?: Glow;
  fillColor?: FillOption;
  lineColor?: FillOption;
  lineWidth?: number;
  radius?: number;
}

export interface IAnimation {
  draw: (audioBufferData: Uint8Array, canvasElement: CanvasRenderingContext2D) => void;
}

export interface IWaveOptions extends IPolygonOptions {
  count?: number;
  mirroredX?: boolean;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
}

export interface ICirclesOptions extends IPolygonOptions {
  count?: number;
  diameter?: number;
  frequencyBand?: "base" | "lows" | "mids" | "highs";
} 