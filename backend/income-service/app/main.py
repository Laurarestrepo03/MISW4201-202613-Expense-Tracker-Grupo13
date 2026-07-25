from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.config import ALLOWED_ORIGINS
from app.routers import incomes

app = FastAPI(title="Income Service API", version="1.0.0")

# La SPA vive en otro origen (dev: localhost:4200; prod: CloudFront), así que
# sin esto el navegador bloquea toda petición. FastAPI resuelve el preflight.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)
app.include_router(incomes.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Lambda propia de este microservicio (Microservicio Ingresos en el diagrama de Infraestructura).
handler = Mangum(app)
