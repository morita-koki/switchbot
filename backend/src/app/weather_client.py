import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
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


def fetch_yahoo_forecast(url: str = DEFAULT_YAHOO_URL, hours: int = 24, bucket_hours: int = 3) -> Dict:
    """Fetch and parse a simple time-series forecast from the given Yahoo Japan weather page.

    Returns a dict: { source, units, forecasts: [ { dt: iso, temp_c: float|null, label: str }, ... ] }

    This is a best-effort scraper that looks for the first table in the page that contains
    time headers and numeric temperature cells. It supports coarse 3-hour buckets typically
    used on Yahoo's pages.
    """
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.content, "html.parser")

    # Prefer a div-based pinpoint forecast block (some Yahoo pages use a div with id 'yjw_pinpoint_today')
    container = soup.find("div", id="yjw_pinpoint_today")
    if container is None:
        container = soup.find("div", class_="yjw_pinpoint_today")

    forecasts: List[Dict] = []
    now = datetime.now()

    # If the pinpoint container is not present, return empty forecasts (no fallback)
    if container is None:
        return {"source": "yahoo", "units": "C", "forecasts": forecasts}

    # Try to extract rows (some pages still include <tr>, others use block elements)
    trlist = container.find_all("tr")
    if not trlist:
        # try immediate child divs or lis as rows
        # prefer direct children to avoid nested content
        trlist = [c for c in container.find_all(recursive=False) if c.name in ("div", "li")]

    # map expected rows to keys similar to the example script
    tenkilist = ["jikan", "tenki", "kion", "shitsudo", "kosuiryo", "kaze"]
    result: Dict[str, List[str]] = {}
    for idx, key in enumerate(tenkilist):
        if idx < len(trlist):
            text = trlist[idx].get_text("\n", strip=True)
            parts = [s.strip() for s in text.split("\n") if s.strip()]
            result[key] = parts
        else:
            result[key] = []

    # combine wind tokens similar to the example
    kaze2: List[str] = []
    if result.get("kaze"):
        kaze2.append(result["kaze"][0])
        for i in range(1, len(result["kaze"]), 2):
            a = result["kaze"][i]
            b = result["kaze"][i+1] if i+1 < len(result["kaze"]) else ""
            kaze2.append(a + b)

    # Build forecasts from parsed arrays; skip index 0 if it contains header/current label as in example
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
            candidate = now.replace(hour=hr, minute=0, second=0, microsecond=0)
            if candidate < now - timedelta(hours=1):
                candidate = candidate + timedelta(days=1)
            dt = candidate
        else:
            dt = now + timedelta(hours=(i - 1) * bucket_hours)

        raw_temp = kion[i] if i < len(kion) else ""
        temp_c = _parse_temp_text(raw_temp)

        # Extract weather condition
        weather = tenki[i] if i < len(tenki) else ""

        # Extract precipitation
        raw_precip = kosuiryo[i] if i < len(kosuiryo) else ""
        precipitation_mm = _parse_temp_text(raw_precip)

        # normalize label to time-like label
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

    # print(forecasts)

    # Filter to forecasts within the requested time window
    end_time = now + timedelta(hours=hours)
    filtered_forecasts = []
    for fc in forecasts:
        try:
            fc_dt = datetime.fromisoformat(fc['dt'])
            # Make fc_dt timezone-aware if it's naive
            if fc_dt.tzinfo is None:
                fc_dt = fc_dt.replace(tzinfo=timezone.utc)
            if fc_dt <= end_time:
                filtered_forecasts.append(fc)
        except Exception:
            # If parsing fails, include it anyway
            filtered_forecasts.append(fc)

    print(f"Fetched {len(filtered_forecasts)} forecast entries from Yahoo (within {hours} hours).")

    return {"source": "yahoo", "units": "C", "forecasts": filtered_forecasts}


if __name__ == "__main__":
    # simple local test
    print(fetch_yahoo_forecast())
