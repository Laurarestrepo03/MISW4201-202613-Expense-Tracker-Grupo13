import uuid
from decimal import Decimal
from typing import List, Optional

from boto3.dynamodb.conditions import Key

from app.repositories.dynamo_client import get_table

EXPENSE_PK = "EXPENSE"


def _sk(expense_id: str, expense_date: str) -> str:
    # SK = fecha#id -> permite listar ordenado por fecha con Query (sin GSI)
    return f"{expense_date}#{expense_id}"


def add_expense(title: str, amount: float, expense_date: str, note: str) -> dict:
    table = get_table()
    expense_id = str(uuid.uuid4())
    item = {
        "PK": EXPENSE_PK,
        "SK": _sk(expense_id, expense_date),
        "id": expense_id,
        "title": title,
        "amount": Decimal(str(amount)),
        "date": expense_date,
        "note": note,
    }
    table.put_item(Item=item)
    return {"id": expense_id, "title": title, "amount": amount, "date": expense_date, "note": note}


def list_expenses() -> List[dict]:
    table = get_table()
    response = table.query(KeyConditionExpression=Key("PK").eq(EXPENSE_PK))
    return [_deserialize(item) for item in response.get("Items", [])]


def get_expense(expense_id: str) -> Optional[dict]:
    for item in list_expenses():
        if item["id"] == expense_id:
            return item
    return None


def delete_expense(expense_id: str) -> Optional[dict]:
    existing = get_expense(expense_id)
    if existing is None:
        return None
    table = get_table()
    table.delete_item(Key={"PK": EXPENSE_PK, "SK": _sk(expense_id, existing["date"])})
    return existing


def total_expenses() -> float:
    return sum(item["amount"] for item in list_expenses())


def _deserialize(item: dict) -> dict:
    return {
        "id": item["id"],
        "title": item["title"],
        "amount": float(item["amount"]),
        "date": item["date"],
        "note": item.get("note", ""),
    }
