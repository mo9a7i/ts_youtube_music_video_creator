import express from 'express';
import { Server } from 'http';
import type { RequestHandler } from 'express';

export class StreamServer {
  private app = express();
  private server: Server | null = null;
  private port = 3000;
  private stream: NodeJS.ReadableStream | null = null;

  constructor() {
    this.app.get('/stream', ((_req, res) => {
      if (!this.stream) {
        return res.status(404).send('No active stream');
      }

      res.setHeader('Content-Type', 'video/mp2t');
      res.setHeader('Cache-Control', 'no-cache');
      this.stream.pipe(res);
    }) as RequestHandler);
  }

  start(): string {
    this.server = this.app.listen(this.port);
    const url = `http://localhost:${this.port}/stream`;
    console.log(`\nStream available at: ${url}`);
    return url;
  }

  setStream(stream: NodeJS.ReadableStream) {
    this.stream = stream;
  }

  stop() {
    this.server?.close();
  }
} 