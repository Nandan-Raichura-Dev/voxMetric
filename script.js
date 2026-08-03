
const micBtn = document.getElementById('micBtn');
const startBtn=document.getElementById('startBtn');
const transcriptBox =document.getElementById('transcriptBox');
const statusBadge =document.getElementById('statusBadge');
const statusText =document.getElementById('statusText');
const wordCountBadge =document.getElementById('wordCountBadge');
const testSpeechBtn =document.getElementById('testSpeechBtn');
const timerDisplay =document.getElementById('timerDisplay');

// i will use it for changing the state in codee
let recognition=null;
let isRecording =false;
let fullTranscript = '';
let timerInterval= null;
let secElapsed = 0;

// init web speech api 


const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang ='en-US';

  //  speech processing
  recognition.onresult =(event)=> {
      let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
          currentText +=event.results[i][0].transcript;
          }
    
    fullTranscript = currentText;
    transcriptBox.innerHTML =`<p>${fullTranscript}</p>`;
    
    //    live word count
    const wordCount =fullTranscript.trim() ? fullTranscript.trim().split(/\s+/).length : 0;
    wordCountBadge.textContent =`${wordCount} words`;

    
    if (wordCount>0) {
      testSpeechBtn.disabled =false;
    }
  };

  recognition.onerror =(event) =>{
    console.error("Speech Recognition Error:", event.error);
    stopRecording();
  };

  

} else {
    alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
}

// mic button event

micBtn.addEventListener('click', () => {
    if(!recognition)return;

        if(!isRecording){
            startRecording();
        }else{
            stopRecording();
        }

});

startBtn.addEventListener('click',()=>{
    if(!recognition)return;

    
        if(!isRecording){
            startRecording();
        }else{
            stopRecording();
        }

    

});

// helper func

function startRecording() {
  isRecording = true;
  recognition.start();

    micBtn.classList.add('recording');
        statusBadge.className='status-badge recording';
        statusText.textContent='Recording...';

if(fullTranscript === '') {
    transcriptBox.innerHTML = '<p class="placeholder-text">Listening to your voice...</p>';
  }

    // start timer
  secElapsed = 0; 
  clearInterval(timerInterval);
    timerInterval=setInterval(()=>{// this func executes iin each second
    secElapsed++;
      const mins=String(Math.floor(secElapsed/60)).padStart(2,'0');// pad start to covert iit into the 05 instead of the 5 
    const secs=String(Math.floor(secElapsed%60)).padStart(2,'0');
    timerDisplay.textContent=`${mins}:${secs}`;

   },1000);
}

function stopRecording() {
    isRecording = false;
    recognition.stop(); 
    clearInterval(timerInterval);

// also update variables 
  micBtn.classList.remove('recording');
    statusBadge.className = 'status-badge ready';
    statusText.textContent = 'Paused / Ready';
}

testSpeechBtn.addEventListener('click', () => {
    if (!fullTranscript.trim()) return;
    alert('Speech saved! Ready for analysis calculation.');
});