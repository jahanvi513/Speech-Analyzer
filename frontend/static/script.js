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

// 🟢 Add analysis results as a row in the table
function addAnalysisToTable(analysis) {
    const table = document.getElementById("analysisTable").getElementsByTagName("tbody")[0];
    const row = table.insertRow();

    row.insertCell(0).innerText = analysis.datetime;
    row.insertCell(1).innerText = analysis.audio_name;
    row.insertCell(2).innerText = analysis.overall_score;
    row.insertCell(3).innerText = analysis.language;
    row.insertCell(4).innerText = analysis.clarity;
    row.insertCell(5).innerText = analysis.confidence;
    row.insertCell(6).innerText = analysis.fluency;
    row.insertCell(7).innerText = analysis.topic_relevance;
    row.insertCell(8).innerText = analysis.strong_points;
    row.insertCell(9).innerText = analysis.improvements;
    row.insertCell(10).innerText = analysis.filler_words;
    row.insertCell(11).innerText = analysis.general_feedback;
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
                alert("Error: " + data.error);
                return;
            }

            // Show transcription
            document.getElementById('transcription').textContent = data.transcription;

            // Append analysis row in table
            addAnalysisToTable(data.analysis);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            alert("An error occurred while analyzing. Check console for details.");
        });
}
