"""
Migration script: Add PRO subscription fields to users table
Chạy script này để thêm các cột mới cho tính năng PRO subscription
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/genwear")

def migrate():
    """Add PRO subscription fields to users table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        print("Current columns in users table:", columns)
        
        # Add pro_subscription_start column
        if 'pro_subscription_start' not in columns:
            print("Adding pro_subscription_start column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN pro_subscription_start TIMESTAMP NULL
            """))
            conn.commit()
            print("✓ Added pro_subscription_start")
        else:
            print("✓ pro_subscription_start already exists")
        
        # Add pro_subscription_end column
        if 'pro_subscription_end' not in columns:
            print("Adding pro_subscription_end column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN pro_subscription_end TIMESTAMP NULL
            """))
            conn.commit()
            print("✓ Added pro_subscription_end")
        else:
            print("✓ pro_subscription_end already exists")
        
        # Add pro_subscription_status column
        if 'pro_subscription_status' not in columns:
            print("Adding pro_subscription_status column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN pro_subscription_status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE'
            """))
            conn.commit()
            print("✓ Added pro_subscription_status")
        else:
            print("✓ pro_subscription_status already exists")
        
        # Update daily_credits_remaining for existing PRO users
        print("\nUpdating daily credits for PRO users...")
        result = conn.execute(text("""
            UPDATE users 
            SET daily_credits_remaining = 20
            WHERE account_tier = 'PRO' AND daily_credits_remaining < 20
        """))
        conn.commit()
        print(f"✓ Updated {result.rowcount} PRO users to have 20 daily credits")
        
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    print("Starting PRO subscription migration...")
    print(f"Database: {DATABASE_URL}")
    print("-" * 60)
    
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
