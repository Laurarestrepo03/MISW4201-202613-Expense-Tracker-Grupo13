import os

# Tabla propia de este microservicio (no compartida con expense-service).
TABLE_NAME = os.environ.get("INCOME_TABLE", "income-table")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
