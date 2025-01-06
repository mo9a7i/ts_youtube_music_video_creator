import { IAnimation, ILineOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";

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

export class Lines implements IAnimation {
    private _options: Required<ILinesOptions>;

    constructor(options?: Partial<ILinesOptions>) {
        this._options = {
            count: 64,
            frequencyBand: "mids",
            top: false,
            right: false,
            bottom: true,
            left: false,
            center: false,
            mirroredX: false,
            mirroredY: false,
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

        if (this._options.frequencyBand) {
            audioData.setFrequencyBand(this._options.frequencyBand);
        }

        audioData.scaleData(Math.min(width, height));

        if (this._options.mirroredX) {
            const midPoint = Math.ceil(audioData.data.length / 2);
            for (let i = 0; i < midPoint; i++) {
                audioData.data[audioData.data.length - 1 - i] = audioData.data[i];
            }
        }

        if (this._options.top) {
            this.drawTopLines(audioData, shapes, width);
        }

        if (this._options.right) {
            this.drawRightLines(audioData, shapes, width, height);
        }

        if (this._options.bottom || (!this._options.top && !this._options.right && !this._options.left && !this._options.center)) {
            this.drawBottomLines(audioData, shapes, width, height);
        }

        if (this._options.left) {
            this.drawLeftLines(audioData, shapes, height);
        }

        if (this._options.center) {
            this.drawCenterLines(audioData, shapes, width, height);
        }
    }

    private drawTopLines(audioData: AudioData, shapes: Shapes, width: number): void {
        for (let i = 1; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const fromX = (width / this._options.count) * i;
            const fromY = 0;
            const toX = fromX;
            const toY = dataValue;

            shapes.line(fromX, fromY, toX, toY, this._options);
        }
    }

    private drawRightLines(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        for (let i = 1; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const fromX = width;
            const fromY = (height / this._options.count) * i;
            const toX = width - dataValue;
            const toY = fromY;

            shapes.line(fromX, fromY, toX, toY, this._options);
        }
    }

    private drawBottomLines(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        for (let i = 1; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const fromX = (width / this._options.count) * i;
            const fromY = height;
            const toX = fromX;
            const toY = fromY - dataValue;

            shapes.line(fromX, fromY, toX, toY, this._options);
        }
    }

    private drawLeftLines(audioData: AudioData, shapes: Shapes, height: number): void {
        for (let i = 1; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const fromX = 0;
            const fromY = (height / this._options.count) * i;
            const toX = dataValue;
            const toY = fromY;

            shapes.line(fromX, fromY, toX, toY, this._options);
        }
    }

    private drawCenterLines(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        const centerY = height / 2;

        for (let i = 1; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const fromX = (width / this._options.count) * i;
            const fromY = centerY;
            const toX = fromX;
            const toY = fromY - dataValue;

            shapes.line(fromX, fromY, toX, toY, this._options);

            if (this._options.mirroredY) {
                shapes.line(fromX, fromY, toX, fromY + dataValue, this._options);
            }
        }
    }
} 