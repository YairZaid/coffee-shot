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


def shot_payload(bean_id: int) -> dict:
    return {
        "bean_id": bean_id,
        "dose": 18.0,
        "grind_size": 3.5,
        "grind_time": 12.5,
        "shot_yield": 40.0,
        "duration": 28.0,
        "rating": 8,
        "notes": "test shot",
    }


def test_create_shot_returns_201_with_generated_fields(bean_id: int):
    response = client.post("/shots", json=shot_payload(bean_id))

    assert response.status_code == 201
    body = response.json()
    assert body["bean_id"] == bean_id
    assert body["id"] is not None
    assert body["created_at"] is not None


def test_list_shots_returns_created_shot(bean_id: int):
    client.post("/shots", json=shot_payload(bean_id))

    response = client.get("/shots")

    assert response.status_code == 200
    shots = response.json()
    assert len(shots) == 1
    assert shots[0]["bean_id"] == bean_id


def test_get_shot_returns_matching_shot(bean_id: int):
    created = client.post("/shots", json=shot_payload(bean_id)).json()

    response = client.get(f"/shots/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_shot_returns_404_when_missing():
    response = client.get("/shots/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Shot not found"
