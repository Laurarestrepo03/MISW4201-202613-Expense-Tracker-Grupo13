import os

# Tabla propia de este microservicio (no compartida con expense-service).
TABLE_NAME = os.environ.get("INCOME_TABLE", "income-table")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

# Orígenes autorizados para la SPA, separados por coma (dev: localhost:4200;
# prod: el dominio de CloudFront). Explícitos siempre: nunca "*".
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:4200").split(",")
    if origin.strip()
]
