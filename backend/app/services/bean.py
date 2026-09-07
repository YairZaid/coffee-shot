from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bean import Bean
from app.schemas.bean import BeanCreate


def create_bean(db: Session, bean_in: BeanCreate) -> Bean:
    bean = Bean(**bean_in.model_dump())
    db.add(bean)
    db.commit()
    db.refresh(bean)
    return bean


def list_beans(db: Session) -> list[Bean]:
    statement = select(Bean).order_by(Bean.created_at.desc())
    return list(db.execute(statement).scalars().all())


def get_bean(db: Session, bean_id: int) -> Bean | None:
    return db.get(Bean, bean_id)
