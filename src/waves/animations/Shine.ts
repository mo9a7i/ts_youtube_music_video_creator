import { IAnimation, ILineOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";

export interface IShineOptions extends ILineOptions {
    count: number;
    diameter: number;
    frequencyBand?: "base" | "lows" | "mids" | "highs";
    rotate: number;
    offset?: boolean;
}

export class Shine implements IAnimation {
    private _options: Required<IShineOptions>;

    constructor(options?: Partial<IShineOptions>) {
        this._options = {
            count: 30,
            diameter: 0,
            rotate: 0,
            offset: false,
            frequencyBand: "mids",
            lineColor: "white",
            lineWidth: 1,
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

            const radians = shapes.toRadians((degrees * i) + this._options.rotate);
            const diameter = this._options.offset ? this._options.diameter - (dataValue / 2) : this._options.diameter;
            const diameter2 = this._options.diameter + dataValue;

            const point1X = (diameter / 2) * Math.cos(radians) + centerX;
            const point1Y = (diameter / 2) * Math.sin(radians) + centerY;
            const point2X = (diameter2 / 2) * Math.cos(radians) + centerX;
            const point2Y = (diameter2 / 2) * Math.sin(radians) + centerY;

            shapes.line(point1X, point1Y, point2X, point2Y, this._options);
        }
    }
} 