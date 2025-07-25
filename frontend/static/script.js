let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let seconds = 0;

function showUpload() {
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('recordSection').style.display = 'none';
}

function showRecord() {
    document.getElementById('recordSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
}

function startRecording() {
    recordedChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            document.getElementById('audioPlayback').src = audioUrl;
            document.querySelector('#recordSection button[onclick="submitRecordedAudio()"]').disabled = false;
        };
        mediaRecorder.start();
        document.querySelector('#recordSection button[onclick="stopRecording()"]').disabled = false;
        seconds = 0;
        timerInterval = setInterval(updateTimer, 1000);
    });
}

function stopRecording() {
    mediaRecorder.stop();
    clearInterval(timerInterval);
    document.getElementById('timer').textContent = "00:00";
    document.querySelector('#recordSection button[onclick="stopRecording()"]').disabled = true;
}

function updateTimer() {
    seconds++;
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${min}:${sec}`;
}

function submitAudio() {
    const file = document.getElementById('audioUpload').files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('audio', file);
    analyzeAudio(formData);
}

function submitRecordedAudio() {
    const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob);
    analyzeAudio(formData);
}

function analyzeAudio(formData) {
    fetch('/analyze', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            document.getElementById('transcription').textContent = data.transcription;
            document.getElementById('analysis').textContent = data.analysis;
        });
}
