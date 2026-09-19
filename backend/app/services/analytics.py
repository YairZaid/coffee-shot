from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.shot import Shot
from app.schemas.analytics import BeanStats


def get_bean_stats(db: Session, bean_id: int) -> BeanStats:
    statement = select(
        func.count(Shot.id),
        func.avg(Shot.rating),
        func.avg(Shot.shot_yield / Shot.dose),
    ).where(Shot.bean_id == bean_id)

    shot_count, avg_rating, avg_ratio = db.execute(statement).one()

    return BeanStats(
        bean_id=bean_id,
        shot_count=shot_count,
        avg_rating=avg_rating,
        avg_ratio=avg_ratio,
    )
