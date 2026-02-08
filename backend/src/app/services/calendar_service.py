from datetime import datetime
from typing import Dict, List
import logging

from src.app.calendar_client import fetch_today_events

logger = logging.getLogger(__name__)


class CalendarService:
    """カレンダー情報を取得・整形するサービスクラス"""

    def __init__(self):
        """初期化（データベース不要）"""
        pass

    def get_today_events(self) -> Dict:
        """今日のカレンダー予定を取得・整形

        Returns:
            {
                'events': [
                    {
                        'id': str,
                        'summary': str,
                        'start': str (ISO),
                        'end': str (ISO),
                        'start_time': str ('09:00'),
                        'end_time': str ('10:00'),
                        'location': str | None,
                        'description': str | None,
                        'is_all_day': bool
                    }
                ],
                'count': int,
                'date': str
            }
        """
        try:
            # Calendar APIから今日の予定を取得
            raw_events = fetch_today_events()

            # フロントエンド用に整形
            formatted_events = []
            for event in raw_events:
                start_str = event.get('start', '')
                end_str = event.get('end', '')

                # 終日イベントかどうかを判定
                # dateTimeフィールドがあれば時刻指定、dateのみなら終日
                is_all_day = 'T' not in start_str

                # 時刻を抽出（HH:MM形式）
                start_time = ''
                end_time = ''
                if not is_all_day:
                    try:
                        start_dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                        end_dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                        start_time = start_dt.strftime('%H:%M')
                        end_time = end_dt.strftime('%H:%M')
                    except Exception as e:
                        logger.warning(f"Failed to parse event time: {e}")
                        start_time = ''
                        end_time = ''

                formatted_events.append({
                    'id': event.get('id'),
                    'summary': event.get('summary', '(タイトルなし)'),
                    'start': start_str,
                    'end': end_str,
                    'start_time': start_time,
                    'end_time': end_time,
                    'location': event.get('location'),
                    'description': event.get('description'),
                    'is_all_day': is_all_day,
                    'calendar_id': event.get('calendar_id'),
                    'calendar_name': event.get('calendar_name'),
                    'calendar_color': event.get('calendar_color')
                })

            today = datetime.now().strftime('%Y-%m-%d')

            return {
                'events': formatted_events,
                'count': len(formatted_events),
                'date': today
            }

        except Exception as e:
            logger.error(f"カレンダー予定の取得に失敗: {e}")
            raise
