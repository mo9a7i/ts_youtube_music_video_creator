export class ProgressBar {
  private lastUpdate: number = 0;
  private readonly updateInterval: number = 100;
  private stepStartTime: number = Date.now();

  constructor(private total: number, private stepName: string) {
    this.stepStartTime = Date.now();
  }

  update(current: number) {
    const now = Date.now();
    if (now - this.lastUpdate > this.updateInterval || current === this.total - 1) {
      const percent = Math.round((current / this.total) * 100);
      const bar = this.getProgressBar(percent);
      process.stdout.write(`\r${this.stepName} ${bar} ${percent}% (${current + 1}/${this.total})`);
      this.lastUpdate = now;
    }
  }

  complete() {
    const duration = ((Date.now() - this.stepStartTime) / 1000).toFixed(2);
    process.stdout.write(`\n${this.stepName} completed in ${duration}s\n`);
  }

  private getProgressBar(percent: number): string {
    const width = 30;
    const completed = Math.round(width * (percent / 100));
    const remaining = width - completed;
    return `[${'='.repeat(completed)}${remaining > 0 ? '>' : ''}${' '.repeat(Math.max(0, remaining - 1))}]`;
  }
} 