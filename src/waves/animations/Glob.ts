import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";
import { IGlobOptions, IAnimation } from "../types/effects";



export class Glob implements IAnimation {
    private _options: Required<IGlobOptions>;

    constructor(options?: Partial<IGlobOptions>) {
        this._options = {
            count: 100,
            diameter: 0,
            frequencyBand: "mids",
            mirroredX: false,
            lineColor: "white",
            lineWidth: 1,
            fillColor: "rgba(0,0,0,0)",
            rounded: true,
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

        if (this._options.mirroredX) {
            const midPoint = Math.ceil(audioData.data.length / 2);
            for (let i = 0; i < midPoint; i++) {
                audioData.data[audioData.data.length - 1 - i] = audioData.data[i];
            }
        }

        const points = [];
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const degrees = 360 / this._options.count;
            const newDiameter = this._options.diameter + dataValue;

            const x = centerX + (newDiameter / 2) * Math.cos(shapes.toRadians(degrees * i));
            const y = centerY + (newDiameter / 2) * Math.sin(shapes.toRadians(degrees * i));
            points.push({ x, y });
        }

        points.push(points[0]); // Close the shape
        shapes.polygon(points, this._options);
    }
} 