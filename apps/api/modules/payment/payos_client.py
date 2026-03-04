import os
from payos import PayOS
from dotenv import load_dotenv

load_dotenv()

client_id = os.environ.get("PAYOS_CLIENT_ID")
api_key = os.environ.get("PAYOS_API_KEY")
checksum_key = os.environ.get("PAYOS_CHECKSUM_KEY")

payos_client = None

if client_id and api_key and checksum_key:
    payos_client = PayOS(
        client_id=client_id,
        api_key=api_key,
        checksum_key=checksum_key
    )
else:
    print("WARNING: PayOS credentials not found in environment variables.")
