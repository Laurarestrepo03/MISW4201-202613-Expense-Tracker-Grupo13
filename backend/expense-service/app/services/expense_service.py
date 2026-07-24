from app.models.schemas import ExpenseCreate, ExpenseOut, TotalOut
from app.repositories import expense_repository


def create_expense(data: ExpenseCreate) -> ExpenseOut:
    saved = expense_repository.add_expense(
        title=data.title,
        amount=data.amount,
        expense_date=data.date.isoformat(),
        note=data.note,
    )
    return ExpenseOut(**saved)


def list_expenses() -> list[ExpenseOut]:
    return [ExpenseOut(**item) for item in expense_repository.list_expenses()]


def get_expense(expense_id: str) -> ExpenseOut | None:
    item = expense_repository.get_expense(expense_id)
    return ExpenseOut(**item) if item else None


def delete_expense(expense_id: str) -> ExpenseOut | None:
    item = expense_repository.delete_expense(expense_id)
    return ExpenseOut(**item) if item else None


def get_total() -> TotalOut:
    return TotalOut(total=expense_repository.total_expenses())
