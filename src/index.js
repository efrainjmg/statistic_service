const { getStatsByCodigo } = require('./db');
const { processStatistics, isValidDateFormat } = require('./stats');

/**
 * Lambda handler for GET /stats/{codigo}
 * Retrieves statistics for a shortened URL
 */
exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));

    try {
        // Extract codigo from path parameters
        const codigo = event.pathParameters?.codigo;

        if (!codigo) {
            return createResponse(400, {
                error: 'Missing required parameter: codigo'
            });
        }

        // Extract query parameters for date filtering
        const fechaInicio = event.queryStringParameters?.fechaInicio || null;
        const fechaFin = event.queryStringParameters?.fechaFin || null;

        // Validate date formats
        if (!isValidDateFormat(fechaInicio)) {
            return createResponse(400, {
                error: 'Invalid fechaInicio format. Use YYYY-MM-DD'
            });
        }

        if (!isValidDateFormat(fechaFin)) {
            return createResponse(400, {
                error: 'Invalid fechaFin format. Use YYYY-MM-DD'
            });
        }

        // Fetch data from DynamoDB
        const item = await getStatsByCodigo(codigo);

        if (!item) {
            return createResponse(404, {
                error: 'URL code not found',
                codigo: codigo
            });
        }

        // Process and filter statistics
        const stats = processStatistics(item, fechaInicio, fechaFin);

        // Return successful response
        return createResponse(200, {
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error processing request:', error);

        return createResponse(500, {
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Create HTTP response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body object
 * @returns {Object} API Gateway response object
 */
function createResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}
