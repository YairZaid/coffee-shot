import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

BEAN_PAYLOAD = {
    "name": "Yirgacheffe",
    "roaster": "Some Roaster",
    "origin": "Ethiopia",
    "roast_date": "2026-08-20",
}


@pytest.fixture
def bean_id() -> int:
    response = client.post("/beans", json=BEAN_PAYLOAD)
    return response.json()["id"]


def shot_payload(bean_id: int, *, dose: float, shot_yield: float, rating: int) -> dict:
    return {
        "bean_id": bean_id,
        "dose": dose,
        "grind_size": 3.5,
        "grind_time": 12.5,
        "shot_yield": shot_yield,
        "duration": 28.0,
        "rating": rating,
        "notes": "test shot",
    }


def test_bean_stats_returns_zero_state_for_bean_without_shots(bean_id: int):
    response = client.get(f"/beans/{bean_id}/stats")

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "bean_id": bean_id,
        "shot_count": 0,
        "avg_rating": None,
        "avg_ratio": None,
    }


def test_bean_stats_returns_averages_for_bean_with_shots(bean_id: int):
    client.post(
        "/shots", json=shot_payload(bean_id, dose=18.0, shot_yield=36.0, rating=8)
    )
    client.post(
        "/shots", json=shot_payload(bean_id, dose=20.0, shot_yield=44.0, rating=6)
    )

    response = client.get(f"/beans/{bean_id}/stats")

    assert response.status_code == 200
    body = response.json()
    assert body["bean_id"] == bean_id
    assert body["shot_count"] == 2
    assert body["avg_rating"] == pytest.approx(7.0)
    assert body["avg_ratio"] == pytest.approx((36.0 / 18.0 + 44.0 / 20.0) / 2)
