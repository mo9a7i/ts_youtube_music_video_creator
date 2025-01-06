import { IAnimation, IPolygonOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";

export interface IFlowerOptions extends IPolygonOptions {
    count: number;
    diameter: number;
    frequencyBand?: "base" | "lows" | "mids" | "highs";
    rotate: number;
}

export class Flower implements IAnimation {
    private _options: Required<IFlowerOptions>;

    constructor(options?: Partial<IFlowerOptions>) {
        this._options = {
            count: 20,
            diameter: 0,
            rotate: 0,
            frequencyBand: "mids",
            lineColor: "white",
            lineWidth: 1,
            fillColor: "rgba(0,0,0,0)",
            rounded: false,
            glow: { strength: 0, color: "transparent" }
        };

        if (options) {
            this._options = { ...this._options, ...options };
        }
    }

    public draw(audioBufferData: Uint8Array, canvasElement: CanvasRenderingContext2D): void {
        const { height, width } = canvasElement.canvas;
        const shapes = new Shapes(canvasElement);
        const audioData = new AudioData(audioBufferData);
        const centerX = width / 2;
        const centerY = height / 2;

        if (this._options.diameter === 0) {
            this._options.diameter = height / 3;
        }

        if (this._options.frequencyBand) {
            audioData.setFrequencyBand(this._options.frequencyBand);
        }

        audioData.scaleData(Math.min(width, height));
        const degrees = 360 / this._options.count;

        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const radians1 = shapes.toRadians((degrees * i) + this._options.rotate);
            const radians2 = shapes.toRadians((degrees * (i + 1)) + this._options.rotate);

            const point1X = (this._options.diameter / 2) * Math.cos(radians1) + centerX;
            const point1Y = (this._options.diameter / 2) * Math.sin(radians1) + centerY;
            const point2X = (this._options.diameter / 2) * Math.cos(radians2) + centerX;
            const point2Y = (this._options.diameter / 2) * Math.sin(radians2) + centerY;

            const diameter2 = this._options.diameter + dataValue;
            const point3X = (diameter2 / 2) * Math.cos(radians1) + centerX;
            const point3Y = (diameter2 / 2) * Math.sin(radians1) + centerY;
            const point4X = (diameter2 / 2) * Math.cos(radians2) + centerX;
            const point4Y = (diameter2 / 2) * Math.sin(radians2) + centerY;

            shapes.polygon([
                { x: point1X, y: point1Y },
                { x: point3X, y: point3Y },
                { x: point4X, y: point4Y },
                { x: point2X, y: point2Y }
            ], this._options);
        }
    }
} 