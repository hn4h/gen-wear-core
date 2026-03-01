"""
Migration script: Thêm các column mới vào order_items và orders
cho tính năng Custom AI Design Orders.

Chạy: python migrate_custom_design.py
"""
import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://genwear:password@localhost:5432/genwear_db")
engine = create_engine(DATABASE_URL)

migrations = [
    # OrderItem - make product_id nullable
    "ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;",
    # OrderItem - thêm các column mới (bỏ qua nếu đã tồn tại)
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name_snapshot VARCHAR;",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image_snapshot VARCHAR;",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_custom_design BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS design_image_url VARCHAR;",
    # Order - thêm custom_notes
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_notes VARCHAR;",
]

with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            print(f"✅ OK: {sql[:60]}...")
        except Exception as e:
            print(f"⚠️  Skip ({e}): {sql[:60]}...")
    conn.commit()

print("\n✅ Migration hoàn thành!")
