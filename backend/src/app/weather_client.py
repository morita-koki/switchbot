import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional
import re


DEFAULT_YAHOO_URL = "https://weather.yahoo.co.jp/weather/jp/23/5110/23107.html"


def _parse_temp_text(text: str) -> Optional[float]:
    if not text:
        return None
    # remove non-numeric except minus and dot
    m = re.search(r"-?\d+(?:\.\d+)?", text)
    if not m:
        return None
    try:
        return float(m.group(0))
    except Exception:
        return None


def _parse_pinpoint_container(container, target_date: date, bucket_hours: int = 3) -> List[Dict]:
    """ピンポイント天気コンテナをパースして予報リストを返す"""
    forecasts: List[Dict] = []

    if container is None:
        return forecasts

    # Try to extract rows (some pages still include <tr>, others use block elements)
    trlist = container.find_all("tr")
    if not trlist:
        trlist = [c for c in container.find_all(recursive=False) if c.name in ("div", "li")]

    # map expected rows to keys
    tenkilist = ["jikan", "tenki", "kion", "shitsudo", "kosuiryo", "kaze"]
    result: Dict[str, List[str]] = {}
    for idx, key in enumerate(tenkilist):
        if idx < len(trlist):
            text = trlist[idx].get_text("\n", strip=True)
            parts = [s.strip() for s in text.split("\n") if s.strip()]
            result[key] = parts
        else:
            result[key] = []

    # Build forecasts from parsed arrays
    jikan = result.get("jikan", [])
    kion = result.get("kion", [])
    tenki = result.get("tenki", [])
    kosuiryo = result.get("kosuiryo", [])
    count = max(0, len(jikan) - 1)

    for i in range(1, 1 + count):
        label_raw = jikan[i] if i < len(jikan) else ""
        label = label_raw.strip()

        # parse hour from label
        hr = None
        m = re.search(r"(\d{1,2})", label)
        if m:
            try:
                hr = int(m.group(1))
            except Exception:
                hr = None

        if hr is not None:
            dt = datetime.combine(target_date, datetime.min.time()).replace(hour=hr)
        else:
            dt = datetime.combine(target_date, datetime.min.time()) + timedelta(hours=i * bucket_hours)

        raw_temp = kion[i] if i < len(kion) else ""
        temp_c = _parse_temp_text(raw_temp)

        weather = tenki[i] if i < len(tenki) else ""

        raw_precip = kosuiryo[i] if i < len(kosuiryo) else ""
        precipitation_mm = _parse_temp_text(raw_precip)

        if not label:
            try:
                label = dt.strftime("%H:%M")
            except Exception:
                label = ""

        forecasts.append({
            "dt": dt.isoformat(),
            "temp_c": temp_c,
            "label": label,
            "weather": weather,
            "precipitation_mm": precipitation_mm
        })

    return forecasts


def fetch_yahoo_forecast(url: str = DEFAULT_YAHOO_URL, hours: int = 24, bucket_hours: int = 3) -> Dict:
    """Fetch and parse a simple time-series forecast from the given Yahoo Japan weather page.

    Returns a dict: { source, units, forecasts: [ { dt: iso, temp_c: float|null, label: str }, ... ] }

    Fetches both today's and tomorrow's forecasts from yjw_pinpoint_today and yjw_pinpoint_tomorrow.
    """
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.content, "html.parser")

    now = datetime.now()
    today = now.date()
    tomorrow = today + timedelta(days=1)

    forecasts: List[Dict] = []

    # 今日の天気を取得
    container_today = soup.find("div", id="yjw_pinpoint_today")
    if container_today is None:
        container_today = soup.find("div", class_="yjw_pinpoint_today")
    forecasts.extend(_parse_pinpoint_container(container_today, today, bucket_hours))

    # 明日の天気を取得
    container_tomorrow = soup.find("div", id="yjw_pinpoint_tomorrow")
    if container_tomorrow is None:
        container_tomorrow = soup.find("div", class_="yjw_pinpoint_tomorrow")
    forecasts.extend(_parse_pinpoint_container(container_tomorrow, tomorrow, bucket_hours))

    print(f"Fetched {len(forecasts)} forecast entries from Yahoo (today + tomorrow).")

    return {"source": "yahoo", "units": "C", "forecasts": forecasts}


if __name__ == "__main__":
    # simple local test
    print(fetch_yahoo_forecast())
