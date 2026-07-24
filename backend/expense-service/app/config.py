import os

TABLE_NAME = os.environ.get("EXPENSE_TABLE", "expense-table")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
