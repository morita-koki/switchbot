#!/usr/bin/env python3
"""
Database seed script for SwitchBot backend
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from src.database.database import engine, SessionLocal
from src.database.models import Base, Device, User, DeviceStatus
from src.app.switchbot_client import SwitchBotClient
from src.app.services.device_service import DeviceService
from dotenv import load_dotenv
import json
from typing import Optional

load_dotenv()

# SwitchBot API settings
SWITCHBOT_CLIENT_TOKEN = os.getenv("SWITCHBOT_CLIENT_TOKEN")
SWITCHBOT_CLIENT_SECRET = os.getenv("SWITCHBOT_CLIENT_SECRET")

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def seed_users(db: Session):
    """Seed initial users"""
    users_data = [
        {
            "username": "admin",
            "email": "admin@switchbot.local",
            "is_active": True
        },
        {
            "username": "demo_user",
            "email": "demo@switchbot.local",
            "is_active": True
        }
    ]

    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing_user:
            user = User(**user_data)
            db.add(user)
            print(f"Created user: {user_data['username']}")

def seed_devices(db: Session):
    """(removed) Static device seeding is deprecated.

    Device rows are created from the SwitchBot Cloud API via
    `seed_devices_from_api`. This function is left as a no-op to avoid
    accidental static/random seeding.
    """
    print("Static device seeding disabled; use SWITCHBOT_TOKEN to seed from API.")

def seed_device_status(db: Session):
    """(removed) Static device status seeding is deprecated.

    Use `DeviceService.fetch_all_meter_statuses()` after devices
    are populated from the API to create DeviceStatus rows.
    """
    print("Static device status seeding disabled; use SWITCHBOT_TOKEN to seed from API.")

def seed_devices_from_api(db: Session):
    """Seed devices using SwitchBotClient via DeviceService.

    This uses `DeviceService` to call the client where appropriate. It will
    create/update Device rows based on API device list, and then call
    `fetch_all_meter_statuses` to populate meter DeviceStatus entries.
    """
    token = SWITCHBOT_CLIENT_TOKEN or ""
    secret = SWITCHBOT_CLIENT_SECRET or ""
    if not token:
        print("SWITCHBOT_CLIENT_TOKEN not set; skipping API seeding.")
        return

    client = SwitchBotClient(token=token, secret=secret)
    ds = DeviceService(db=db, client=client)

    # Get devices from client
    try:
        resp = client.get_devices()
    except Exception as e:
        print(f"Failed to fetch devices from SwitchBot API: {e}")
        return

    devices = resp.get("body", {}).get("deviceList", [])

    for dev in devices:
        device_id = dev.get("deviceId")
        if not device_id:
            continue

        existing_device = db.query(Device).filter(Device.device_id == device_id).first()
        name = dev.get("deviceName") or dev.get("deviceType") or device_id
        type_ = dev.get("deviceType") or dev.get("deviceModel") or "Unknown"
        hub_device_id = dev.get("hubDeviceId")

        if not existing_device:
            device = Device(
                device_id=device_id,
                name=name,
                type=type_,
                hub_device_id=hub_device_id,
                is_active=True
            )
            db.add(device)
            print(f"Created device from API: {name} ({device_id})")
        else:
            updated = False
            if existing_device.name != name:
                existing_device.name = name
                updated = True
            if existing_device.type != type_:
                existing_device.type = type_
                updated = True
            if updated:
                print(f"Updated device from API: {name} ({device_id})")

    # After ensuring Device rows exist, fetch and store meter statuses via DeviceService
    status_result = ds.fetch_all_meter_statuses()
    print(f"Fetched meter statuses: {status_result}")

def seed_weather_forecast(db: Session):
    """Seed initial weather forecast data"""
    try:
        from src.app.services.weather_service import WeatherService

        service = WeatherService(db)
        # Yahoo Japanから取得できる全てのデータを保存（通常24-48時間分）
        result = service.fetch_and_store_forecast(hours=48)
        print(f"Fetched weather forecast: {result['stored']}/{result['total']} entries stored")
    except Exception as e:
        print(f"Failed to fetch weather forecast: {e}")

def main():
    """Main seed function"""
    print("Starting database seeding...")

    # Create tables if they don't exist
    create_tables()

    # Create database session
    db = SessionLocal()

    try:
        # Seed data
        seed_users(db)
        # Require SWITCHBOT_CLIENT_TOKEN to seed devices from SwitchBot Cloud
        if not SWITCHBOT_CLIENT_TOKEN:
            raise RuntimeError(
                "SWITCHBOT_CLIENT_TOKEN is not set. Device seeding requires a SwitchBot Cloud token."
            )

        seed_devices_from_api(db)
        seed_weather_forecast(db)

        # Commit changes
        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()