
from db import get_connection

connection = get_connection()

if connection:
    connection.close()
    print("Database test completed!")
