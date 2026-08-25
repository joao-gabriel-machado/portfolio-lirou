// src/components/city/cityAudio.ts
// Ambiente sonoro procedural: hum grave urbano + "vento" de ruído filtrado.
// Sem arquivos de áudio. Singleton; seguro chamar start/stop repetidamente.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioNode[] = [];

function makeNoiseBuffer(c: AudioContext): AudioBuffer {
  const seconds = 2;
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function startCityAmbience(): void {
  if (ctx) { void ctx.resume(); return; }
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // Fade-in suave (2s) até volume discreto
  master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2);

  // 1) Hum grave da cidade: dois osciladores desafinados + lowpass
  const humGain = ctx.createGain();
  humGain.gain.value = 0.5;
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 120;
  [50, 62.3].forEach((freq) => {
    const osc = ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(humFilter);
    osc.start();
    nodes.push(osc);
  });
  humFilter.connect(humGain);
  humGain.connect(master);

  // 2) "Vento" urbano: ruído em loop por bandpass com LFO lento
  const noise = ctx.createBufferSource();
  noise.buffer = makeNoiseBuffer(ctx);
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 420;
  band.Q.value = 0.6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.12;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;              // variação bem lenta
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(band.frequency);
  lfo.start();
  noise.connect(band);
  band.connect(windGain);
  windGain.connect(master);
  noise.start();
  nodes.push(noise, lfo);

  // Pausa quando a aba fica oculta
  document.addEventListener('visibilitychange', onVisibility);
}

function onVisibility(): void {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend();
  else void ctx.resume();
}

export function stopCityAmbience(): void {
  if (!ctx || !master) return;
  const c = ctx;
  const stoppingNodes = nodes;
  master.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
  window.setTimeout(() => {
    stoppingNodes.forEach((n) => { try { (n as OscillatorNode).stop?.(); } catch { /* já parado */ } });
    void c.close();
  }, 700);
  document.removeEventListener('visibilitychange', onVisibility);
  ctx = null; master = null; nodes = [];
}
