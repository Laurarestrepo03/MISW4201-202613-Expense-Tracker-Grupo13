from fastapi import APIRouter, HTTPException

from app.models.schemas import IncomeCreate, IncomeOut, TotalOut
from app.services import income_service

router = APIRouter(prefix="/incomes", tags=["incomes"])


@router.post("", response_model=IncomeOut, status_code=201)
def create_income(data: IncomeCreate) -> IncomeOut:
    return income_service.create_income(data)


@router.get("", response_model=list[IncomeOut])
def list_incomes() -> list[IncomeOut]:
    return income_service.list_incomes()


@router.get("/total", response_model=TotalOut)
def get_total() -> TotalOut:
    """Consumido por el Dashboard (Angular) para calcular balance = total_income - total_expenses."""
    return income_service.get_total()


@router.get("/{income_id}", response_model=IncomeOut)
def get_income(income_id: str) -> IncomeOut:
    income = income_service.get_income(income_id)
    if income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return income


@router.delete("/{income_id}", response_model=IncomeOut)
def delete_income(income_id: str) -> IncomeOut:
    deleted = income_service.delete_income(income_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return deleted
