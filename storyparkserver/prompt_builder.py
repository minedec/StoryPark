from openai import OpenAI
import json
from flask import jsonify
from logger import logger, tester_name

#gpt
client = OpenAI(api_key="sess-3s5HNqOgrQcYnjUiYZjutwBgYwuMLdagEfBYI8Su")

#qwen
client = OpenAI(
        api_key="sk-0b17f0d5edac4ab59b279e81a7fe8d2c", 
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

sketch_object_en = ["bird", "ant", "ambulance", "angel", "alarm_clock", "antyoga", "backpack", "barn", "basket", "bear", "bee", "beeflower", "bicycle", "book", "brain", "bridge", "bulldozer", "bus", "butterfly", "cactus", "calendar", "castle", "cat", "catbus", "catpig", "chair", "couch", "crab", "crabchair", "crabrabbitfacepig", "cruise_ship", "diving_board", "dog", "dogbunny", "dolphin", "duck", "elephant", "elephantpig", "everything", "eye", "face", "fan", "fire_hydrant", "firetruck", "flamingo", "flower", "floweryoga", "frog", "frogsofa", "garden", "hand", "hedgeberry", "hedgehog", "helicopter", "kangaroo", "key", "lantern", "lighthouse", "lion", "lionsheep", "lobster", "map", "mermaid", "monapassport", "monkey", "mosquito", "octopus", "owl", "paintbrush", "palm_tree", "parrot", "passport", "peas", "penguin", "pig", "pigsheep", "pineapple", "pool", "postcard", "power_outlet", "rabbit", "rabbitturtle", "radio", "radioface", "rain", "rhinoceros", "rifle", "roller_coaster", "sandwich", "scorpion", "sea_turtle", "sheep", "skull", "snail", "snowflake", "speedboat", "spider", "squirrel", "steak", "stove", "strawberry", "swan", "swing_set", "the_mona_lisa", "tiger", "toothbrush", "toothpaste", "tractor", "trombone", "truck", "whale", "windmill", "yoga", "yogabicycle"]
sketch_object_ch = ["鸟","蚂蚁","救护车","天使","闹钟","蚂蚁瑜伽","背包","谷仓","篮子","熊","蜜蜂","蜂花","自行车","书","大脑","桥","推土机","公共汽车","蝴蝶","仙人掌","日历","城堡","猫","猫巴士","猫猪","椅子","沙发","蟹","螃蟹椅","蟹兔脸猪","邮轮","跳板","狗","狗兔子","海豚","鸭","大象","象猪","一切","眼睛","脸","粉丝","消防栓","救火车","火烈鸟","花","花瑜伽","青蛙","青蛙沙发","花园","手","对冲浆果","刺猬","直升机","袋鼠","关键","灯笼","灯塔","狮子","狮子羊","龙虾","地图","美人鱼","莫娜护照","猴子","蚊子","章鱼","猫头鹰","画笔","棕榈树","鹦鹉","护照","豌豆","企鹅","猪","猪羊","菠萝","池","明信片","电源插座","兔子","兔子乌龟","收音机","收音机的脸","雨","犀牛","步枪","过山车","三明治","蝎子","海龟","羊","头骨","蜗牛","雪花","快艇","蜘蛛","松鼠","牛排","火炉","草莓","天鹅","秋千","蒙娜丽莎""老虎","牙刷","牙膏","拖拉机","长号","卡车","鲸","风车","瑜伽","瑜伽自行车"]

context_history = []

#qwen apikey sk-0b17f0d5edac4ab59b279e81a7fe8d2c

# 清空对话历史
def clean_history() -> None:
  context_history.clear()

# gpt收发接口
def send_to_gpt(user_prompt):
  context_history.append(
        {
            "role":"user",
            "content":user_prompt,
        }
    )
  chat_completion = client.chat.completions.create(
    messages=context_history,
    model="gpt-3.5-turbo",
  )
  assistant_message = chat_completion.choices[0].message.content
  context_history.append(
    {
      "role":"assistant",
      "content":assistant_message
    }
  )
  return json.loads(chat_completion.choices[0].message.content)


# qwen收发接口
def send_to_qwen(user_prompt, record_in_context=True):
  if not record_in_context:
    chat_completion = client.chat.completions.create(
      messages=[{
            "role":"user",
            "content":user_prompt,
        }],
      model="qwen-max",
    )
    assistant_message = chat_completion.choices[0].message.content
    return assistant_message
  context_history.append(
        {
            "role":"user",
            "content":user_prompt,
        }
    )
  chat_completion = client.chat.completions.create(
    messages=context_history,
    model="qwen-max",
  )
  assistant_message = chat_completion.choices[0].message.content
  context_history.append(
    {
      "role":"assistant",
      "content":assistant_message
    }
  )
  print(context_history)
  global tester_name
  logger.info(f"Tester: {tester_name} - Prompt:{user_prompt}\\nResponse:{assistant_message}")
  return assistant_message


# prompt格式化
def prompt_formater(story_index:int, chapter_index:int, replace: dict) -> str:
  prompt_file_path = './prompt/' + str(story_index) + '/' + str(chapter_index) + '.txt'
  with open(prompt_file_path, 'r') as f:
    prompt_format = f.read()
    for key in replace:
      if key in prompt_format:
        prompt_format = prompt_format.replace(key, replace[key])

  return prompt_format


# 被试关键词提取
def extract_object(user_message):
  extract_text = read_prompt_file("./prompt/extract.txt").replace('message', user_message)
  # res_json = send_to_gpt(extract_text)
  print(extract_text)
  res_json = send_to_qwen(extract_text, False)
  print(res_json)
  keyword = json.loads(res_json)["keyword"]
  sketch_object = sketch_object_en[sketch_object_ch.index(json.loads(res_json)["object"])]
  return keyword, sketch_object
  

# 读取文件模板
def read_prompt_file(file_path):
  with open(file_path, 'r') as file:
    content = file.read()
  return content


def drawback_context_cnt(drawback_cnt):
  global context_history
  for i in range(drawback_cnt):
    context_history.pop()
    context_history.pop()
  print(context_history)