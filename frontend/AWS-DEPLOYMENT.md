# Despliegue en AWS con SAM y CloudFront

Esta guía describe cómo desplegar la aplicación Angular Frontend en AWS usando SAM (Serverless Application Model) con CloudFront y S3.

## Requisitos Previos

1. **AWS CLI** instalado y configurado
   ```bash
   aws --version
   aws configure
   ```

2. **SAM CLI** instalado
   ```bash
   sam --version
   ```
   Instalación: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

3. **Node.js y npm** instalados
   ```bash
   node --version
   npm --version
   ```

4. **Credenciales AWS** configuradas con permisos para:
   - CloudFormation
   - S3
   - CloudFront
   - IAM (para crear roles)

## Arquitectura

La infraestructura desplegada incluye:

- **S3 Bucket**: Almacena los archivos estáticos de Angular
- **CloudFront Distribution**: CDN global para servir la aplicación
- **Origin Access Control (OAC)**: Acceso seguro de CloudFront a S3
- **CloudFront Function**: Manejo de rutas SPA (redirige a index.html)
- **Políticas de caché**: Optimizadas para archivos con hash vs index.html


## Despliegue Manual Paso a Paso

Si prefieres ejecutar cada paso manualmente:

### 1. Build de la aplicación Angular

```bash
npm install
npm run build
```

Los archivos se generan en `dist/frontend/browser/`

### 2. Desplegar infraestructura con SAM

```bash
# Primera vez - con guided deployment
sam deploy --guided

# Despliegues subsecuentes
sam deploy --config-env dev
```

O para un ambiente específico:

```bash
sam deploy \
  --stack-name expense-tracker-frontend-dev \
  --parameter-overrides Environment=dev \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### 3. Obtener información del stack

```bash
# Obtener el nombre del bucket
aws cloudformation describe-stacks \
  --stack-name expense-tracker-frontend-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
  --output text

# Obtener el Distribution ID de CloudFront
aws cloudformation describe-stacks \
  --stack-name expense-tracker-frontend-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text
```

### 4. Sincronizar archivos a S3

```bash
# Reemplazar BUCKET_NAME con el nombre real del bucket
BUCKET_NAME="expense-tracker-frontend-dev-frontend-dev"

# Sincronizar todos los archivos excepto index.html
aws s3 sync dist/frontend/browser/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.ico"

# Subir index.html con cache corto
aws s3 cp dist/frontend/browser/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"
```

### 5. Invalidar caché de CloudFront

```bash
# Reemplazar DISTRIBUTION_ID con el ID real
DISTRIBUTION_ID="E1234567890ABC"

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

