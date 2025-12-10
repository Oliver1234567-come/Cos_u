# 单独测试声学评分模型

## 服务状态
- Python声学评分服务运行在: `http://127.0.0.1:8000`
- 这是**纯声学模型评分**，不包含GPT融合、字数检查等其他逻辑

## 使用方法

### 方法1: 使用测试脚本（推荐）

```bash
cd backend/scoring_service
source venv/bin/activate

# 测试你的音频文件
python test_acoustic_only.py <你的音频文件路径>

# 示例
python test_acoustic_only.py test_audio.m4a
python test_acoustic_only.py ../api/test_audio.m4a
```

### 方法2: 直接使用curl

```bash
# 测试音频文件
curl -X POST http://127.0.0.1:8000/score \
  -F "file=@<你的音频文件路径>" \
  -F "task_type=1" | python3 -m json.tool

# 示例
curl -X POST http://127.0.0.1:8000/score \
  -F "file=@test_audio.m4a" \
  -F "task_type=1" | python3 -m json.tool
```

### 方法3: 使用Python requests

```python
import requests

url = "http://127.0.0.1:8000/score"
with open("your_audio.m4a", "rb") as f:
    files = {"file": ("audio.m4a", f, "audio/m4a")}
    data = {"task_type": 1}
    response = requests.post(url, files=files, data=data)
    print(response.json())
```

## 返回结果说明

返回的JSON包含4个维度评分（0-30分）：
- `delivery`: 流畅度评分
- `language_use`: 语言使用评分
- `topic_dev`: 内容发展评分
- `overall`: 总分

**注意**: 这些分数是**纯声学模型**的输出，没有经过：
- GPT文本分析融合
- 字数检查惩罚
- 其他后处理逻辑

## 服务管理

### 启动服务
```bash
cd backend/scoring_service
source venv/bin/activate
uvicorn scoring_api:app --host 0.0.0.0 --port 8000
```

### 停止服务
```bash
lsof -ti:8000 | xargs kill -9
```

### 查看服务日志
```bash
tail -f /tmp/python_scoring.log
```

## 对比测试

如果你想对比：
1. **纯声学模型分数** - 使用本服务
2. **融合后分数** - 使用Node.js后端 `http://localhost:4000/api/score/score`

这样可以判断问题出在声学模型本身，还是融合逻辑。





