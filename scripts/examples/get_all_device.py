import os
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


def main():
    # 環境変数を読み込む
    load_dotenv()

    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        print("エラー: SWITCHBOT_CLIENT_TOKEN と SWITCHBOT_CLIENT_SECRET を .env ファイルに設定してください")
        return

    try:
        # デバイス一覧を取得
        result = get_devices(token, secret)

        print("=== SwitchBot デバイス一覧 ===\n")

        # 物理デバイス
        if 'body' in result and 'deviceList' in result['body']:
            devices = result['body']['deviceList']
            if devices:
                print(f"物理デバイス ({len(devices)}台):")
                for device in devices:
                    print(f"  - {device.get('deviceName', 'Unknown')} ({device.get('deviceType', 'Unknown')})")
                    print(f"    ID: {device.get('deviceId', 'N/A')}")
                    if 'hubDeviceId' in device:
                        print(f"    Hub ID: {device['hubDeviceId']}")
                print()
            else:
                print("物理デバイス: なし\n")

        # 仮想デバイス（赤外線リモコンなど）
        if 'body' in result and 'infraredRemoteList' in result['body']:
            infrared = result['body']['infraredRemoteList']
            if infrared:
                print(f"仮想デバイス/赤外線リモコン ({len(infrared)}台):")
                for device in infrared:
                    print(f"  - {device.get('deviceName', 'Unknown')} ({device.get('remoteType', 'Unknown')})")
                    print(f"    ID: {device.get('deviceId', 'N/A')}")
                    if 'hubDeviceId' in device:
                        print(f"    Hub ID: {device['hubDeviceId']}")
                print()
            else:
                print("仮想デバイス: なし\n")

        # API応答全体を表示（デバッグ用）
        print("\n=== API応答（JSON） ===")
        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))

    except requests.exceptions.RequestException as e:
        print(f"APIエラー: {e}")
    except Exception as e:
        print(f"エラー: {e}")


if __name__ == "__main__":
    main()
