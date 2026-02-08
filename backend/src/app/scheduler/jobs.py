from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
import os
from src.database.database import SessionLocal
from src.app.switchbot_client import SwitchBotClient
from src.app.services.device_service import DeviceService

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def fetch_all_meter_statuses_job():
    """全温湿度計のデータを取得するバックグラウンドジョブ"""
    db = SessionLocal()
    try:
        token = os.getenv('SWITCHBOT_CLIENT_TOKEN')
        secret = os.getenv('SWITCHBOT_CLIENT_SECRET')

        if not token or not secret:
            logger.error("認証情報が設定されていません")
            return

        client = SwitchBotClient(token, secret)
        service = DeviceService(db, client)

        result = service.fetch_all_meter_statuses()
        logger.info(f"スケジュール実行完了: {result['success']}/{result['total']}件成功")

        if result['errors']:
            for error in result['errors']:
                logger.error(f"デバイス {error['device_id']}: {error['error']}")

    except Exception as e:
        logger.error(f"スケジュールジョブでエラー: {e}")
    finally:
        db.close()


def fetch_weather_forecast_job():
    """天気予報を取得してDBに保存するバックグラウンドジョブ"""
    db = SessionLocal()
    try:
        from src.app.services.weather_service import WeatherService

        service = WeatherService(db)
        # Yahoo Japanからその日1日分の天気予報を取得（24時間分）
        result = service.fetch_and_store_forecast(hours=48)
        logger.info(f"天気予報取得完了: {result['stored']}/{result['total']}件保存")

    except Exception as e:
        logger.error(f"天気予報取得ジョブでエラー: {e}")
    finally:
        db.close()


def start_scheduler():
    """スケジューラーを起動"""
    device_interval_minutes = int(os.getenv('FETCH_INTERVAL_MINUTES', 10))
    weather_interval_minutes = int(os.getenv('WEATHER_FETCH_INTERVAL_MINUTES', 60))

    # デバイスステータス取得ジョブ
    scheduler.add_job(
        fetch_all_meter_statuses_job,
        trigger=IntervalTrigger(minutes=device_interval_minutes),
        id='fetch_meter_statuses',
        name='全温湿度計のステータス取得',
        replace_existing=True
    )

    # 天気予報取得ジョブ
    scheduler.add_job(
        fetch_weather_forecast_job,
        trigger=IntervalTrigger(minutes=weather_interval_minutes),
        id='fetch_weather_forecast',
        name='天気予報取得',
        replace_existing=True
    )

    scheduler.start()
    logger.info(f"スケジューラー起動")
    logger.info(f"  - デバイスステータス: {device_interval_minutes}分ごと")
    logger.info(f"  - 天気予報: {weather_interval_minutes}分ごと")

    # 起動時に即座に天気データを取得
    logger.info("起動時の天気予報取得を開始")
    fetch_weather_forecast_job()


def shutdown_scheduler():
    """スケジューラーを停止"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("スケジューラー停止")
