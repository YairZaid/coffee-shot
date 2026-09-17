from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.shot import Shot
from app.schemas.shot import ShotCreate, ShotRead
from app.services.shot import create_shot, get_shot, list_shots

router = APIRouter(prefix="/shots", tags=["shots"])


@router.post("", response_model=ShotRead, status_code=201)
def create_shot_route(shot_in: ShotCreate, db: Session = Depends(get_db)) -> Shot:
    return create_shot(db, shot_in)


@router.get("", response_model=list[ShotRead])
def list_shots_route(
    bean_id: int | None = None, db: Session = Depends(get_db)
) -> list[Shot]:
    return list_shots(db, bean_id)


@router.get("/{shot_id}", response_model=ShotRead)
def get_shot_route(shot_id: int, db: Session = Depends(get_db)) -> Shot:
    shot = get_shot(db, shot_id)
    if shot is None:
        raise HTTPException(status_code=404, detail="Shot not found")
    return shot
