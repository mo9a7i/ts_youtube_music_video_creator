import { CanvasRenderingContext2D as NodeCanvasContext, Image, createCanvas } from 'canvas';
import { IPolygonOptions, IRectangleOptions, IArcOptions, ICircleOptions, ILineOptions, ColorValue } from "../types";

export class Shapes {
    private _canvasContext: NodeCanvasContext;

    constructor(canvasContext: NodeCanvasContext) {
        this._canvasContext = canvasContext;
    }

    public toRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    public toDegrees(radians: number): number {
        return (radians * 180) / Math.PI;
    }

    private _rotatePoint(originX: number, originY: number, pointX: number, pointY: number, degrees: number) {
        let angle = this.toRadians(degrees)
        let x = Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX;
        let y = Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY;
        return { x, y };
    }

    private _makeGradient(colors: string[], rotate?: number): CanvasGradient {
        // Create diagonal gradient from top-left to bottom-right
        const gradient = this._canvasContext.createLinearGradient(
            0, 0,
            this._canvasContext.canvas.width, this._canvasContext.canvas.height
        );

        if (rotate) {
            this._canvasContext.save();
            this._canvasContext.translate(
                this._canvasContext.canvas.width / 2,
                this._canvasContext.canvas.height / 2
            );
            this._canvasContext.rotate((rotate * Math.PI) / 180);
            this._canvasContext.translate(
                -this._canvasContext.canvas.width / 2,
                -this._canvasContext.canvas.height / 2
            );
        }

        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });

        if (rotate) {
            this._canvasContext.restore();
        }

        return gradient;
    }

    private async _makeImage(srcUrl: string): Promise<CanvasPattern | null> {
        try {
            const img = new Image();
            img.src = srcUrl;
            const pattern = this._canvasContext.createPattern(img, "repeat");
            return pattern;
        } catch (error) {
            console.error('Error creating pattern:', error);
            return null;
        }
    }

    private async _implementOptions(options: any, closePath = true) {
        if (typeof options?.lineColor === "string") {
            this._canvasContext.strokeStyle = options.lineColor;
        } else if (options?.lineColor?.gradient) {
            this._canvasContext.strokeStyle = this._makeGradient(options.lineColor.gradient, options.lineColor.rotate);
        } else if (options?.lineColor?.image) {
            const pattern = await this._makeImage(options.lineColor.image);
            if (pattern) this._canvasContext.strokeStyle = pattern;
        } else {
            this._canvasContext.strokeStyle = "#000";
        }

        if (typeof options?.fillColor === "string") {
            this._canvasContext.fillStyle = options.fillColor;
        } else if (options?.fillColor?.gradient) {
            this._canvasContext.fillStyle = this._makeGradient(options.fillColor.gradient, options.fillColor.rotate);
        } else if (options?.fillColor?.image) {
            const pattern = await this._makeImage(options.fillColor.image);
            if (pattern) this._canvasContext.fillStyle = pattern;
        } else {
            this._canvasContext.fillStyle = "#000";
        }

        this._canvasContext.lineCap = (options?.rounded ? "round" : "butt") ?? "butt";
        this._canvasContext.lineWidth = options?.lineWidth ?? 1.0;
        this._canvasContext.shadowColor = options?.glow?.color ?? "rgba(0,0,0,0)";
        this._canvasContext.shadowBlur = options?.glow?.strength ?? 0;
        this._canvasContext.shadowOffsetX = 0;
        this._canvasContext.shadowOffsetY = 0;

        if (closePath) this._canvasContext.closePath();
        this._canvasContext.stroke();
        if (closePath) this._canvasContext.fill();
    }

    public async arc(x: number, y: number, diameter: number, startAngleInDegrees: number, endAngleInDegrees: number, options?: IArcOptions) {
        this._canvasContext.beginPath();
        this._canvasContext.arc(x, y, diameter / 2, this.toRadians(startAngleInDegrees), this.toRadians(endAngleInDegrees));
        await this._implementOptions(options, false);
        return this;
    }

    public async circle(x: number, y: number, diameter: number, options?: ICircleOptions) {
        this._canvasContext.beginPath();
        this._canvasContext.arc(x, y, diameter / 2, 0, 2 * Math.PI);
        await this._implementOptions(options);
        return this;
    }

    public async line(fromX: number, fromY: number, toX: number, toY: number, options?: ILineOptions) {
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(fromX, fromY);
        this._canvasContext.lineTo(toX, toY);
        await this._implementOptions(options);
        return this;
    }

    public async polygon(points: { x: number, y: number }[], options?: IPolygonOptions) {
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            let nextPoint = points[i + 1] ?? point;
            let xc = (point.x + nextPoint.x) / 2;
            let yc = (point.y + nextPoint.y) / 2;

            if (options?.rounded)
                this._canvasContext.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            else
                this._canvasContext.lineTo(points[i].x, points[i].y);
        }

        await this._implementOptions(options);
        return this;
    }

    public async rectangle(x: number, y: number, width: number, height: number, options?: IRectangleOptions) {
        let radius = options?.radius ?? 0;
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(x + radius, y);
        this._canvasContext.arcTo(x + width, y, x + width, y + height, radius);
        this._canvasContext.arcTo(x + width, y + height, x, y + height, radius);
        this._canvasContext.arcTo(x, y + height, x, y, radius);
        this._canvasContext.arcTo(x, y, x + width, y, radius);
        await this._implementOptions(options);
        return this;
    }
} 