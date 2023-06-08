class SoundMonitor {
  constructor() {
    this.audioContext = new AudioContext();
    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = 512;
    this.analyzer.smoothingTimeConstant = 0.1;
  }

  getMaxVolume = () => {
    const fftBins = new Float32Array(this.analyzer.frequencyBinCount);
    this.analyzer.getFloatFrequencyData(fftBins);
    return Math.max(...fftBins);
  };

  getLevel = ()  => {
    const frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.analyzer.getByteFrequencyData(frequencyData);
    const sum = frequencyData.reduce((p, c) => p + c, 0);

    return Math.sqrt(sum / frequencyData.length);
  };

  looper = (callback) => {
    this.interval = setInterval(() => {
      const currentVolume = this.getMaxVolume();
      const currentLevel = this.getLevel();

      callback({
        volume: currentVolume,
        level: currentLevel
      })
    }, 1000);
  };

  start = async (stream, callback) => {
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.sourceNode.connect(this.analyzer);

    this.looper(callback);
  };

  stop = () => {
    this.sourceNode.disconnect();
    clearInterval(this.interval);
  }
}

const instance = new SoundMonitor();
//Object.freeze(instance);

export default instance;
