from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
import os
import subprocess
import time
from flasgger import Swagger, swag_from
from zhipuai import ZhipuAI

# 导入logger前先确保log目录存在
log_dir = os.path.join(os.path.dirname(__file__), 'log')
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

from logger import logger, tester_name

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

# Initialize Swagger
swagger = Swagger(app)

# Ensure the static folder exists
static_folder = os.path.join(app.root_path, 'static')
if not os.path.exists(static_folder):
    os.makedirs(static_folder)

# Create swagger.json if it doesn't exist
swagger_file = os.path.join(static_folder, 'swagger.json')
if not os.path.exists(swagger_file):
    with open(swagger_file, 'w') as f:
        f.write('{"openapi": "3.0.0", "info": {"title": "StoryPark Server API", "version": "1.0.0"}, "paths": {}}')

class StoryState:
  """
  current story state, include story index, chapter index and other things
  """
  def __init__(self) -> None:
    self.story_index = 1
    self.chapter_index = 1
    self.story_text = ""  # 课文字符串
    self.story_summary = ""  # 故事梗概字符串
    self.story_elements = []  # 故事元素字符串数组
    self.zhipu_client = ZhipuAI(api_key="6c709502dd4342fcd6999456f1219f0c.l2WvWtqI6PgZi70J")
  
story_state = StoryState()

@app.route("/")
@swag_from({
    'responses': {
        '200': {
            'description': 'Welcome message',
            'schema': {
                'type': 'string'
            }
        }
    }
})
def index():
  return "hello world"

# 消息收发接口
@app.route("/text2voice", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'text',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Text you need to transform to audio'
        }
    ],
    'responses': {
        '200': {
            'description': 'Audio file',
            'content': {
                'audio/mp3': {}
            }
        }
    }
})
def text2voice():
  """
  Transform text to voice
  """
  text = request.json.get("text", "").lower()
  audio_file_path = './tmp/temp_text_2_voice.mp3'
  print('trans text:', text)
  handle_text2voice(text, audio_file_path)
  global tester_name
  logger.info(f"Tester: {tester_name} - Text to Voice:{text}")
  with open(audio_file_path, 'rb') as audio_file:
    return send_file(audio_file_path, mimetype='audio/mp3')
  

@app.route("/voice2text", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'audiofile',
            'in': 'formData',
            'type': 'file',
            'required': 'true',
            'description': 'Audio file to be converted to text'
        }
    ],
    'responses': {
        '200': {
            'description': 'Converted text',
            'schema': {
                'type': 'object',
                'properties': {
                    'text': {'type': 'string'}
                }
            }
        }
    }
})
def voice2text():
  """
  Receive voice and transfer to text
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
  global tester_name
  logger.info(f"Tester: {tester_name} - Voice to Text:{text}")

  res = {
    "text": text
  }

  return jsonify(res)

@app.route("/save_image", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'imgfile',
            'in': 'formData',
            'type': 'file',
            'required': 'true',
            'description': 'Image file to be saved'
        },
        {
            'name': 'filename',
            'in': 'formData',
            'type': 'string',
            'required': 'true',
            'description': 'Filename for the image'
        }
    ],
    'responses': {
        '200': {
            'description': 'Image saved successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'}
                }
            }
        }
    }
})
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

  global tester_name
  logger.info(f"Tester: {tester_name} - Save Image:{temp_path}")
  return jsonify({"message": "Image saved successfully"})

@app.route("/download_image", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'filename',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Filename of the image to download'
        }
    ],
    'responses': {
        '200': {
            'description': 'Image file',
            'content': {
                'image/png': {}
            }
        }
    }
})
def download_image():
  text = request.json.get("filename", "").lower()
  img_file_path = './pic/' + text
  max_wait_time = 10
  start_time = time.time()

  while True:
    if os.path.exists(img_file_path):
      with open(img_file_path, 'rb') as img_file:
        return send_file(img_file_path, mimetype='image/png')
    else:
      elapsed_time = time.time() - start_time
      if elapsed_time >= max_wait_time:
        return "File not found after waiting for {} seconds.".format(max_wait_time), 404
      time.sleep(0.5)

@app.route('/restart_new_story', methods=["POST"])
@swag_from({
    'responses': {
        '200': {
            'description': 'Story restarted successfully',
            'schema': {
                'type': 'object'
            }
        }
    }
})
def restart_new_story():
  """
  restart new story and clean all file in the old story
  """
  story_state.story_index = -1
  story_state.chapter_index = -1
  clean_history()
  global tester_name
  logger.info(f"Tester: {tester_name} - Restart new story")
  return jsonify({})

@app.route('/get_story_and_chapter', methods=["POST"])
@swag_from({
    'responses': {
        '200': {
            'description': 'Current story and chapter indices',
            'schema': {
                'type': 'object',
                'properties': {
                    'story_index': {'type': 'integer'},
                    'chapter_index': {'type': 'integer'}
                }
            }
        }
    }
})
def get_story_and_chapter():
  """
  get current story index and chapter index
  """
  res = {
    "story_index" : story_state.story_index,
    "chapter_index" : story_state.chapter_index
  }
  return jsonify(res)

@app.route('/set_story_and_chapter', methods=['POST'])
@swag_from({
    'parameters': [
        {
            'name': 'story_index',
            'in': 'body',
            'type': 'integer',
            'required': 'true',
            'description': 'Story index to set'
        },
        {
            'name': 'chapter_index',
            'in': 'body',
            'type': 'integer',
            'required': 'true',
            'description': 'Chapter index to set'
        }
    ],
    'responses': {
        '200': {
            'description': 'Story and chapter indices set successfully',
            'schema': {
                'type': 'object'
            }
        }
    }
})
def set_story_and_chapter():
  story_index = request.json.get("story_index","")
  chapter_index = request.json.get("chapter_index","")
  story_state.story_index = story_index
  story_state.chapter_index = chapter_index
  print("set story index:" + str(story_state.story_index) + ",chapter index:" + str(story_state.chapter_index))
  logger.info(f"Tester: {tester_name} - Set story:{story_state.story_index},chapter:{story_state.chapter_index}")
  return jsonify({})


@app.route('/extract_keyword', methods=['POST'])
@swag_from({
    'parameters': [
        {
            'name': 'message',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Message to extract keyword from'
        }
    ],
    'responses': {
        '200': {
            'description': 'Extracted keyword and sketch object',
            'schema': {
                'type': 'object',
                'properties': {
                    'keyword': {'type': 'string'},
                    'sketch_object': {'type': 'string'}
                }
            }
        }
    }
})
def extract_keyword():
  user_message = request.json.get('message')
  keyword, sketch_object = extract_object(user_message)

  res = {
    "keyword": keyword,
    "sketch_object": sketch_object
  }
  global tester_name
  logger.info(f"Tester: {tester_name} - Extract Keyword: {res}")
  return jsonify(res)


@app.route("/generate_story", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'message',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'User message'
        },
        {
            'name': 'story_index',
            'in': 'body',
            'type': 'integer',
            'required': 'true',
            'description': 'Story index'
        },
        {
            'name': 'chapter_index',
            'in': 'body',
            'type': 'integer',
            'required': 'true',
            'description': 'Chapter index'
        }
    ],
    'responses': {
        '200': {
            'description': 'Generated story and interaction',
            'schema': {
                'type': 'object',
                'properties': {
                    'story': {'type': 'string'},
                    'interact': {'type': 'string'}
                }
            }
        }
    }
})
def next_chapter():
  """
  receive user response with prev chapter and generate next chapter story, update story_index and chapter_index when use this func
  """
  user_message = request.json.get("message","").lower()
  story_index = request.json.get("story_index","")
  chapter_index = request.json.get("chapter_index","")

  # 记录用户反馈
  user_prompt = prompt_formater(
    story_index,
    chapter_index,
    {"message":user_message}
  )
  print('user_prompt:', user_prompt)
  # res = send_to_gpt(user_prompt)
  print('story index:', story_index, "chapter index:", chapter_index)
  res = send_to_qwen(user_prompt)
  return jsonify(res)

@app.route("/drawback_context", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'drawback_cnt',
            'in': 'body',
            'type': 'integer',
            'required': 'true',
            'description': 'Number of contexts to draw back'
        }
    ],
    'responses': {
        '200': {
            'description': 'Context drawn back successfully',
            'schema': {
                'type': 'object'
            }
        }
    }
})
def drawback_context():
  """
  drawback context, use this func when user feedback is not good
  """
  draw_back_cnt = request.json.get("drawback_cnt","")
  drawback_context_cnt(draw_back_cnt)
  return jsonify({})

@app.route("/set_tester_name", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'tester_name',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Name of the tester'
        }
    ],
    'responses': {
        '200': {
            'description': 'Tester name set successfully',
            'schema': {
                'type': 'object'
            }
        }
    }
})
def set_tester_name():
  global tester_name
  tester_name = request.json.get("tester_name")
  return jsonify({})

@app.route("/send2qwen", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'text',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Text to send to Qwen'
        }
    ],
    'responses': {
        '200': {
            'description': 'Response from Qwen',
            'schema': {
                'type': 'object',
                'properties': {
                    'response': {'type': 'string'}
                }
            }
        }
    }
})
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

@app.route("/generate_image", methods=["POST"])
@swag_from({
    'parameters': [
        {
            'name': 'prompt',
            'in': 'body',
            'type': 'string',
            'required': 'true',
            'description': 'Text prompt for image generation'
        }
    ],
    'responses': {
        '200': {
            'description': 'Generated image URL',
            'schema': {
                'type': 'object',
                'properties': {
                    'image_url': {'type': 'string'}
                }
            }
        }
    }
})
def generate_image():
    prompt = request.json.get("prompt")
    response = story_state.zhipu_client.images.generations(
        model="cogview-3",
        prompt=prompt,
    )
    
    image_url = response.data[0].url
    return jsonify({"image_url": image_url})


if __name__ == "__main__":
  app.run(host='0.0.0.0', port=4999, debug=True)


