output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = "${aws_apigatewayv2_api.stats_api.api_endpoint}/stats"
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.stats_function.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.stats_function.function_name
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_role.arn
}
