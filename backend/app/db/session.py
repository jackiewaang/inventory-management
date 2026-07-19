from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL = (
    "postgresql+psycopg://inventory:password@localhost:5432/inventory"
)

engine = create_engine(DATABASE_URL, echo=True) # manage connection with postgresql

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False) # produces database sessions

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()