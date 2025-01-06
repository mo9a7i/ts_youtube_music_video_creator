import { IAnimation, ICircleOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";

export interface ICirclesOptions extends ICircleOptions {
    count: number;
    diameter: number;
    frequencyBand?: "base" | "lows" | "mids" | "highs";
}

export class Circles implements IAnimation {
    private _options: Required<ICirclesOptions>;

    constructor(options?: Partial<ICirclesOptions>) {
        this._options = {
            count: 40,
            diameter: 0,
            fillColor: "rgba(0,0,0,0)",
            frequencyBand: "mids",
            lineColor: "white",
            lineWidth: 1,
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

        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            shapes.circle(centerX, centerY, this._options.diameter + dataValue, this._options);
        }
    }
} 