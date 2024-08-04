from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
import os
import subprocess
from logger import logger

from prompt_builder import (
  send_to_gpt,
  send_to_qwen,
  extract_object,
  prompt_formater,
  clean_history,
  drawback_context_cnt
)

from multimod import (
  handle_text2voice,
  handle_voice2text
)

from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources=r'/*', origins="*")

class StoryState:
  """
  current story state, include story index, chapter index and other things
  """
  def __init__(self) -> None:
    self.story_index = 1
    self.chapter_index = 1
  
story_state = StoryState()


@app.route("/")
def index():
  return "hello world"

# 消息收发接口
@app.route("/text2voice", methods=["POST"])
def text2voice():
  """
  json format:
  {'text':'Text you need to transfor to audio'}
  """
  text = request.json.get("text", "").lower()
  audio_file_path = './tmp/temp_text_2_voice.mp3'
  handle_text2voice(text, audio_file_path)
  logger.info(f"Text to Voice:{text}")
  with open(audio_file_path, 'rb') as audio_file:
    return send_file(audio_file_path, mimetype='audio/mp3')
  

@app.route("/voice2text", methods=["POST"])
def voice2text():
  """
  revice voice and transfer to text
  json format:
  
  """
  voice_file = request.files['audiofile']
  
  original_path = os.path.join('./tmp/origin_temp_voice_2_text.mp3')
  voice_file.save(original_path)

    # 使用 FFmpeg 转换音频文件
  converted_path = os.path.join('./tmp/convert_temp_voice_2_text.mp3')
  subprocess.run([
      'ffmpeg',
      '-i', original_path,
      '-ar', '16000',  # 设置采样率
      '-ac', '1',     # 设置为单声道
      '-ab', '128k',  # 设置比特率为128kbps
      '-y',  # 覆盖输出文件
      converted_path
  ])

  text = handle_voice2text(converted_path)
  logger.info(f"Voice to Text:{text}")

  res = {
    "text": text
  }

  return jsonify(res)

@app.route("/save_image", methods=["POST"])
def save_image():
  """
  Save a sketch image with a custom filename provided in the request.
  """
  sketch_file = request.files.get('imgfile')
  filename = request.form.get('filename')

  if not sketch_file or not filename:
      return jsonify({"error": "Missing file or filename"}), 400

  buffer_data = sketch_file.read()
  temp_path = os.path.join('./pic/', 
                            filename)

  with open(temp_path, 'wb+') as f:
      f.write(buffer_data)

  logger.info(f"Save Image:{temp_path}")
  return jsonify({"message": "Image saved successfully"})

@app.route("/download_image", methods=["POST"])
def download_image():
  text = request.json.get("filename", "").lower()
  img_file_path = './pic/' + text
  with open(img_file_path, 'rb') as img_file:
    return send_file(img_file_path, mimetype='image/png')

@app.route('/restart_new_story', methods=["POST"])
def restart_new_story():
  """
  restart new story and clean all file in the old story
  """
  story_state.story_index = -1
  story_state.chapter_index = -1
  clean_history()
  logger.info(f"Restart new story")
  return jsonify({})

@app.route('/get_story_and_chapter', methods=["POST"])
def get_story_and_chapter():
  """
  get current story index and chapter index
  return json format:
  {
    'story_index' : xx,
    'chapter_index' : xx
  }
  """
  res = {
    "story_index" : story_state.story_index,
    "chapter_index" : story_state.chapter_index
  }
  return jsonify(res)

@app.route('/set_story_and_chapter', methods=['POST'])
def set_story_and_chapter():
  story_index = request.json.get("story_index","")
  chapter_index = request.json.get("chapter_index","")
  story_state.story_index = story_index
  story_state.chapter_index = chapter_index
  logger.info(f"Set story:{story_index},chapter:{chapter_index}")
  return jsonify({})


@app.route('/extract_keyword', methods=['POST'])
def extract_keyword():
  user_message = request.json.get('message')
  keyword, sketch_object = extract_object(user_message)

  res = {
    "keyword": keyword,
    "sketch_object": sketch_object
  }
  logger.info(f"Extract Keyword: {res}")
  return jsonify(res)


@app.route("/generate_story", methods=["POST"])
def next_chapter():
  """
  receive user response with prev chapter and generate next chapter story, update story_index and chapter_index when use this func
  revice json format:
  {
    'message': user_message(string),
    'extract': bool,
  }
  send json format:
  {
    'story':res_json["story"],
    'interact':res_json["interact"],
  }
  then use /text2voice transfer story and interact to audio
  """
  if story_state.story_index == -1 or story_state.chapter_index == -1:
    return jsonify({'error':'please set story index and chapter index'})
  user_message = request.json.get("message","").lower()

  # 记录用户反馈
  user_prompt = prompt_formater(
    story_state.story_index,
    story_state.chapter_index,
    {"message":user_message}
  )
  print('user_prompt:', user_prompt)
  # res = send_to_gpt(user_prompt)
  res = send_to_qwen(user_prompt)
  return jsonify(res)

@app.route("/drawback_context", methods=["POST"])
def drawback_context():
  """
  drawback context, use this func when user feedback is not good
  """
  draw_back_cnt = request.json.get("drawback_cnt","")
  drawback_context_cnt(draw_back_cnt)
  return jsonify({})


@app.route("/send2qwen", methods=["POST"])
def send2qwen():
  text = request.json.get("text")
  return jsonify({"response":send_to_qwen(text)})


@app.route("/test_get_text", methods=['POST'])
def test_get_text():
  return jsonify({"text": "abcd"})

@app.route("/test_get_audio")
def test_get_audio():
  audio_file = open('./story_voice.mp3','rb')
  return send_file(audio_file, mimetype='audio/mp3')


if __name__ == "__main__":
  app.run(host='0.0.0.0', port=4999, debug=True)


