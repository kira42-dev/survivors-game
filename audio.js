const Audio = {
  ctx: null,
  masterGain: null,
  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {}
  },

  _ensure() {
    if (!this.ctx) this._init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  _osc(type, freq, duration, vol) {
    this._ensure();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  _noise(duration, vol) {
    this._ensure();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = vol || 0.15;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  },

  play(name) {
    switch (name) {
      case 'attack':
        this._osc('square', 440, 0.08, 0.2);
        this._osc('square', 520, 0.06, 0.1);
        break;
      case 'hit':
        this._osc('triangle', 120, 0.1, 0.25);
        this._noise(0.05, 0.1);
        break;
      case 'levelUp':
        this._osc('square', 523, 0.1, 0.15);
        setTimeout(() => this._osc('square', 659, 0.1, 0.15), 80);
        setTimeout(() => this._osc('square', 784, 0.15, 0.2), 160);
        break;
      case 'coin':
        this._osc('square', 880, 0.05, 0.12);
        setTimeout(() => this._osc('square', 1100, 0.08, 0.1), 40);
        break;
      case 'xp':
        this._osc('sine', 660, 0.08, 0.1);
        break;
      case 'gameOver':
        this._osc('square', 440, 0.15, 0.2);
        setTimeout(() => this._osc('square', 330, 0.15, 0.2), 150);
        setTimeout(() => this._osc('square', 220, 0.3, 0.2), 300);
        break;
      case 'click':
        this._osc('square', 600, 0.03, 0.1);
        break;
      case 'explosion':
        this._noise(0.2, 0.2);
        this._osc('sine', 60, 0.2, 0.3);
        break;
      case 'boss':
        this._osc('sawtooth', 80, 0.3, 0.15);
        setTimeout(() => this._osc('sawtooth', 90, 0.3, 0.12), 100);
        break;
    }
  },
};
