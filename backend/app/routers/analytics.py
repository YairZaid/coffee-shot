from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import BeanStats
from app.services.analytics import get_bean_stats

router = APIRouter(prefix="/beans", tags=["analytics"])


@router.get("/{bean_id}/stats", response_model=BeanStats)
def get_bean_stats_route(bean_id: int, db: Session = Depends(get_db)) -> BeanStats:
    return get_bean_stats(db, bean_id)
