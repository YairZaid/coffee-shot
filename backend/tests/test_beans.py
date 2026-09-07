from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

BEAN_PAYLOAD = {
    "name": "Yirgacheffe",
    "roaster": "Some Roaster",
    "origin": "Ethiopia",
    "roast_date": "2026-08-20",
}


def test_create_bean_returns_201_with_generated_fields():
    response = client.post("/beans", json=BEAN_PAYLOAD)

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == BEAN_PAYLOAD["name"]
    assert body["id"] is not None
    assert body["created_at"] is not None


def test_list_beans_returns_created_bean():
    client.post("/beans", json=BEAN_PAYLOAD)

    response = client.get("/beans")

    assert response.status_code == 200
    beans = response.json()
    assert len(beans) == 1
    assert beans[0]["name"] == BEAN_PAYLOAD["name"]


def test_get_bean_returns_matching_bean():
    created = client.post("/beans", json=BEAN_PAYLOAD).json()

    response = client.get(f"/beans/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_get_bean_returns_404_when_missing():
    response = client.get("/beans/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Bean not found"
