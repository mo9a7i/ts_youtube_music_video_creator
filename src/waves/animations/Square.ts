import { IAnimation, ILineOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";

export interface ISquareOptions extends ILineOptions {
    count: number;
    diameter: number;
    frequencyBand?: "base" | "lows" | "mids" | "highs";
}

export class Square implements IAnimation {
    private _options: Required<ISquareOptions>;

    constructor(options?: Partial<ISquareOptions>) {
        this._options = {
            count: 40,
            diameter: 0,
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
        const sideLength = this._options.count / 4;

        this.drawTopSide(audioData, shapes, centerX, centerY, sideLength);
        this.drawRightSide(audioData, shapes, centerX, centerY, sideLength);
        this.drawBottomSide(audioData, shapes, centerX, centerY, sideLength);
        this.drawLeftSide(audioData, shapes, centerX, centerY, sideLength);
    }

    private drawTopSide(audioData: AudioData, shapes: Shapes, centerX: number, centerY: number, sideLength: number): void {
        for (let i = 0; i < sideLength; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const xIncrease = this._options.diameter / sideLength;
            const startX = (centerX - (this._options.diameter / 2)) + (xIncrease * i);
            const startY = centerY - (this._options.diameter / 2);

            shapes.line(startX, startY, startX, startY - dataValue, this._options);
        }
    }

    private drawRightSide(audioData: AudioData, shapes: Shapes, centerX: number, centerY: number, sideLength: number): void {
        for (let i = 0; i < sideLength; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * (i * 2);
            const dataValue = audioData.data[dataIndex];

            const yIncrease = this._options.diameter / sideLength;
            const startX = centerX + (this._options.diameter / 2);
            const startY = (centerY - (this._options.diameter / 2)) + (yIncrease * i);

            shapes.line(startX, startY, startX + dataValue, startY, this._options);
        }
    }

    private drawBottomSide(audioData: AudioData, shapes: Shapes, centerX: number, centerY: number, sideLength: number): void {
        for (let i = 0; i < sideLength; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * (i * 3);
            const dataValue = audioData.data[dataIndex];

            const xIncrease = this._options.diameter / sideLength;
            const startX = (centerX - (this._options.diameter / 2)) + (xIncrease * i);
            const startY = centerY + (this._options.diameter / 2);

            shapes.line(startX, startY, startX, startY + dataValue, this._options);
        }
    }

    private drawLeftSide(audioData: AudioData, shapes: Shapes, centerX: number, centerY: number, sideLength: number): void {
        for (let i = 0; i < sideLength; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * (i * 4);
            const dataValue = audioData.data[dataIndex];

            const yIncrease = this._options.diameter / sideLength;
            const startX = centerX - (this._options.diameter / 2);
            const startY = (centerY - (this._options.diameter / 2)) + (yIncrease * i);

            shapes.line(startX, startY, startX - dataValue, startY, this._options);
        }
    }
} 