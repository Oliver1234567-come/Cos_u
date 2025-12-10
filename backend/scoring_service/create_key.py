import requests
import urllib3
import os
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 直接访问 IP
url = "https://34.149.128.107/v1/users/me/api_keys"

headers = {
    "Host": "api.openai.com",   # 强制指定域名
    "Authorization": f"Bearer {proj_key}",
    "Content-Type": "application/json"
}

payload = {
    "name": "Cosu User Key",
    "scope": "user"
}

resp = requests.post(
    url,
    headers=headers,
    json=payload,
    verify=False,  # ★ 关闭 SSL 验证
    timeout=20
)

print("Status:", resp.status_code)
print("Response:")
print(resp.text)
