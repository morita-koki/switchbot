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
import json

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
    """Seed sample devices"""
    devices_data = [
        {
            "device_id": "C271111EC0AB",
            "name": "Living Room Thermometer",
            "type": "Meter",
            "hub_device_id": "000000000000",
            "is_active": True
        },
        {
            "device_id": "D271111EC0AC",
            "name": "Bedroom Curtain",
            "type": "Curtain",
            "hub_device_id": "000000000000",
            "is_active": True
        },
        {
            "device_id": "E271111EC0AD",
            "name": "Smart Lock",
            "type": "Lock",
            "hub_device_id": "000000000000",
            "is_active": True
        }
    ]

    for device_data in devices_data:
        # Check if device already exists
        existing_device = db.query(Device).filter(Device.device_id == device_data["device_id"]).first()
        if not existing_device:
            device = Device(**device_data)
            db.add(device)
            print(f"Created device: {device_data['name']}")

def seed_device_status(db: Session):
    """Seed sample device status data"""
    # Get existing devices
    thermometer = db.query(Device).filter(Device.type == "Meter").first()
    curtain = db.query(Device).filter(Device.type == "Curtain").first()

    if thermometer:
        status_data = {
            "temperature": "23.5",
            "humidity": "65",
            "battery": 85
        }
        device_status = DeviceStatus(
            device_id=thermometer.device_id,
            status_data=json.dumps(status_data),
            battery=85,
            temperature="23.5",
            humidity="65"
        )
        db.add(device_status)
        print(f"Created status for: {thermometer.name}")

    if curtain:
        status_data = {
            "position": 50,
            "battery": 92
        }
        device_status = DeviceStatus(
            device_id=curtain.device_id,
            status_data=json.dumps(status_data),
            battery=92
        )
        db.add(device_status)
        print(f"Created status for: {curtain.name}")

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
        seed_devices(db)
        seed_device_status(db)

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