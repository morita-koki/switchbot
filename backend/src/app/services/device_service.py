from sqlalchemy.orm import Session
from src.database.models import Device, DeviceStatus
from src.app.switchbot_client import SwitchBotClient
from src.app.utils import format_datetime_iso
from typing import Dict, List


class DeviceService:
    def __init__(self, db: Session, client: SwitchBotClient):
        self.db = db
        self.client = client

    def update_custom_name(self, device_id: str, custom_name: str) -> Device:
        """カスタム名を更新"""
        device = self.db.query(Device).filter(Device.device_id == device_id).first()
        if not device:
            raise ValueError(f"Device {device_id} not found")
        device.custom_name = custom_name.strip() if custom_name else None
        self.db.commit()
        self.db.refresh(device)
        return device

    def get_devices_with_latest_status(self) -> List[Dict]:
        """全デバイスと最新ステータスを取得"""
        devices = self.db.query(Device).filter(Device.is_active == True).all()
        result = []

        for device in devices:
            latest_status = (
                self.db.query(DeviceStatus)
                .filter(DeviceStatus.device_id == device.device_id)
                .order_by(DeviceStatus.created_at.desc())
                .first()
            )

            device_data = {
                "device_id": device.device_id,
                "name": device.name,
                "custom_name": device.custom_name,
                "type": device.type,
                "hub_device_id": device.hub_device_id,
                "latest_status": None
            }

            if latest_status:
                device_data["latest_status"] = {
                    "temperature": latest_status.temperature,
                    "humidity": latest_status.humidity,
                    "battery": latest_status.battery,
                    "recorded_at": format_datetime_iso(latest_status.created_at)
                }

            result.append(device_data)

        return result

    def fetch_and_store_status(self, device_id: str) -> DeviceStatus:
        """APIからステータスを取得してDBに保存"""
        device = self.db.query(Device).filter(Device.device_id == device_id).first()
        if not device:
            raise ValueError(f"Device {device_id} not found")

        if not SwitchBotClient.is_meter_device(device.type):
            raise ValueError(f"Device {device_id} is not a meter device")

        # API呼び出し
        response = self.client.get_device_status(device_id)
        body = response.get('body', {})

        # DeviceStatus作成
        status = DeviceStatus(
            device_id=device_id,
            temperature=str(body.get('temperature')) if body.get('temperature') is not None else None,
            humidity=str(body.get('humidity')) if body.get('humidity') is not None else None,
            battery=body.get('battery'),
            status_data=str(response)
        )

        self.db.add(status)
        self.db.commit()
        self.db.refresh(status)

        return status

    def fetch_all_meter_statuses(self) -> Dict[str, any]:
        """全温湿度計のステータスを取得"""
        devices = self.db.query(Device).filter(Device.is_active == True).all()
        meter_devices = [d for d in devices if SwitchBotClient.is_meter_device(d.type)]

        success_count = 0
        errors = []

        for device in meter_devices:
            try:
                self.fetch_and_store_status(device.device_id)
                success_count += 1
            except Exception as e:
                errors.append({"device_id": device.device_id, "error": str(e)})

        return {
            "total": len(meter_devices),
            "success": success_count,
            "failed": len(errors),
            "errors": errors
        }
