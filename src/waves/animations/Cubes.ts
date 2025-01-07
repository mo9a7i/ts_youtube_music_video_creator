import { Shapes } from "../util/Shapes";
import { AudioData } from "../util/AudioData";
import { CanvasRenderingContext2D } from "canvas";
import { ICubesOptions, IAnimation } from "../types/effects";


export class Cubes implements IAnimation {
    private _options: Required<ICubesOptions>;

    constructor(options?: Partial<ICubesOptions>) {
        this._options = {
            count: 20,
            cubeHeight: 0,
            frequencyBand: "mids",
            gap: 5,
            radius: 0,
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

        const cubeWidth = Math.floor((width - (this._options.gap * this._options.count)) / this._options.count);
        if (!this._options.cubeHeight) {
            this._options.cubeHeight = cubeWidth;
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

        if (this._options.top) {
            this.drawTopCubes(audioData, shapes, width, cubeWidth);
        }

        if (this._options.right) {
            this.drawRightCubes(audioData, shapes, width, height, cubeWidth);
        }

        if (this._options.bottom || (!this._options.top && !this._options.right && !this._options.left && !this._options.center)) {
            this.drawBottomCubes(audioData, shapes, width, height, cubeWidth);
        }

        if (this._options.left) {
            this.drawLeftCubes(audioData, shapes, height, cubeWidth);
        }

        if (this._options.center) {
            this.drawCenterCubes(audioData, shapes, width, height, cubeWidth);
        }
    }

    private drawTopCubes(audioData: AudioData, shapes: Shapes, width: number, cubeWidth: number): void {
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const x = (this._options.gap + cubeWidth) * i;
            const cubeCount = Math.ceil(dataValue / cubeWidth);

            for (let j = 0; j < cubeCount; j++) {
                const y = j * (this._options.cubeHeight + this._options.gap);
                shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
            }
        }
    }

    private drawRightCubes(audioData: AudioData, shapes: Shapes, width: number, height: number, cubeWidth: number): void {
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const y = i * (this._options.cubeHeight + this._options.gap);
            const cubeCount = Math.ceil(dataValue / cubeWidth);

            for (let j = 0; j < cubeCount; j++) {
                const x = width - ((this._options.gap + cubeWidth) * j);
                shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
            }
        }
    }

    private drawBottomCubes(audioData: AudioData, shapes: Shapes, width: number, height: number, cubeWidth: number): void {
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const x = (this._options.gap + cubeWidth) * i;
            const cubeCount = Math.ceil(dataValue / cubeWidth);

            for (let j = 0; j < cubeCount; j++) {
                const y = height - (j * (this._options.cubeHeight + this._options.gap));
                shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
            }
        }
    }

    private drawLeftCubes(audioData: AudioData, shapes: Shapes, height: number, cubeWidth: number): void {
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const y = i * (this._options.cubeHeight + this._options.gap);
            const cubeCount = Math.ceil(dataValue / cubeWidth);

            for (let j = 0; j < cubeCount; j++) {
                const x = ((this._options.gap + cubeWidth) * j);
                shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
            }
        }
    }

    private drawCenterCubes(audioData: AudioData, shapes: Shapes, width: number, height: number, cubeWidth: number): void {
        for (let i = 0; i < this._options.count; i++) {
            const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
            const dataValue = audioData.data[dataIndex];
            const x = (this._options.gap + cubeWidth) * i;
            const cubeCount = Math.ceil(dataValue / cubeWidth);

            for (let j = 0; j < cubeCount; j++) {
                const y = (height / 2) - (j * (this._options.cubeHeight + this._options.gap));
                shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
            }
        }

        if (this._options.mirroredY) {
            for (let i = 0; i < this._options.count; i++) {
                const dataIndex = Math.floor(audioData.data.length / this._options.count) * i;
                const dataValue = audioData.data[dataIndex];
                const x = (this._options.gap + cubeWidth) * i;
                const cubeCount = Math.ceil(dataValue / cubeWidth);

                for (let j = 0; j < cubeCount; j++) {
                    const y = (height / 2) + (j * (this._options.cubeHeight + this._options.gap));
                    shapes.rectangle(x, y, cubeWidth, this._options.cubeHeight, this._options);
                }
            }
        }
    }
} 