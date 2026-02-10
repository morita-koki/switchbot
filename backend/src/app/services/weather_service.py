from sqlalchemy.orm import Session
from sqlalchemy import func
from src.database.models import WeatherForecast, Device, DeviceStatus
from src.app.weather_client import fetch_yahoo_forecast
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self, db: Session):
        self.db = db

    def fetch_and_store_forecast(self, url: str = None, hours: int = 24) -> Dict:
        """Yahoo Japanから天気予報を取得してDBに保存"""
        try:
            # 外部APIから取得
            if url:
                forecast_data = fetch_yahoo_forecast(url, hours=hours)
            else:
                forecast_data = fetch_yahoo_forecast(hours=hours)

            stored_count = 0
            for point in forecast_data.get('forecasts', []):
                forecast_dt = datetime.fromisoformat(point['dt'])

                # 既存データを確認（同じ予報時刻の最近のデータがあればスキップ）
                recent_cutoff = datetime.now(timezone.utc) - timedelta(minutes=10)
                existing = self.db.query(WeatherForecast).filter(
                    WeatherForecast.forecast_datetime == forecast_dt,
                    WeatherForecast.created_at > recent_cutoff
                ).first()

                if existing:
                    continue  # 最近のデータがあればスキップ

                # 新規データを保存
                weather_forecast = WeatherForecast(
                    forecast_datetime=forecast_dt,
                    temperature=point.get('temp_c'),
                    weather_condition=point.get('weather'),
                    precipitation_mm=point.get('precipitation_mm'),
                    label=point.get('label'),
                    source=forecast_data.get('source', 'yahoo')
                )
                self.db.add(weather_forecast)
                stored_count += 1

            self.db.commit()
            logger.info(f"天気予報を保存: {stored_count}/{len(forecast_data.get('forecasts', []))}件")

            return {
                'success': True,
                'stored': stored_count,
                'total': len(forecast_data.get('forecasts', []))
            }
        except Exception as e:
            self.db.rollback()
            logger.error(f"天気予報の取得・保存に失敗: {e}")
            raise

    def get_latest_forecast(self, hours: int = 24) -> Dict:
        """DBから最新の天気予報を取得

        現在時刻以降、指定時間分のデータを返す
        """
        now = datetime.now()
        end_time = now + timedelta(hours=hours)

        # 各予報時刻ごとに最新のデータを取得
        # サブクエリで各forecast_datetimeの最大created_atを取得
        subquery = (
            self.db.query(
                WeatherForecast.forecast_datetime,
                func.max(WeatherForecast.created_at).label('max_created')
            )
            .filter(
                WeatherForecast.forecast_datetime >= now,
                WeatherForecast.forecast_datetime <= end_time
            )
            .group_by(WeatherForecast.forecast_datetime)
            .subquery()
        )

        forecasts = (
            self.db.query(WeatherForecast)
            .join(
                subquery,
                (WeatherForecast.forecast_datetime == subquery.c.forecast_datetime) &
                (WeatherForecast.created_at == subquery.c.max_created)
            )
            .order_by(WeatherForecast.forecast_datetime)
            .all()
        )

        forecast_list = []
        for f in forecasts:
            forecast_list.append({
                'dt': f.forecast_datetime.isoformat(),
                'temp_c': f.temperature,
                'label': f.label,
                'weather': f.weather_condition,
                'precipitation_mm': f.precipitation_mm
            })

        return {
            'source': 'yahoo',
            'units': 'C',
            'forecasts': forecast_list
        }

    def get_outdoor_sensor_data(self, custom_name: Optional[str] = "室外") -> Optional[Dict]:
        """屋外センサー（WoIOSensorなど）の最新データを取得

        Args:
            custom_name: センサーのカスタム名（デフォルト: "室外"）

        Returns:
            センサーの最新データ。見つからない場合はNone
        """
        # custom_nameまたはnameで屋外センサーを検索
        outdoor_device = (
            self.db.query(Device)
            .filter(
                Device.is_active == True,
                (Device.custom_name == custom_name) | (Device.name.like(f"%{custom_name}%"))
            )
            .first()
        )

        if not outdoor_device:
            logger.warning(f"屋外センサー（custom_name='{custom_name}'）が見つかりません")
            return None

        # 最新のステータスを取得
        latest_status = (
            self.db.query(DeviceStatus)
            .filter(DeviceStatus.device_id == outdoor_device.device_id)
            .order_by(DeviceStatus.created_at.desc())
            .first()
        )

        if not latest_status:
            logger.warning(f"デバイス {outdoor_device.device_id} のステータスが見つかりません")
            return None

        return {
            'device_id': outdoor_device.device_id,
            'device_name': outdoor_device.custom_name or outdoor_device.name,
            'device_type': outdoor_device.type,
            'temperature': float(latest_status.temperature) if latest_status.temperature else None,
            'humidity': float(latest_status.humidity) if latest_status.humidity else None,
            'battery': latest_status.battery,
            'recorded_at': latest_status.created_at.isoformat()
        }
