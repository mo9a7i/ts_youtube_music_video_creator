import type { IAnimation, IArcsOptions } from "../types";
import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";



export class Arcs implements IAnimation {
    private _options: Required<IArcsOptions>;

    constructor(options?: Partial<IArcsOptions>) {
        this._options = {
            count: 40,
            diameter: 0,
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

    public draw(audioBufferData: Uint8Array, canvas: CanvasRenderingContext2D): void {
        const { height, width } = canvas.canvas;
        const shapes = new Shapes(canvas);
        const audioData = new AudioData(audioBufferData);
        const centerY = height / 2;
        const centerX = width / 2;

        if (this._options.frequencyBand) {
            audioData.setFrequencyBand(this._options.frequencyBand);
        }

        audioData.scaleData(Math.min(width, height));

        // Draw left side arcs
        for (let i = 0; i <= this._options.count / 2; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const centerPoint = ((width - this._options.diameter) / this._options.count) * i;
            const startAngle = 180 - (45 / ((255 / dataValue) / 2));
            const endAngle = 180 + (45 / ((255 / dataValue) / 2));
            const diameter2 = dataValue * 2;

            shapes.arc(
                centerPoint + (diameter2 / 2), 
                centerY, 
                diameter2, 
                startAngle, 
                endAngle, 
                this._options
            );
        }

        // Draw center circle
        const centerDataIndex = Math.floor(audioData.data.length / 2);
        const centerDataValue = audioData.data[centerDataIndex];
        shapes.circle(
            centerX, 
            centerY, 
            this._options.diameter * centerDataValue, 
            this._options
        );

        // Draw right side arcs
        for (let i = this._options.count / 2; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];

            const centerPoint = (((width - this._options.diameter) / this._options.count) * i) + this._options.diameter;
            const startAngle = 180 - (45 / ((255 / dataValue) / 2));
            const endAngle = 180 + (45 / ((255 / dataValue) / 2));
            const diameter2 = dataValue * 2;

            shapes.arc(
                centerPoint - (diameter2 / 2), 
                centerY, 
                diameter2, 
                startAngle + 180, 
                endAngle + 180, 
                this._options
            );
        }
    }
} 