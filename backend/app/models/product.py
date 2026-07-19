from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    itemno: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    buying_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    colors: Mapped[str | None] = mapped_column(String(500), nullable=True)
    colli: Mapped[int | None] = mapped_column(nullable=True)
    tags: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)