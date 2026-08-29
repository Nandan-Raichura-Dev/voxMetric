import { supabase } from './supabase-client.js';

const micBtn = document.getElementById('micBtn');
const startBtn = document.getElementById('startBtn');
const transcriptBox = document.getElementById('transcriptBox');
const statusBadge = document.getElementById('statusBadge');
const statusText = document.getElementById('statusText');
const wordCountBadge = document.getElementById('wordCountBadge');
const testSpeechBtn = document.getElementById('testSpeechBtn');
const timerDisplay = document.getElementById('timerDisplay');

let recognition = null;
let isRecording = false;
let fullTranscript = '';
let timerInterval = null;
let secElapsed = 0;
let confidenceScore = 0.9;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let currentText = '';
    for (let i = 0; i < event.results.length; i++) {
      currentText += event.results[i][0].transcript;
      if (event.results[i][0].confidence) {
        confidenceScore = event.results[i][0].confidence;
      }
    }

    fullTranscript = currentText;
    transcriptBox.innerHTML = `<p>${fullTranscript}</p>`;

    const wordCount = fullTranscript.trim() ? fullTranscript.trim().split(/\s+/).length : 0;
    wordCountBadge.textContent = `${wordCount} words`;

    if (wordCount > 0) {
      testSpeechBtn.disabled = false;
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    stopRecording();
  };
} else {
  alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
}

micBtn.addEventListener('click', toggleRecording);
startBtn.addEventListener('click', toggleRecording);

function toggleRecording() {
  if (!recognition) return;
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}

function startRecording() {
  isRecording = true;
  fullTranscript = '';
  confidenceScore = 0.9;
  recognition.start();

  micBtn.classList.add('recording');
  statusBadge.className = 'status-badge recording';
  statusText.textContent = 'Recording...';
  transcriptBox.innerHTML = '<p class="placeholder-text">Listening to your voice...</p>';

  secElapsed = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secElapsed++;
    const mins = String(Math.floor(secElapsed / 60)).padStart(2, '0');
    const secs = String(Math.floor(secElapsed % 60)).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopRecording() {
  isRecording = false;
  recognition.stop();
  clearInterval(timerInterval);

  micBtn.classList.remove('recording');
  statusBadge.className = 'status-badge ready';
  statusText.textContent = 'Paused / Ready';
}

// Algorithm Analysis Engine
function analyzeSpeech(transcript, durationSec, confidence) {
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const minutes = durationSec / 60;
  const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;

  const fillerList = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'so'];
  let fillerCount = 0;

  words.forEach(w => {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (fillerList.includes(cleanWord)) fillerCount++;
  });

  const clarityScore = Math.max(0, 100 - (fillerCount * 5));
  const pronunciationScore = Math.round(confidence * 100);

  return { wpm, clarityScore, pronunciationScore, fillerCount, wordCount };
}

// Process & Save
testSpeechBtn.addEventListener('click', async () => {
  if (!fullTranscript.trim()) return;

  const stats = analyzeSpeech(fullTranscript, secElapsed, confidenceScore);

  // Update UI Elements
  const resultsCard = document.getElementById('resultsCard');
  if (resultsCard) resultsCard.classList.remove('hidden');

  document.getElementById('wpmValue').innerHTML = `${stats.wpm} <span class="unit">WPM</span>`;
  document.getElementById('clarityValue').textContent = `${stats.clarityScore}%`;
  document.getElementById('pronunciationValue').textContent = `${stats.pronunciationScore}%`;
  document.getElementById('fillerValue').textContent = stats.fillerCount;

  // Save to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase.from('speech_logs').insert([{
      user_id: user.id,
      transcript: fullTranscript,
      filler_count: stats.fillerCount
    }]);

    if (!error) {
      alert('Analysis Complete & Saved to Database!');
    }
  }
});