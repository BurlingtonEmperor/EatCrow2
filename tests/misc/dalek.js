const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

async function speakDalek(text) {
  // 1. Setup the Ring Modulator (The Dalek Magic)
  const oscillator = audioCtx.createOscillator();
  const modulator = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.value = 30; // Iconic Dalek frequency
  modulator.gain.value = 0; // Start muted

  // Connect oscillator to the gain's amplitude
  oscillator.connect(modulator.gain);
  oscillator.start();

  // 2. Setup the Speech Synthesis
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Daleks are staccato and monotonous
  utterance.pitch = 0.8; 
  utterance.rate = 1.1; 
  
  // Note: Modern browsers require a MediaStream destination to pipe TTS 
  // into Web Audio. Alternatively, use a robotic voice like 'Google UK English Male'.
  window.speechSynthesis.speak(utterance);
  
  // Connect your nodes to speakers
  modulator.connect(audioCtx.destination);
}