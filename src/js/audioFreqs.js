import average from 'analyser-frequency-average';

// music
const layer = new Audio();
layer.src = 'src/static/song.ogg';

const ctx = new AudioContext();
const source = ctx.createMediaElementSource(layer);
const analyser = ctx.createAnalyser();
source.connect(analyser);
analyser.connect(ctx.destination);
layer.play();
layer.loop = true;

const freq = new Uint8Array(analyser.frequencyBinCount);
requestAnimationFrame(update);

var bands = {
  sub: {
    from: 32,
    to: 512
  },

  low: {
    from: 513,
    to: 2048
  },

  mid: {
    from: 2049,
    to: 8192
  },

  high: {
    from: 8193,
    to: 12384
  }
};

function update() {
  requestAnimationFrame(update);
  analyser.getByteFrequencyData(freq);
}

export { analyser, freq, bands };
