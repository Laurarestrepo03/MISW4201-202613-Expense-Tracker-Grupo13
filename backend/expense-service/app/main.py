from fastapi import FastAPI
from mangum import Mangum

from app.routers import expenses

app = FastAPI(title="Expense Service API", version="1.0.0")
app.include_router(expenses.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Lambda propia de este microservicio (Microservicio Gastos en el diagrama de Infraestructura).
handler = Mangum(app)
