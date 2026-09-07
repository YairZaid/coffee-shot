from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class BeanBase(BaseModel):
    name: str
    roaster: str
    origin: str
    roast_date: date


class BeanCreate(BeanBase):
    pass


class BeanRead(BeanBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
