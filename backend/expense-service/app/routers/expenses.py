from fastapi import APIRouter, HTTPException

from app.models.schemas import ExpenseCreate, ExpenseOut, TotalOut
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(data: ExpenseCreate) -> ExpenseOut:
    return expense_service.create_expense(data)


@router.get("", response_model=list[ExpenseOut])
def list_expenses() -> list[ExpenseOut]:
    return expense_service.list_expenses()


@router.get("/total", response_model=TotalOut)
def get_total() -> TotalOut:
    """Consumido por el Dashboard (Angular) para calcular balance = total_income - total_expenses"""
    return expense_service.get_total()


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: str) -> ExpenseOut:
    expense = expense_service.get_expense(expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.delete("/{expense_id}", response_model=ExpenseOut)
def delete_expense(expense_id: str) -> ExpenseOut:
    deleted = expense_service.delete_expense(expense_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return deleted
