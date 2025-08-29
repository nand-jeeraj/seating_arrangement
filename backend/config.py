import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  

class Config:
    MONGO_URI = os.getenv("MONGO_URI") 
    DB_NAME = os.getenv("DB_NAME")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)