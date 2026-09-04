import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "data" / "commerce.db"


def init_db():
    connection = sqlite3.connect(DB_FILE)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_request TEXT,
            selected_product TEXT,
            recommended_products TEXT,
            total_amnt REAL,
            approval TEXT,
            razorpay_order_id TEXT,
            payment_status TEXT
        )
    """)

    connection.commit()
    connection.close()