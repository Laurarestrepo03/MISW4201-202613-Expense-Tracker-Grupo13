from fastapi import FastAPI
from mangum import Mangum

from app.routers import incomes

app = FastAPI(title="Income Service API", version="1.0.0")
app.include_router(incomes.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Lambda propia de este microservicio (Microservicio Ingresos en el diagrama de Infraestructura).
handler = Mangum(app)
