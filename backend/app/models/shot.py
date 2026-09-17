from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Shot(Base):
    __tablename__ = "shots"

    id: Mapped[int] = mapped_column(primary_key=True)
    bean_id: Mapped[int] = mapped_column(ForeignKey("beans.id"))
    dose: Mapped[float] = mapped_column(Float)
    grind_size: Mapped[float] = mapped_column(Float)
    grind_time: Mapped[float] = mapped_column(Float)
    shot_yield: Mapped[float] = mapped_column(Float)
    duration: Mapped[float] = mapped_column(Float)
    rating: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
