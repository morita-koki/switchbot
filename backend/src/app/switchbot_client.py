import os
import time
import hashlib
import hmac
import base64
import uuid
import requests
from typing import Dict, Any


class SwitchBotClient:
    """SwitchBot API v1.1 クライアント"""

    BASE_URL = "https://api.switch-bot.com/v1.1"

    def __init__(self, token: str, secret: str):
        self.token = token
        self.secret = secret

    def _get_headers(self) -> Dict[str, str]:
        """認証ヘッダーを生成"""
        nonce = uuid.uuid4().hex
        t = int(round(time.time() * 1000))
        string_to_sign = f"{self.token}{t}{nonce}"

        sign = base64.b64encode(
            hmac.new(
                self.secret.encode('utf-8'),
                string_to_sign.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')

        return {
            'Authorization': self.token,
            'sign': sign,
            'nonce': nonce,
            't': str(t),
            'Content-Type': 'application/json'
        }

    def get_devices(self) -> Dict[str, Any]:
        """デバイス一覧を取得"""
        url = f"{self.BASE_URL}/devices"
        headers = self._get_headers()

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        return response.json()

    def get_device_status(self, device_id: str) -> Dict[str, Any]:
        """デバイスのステータスを取得"""
        url = f"{self.BASE_URL}/devices/{device_id}/status"
        headers = self._get_headers()

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        return response.json()

    @staticmethod
    def is_meter_device(device_type: str) -> bool:
        """温湿度計デバイスかどうか判定"""
        meter_types = ['Meter', 'MeterPlus', 'MeterPro', 'WoIOSensor']
        return device_type in meter_types
