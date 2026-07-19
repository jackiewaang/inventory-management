from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])

DatabaseSession = Annotated[Session, Depends(get_db)]
UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_product_image(file: UploadFile = File(...)) -> dict[str, str]:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, WebP, or GIF image.")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5 MB.")
    suffix = Path(file.filename or "image").suffix.lower()
    filename = f"{uuid4().hex}{suffix}"
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIRECTORY / filename).write_bytes(contents)
    return {"path": f"/uploads/{filename}"}

# Create a new product
@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: DatabaseSession,
) -> Product:
    product = Product(**product_data.model_dump())
    db.add(product)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with the same item number already exists.",
        )
    
    db.refresh(product)

    return product

@router.get("", response_model=list[ProductRead])
def get_products(db: DatabaseSession) -> list[Product]:
    statement = select(Product).order_by(Product.id.desc())
    products = db.scalars(statement).all()

    return list(products)

@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: DatabaseSession) -> Product:
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    
    return product

@router.patch("/{product_id}", response_model=ProductRead)
def update_product(product_id: int, product_data: ProductUpdate, db: DatabaseSession) -> Product:
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    updated_data = product_data.model_dump(exclude_unset=True)

    for field, value in updated_data.items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with the same item number already exists.",
        )
    
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: DatabaseSession):
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    db.delete(product)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
