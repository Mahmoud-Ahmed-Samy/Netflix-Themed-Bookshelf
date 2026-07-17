// Claude - calming background music for the bookshelf.
//
// There's no audio-file host reachable from this build, so instead of an
// mp3 this is a small generative ambient pad: soft, slow, layered tones that
// drift between chords, meant to sit quietly under the UI without being
// noticed. It never assumes it can start on its own (autoplay is blocked by
// every browser without a user gesture anyway) - App.jsx wires this to a
// mute/unmute button.

let ctx = null;
let masterGain = null;
let chordTimer = null;
let activeVoices = [];
let playing = false;

// A slow, warm, unresolved loop (Cmaj7 - Am7 - Fmaj7 - Gsus) - avoids ever
// landing hard on the root, which is what keeps a pad feeling restful
// instead of like it's "going" anywhere. Frequencies in Hz, low register.
const CHORDS = [
  [130.81, 164.81, 196.0, 246.94], // Cmaj7  (C3 E3 G3 B3)
  [110.0, 130.81, 164.81, 196.0], // Am7    (A2 C3 E3 G3)
  [87.31, 110.0, 130.81, 164.81], // Fmaj7  (F2 A2 C3 E3)
  [98.0, 130.81, 146.83, 196.0], // Gsus   (G2 C3 D3 G3)
];

const CHORD_SECONDS = 9;
const VOICE_SECONDS = CHORD_SECONDS + 2.5; // small overlap for a crossfade, not a hard cut

function playChordVoices(freqs) {
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime((i - (freqs.length - 1) / 2) * 3, now); // tiny spread, avoids a sterile unison

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(0.3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16 / freqs.length, now + 3.2); // slow swell in
    gain.gain.linearRampToValueAtTime(0, now + VOICE_SECONDS); // slow fade out

    osc.connect(filter);
    filter.connect(gain);

    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.setValueAtTime(((i / (freqs.length - 1 || 1)) - 0.5) * 0.5, now);
      gain.connect(pan);
      pan.connect(masterGain);
    } else {
      gain.connect(masterGain);
    }

    osc.start(now);
    osc.stop(now + VOICE_SECONDS + 0.5);

    activeVoices.push(osc);
    osc.onended = () => {
      activeVoices = activeVoices.filter((v) => v !== osc);
    };
  });
}

export const music = {
  get playing() {
    return playing;
  },

  // Returns the new playing state, so the caller can sync a button's label
  // without keeping its own separate copy of this module's internal state.
  toggle() {
    if (playing) {
      this.stop();
    } else {
      this.start();
    }
    return playing;
  },

  start() {
    if (playing) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5); // per-voice gains already keep this quiet

    playing = true;
    let chordIndex = 0;
    const playNext = () => {
      playChordVoices(CHORDS[chordIndex % CHORDS.length]);
      chordIndex++;
    };
    playNext();
    chordTimer = setInterval(playNext, CHORD_SECONDS * 1000);
  },

  stop() {
    if (!playing) return;
    playing = false;
    if (chordTimer) clearInterval(chordTimer);
    chordTimer = null;

    if (masterGain && ctx) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    }
    // Let already-scheduled voices ring out and fade naturally via the
    // master fade above, rather than cutting them off abruptly.
  },
};
