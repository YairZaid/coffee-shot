from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.shot import Shot
from app.schemas.shot import ShotCreate


def create_shot(db: Session, shot_in: ShotCreate) -> Shot:
    shot = Shot(**shot_in.model_dump())
    db.add(shot)
    db.commit()
    db.refresh(shot)
    return shot


def list_shots(db: Session, bean_id: int | None = None) -> list[Shot]:
    statement = select(Shot).order_by(Shot.created_at.desc())
    if bean_id is not None:
        statement = statement.where(Shot.bean_id == bean_id)
    return list(db.execute(statement).scalars().all())


def get_shot(db: Session, shot_id: int) -> Shot | None:
    return db.get(Shot, shot_id)
