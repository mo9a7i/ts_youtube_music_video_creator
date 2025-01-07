import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";
import { IWaveOptions, IAnimation } from "../types/effects";

export class Wave implements IAnimation {
    private _options: Required<IWaveOptions>;

    constructor(options?: Partial<IWaveOptions>) {
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
            this.drawTopWave(audioData, shapes, width);
        }

        if (this._options.right) {
            this.drawRightWave(audioData, shapes, width, height);
        }

        if (this._options.bottom || (!this._options.top && !this._options.right && !this._options.left && !this._options.center)) {
            this.drawBottomWave(audioData, shapes, width, height);
        }

        if (this._options.left) {
            this.drawLeftWave(audioData, shapes, height);
        }

        if (this._options.center) {
            this.drawCenterWave(audioData, shapes, width, height);
        }
    }

    private drawTopWave(audioData: AudioData, shapes: Shapes, width: number): void {
        const points = [{ x: 0, y: 0 }];
        for (let i = 0; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            points.push({
                x: Math.floor(width / this._options.count) * i,
                y: dataValue
            });
        }
        points.push({ x: width, y: 0 });
        shapes.polygon(points, this._options);
    }

    private drawRightWave(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        const points = [{ x: width, y: 0 }];
        for (let i = 0; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            points.push({
                x: width - dataValue,
                y: Math.floor(height / this._options.count) * i
            });
        }
        points.push({ x: width, y: height });
        shapes.polygon(points, this._options);
    }

    private drawBottomWave(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        const points = [{ x: 0, y: height }];
        for (let i = 0; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            points.push({
                x: Math.floor(width / this._options.count) * i,
                y: height - dataValue
            });
        }
        points.push({ x: width, y: height });
        shapes.polygon(points, this._options);
    }

    private drawLeftWave(audioData: AudioData, shapes: Shapes, height: number): void {
        const points = [{ x: 0, y: 0 }];
        for (let i = 0; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            points.push({
                x: dataValue,
                y: Math.floor(height / this._options.count) * i
            });
        }
        points.push({ x: 0, y: height });
        shapes.polygon(points, this._options);
    }

    private drawCenterWave(audioData: AudioData, shapes: Shapes, width: number, height: number): void {
        const centerY = height / 2;
        const points = [{ x: 0, y: centerY }];

        for (let i = 0; i <= this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            points.push({
                x: Math.floor(width / this._options.count) * i,
                y: centerY - dataValue
            });
        }
        points.push({ x: width, y: centerY });
        shapes.polygon(points, this._options);

        if (this._options.mirroredY) {
            const mirrorPoints = [{ x: 0, y: centerY }];
            for (let i = 0; i <= this._options.count; i++) {
                const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
                const dataValue = audioData.data[dataIndex];
                mirrorPoints.push({
                    x: Math.floor(width / this._options.count) * i,
                    y: centerY + dataValue
                });
            }
            mirrorPoints.push({ x: width, y: centerY });
            shapes.polygon(mirrorPoints, this._options);
        }
    }
} 