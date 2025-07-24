from flask import Flask, render_template, request, jsonify
import os, uuid
import openai
import whisper
import shutil
from systemprompt import system_prompt
from config import OPENAI_API_KEY

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# Clear temp uploads folder on server restart
for f in os.listdir(UPLOAD_FOLDER):
    os.remove(os.path.join(UPLOAD_FOLDER, f))

model = whisper.load_model("small")  # multilingual support
    
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    audio = request.files['audio']
    temp_filename = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.wav")
    audio.save(temp_filename)
    
    # Step 1: Transcribe using Whisper
    transcription = model.transcribe(temp_filename)["text"]

    # Step 2: Analyze using GPT-4
    openai.api_key = OPENAI_API_KEY
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcription}
        ],
        temperature=0.7,
        max_tokens=800
    )
    analysis = response["choices"][0]["message"]["content"]

    os.remove(temp_filename)  # delete after use
    return jsonify({"transcription": transcription, "analysis": analysis})

if __name__ == '__main__':
    app.run(debug=True)
