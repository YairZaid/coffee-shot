from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.bean import Bean
from app.schemas.bean import BeanCreate, BeanRead
from app.services.bean import create_bean, get_bean, list_beans

router = APIRouter(prefix="/beans", tags=["beans"])


@router.post("", response_model=BeanRead, status_code=201)
def create_bean_route(bean_in: BeanCreate, db: Session = Depends(get_db)) -> Bean:
    return create_bean(db, bean_in)


@router.get("", response_model=list[BeanRead])
def list_beans_route(db: Session = Depends(get_db)) -> list[Bean]:
    return list_beans(db)


@router.get("/{bean_id}", response_model=BeanRead)
def get_bean_route(bean_id: int, db: Session = Depends(get_db)) -> Bean:
    bean = get_bean(db, bean_id)
    if bean is None:
        raise HTTPException(status_code=404, detail="Bean not found")
    return bean
