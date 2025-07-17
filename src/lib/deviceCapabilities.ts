export function supportsGPUAcceleration() {
  try {
    const canvas = document.createElement('canvas');
    const gl = (
      canvas.getContext('webgl2') || 
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
    return !!gl;
  } catch {
    return false;
  }
}

interface PerformanceMetrics {
  lastRenderTime: number;
  averageRenderTime: number;
  samples: number[];
  recordSample: (time: number) => PerformanceMetrics;
  shouldFallbackToCpu: () => boolean;
}

const MAX_AVERAGE_RENDER_TIME = 1000;
const MAX_SINGLE_RENDER_TIME = 1500;

export function measurePdfRenderPerformance(): PerformanceMetrics {
  return {
    lastRenderTime: 0,
    averageRenderTime: 0,
    samples: [] as number[],
    recordSample(time: number) {
      this.samples.push(time);
      this.lastRenderTime = time;
      this.averageRenderTime = 
        this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
      return this;
    },
    shouldFallbackToCpu() {
      return this.averageRenderTime > MAX_AVERAGE_RENDER_TIME || 
             this.lastRenderTime > MAX_SINGLE_RENDER_TIME;
    }
  };
}
