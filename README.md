# Statistics Service

A microservice for retrieving analytics and statistics data for shortened URLs in a distributed URL shortener system.

## Overview

This service provides a REST API endpoint to fetch statistics for shortened URLs, including visit counts, access dates, and filtered analytics by date range. The service is built using AWS Lambda, API Gateway, and DynamoDB.

## Architecture

- **Runtime**: Node.js 20.x
- **Compute**: AWS Lambda
- **Database**: DynamoDB (read-only access)
- **API**: API Gateway HTTP API
- **Infrastructure**: Terraform

## Features

- ✅ Retrieve statistics for a shortened URL by code
- ✅ Total visit count
- ✅ Visit history with timestamps
- ✅ Date range filtering (optional)
- ✅ First and last visit timestamps
- ✅ CORS support for frontend integration
- ✅ Error handling (404 for not found, 400 for validation errors)

## Project Structure

```
statistic_service/
├── src/
│   ├── index.js      # Lambda handler (main entry point)
│   ├── db.js         # DynamoDB connection and queries
│   └── stats.js      # Statistics processing and filtering logic
├── terraform/
│   ├── main.tf       # Main Terraform configuration
│   ├── variables.tf  # Input variables
│   └── outputs.tf    # Output values
├── package.json      # Node.js dependencies
└── README.md         # This file
```

## API Documentation

### Get Statistics

**Endpoint**: `GET /stats/{codigo}`

**Path Parameters**:
- `codigo` (required) - The shortened URL code

**Query Parameters**:
- `fechaInicio` (optional) - Start date for filtering in YYYY-MM-DD format
- `fechaFin` (optional) - End date for filtering in YYYY-MM-DD format

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "codigo": "abc123",
    "urlOriginal": "https://example.com/very-long-url",
    "visitasTotales": 150,
    "fechas": [
      "2025-11-28T10:30:00.000Z",
      "2025-11-29T14:20:00.000Z"
    ],
    "primeraVisita": "2025-11-28T10:30:00.000Z",
    "ultimaVisita": "2025-11-29T14:20:00.000Z"
  }
}
```

**With Date Filtering**:
```json
{
  "success": true,
  "data": {
    "codigo": "abc123",
    "urlOriginal": "https://example.com/very-long-url",
    "visitasTotales": 150,
    "visitasFiltradas": 45,
    "fechas": [
      "2025-11-28T10:30:00.000Z",
      "2025-11-29T14:20:00.000Z"
    ],
    "primeraVisita": "2025-11-28T10:30:00.000Z",
    "ultimaVisita": "2025-11-29T14:20:00.000Z"
  }
}
```

**Error Response (404 - Not Found)**:
```json
{
  "error": "URL code not found",
  "codigo": "xyz789"
}
```

**Error Response (400 - Bad Request)**:
```json
{
  "error": "Invalid fechaInicio format. Use YYYY-MM-DD"
}
```

**Error Response (500 - Internal Server Error)**:
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

## Setup and Installation

### Prerequisites

- Node.js 20.x or later
- npm
- Terraform >= 1.0
- AWS CLI configured with appropriate credentials
- Access to an existing DynamoDB table for URL data

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables** (for local testing):
   ```bash
   export TABLE_NAME=UrlShortenerTable
   export AWS_REGION=us-east-1
   ```

3. **Run tests** (if available):
   ```bash
   npm test
   ```

## Deployment

### Using Terraform

1. **Navigate to the terraform directory**:
   ```bash
   cd terraform
   ```

2. **Initialize Terraform**:
   ```bash
   terraform init
   ```

3. **Review the configuration** (optional):
   Edit `variables.tf` to customize:
   - `aws_region` - AWS region (default: us-east-1)
   - `table_name` - DynamoDB table name (default: UrlShortenerTable)
   - `lambda_function_name` - Lambda function name
   - Other parameters as needed

4. **Plan the deployment**:
   ```bash
   terraform plan
   ```

5. **Apply the configuration**:
   ```bash
   terraform apply
   ```
   Type `yes` when prompted to confirm.

6. **Get the API endpoint**:
   After deployment, Terraform will output the API Gateway URL:
   ```bash
   terraform output api_gateway_url
   ```

### Configuration Variables

You can override default variables by creating a `terraform.tfvars` file:

```hcl
aws_region           = "us-east-1"
table_name          = "UrlShortenerTable"
lambda_function_name = "statistic-service"
environment         = "production"
lambda_timeout      = 30
lambda_memory       = 256
```

Or pass them via command line:
```bash
terraform apply -var="table_name=MyCustomTable" -var="aws_region=us-west-2"
```

## CI/CD with GitHub Actions

This project includes automated deployment using GitHub Actions. See [`.github/SETUP.md`](.github/SETUP.md) for detailed setup instructions.

### Quick Setup

1. **Add GitHub Secrets**: Go to Settings → Secrets and variables → Actions
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

2. **Push to main**: Deployment happens automatically
   ```bash
   git push origin main
   ```

3. **View deployment**: Check the Actions tab for deployment status and API URL

### Workflows

- **Deploy** (`.github/workflows/deploy.yml`) - Automatic deployment on push to main
- **Test** (`.github/workflows/test.yml`) - Validation on pull requests

## Testing

### Example API Calls

**Get all statistics for a URL**:
```bash
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/stats/abc123
```

**Get statistics with date filtering**:
```bash
curl "https://your-api-id.execute-api.us-east-1.amazonaws.com/stats/abc123?fechaInicio=2025-01-01&fechaFin=2025-12-31"
```

## DynamoDB Table Schema

This service expects the following DynamoDB table structure:

| Attribute      | Type   | Description                           |
|---------------|--------|---------------------------------------|
| codigo        | String | Primary key - shortened URL code      |
| urlOriginal   | String | Original long URL                     |
| visitas       | Number | Total visit count                     |
| fechas        | List   | Array of visit timestamps (ISO 8601)  |

**Example DynamoDB Item**:
```json
{
  "codigo": "abc123",
  "urlOriginal": "https://example.com/very-long-url",
  "visitas": 150,
  "fechas": [
    "2025-11-28T10:30:00.000Z",
    "2025-11-29T14:20:00.000Z"
  ]
}
```

## IAM Permissions

The Lambda function requires the following DynamoDB permissions:
- `dynamodb:GetItem` - Retrieve individual items by codigo
- `dynamodb:Query` - Query items (if using GSI in the future)

These permissions are automatically configured by Terraform.

## Monitoring and Logs

- **CloudWatch Logs**: Lambda execution logs are available at `/aws/lambda/statistic-service`
- **API Gateway Logs**: API access logs are available at `/aws/apigateway/statistic-service`
- **Log Retention**: 7 days (configurable in `main.tf`)

## Cleanup

To remove all deployed resources:

```bash
cd terraform
terraform destroy
```

Type `yes` when prompted to confirm deletion.

## Integration with Other Services

This service integrates with:
- **URL Shortener Service**: Reads the same DynamoDB table where shortened URLs are stored
- **Redirection Service**: Relies on visit tracking implemented by the redirection service
- **Frontend**: Provides JSON data for analytics dashboards

## Troubleshooting

**Issue**: "URL code not found" error
- **Solution**: Verify that the codigo exists in the DynamoDB table

**Issue**: Lambda timeout errors
- **Solution**: Increase `lambda_timeout` variable in Terraform configuration

**Issue**: CORS errors in browser
- **Solution**: Verify API Gateway CORS configuration in `main.tf`

**Issue**: DynamoDB access denied
- **Solution**: Check IAM role permissions and table name in environment variables

## License

ISC
