from datetime import datetime, timezone
from typing import Optional


def format_datetime_iso(dt: Optional[datetime]) -> Optional[str]:
    """Datetime を UTC に正規化して ISO8601 文字列を返す。

    - None を受け取ったら None を返す。
    - tz-aware な値は UTC に変換して返す。
    - naive な値は UTC として扱い、Z サフィックスの ISO を返す。
    """
    if dt is None:
        return None

    if dt.tzinfo is None:
        aware = dt.replace(tzinfo=timezone.utc)
    else:
        aware = dt.astimezone(timezone.utc)

    iso = aware.isoformat()
    # Python の isoformat は '+00:00' を付与するため 'Z' に置き換える
    if iso.endswith("+00:00"):
        iso = iso.replace("+00:00", "Z")

    return iso
