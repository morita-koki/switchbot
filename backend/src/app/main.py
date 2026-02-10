import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .switchbot_client import SwitchBotClient
from src.app.utils import format_datetime_iso
from src.database.database import get_db
from .services.device_service import DeviceService
from .scheduler.jobs import start_scheduler, shutdown_scheduler

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時
    start_scheduler()
    yield
    # 終了時
    shutdown_scheduler()


app = FastAPI(lifespan=lifespan)


class UpdateNameRequest(BaseModel):
    custom_name: str


class CommandRequest(BaseModel):
    command: str
    parameter: str = "default"
    command_type: str = "command"


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is protected behind Nginx!"}

@app.get("/api/devices")
def get_devices():
    """SwitchBotデバイス一覧を取得"""
    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        raise HTTPException(
            status_code=500,
            detail="SWITCHBOT_CLIENT_TOKEN と SWITCHBOT_CLIENT_SECRET が設定されていません"
        )

    try:
        client = SwitchBotClient(token, secret)
        result = client.get_devices()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/devices/status")
def get_devices_with_status(db: Session = Depends(get_db)):
    """全デバイスと最新の温度・湿度データを取得"""
    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        raise HTTPException(status_code=500, detail="認証情報が設定されていません")

    try:
        client = SwitchBotClient(token, secret)
        service = DeviceService(db, client)
        return service.get_devices_with_latest_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/devices/{device_id}/name")
def update_device_name(
    device_id: str,
    request: UpdateNameRequest,
    db: Session = Depends(get_db)
):
    """デバイスのカスタム名を更新"""
    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        raise HTTPException(status_code=500, detail="認証情報が設定されていません")

    custom_name = request.custom_name.strip()
    if not custom_name or len(custom_name) > 100:
        raise HTTPException(status_code=400, detail="名前は1-100文字で入力してください")

    try:
        client = SwitchBotClient(token, secret)
        service = DeviceService(db, client)
        device = service.update_custom_name(device_id, custom_name)

        return {
            "device_id": device.device_id,
            "name": device.name,
            "custom_name": device.custom_name,
            "type": device.type
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/devices/{device_id}/command")
def send_device_command(device_id: str, request: CommandRequest):
    """デバイスにコマンドを送信

    Args:
        device_id: デバイスID
        request.command: コマンド名 (turnOn, turnOff, setBrightness, setAll など)
        request.parameter: パラメータ (default, 1-100, "26,2,1,on" など)
        request.command_type: コマンドタイプ (command または customize)
    """
    token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
    secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

    if not token or not secret:
        raise HTTPException(status_code=500, detail="認証情報が設定されていません")

    try:
        client = SwitchBotClient(token, secret)
        result = client.send_command(
            device_id=device_id,
            command=request.command,
            parameter=request.parameter,
            command_type=request.command_type
        )

        # SwitchBot APIのレスポンスをチェック
        if result.get('statusCode') != 100:
            logger = logging.getLogger(__name__)
            logger.error(f"コマンド送信失敗: {result}")
            raise HTTPException(
                status_code=400,
                detail=f"コマンド送信に失敗しました: {result.get('message', 'Unknown error')}"
            )

        return {
            "success": True,
            "device_id": device_id,
            "command": request.command,
            "result": result
        }
    except HTTPException:
        raise
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"コマンド送信エラー: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/weather/forecast")
def get_weather_forecast(hours: int = 48, from_midnight: bool = True, db: Session = Depends(get_db)):
    """DBから最新の天気予報を取得

    Query params:
    - hours: 取得する時間幅（デフォルト48）
    - from_midnight: 今日の0時から取得するか（デフォルトTrue）
    """
    try:
        from src.app.services.weather_service import WeatherService

        service = WeatherService(db)
        result = service.get_latest_forecast(hours=hours, from_midnight=from_midnight)

        # データが空の場合は警告を返す
        if not result.get('forecasts'):
            logger = logging.getLogger(__name__)
            logger.warning("天気予報データが見つかりません。Schedulerが正常に動作しているか確認してください。")
            raise HTTPException(
                status_code=503,
                detail="天気予報データが利用できません。しばらくしてから再度お試しください。"
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"天気予報の取得に失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/weather/outdoor")
def get_outdoor_sensor(sensor_name: str = "室外", db: Session = Depends(get_db)):
    """屋外センサーの最新データを取得

    Query params:
    - sensor_name: センサーのカスタム名（デフォルト: "室外"）
    """
    try:
        from src.app.services.weather_service import WeatherService

        service = WeatherService(db)
        result = service.get_outdoor_sensor_data(custom_name=sensor_name)

        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"屋外センサー（{sensor_name}）が見つかりません。デバイス一覧からカスタム名を設定してください。"
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"屋外センサーデータの取得に失敗: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/calendar/today")
def get_today_calendar():
    """今日のカレンダー予定を取得

    Returns:
        {
            'events': [...],
            'count': int,
            'date': str
        }
    """
    try:
        from src.app.services.calendar_service import CalendarService

        service = CalendarService()
        result = service.get_today_events()

        return result
    except FileNotFoundError as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Google Calendar認証情報が見つかりません: {e}")
        raise HTTPException(
            status_code=500,
            detail="カレンダー認証情報が設定されていません"
        )
    except ValueError as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Google Calendar設定エラー: {e}")
        raise HTTPException(
            status_code=500,
            detail="カレンダー設定が正しくありません"
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"カレンダーデータの取得に失敗: {e}")
        raise HTTPException(
            status_code=503,
            detail="カレンダーサービスが利用できません"
        )