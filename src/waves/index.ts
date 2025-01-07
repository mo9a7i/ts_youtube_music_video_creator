import { Arcs } from "./animations/Arcs";
import { Circles } from "./animations/Circles";
import { Cubes } from "./animations/Cubes";
import { Flower } from "./animations/Flower";
import { Glob } from "./animations/Glob";
import { Lines } from "./animations/Lines";
import { Shine } from "./animations/Shine";
import { Square } from "./animations/Square";
import { Turntable } from "./animations/Turntable";
import { AnalyserNode, AudioContext } from 'node-web-audio-api';
import { CanvasRenderingContext2D } from 'canvas';
import { Wave as WaveAnimation } from "./animations/Wave";
import { AudioElement, IAnimation, IArcsOptions, ICirclesOptions, ICubesOptions, IFlowerOptions, IGlobOptions, ILinesOptions, IShineOptions, ISquareOptions, ITurntableOptions, IWaveOptions } from "./types";



export {
    IArcsOptions,
    ICirclesOptions,
    ICubesOptions,
    IFlowerOptions,
    IGlobOptions,
    ILinesOptions,
    IShineOptions,
    ISquareOptions,
    ITurntableOptions,
    IWaveOptions,
};



export class Wave {
    public animations = {
        Arcs: Arcs,
        Circles: Circles,
        Cubes: Cubes,
        Flower: Flower,
        Glob: Glob,
        Lines: Lines,
        Shine: Shine,
        Square: Square,
        Turntable: Turntable,
        Wave: WaveAnimation,
    };
    private _activeAnimations: IAnimation[] = [];
    private _canvasElement: any;
    private _canvasContext: CanvasRenderingContext2D;
    private _audioContext!: AudioContext | null;
    private _audioSource: any | null;
    private _audioAnalyser!: AnalyserNode;
    private _muteAudio: boolean;
    private _isPlaying: boolean = false;
    private _defaultColors = {
        lineColor: "white",
        fillColor: "white"
    };

    constructor(audioElement: AudioElement, canvasElement: any, muteAudio: boolean = false) {
        this._canvasElement = canvasElement;
        this._canvasContext = this._canvasElement.getContext("2d");
        this._muteAudio = muteAudio;

        if (audioElement instanceof AnalyserNode) {
            this._audioAnalyser = audioElement;
            this._audioContext = null;
            this._audioSource = null;
            this._play();
        }
    }

    private _play(): void {
        if (this._audioSource) {
            this._audioSource.connect(this._audioAnalyser);
            if (!this._muteAudio) {
                this._audioSource.connect(this._audioContext!.destination);
            }
        }

        this._audioAnalyser.smoothingTimeConstant = 0.85;
        this._audioAnalyser.fftSize = 1024;
        this._isPlaying = true;

        let audioBufferData = new Uint8Array(this._audioAnalyser.frequencyBinCount);

        let tick = () => {
            if (!this._isPlaying) return;

            this._audioAnalyser.getByteFrequencyData(audioBufferData);

            this._activeAnimations.forEach((animation) => {
                animation.draw(audioBufferData, this._canvasContext);
            });
        };

        tick();
    }

    public addAnimation(animation: IAnimation): void {
        this._activeAnimations.push(animation);
    }

    public clearAnimations(): void {
        this._activeAnimations = [];
        this._isPlaying = false;
    }

    public draw(audioBufferData: Uint8Array, ctx: CanvasRenderingContext2D): void {
        this._activeAnimations.forEach((animation) => {
            animation.draw(audioBufferData, ctx);
        });
    }

    public setAnimation(name: keyof Wave['animations']) {
        this.clearAnimations();
        
        const options = {
            lineColor: this._defaultColors.lineColor,
            fillColor: name === "Circles" ? "rgba(0,0,0,0)" : this._defaultColors.fillColor
        };

        const AnimationClass = this.animations[name];
        const animation = new AnimationClass(options);
        this.addAnimation(animation);
    }

    public setDefaultColors(lineColor: string, fillColor: string) {
        this._defaultColors = { lineColor, fillColor };
    }
} 