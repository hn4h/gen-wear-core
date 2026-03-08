"""
Migration script: Add missing fields (account_tier, daily_credits) to users table
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/genwear")

def migrate():
    """Add missing fields to users table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        print("Current columns in users table:", columns)
        
        # Add account_tier column
        if 'account_tier' not in columns:
            print("Adding account_tier column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN account_tier VARCHAR(50) NOT NULL DEFAULT 'FREE'
            """))
            conn.commit()
            print("✓ Added account_tier")
        else:
            print("✓ account_tier already exists")
            
        # Add daily_credits_remaining column
        if 'daily_credits_remaining' not in columns:
            print("Adding daily_credits_remaining column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN daily_credits_remaining INTEGER NOT NULL DEFAULT 5
            """))
            conn.commit()
            print("✓ Added daily_credits_remaining")
        else:
            print("✓ daily_credits_remaining already exists")
            
        # Add daily_credits_reset_at column
        if 'daily_credits_reset_at' not in columns:
            print("Adding daily_credits_reset_at column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN daily_credits_reset_at TIMESTAMP NULL
            """))
            conn.commit()
            print("✓ Added daily_credits_reset_at")
        else:
            print("✓ daily_credits_reset_at already exists")
        
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    print("Starting migration...")
    print(f"Database: {DATABASE_URL}")
    print("-" * 60)
    
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        sys.exit(1)
