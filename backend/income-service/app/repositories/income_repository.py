import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from boto3.dynamodb.conditions import Key

from app.repositories.dynamo_client import get_table

INCOME_PK = "INCOME"


def _sk(income_id: str, timestamp: str) -> str:
    # SK = timestamp#id -> permite listar ordenado cronológicamente con Query (sin GSI)
    return f"{timestamp}#{income_id}"


def add_income(source: str, amount: float) -> dict:
    """
    El front no pide fecha para income, así que el servidor la sella
    aquí mismo con la hora actual (UTC), al momento de crear el registro.
    """
    table = get_table()
    income_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    item = {
        "PK": INCOME_PK,
        "SK": _sk(income_id, timestamp),
        "id": income_id,
        "source": source,
        "amount": Decimal(str(amount)),
        "date": timestamp,
    }
    table.put_item(Item=item)
    return {"id": income_id, "source": source, "amount": amount, "date": timestamp}


def list_incomes() -> List[dict]:
    table = get_table()
    response = table.query(KeyConditionExpression=Key("PK").eq(INCOME_PK))
    return [_deserialize(item) for item in response.get("Items", [])]


def get_income(income_id: str) -> Optional[dict]:
    # El SK incluye el timestamp, así que no se puede get_item directo por id:
    # se busca en la lista (dataset pequeño, app monousuario).
    for item in list_incomes():
        if item["id"] == income_id:
            return item
    return None


def delete_income(income_id: str) -> Optional[dict]:
    existing = get_income(income_id)
    if existing is None:
        return None
    table = get_table()
    table.delete_item(Key={"PK": INCOME_PK, "SK": _sk(income_id, existing["date"])})
    return existing


def total_income() -> float:
    return sum(item["amount"] for item in list_incomes())


def _deserialize(item: dict) -> dict:
    return {
        "id": item["id"],
        "source": item["source"],
        "amount": float(item["amount"]),
        "date": item["date"],
    }
