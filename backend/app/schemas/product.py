from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

class ProductCreate(BaseModel):
    itemno: str = Field(min_length=1, max_length=50)
    buying_price: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    image_path: str | None = None
    colors: str | None = None
    colli: int | None = None
    tags: str | None = None
    notes: str | None = None

class ProductUpdate(BaseModel):
    itemno: str | None = Field(default=None, min_length=1, max_length=50)
    buying_price: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    image_path: str | None = None
    colors: str | None = None
    colli: int | None = None
    tags: str | None = None
    notes: str | None = None

class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    itemno: str
    buying_price: Decimal
    selling_price: Decimal
    image_path: str | None = None
    colors: str | None = None
    colli: int | None = None
    tags: str | None = None
    notes: str | None = None
    created_at: datetime
