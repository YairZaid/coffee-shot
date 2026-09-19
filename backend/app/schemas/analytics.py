from pydantic import BaseModel


class BeanStats(BaseModel):
    bean_id: int
    shot_count: int
    avg_rating: float | None
    avg_ratio: float | None
