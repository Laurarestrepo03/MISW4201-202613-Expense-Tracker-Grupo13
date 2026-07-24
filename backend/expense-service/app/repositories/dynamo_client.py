import boto3

from app.config import AWS_REGION, TABLE_NAME


def get_table():
    """
    Tabla propia de expense-service. Esquema: PK compuesto = "EXPENSE"
    (constante) + SK = "<fecha>#<id>", lo que permite listar ordenado
    por fecha con Query.
    """
    dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
    return dynamodb.Table(TABLE_NAME)
