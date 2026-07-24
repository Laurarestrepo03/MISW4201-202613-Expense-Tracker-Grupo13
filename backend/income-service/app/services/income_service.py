from app.models.schemas import IncomeCreate, IncomeOut, TotalOut
from app.repositories import income_repository


def create_income(data: IncomeCreate) -> IncomeOut:
    saved = income_repository.add_income(source=data.source, amount=data.amount)
    return IncomeOut(**saved)


def list_incomes() -> list[IncomeOut]:
    return [IncomeOut(**item) for item in income_repository.list_incomes()]


def get_income(income_id: str) -> IncomeOut | None:
    item = income_repository.get_income(income_id)
    return IncomeOut(**item) if item else None


def delete_income(income_id: str) -> IncomeOut | None:
    item = income_repository.delete_income(income_id)
    return IncomeOut(**item) if item else None


def get_total() -> TotalOut:
    return TotalOut(total=income_repository.total_income())
