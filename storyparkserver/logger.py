from datetime import datetime
import logging

global tester_name
tester_name = 'tester'

now = datetime.now()
log_filename = now.strftime("%Y-%m-%d_%H-%M-%S.log")  # 格式化日期和时间为文件名
file_handler = logging.FileHandler('log/'+log_filename)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # 设置日志级别
logger.addHandler(file_handler)