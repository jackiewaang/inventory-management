from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine
from app.models.product import Product
from app.api.products import router as products_router

app = FastAPI(title="Product API", description="API for managing products", version="1.0.0")

app.include_router(products_router)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check():
    return {"status": "healthy, thank you"}