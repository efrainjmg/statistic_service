const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Create DynamoDB client
// AWS Lambda automatically provides AWS_REGION environment variable
const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

// Create Document client for easier data handling
const docClient = DynamoDBDocumentClient.from(client);

// Get the table name from environment variables
const TABLE_NAME = process.env.TABLE_NAME || "UrlShortenerTable";

/**
 * Get URL statistics from DynamoDB by codigo
 * @param {string} codigo - The shortened URL code
 * @returns {Promise<Object|null>} The item data or null if not found
 */
async function getStatsByCodigo(codigo) {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        codigo: codigo
      }
    });

    const response = await docClient.send(command);

    // Return the item or null if not found
    return response.Item || null;
  } catch (error) {
    console.error("Error fetching item from DynamoDB:", error);
    throw error;
  }
}

module.exports = {
  getStatsByCodigo
};
