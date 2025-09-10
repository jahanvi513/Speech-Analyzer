from flask import Flask, render_template, request, jsonify
import os, uuid, json
import openai 
from systemprompt import system_prompt
from config import OPENAI_API_KEY
from datetime import datetime

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

for f in os.listdir(UPLOAD_FOLDER):
    os.remove(os.path.join(UPLOAD_FOLDER, f))

openai.api_key = OPENAI_API_KEY

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    audio = request.files['audio']
    user_api_key = request.form.get("api_key") 

    if not user_api_key:
        return jsonify({"error": "No API key provided"}), 400

    # Save audio temporarily
    temp_filename = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.wav")
    audio.save(temp_filename)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=user_api_key) 

        # Step 1: Transcribe using Whisper
        with open(temp_filename, "rb") as file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=file
            )
        transcription = transcript.text

        # Step 2: Analyze using GPT-4
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt + "\n\nReturn the analysis strictly in valid JSON format with these fields: overall_score, language, clarity, confidence, fluency, topic_relevance, strong_points, improvements, filler_words, general_feedback."},
                {"role": "user", "content": transcription}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        raw_content = response.choices[0].message.content.strip()
        try:
            analysis_json = json.loads(raw_content)
            for key, value in analysis_json.items():
                if isinstance(value, (dict, list)):
                    analysis_json[key] = json.dumps(value, ensure_ascii=False)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse GPT response as JSON", "raw": raw_content}), 500

        result = {
            "datetime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "audio_name": audio.filename,
            **analysis_json
        }

        return jsonify({
            "transcription": transcription,
            "analysis": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)