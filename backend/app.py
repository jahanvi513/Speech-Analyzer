from flask import Flask, render_template, request, jsonify
import os, uuid
import openai
from systemprompt import system_prompt
from config import OPENAI_API_KEY

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Clear temp uploads folder on server restart
for f in os.listdir(UPLOAD_FOLDER):
    os.remove(os.path.join(UPLOAD_FOLDER, f))

openai.api_key = OPENAI_API_KEY

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    audio = request.files['audio']
    temp_filename = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.wav")
    audio.save(temp_filename)

    # Transcribe using OpenAI Whisper API (new SDK)
    with open(temp_filename, "rb") as file:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=file
        )
        transcription = transcript.text

    # Analyze using GPT-4
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcription}
        ],
        temperature=0.7,
        max_tokens=800
    )
    analysis = response.choices[0].message.content

    os.remove(temp_filename)
    return jsonify({"transcription": transcription, "analysis": analysis})

if __name__ == '__main__':
    app.run(debug=True)
