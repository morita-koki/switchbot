import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


def get_calendar_service():
    """Google Calendar APIサービスを作成

    環境変数からService Accountの認証情報を読み込み、
    Calendar APIサービスを返す

    Returns:
        googleapiclient.discovery.Resource: Calendar API service

    Raises:
        FileNotFoundError: 認証情報ファイルが見つからない
        Exception: 認証に失敗
    """
    credentials_path = os.getenv('GOOGLE_CALENDAR_CREDENTIALS_PATH')

    if not credentials_path:
        raise ValueError("GOOGLE_CALENDAR_CREDENTIALS_PATH environment variable is not set")

    if not os.path.exists(credentials_path):
        raise FileNotFoundError(f"Credentials file not found: {credentials_path}")

    try:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=SCOPES
        )

        service = build('calendar', 'v3', credentials=credentials)
        return service
    except Exception as e:
        logger.error(f"Failed to create calendar service: {e}")
        raise


def fetch_today_events(calendar_ids: Optional[List[str]] = None) -> List[Dict]:
    """今日の予定をGoogle Calendarから取得（複数カレンダー対応）

    Args:
        calendar_ids: カレンダーIDのリスト（デフォルト: 環境変数から取得）

    Returns:
        今日の予定のリスト（全カレンダーの予定を統合してソート）
        [
            {
                'id': str,
                'summary': str,
                'start': str (ISO format),
                'end': str (ISO format),
                'location': str | None,
                'description': str | None
            }
        ]

    Raises:
        HttpError: Google Calendar APIエラー
    """
    if calendar_ids is None:
        # 環境変数から複数のカレンダーIDを取得
        calendar_ids_str = os.getenv('GOOGLE_CALENDAR_IDS', os.getenv('GOOGLE_CALENDAR_ID', 'primary'))
        calendar_ids = [cid.strip() for cid in calendar_ids_str.split(',')]

    try:
        service = get_calendar_service()

        # 今日の0時から翌日0時までの範囲を取得
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow_start = today_start + timedelta(days=1)

        # ISO形式に変換（タイムゾーン付き）
        time_min = today_start.isoformat() + 'Z'  # Zulu time (UTC)
        time_max = tomorrow_start.isoformat() + 'Z'

        # カレンダー名に基づく色のマッピング（Googleカレンダーの標準色）
        name_to_color = {
            '研究': '#7986cb',    # ラベンダー
            'jack': '#f6bf26',    # バナナ
            'Map IV': '#33b679',  # セージ
            '私用': '#039be5',    # ピーコック
            'ToDo リスト': '#e67c73',  # トマト
            '誕生日': '#0b8043',  # バジル
        }

        # カレンダー情報を取得（名前と色）
        calendar_info = {}
        for calendar_id in calendar_ids:
            try:
                # まずcalendarList().get()で色情報を取得
                cal_list = service.calendarList().get(calendarId=calendar_id).execute()
                calendar_info[calendar_id] = {
                    'summary': cal_list.get('summary', calendar_id),
                    'backgroundColor': cal_list.get('backgroundColor', '#039BE5')
                }
            except HttpError:
                # calendarList()で取得できない場合はcalendars().get()で名前のみ取得
                try:
                    cal = service.calendars().get(calendarId=calendar_id).execute()
                    name = cal.get('summary', calendar_id)
                    calendar_info[calendar_id] = {
                        'summary': name,
                        'backgroundColor': name_to_color.get(name, '#039BE5')  # 名前から色を決定
                    }
                except HttpError:
                    calendar_info[calendar_id] = {
                        'summary': calendar_id,
                        'backgroundColor': '#039BE5'
                    }

        # 全カレンダーから予定を取得
        all_events = []
        for calendar_id in calendar_ids:
            try:
                # Calendar APIを呼び出し
                events_result = service.events().list(
                    calendarId=calendar_id,
                    timeMin=time_min,
                    timeMax=time_max,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()

                events = events_result.get('items', [])
                logger.info(f"Fetched {len(events)} events from calendar: {calendar_id}")

                # 各イベントにカレンダー情報を追加
                for event in events:
                    event['_calendar_id'] = calendar_id
                    event['_calendar_name'] = calendar_info[calendar_id]['summary']
                    event['_calendar_color'] = calendar_info[calendar_id]['backgroundColor']

                all_events.extend(events)
            except HttpError as error:
                logger.warning(f"Failed to fetch events from calendar {calendar_id}: {error}")
                # 1つのカレンダーで失敗しても他のカレンダーは処理を続ける
                continue

        # 必要な情報だけを抽出
        parsed_events = []
        for event in all_events:
            # start/endは dateTime または date のどちらかを持つ
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))

            parsed_events.append({
                'id': event.get('id'),
                'summary': event.get('summary', '(タイトルなし)'),
                'start': start,
                'end': end,
                'location': event.get('location'),
                'description': event.get('description'),
                'calendar_id': event.get('_calendar_id'),
                'calendar_name': event.get('_calendar_name'),
                'calendar_color': event.get('_calendar_color')
            })

        # 開始時刻でソート
        parsed_events.sort(key=lambda x: x['start'])

        logger.info(f"Fetched total {len(parsed_events)} events from {len(calendar_ids)} calendars")
        return parsed_events

    except Exception as e:
        logger.error(f"Failed to fetch calendar events: {e}")
        raise


if __name__ == "__main__":
    # テスト用
    try:
        events = fetch_today_events()
        print(f"Found {len(events)} events:")
        for event in events:
            print(f"  - {event['summary']} ({event['start']} - {event['end']})")
    except Exception as e:
        print(f"Error: {e}")
