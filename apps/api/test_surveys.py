import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://genwear:password@localhost:5432/genwear_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

db = SessionLocal()

# Test query directly
from sqlalchemy import text
result = db.execute(text("SELECT COUNT(*) FROM survey_responses"))
count = result.scalar()
print(f"Total survey responses: {count}")

result2 = db.execute(text("SELECT * FROM survey_responses LIMIT 5"))
rows = result2.fetchall()
print(f"\nFirst 5 surveys:")
for row in rows:
    print(f"  ID: {row[0]}, User: {row[2]}, Rating: {row[6]}")

db.close()
