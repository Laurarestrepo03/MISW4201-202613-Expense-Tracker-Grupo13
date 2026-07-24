def test_create_expense_returns_201_and_id(client):
    response = client.post(
        "/expenses",
        json={"title": "Bell Mobile", "amount": 100.0, "date": "2022-10-20", "note": "Phone Bill"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Bell Mobile"
    assert body["amount"] == 100.0
    assert "id" in body


def test_list_expenses_returns_all_created(client):
    client.post("/expenses", json={"title": "A", "amount": 10.0, "date": "2022-01-01", "note": ""})
    client.post("/expenses", json={"title": "B", "amount": 20.0, "date": "2022-01-02", "note": ""})

    response = client.get("/expenses")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_total_reflects_all_expenses(client):
    client.post("/expenses", json={"title": "Uniqlo", "amount": 130.23, "date": "2022-11-18", "note": "New clothes"})
    client.post("/expenses", json={"title": "Museum", "amount": 50.45, "date": "2022-12-01", "note": "Admission fee"})

    total = client.get("/expenses/total").json()["total"]
    assert total == 180.68


def test_delete_expense_removes_it(client):
    created = client.post(
        "/expenses",
        json={"title": "BestBuy", "amount": 24.50, "date": "2022-11-30", "note": "Charging Cable"},
    ).json()

    response = client.delete(f"/expenses/{created['id']}")
    assert response.status_code == 200

    assert client.get(f"/expenses/{created['id']}").status_code == 404


def test_delete_nonexistent_expense_returns_404(client):
    response = client.delete("/expenses/does-not-exist")
    assert response.status_code == 404


def test_create_expense_rejects_negative_amount(client):
    response = client.post(
        "/expenses",
        json={"title": "Invalid", "amount": -5.0, "date": "2022-01-01", "note": ""},
    )
    assert response.status_code == 422
