from pydantic import BaseModel, Field


class IncomeCreate(BaseModel):
    """Espejo de Income.java. La fecha NO se pide aquí: el servidor la sella (ver servicio)."""
    source: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., ge=0)  # Ledger.java: REQUIRES amount >= 0


class IncomeOut(IncomeCreate):
    id: str
    date: str  # timestamp ISO (UTC) generado por el servidor al crear el income


class TotalOut(BaseModel):
    """
    Total de incomes. No hay 'balance' en este microservicio: el balance
    se calcula fuera (Dashboard de Angular) combinando este total con el
    de expense-service, dado que ambos son servicios independientes con
    su propia base de datos.
    """
    total: float
