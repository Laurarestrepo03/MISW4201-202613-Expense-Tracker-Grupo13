#!/bin/bash

# Script para desplegar la aplicación en AWS usando SAM

set -e

echo "Desplegando Expense Tracker Backend..."
echo "Construyendo aplicación..."
sam build

echo "Desplegando..."
sam deploy
