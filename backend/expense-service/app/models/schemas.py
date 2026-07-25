from datetime import date

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    """Espejo de Expense.java."""
    title: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)  # Expense.java: REQUIRES amount > 0
    date: date
    note: str = Field(default="", max_length=500)


class ExpenseOut(ExpenseCreate):
    id: str


class TotalOut(BaseModel):
    """
    Total de expenses. Igual que en income-service, no hay 'balance' aquí:
    lo calcula quien consuma ambos servicios (Dashboard de Angular).
    """
    total: float
