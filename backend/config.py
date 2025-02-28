import os
from dotenv import load_dotenv, find_dotenv


class Config:
    load_dotenv(find_dotenv())
    SECRET_KEY = os.getenv(
        "SECRET_KEY", "i_am_secret"
    )  # generate a random secret key using os.random(40) and store it in .env file

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "i_am_jwt_secret")

    # SQLALCHEMY_DATABASE_URI = (
    #     "postgresql://<username>:<password>@localhost:5432/<database_name>"
    # )
    # SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
