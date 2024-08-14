import os
import websocket
import datetime
import hashlib
import base64
import hmac
import json
from urllib.parse import urlencode
import time
import ssl
from wsgiref.handlers import format_date_time
from datetime import datetime
from time import mktime
import _thread as thread

STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识

# 音频文字转换接口（讯飞）
wsParam = None
text2voice_done = False
voice2text_done = False
feedback_text = ""

class Ws_Param_For_text2voice(object):
    # 初始化
    def __init__(self, APPID, APIKey, APISecret, Text, voice_path):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.Text = Text
        self.voice_path = voice_path
        
        self.CommonArgs = {"app_id": self.APPID}
        self.BusinessArgs = {"aue": "lame", "sfl":1, "auf": "audio/L16;rate=16000", "vcn": "xiaoyan", "tte": "utf8"}
        self.Data = {"status": 2, "text": str(base64.b64encode(self.Text.encode('utf-8')), "UTF8")}

    def create_url(self):
        url = 'wss://tts-api.xfyun.cn/v2/tts'
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        signature_origin = "host: " + "ws-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/tts " + "HTTP/1.1"
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        url = url + '?' + urlencode(v)
        return url

def on_message_text2voice(ws, message):
    try:
        message =json.loads(message)
        code = message["code"]
        sid = message["sid"]
        audio = message["data"]["audio"]
        audio = base64.b64decode(audio)
        status = message["data"]["status"]
        if status == 2:
            print("ws is closed")
            ws.close()
        if code != 0:
            errMsg = message["message"]
            print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))
        else:
            with open(wsParam.voice_path, 'ab') as f:
                f.write(audio)
            global text2voice_done
            text2voice_done = True
            
    except Exception as e:
        print("receive msg,but parse exception:", e)


# 收到websocket错误的处理
def on_error(ws, error):
    print("### error:", error)


# 收到websocket关闭的处理
def on_close(ws):
    print("### closed ###")


# 收到websocket连接建立的处理
def on_open_text2voice(ws):
    global text2voice_done
    text2voice_done = False
    def run(*args):
      d = {"common": wsParam.CommonArgs,
            "business": wsParam.BusinessArgs,
            "data": wsParam.Data,
            }
      d = json.dumps(d)
      print("------>开始发送文本数据")
      ws.send(d)
      if os.path.exists(wsParam.voice_path):
          os.remove(wsParam.voice_path)

    thread.start_new_thread(run, ()) 
    


def handle_text2voice(text, voice_path):
  global wsParam
  wsParam = Ws_Param_For_text2voice(APPID='1905c43f', APISecret='MzlmOGFkNzkyMGVhZjg1ODAwYTc2YzI0',
                       APIKey='a6573f48d2ea818e898005aa4eccf28d',
                       Text=text, voice_path=voice_path)
  websocket.enableTrace(False)
  wsUrl = wsParam.create_url()
  ws = websocket.WebSocketApp(wsUrl, on_message=on_message_text2voice, on_error=on_error, on_close=on_close)
  ws.on_open = on_open_text2voice
  ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
  global text2voice_done
  while text2voice_done is False:
    pass
  text2voice_done = False


class Ws_Param_For_voice2text(object):
    def __init__(self, APPID, APIKey, APISecret, AudioFile):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.AudioFile = AudioFile

        self.CommonArgs = {"app_id": self.APPID}
        self.BusinessArgs = {"domain": "iat", "language": "zh_cn", "accent": "mandarin", "vinfo":1,"vad_eos":10000}

    def create_url(self):
        url = 'wss://iat-api.xfyun.cn/v2/iat'
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        signature_origin = "host: " + "ws-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/iat " + "HTTP/1.1"
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        url = url + '?' + urlencode(v)
        return url


# 收到websocket消息的处理
def on_message_voice2text(ws, message):
    try:
        code = json.loads(message)["code"]
        sid = json.loads(message)["sid"]
        if code != 0:
            errMsg = json.loads(message)["message"]
            print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))

        else:
            data = json.loads(message)["data"]["result"]["ws"]
            # print(json.loads(message))
            result = ""
            for i in data:
                for w in i["cw"]:
                    result += w["w"]
            # print("sid:%s call success!,data is:%s" % (sid, json.dumps(data, ensure_ascii=False)))
            global feedback_text
            feedback_text += result
            global voice2text_done
            voice2text_done = True
    except Exception as e:
        print("receive msg,but parse exception:", e)


# 收到websocket连接建立的处理
def on_open_voice2text(ws):
    global voice2text_done 
    voice2text_done = False
    def run(*args):
        frameSize = 8000  # 每一帧的音频大小
        intervel = 0.04  # 发送音频间隔(单位:s)
        status = STATUS_FIRST_FRAME  # 音频的状态信息，标识音频是第一帧，还是中间帧、最后一帧
        global wsParam

        with open(wsParam.AudioFile, "rb") as fp:
            while True:
                buf = fp.read(frameSize)
                # 文件结束
                if not buf:
                    status = STATUS_LAST_FRAME
                # 第一帧处理
                # 发送第一帧音频，带business 参数
                # appid 必须带上，只需第一帧发送
                if status == STATUS_FIRST_FRAME:

                    d = {"common": wsParam.CommonArgs,
                         "business": wsParam.BusinessArgs,
                         "data": {"status": 0, "format": "audio/L16;rate=16000",
                                  "audio": str(base64.b64encode(buf), 'utf-8'),
                                  "encoding": "lame"}}
                    d = json.dumps(d)
                    ws.send(d)
                    status = STATUS_CONTINUE_FRAME
                # 中间帧处理
                elif status == STATUS_CONTINUE_FRAME:
                    d = {"data": {"status": 1, "format": "audio/L16;rate=16000",
                                  "audio": str(base64.b64encode(buf), 'utf-8'),
                                  "encoding": "lame"}}
                    ws.send(json.dumps(d))
                # 最后一帧处理
                elif status == STATUS_LAST_FRAME:
                    d = {"data": {"status": 2, "format": "audio/L16;rate=16000",
                                  "audio": str(base64.b64encode(buf), 'utf-8'),
                                  "encoding": "lame"}}
                    ws.send(json.dumps(d))
                    time.sleep(1)
                    break
                # 模拟音频采样间隔
                time.sleep(intervel)
        ws.close()

    thread.start_new_thread(run, ())
    
    
def handle_voice2text(voice_file):
  global feedback_text
  feedback_text = ""
  global wsParam
  wsParam = Ws_Param_For_voice2text(APPID='1905c43f', APISecret='MzlmOGFkNzkyMGVhZjg1ODAwYTc2YzI0',
                       APIKey='a6573f48d2ea818e898005aa4eccf28d',
                       AudioFile=voice_file)
  websocket.enableTrace(False)
  wsUrl = wsParam.create_url()
  ws = websocket.WebSocketApp(wsUrl, on_message=on_message_voice2text, on_error=on_error, on_close=on_close)
  ws.on_open = on_open_voice2text
  ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
  global voice2text_done
  while voice2text_done is False:
    pass
  voice2text_done = False
  return feedback_text

# if __name__ == "__main__":
#   handle_text2voice('你好，我是小爱同学', './tmppath.mp3')