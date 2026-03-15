"""Import AI generation logs from CSV into database.

Usage:
  python apps/api/import_ai_generation_logs.py --file /path/to/fake_ai_generation_logs.csv --mode upsert
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import Optional

from apps.api.modules.auth.database import SessionLocal
from apps.api.modules.generation.models import AIGenerationLog


DATETIME_FORMATS = [
    "%Y-%m-%d %H:%M:%S.%f",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%dT%H:%M:%S",
]


def parse_datetime(value: str) -> Optional[datetime]:
    raw = (value or "").strip()
    if not raw:
        return None

    for fmt in DATETIME_FORMATS:
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue

    return None


def import_ai_logs(csv_path: Path, mode: str) -> None:
    created = 0
    updated = 0
    skipped = 0

    with SessionLocal() as db:
        existing_logs = db.query(AIGenerationLog).all()
        logs_by_id = {log.id: log for log in existing_logs}

        with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=1):
                log_id = (row.get("id") or "").strip()
                if not log_id:
                    skipped += 1
                    continue

                payload = {
                    "user_id": (row.get("user_id") or "").strip() or None,
                    "prompt": row.get("prompt"),
                    "created_at": parse_datetime(row.get("created_at", "")) or datetime.utcnow(),
                }

                existing = logs_by_id.get(log_id)
                if existing:
                    if mode == "insert":
                        skipped += 1
                        continue
                    existing.user_id = payload["user_id"]
                    existing.prompt = payload["prompt"]
                    existing.created_at = payload["created_at"]
                    updated += 1
                else:
                    new_log = AIGenerationLog(id=log_id, **payload)
                    db.add(new_log)
                    logs_by_id[log_id] = new_log
                    created += 1

                if idx % 500 == 0:
                    db.commit()

        db.commit()

    print(f"Import complete. created={created}, updated={updated}, skipped={skipped}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import AI generation logs from CSV")
    parser.add_argument("--file", required=True, help="Path to CSV file")
    parser.add_argument(
        "--mode",
        choices=["upsert", "insert"],
        default="upsert",
        help="upsert: create/update by id, insert: create only",
    )
    args = parser.parse_args()

    csv_path = Path(args.file)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    import_ai_logs(csv_path=csv_path, mode=args.mode)


if __name__ == "__main__":
    main()
