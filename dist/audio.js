import { frequency } from "./music.js";
let context,
  generation = 0,
  active = [];
export async function audioContext() {
  const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Audio)
    throw new Error("Le son n’est pas disponible dans ce navigateur.");
  context ??= new Audio();
  if (context.state === "suspended") await context.resume();
  return context;
}
function voice(ctx, midi, start, duration = 0.65) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.18, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  [1, 2, 3].forEach((harmonic, i) => {
    const osc = ctx.createOscillator(),
      mix = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency(midi) * harmonic;
    mix.gain.value = [1, 0.3, 0.1][i];
    osc.connect(mix);
    mix.connect(gain);
    osc.start(start);
    osc.stop(start + duration + 0.03);
    active.push(osc);
    osc.onended = () => {
      active = active.filter((item) => item !== osc);
      osc.disconnect();
      mix.disconnect();
    };
  });
  setTimeout(
    () => gain.disconnect(),
    Math.max(0, (start - ctx.currentTime + duration + 0.1) * 1000),
  );
}
export function stopAudio() {
  generation++;
  active.forEach((o) => {
    try {
      o.stop();
    } catch {}
  });
  active = [];
}
export async function playNote(midi) {
  const ctx = await audioContext();
  voice(ctx, midi, ctx.currentTime + 0.02);
}
export async function playSequence(notes, bpm = 80, onNote = () => {}) {
  stopAudio();
  const run = generation,
    ctx = await audioContext(),
    step = 60 / bpm;
  if (run !== generation) return;
  const now = ctx.currentTime + 0.06;
  notes.forEach((n, i) => {
    voice(
      ctx,
      typeof n === "number" ? n : n.midi,
      now + i * step,
      Math.min(step * 0.95, 1.2),
    );
    setTimeout(
      () => {
        if (run === generation) onNote(i);
      },
      (now - ctx.currentTime + i * step) * 1000,
    );
  });
  await new Promise((resolve) =>
    setTimeout(resolve, (notes.length * step + 0.1) * 1000),
  );
  if (run === generation) onNote(-1);
}
