import boto3

from app.config import AWS_REGION, TABLE_NAME


def get_table():
    """
    Tabla propia de income-service. Esquema: PK compuesto = "INCOME" 
    (constante, toda la tabla es de incomes) + SK = "<timestamp>#<id>". 
    El timestamp lo sella el  servidor (el front no pide fecha para 
    income), y permite listar ordenado cronológicamente con Query, igual 
    que expense-service.
    """
    dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
    return dynamodb.Table(TABLE_NAME)
