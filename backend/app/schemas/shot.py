from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field


class ShotBase(BaseModel):
    bean_id: int
    dose: float
    grind_size: float
    grind_time: float
    shot_yield: float
    duration: float
    rating: int
    notes: str | None = None


class ShotCreate(ShotBase):
    pass


class ShotRead(ShotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

    @computed_field
    @property
    def ratio(self) -> float:
        return self.shot_yield / self.dose
