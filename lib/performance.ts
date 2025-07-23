export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
    };
  }

  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<
    string,
    { count: number; average: number; max: number }
  > {
    const result: Record<
      string,
      { count: number; average: number; max: number }
    > = {};

    Array.from(this.metrics.entries()).forEach(([operation, times]) => {
      result[operation] = {
        count: times.length,
        average: this.getAverageTime(operation),
        max: Math.max(...times),
      };
    });

    return result;
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Database query performance wrapper
export const withPerformanceTracking = async <T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const stopTimer = performanceMonitor.startTimer(operation);
  try {
    const result = await fn();
    return result;
  } finally {
    stopTimer();
  }
};
