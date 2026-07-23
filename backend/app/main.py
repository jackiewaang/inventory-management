from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db.base import Base
from app.db.session import engine
from app.models.product import Product
from app.api.products import router as products_router

app = FastAPI(title="Product API", description="API for managing products", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def frontend_cache_headers(request: Request, call_next):
    response = await call_next(request)

    path = request.url.path

    # These files must be checked for updates.
    if (
        path == "/"
        or path.endswith(".html")
        or path == "/manifest.json"
    ):
        response.headers["Cache-Control"] = (
            "no-cache, no-store, must-revalidate"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    # Vite gives built JS/CSS files content-hashed filenames.
    elif path.startswith("/assets/"):
        response.headers["Cache-Control"] = (
            "public, max-age=31536000, immutable"
        )

    return response

project_dir = Path(__file__).resolve().parent.parent

uploads_directory = project_dir / "uploads"
uploads_directory.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_directory), name="uploads")

app.include_router(products_router)

@app.get("/health")
def health_check():
    return {"status": "healthy, thank you"}

# Base.metadata.create_all(bind=engine)

static_dir = project_dir / "static"

if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")