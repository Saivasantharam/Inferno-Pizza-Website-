
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        connection = psycopg.connect(
            host=os.getenv("DB_HOST"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )
        print("PostgreSQL connected successfully!")
        return connection

    except Exception as error:
        print("Database connection failed:", error)
        return None
