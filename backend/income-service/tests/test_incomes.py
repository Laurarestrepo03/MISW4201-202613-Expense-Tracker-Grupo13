def test_create_income_returns_201_id_and_date(client):
    response = client.post("/incomes", json={"source": "Google Inc.", "amount": 1050.0})
    assert response.status_code == 201
    body = response.json()
    assert body["source"] == "Google Inc."
    assert body["amount"] == 1050.0
    assert "id" in body
    assert "date" in body  # sellado por el servidor, no viene del request


def test_list_incomes_returns_all_created(client):
    client.post("/incomes", json={"source": "A", "amount": 10.0})
    client.post("/incomes", json={"source": "B", "amount": 20.0})

    response = client.get("/incomes")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_total_reflects_all_incomes(client):
    client.post("/incomes", json={"source": "ubc", "amount": 20000.0})
    client.post("/incomes", json={"source": "trial", "amount": 1200.89})

    total = client.get("/incomes/total").json()["total"]
    assert total == 21200.89


def test_delete_income_removes_it(client):
    created = client.post("/incomes", json={"source": "ICBC", "amount": 2534.10}).json()

    response = client.delete(f"/incomes/{created['id']}")
    assert response.status_code == 200

    assert client.get(f"/incomes/{created['id']}").status_code == 404


def test_delete_nonexistent_income_returns_404(client):
    response = client.delete("/incomes/does-not-exist")
    assert response.status_code == 404


def test_create_income_rejects_negative_amount(client):
    response = client.post("/incomes", json={"source": "Invalid", "amount": -5.0})
    assert response.status_code == 422


def test_create_income_ignores_client_supplied_date(client):
    """Aunque el cliente mande 'date', se ignora: el schema IncomeCreate no lo acepta."""
    response = client.post(
        "/incomes", json={"source": "Test", "amount": 1.0, "date": "2000-01-01T00:00:00"}
    )
    assert response.status_code == 201
    assert response.json()["date"] != "2000-01-01T00:00:00"
