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

export function measurePdfRenderPerformance() {
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
      return this.averageRenderTime > 1000 || this.lastRenderTime > 1500;
    }
  };
}
