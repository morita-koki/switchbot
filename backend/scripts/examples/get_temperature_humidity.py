"""
SwitchBot 温湿度計から温度・湿度情報を取得するスクリプト

使い方:
  uv run python scripts/examples/get_temperature_humidity.py
  uv run python scripts/examples/get_temperature_humidity.py <デバイスID>
"""

import os
import sys
import time
import hashlib
import hmac
import base64
import uuid
import requests
from dotenv import load_dotenv


def get_switchbot_headers(token: str, secret: str) -> dict:
    """SwitchBot API v1.1の認証ヘッダーを生成"""
    nonce = uuid.uuid4().hex
    t = int(round(time.time() * 1000))
    string_to_sign = f"{token}{t}{nonce}"

    sign = base64.b64encode(
        hmac.new(
            secret.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
    ).decode('utf-8')

    return {
        'Authorization': token,
        'sign': sign,
        'nonce': nonce,
        't': str(t),
        'Content-Type': 'application/json'
    }


def get_devices(token: str, secret: str) -> dict:
    """デバイス一覧を取得"""
    url = "https://api.switch-bot.com/v1.1/devices"
    headers = get_switchbot_headers(token, secret)

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()


def get_device_status(device_id: str, token: str, secret: str) -> dict:
    """デバイスの状態を取得"""
    url = f"https://api.switch-bot.com/v1.1/devices/{device_id}/status"
    headers = get_switchbot_headers(token, secret)

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()


def is_meter_device(device_type: str) -> bool:
    """温湿度計デバイスかどうかを判定"""
    meter_types = ['Meter', 'MeterPlus', 'MeterPro', 'WoIOSensor']
    return device_type in meter_types


def format_temperature_humidity(status_data: dict) -> str:
    """温湿度情報を整形"""
    body = status_data.get('body', {})

    temperature = body.get('temperature')
    humidity = body.get('humidity')
    battery = body.get('battery')

    lines = []
    if temperature is not None:
        lines.append(f"  温度: {temperature}°C")
    if humidity is not None:
        lines.append(f"  湿度: {humidity}%")
    if battery is not None:
        lines.append(f"  バッテリー: {battery}%")

    return "\n".join(lines) if lines else "  データなし"


def main():
    # 環境変数を読み込む
    load_dotenv()

    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        print("エラー: SWITCHBOT_CLIENT_TOKEN と SWITCHBOT_CLIENT_SECRET を .env ファイルに設定してください")
        sys.exit(1)

    try:
        # コマンドライン引数で特定のデバイスIDが指定された場合
        if len(sys.argv) > 1:
            device_id = sys.argv[1]
            print(f"=== デバイス {device_id} の状態 ===\n")

            status = get_device_status(device_id, token, secret)
            print(format_temperature_humidity(status))

            print("\n=== API応答（JSON） ===")
            import json
            print(json.dumps(status, indent=2, ensure_ascii=False))

        else:
            # すべての温湿度計デバイスの情報を取得
            devices_data = get_devices(token, secret)

            if 'body' not in devices_data or 'deviceList' not in devices_data['body']:
                print("デバイス情報の取得に失敗しました")
                return

            # 温湿度計デバイスのみをフィルタリング
            meter_devices = [
                d for d in devices_data['body']['deviceList']
                if is_meter_device(d.get('deviceType', ''))
            ]

            if not meter_devices:
                print("温湿度計デバイスが見つかりませんでした")
                return

            print("=== 温湿度計の情報 ===\n")

            for device in meter_devices:
                device_id = device['deviceId']
                device_name = device.get('deviceName', 'Unknown')
                device_type = device.get('deviceType', 'Unknown')

                print(f"{device_name} ({device_type})")
                print(f"  ID: {device_id}")

                try:
                    status = get_device_status(device_id, token, secret)
                    print(format_temperature_humidity(status))
                except Exception as e:
                    print(f"  エラー: {e}")

                print()

    except requests.exceptions.RequestException as e:
        print(f"APIエラー: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"エラー: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
