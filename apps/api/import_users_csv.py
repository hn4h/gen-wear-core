"""Import users from CSV into database with safe upsert behavior.

Usage:
  python apps/api/import_users_csv.py --file /path/to/data.csv --mode upsert
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from apps.api.modules.auth.database import SessionLocal
from apps.api.modules.auth.models import User


DATETIME_FORMATS = [
    "%m/%d/%Y %I:%M:%S %p",
    "%m/%d/%Y %H:%M:%S",
    "%m/%d/%Y %H:%M",
    "%Y-%m-%d %H:%M:%S",
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


def parse_int(value: str, default: int) -> int:
    raw = (value or "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def parse_bool(value: str, default: bool = True) -> bool:
    raw = (value or "").strip().lower()
    if raw in {"1", "true", "t", "yes", "y"}:
        return True
    if raw in {"0", "false", "f", "no", "n"}:
        return False
    return default


def normalize_choice(value: str, allowed: set[str], default: str) -> str:
    raw = (value or "").strip().upper()
    return raw if raw in allowed else default


def upsert_user(
    row: dict[str, str],
    mode: str,
    users_by_phone: dict[str, User],
    users_by_id: dict[str, User],
) -> str:
    user_id = (row.get("id") or "").strip()
    phone_number = (row.get("phone_number") or "").strip()
    full_name = (row.get("full_name") or "").strip()
    hashed_password = (row.get("hashed_password") or "").strip()

    if not phone_number or not full_name or not hashed_password:
        return "skipped"

    existing_by_phone = users_by_phone.get(phone_number)
    existing_by_id = users_by_id.get(user_id) if user_id else None
    existing = existing_by_phone or existing_by_id

    if existing and mode == "insert":
        return "skipped"

    payload = {
        "full_name": full_name,
        "hashed_password": hashed_password,
        "role": normalize_choice(row.get("role", ""), {"USER", "ADMIN"}, "USER"),
        "account_tier": normalize_choice(row.get("account_tier", ""), {"FREE", "PRO"}, "FREE"),
        "daily_credits_remaining": parse_int(row.get("daily_credits_remaining", ""), 5),
        "daily_credits_reset_at": parse_datetime(row.get("daily_credits_reset_at", "")),
        "pro_subscription_start": parse_datetime(row.get("pro_subscription_start", "")),
        "pro_subscription_end": parse_datetime(row.get("pro_subscription_end", "")),
        "pro_subscription_status": normalize_choice(
            row.get("pro_subscription_status", ""),
            {"INACTIVE", "ACTIVE", "EXPIRED"},
            "INACTIVE",
        ),
        "created_at": parse_datetime(row.get("created_at", "")) or datetime.utcnow(),
        "is_active": parse_bool(row.get("is_active", ""), True),
    }

    if existing:
        for key, value in payload.items():
            setattr(existing, key, value)

        # Keep maps in sync if phone number changes while updating by id.
        if phone_number and existing.phone_number != phone_number:
            users_by_phone.pop(existing.phone_number, None)
            existing.phone_number = phone_number
            users_by_phone[phone_number] = existing

        return "updated"

    if not user_id:
        return "skipped"

    user = User(
        id=user_id,
        phone_number=phone_number,
        **payload,
    )
    users_by_phone[phone_number] = user
    users_by_id[user_id] = user
    return "created"


def import_users(csv_path: Path, mode: str) -> None:
    created = 0
    updated = 0
    skipped = 0

    with SessionLocal() as db:
        existing_users = db.query(User).all()
        users_by_phone = {user.phone_number: user for user in existing_users}
        users_by_id = {user.id: user for user in existing_users}

        with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=1):
                result = upsert_user(
                    row=row,
                    mode=mode,
                    users_by_phone=users_by_phone,
                    users_by_id=users_by_id,
                )
                if result == "created":
                    db.add(users_by_id[(row.get("id") or "").strip()])
                    created += 1
                elif result == "updated":
                    updated += 1
                else:
                    skipped += 1

                if idx % 200 == 0:
                    db.commit()

        db.commit()

    print(f"Import complete. created={created}, updated={updated}, skipped={skipped}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import users from CSV")
    parser.add_argument("--file", required=True, help="Path to CSV file")
    parser.add_argument(
        "--mode",
        choices=["upsert", "insert"],
        default="upsert",
        help="upsert: create/update by phone_number, insert: create only",
    )
    args = parser.parse_args()

    csv_path = Path(args.file)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    import_users(csv_path=csv_path, mode=args.mode)


if __name__ == "__main__":
    main()
