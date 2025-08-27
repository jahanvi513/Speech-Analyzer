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

function saveApiKey() {
    const apiKey = document.getElementById("apiKey").value;
    if (!apiKey) {
        alert("Please enter a valid API key!");
        return;
    }

    sessionStorage.setItem("openai_api_key", apiKey);
    document.getElementById("api-key-container").style.display = "none";

    alert("API key saved for this session only.");
}

function analyzeAudio(formData) {
    const apiKey = sessionStorage.getItem("openai_api_key");
    if (!apiKey) {
        alert("Please enter and save your OpenAI API key before analyzing audio.");
        return;
    }

    formData.append("api_key", apiKey);

    fetch('/analyze', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('transcription').textContent = "";
                document.getElementById('analysis').textContent = "";
                alert("Error: " + data.error);
                return;
            }

            document.getElementById('transcription').textContent = data.transcription;
            document.getElementById('analysis').textContent = data.analysis;
        })
        .catch(err => {
            console.error("Fetch error:", err);
            alert("An error occurred while analyzing. Check console for details.");
        });
}