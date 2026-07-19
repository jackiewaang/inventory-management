import os
from collections.abc import Generator

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=os.environ["POSTGRES_USER"],
    password=os.environ["POSTGRES_PASSWORD"],
    host="postgres",
    port=5432,
    database=os.environ["POSTGRES_DB"],
)

engine = create_engine(DATABASE_URL, echo=True) # manage connection with postgresql

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False) # produces database sessions

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()
