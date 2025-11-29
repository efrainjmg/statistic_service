/**
 * Process and filter statistics data
 * @param {Object} item - DynamoDB item with URL data
 * @param {string} fechaInicio - Optional start date for filtering (YYYY-MM-DD)
 * @param {string} fechaFin - Optional end date for filtering (YYYY-MM-DD)
 * @returns {Object} Processed statistics data
 */
function processStatistics(item, fechaInicio = null, fechaFin = null) {
    if (!item) {
        return null;
    }

    // Extract basic data
    const stats = {
        codigo: item.codigo,
        urlOriginal: item.urlOriginal || item.url || null,
        visitasTotales: item.visitas || 0,
        fechas: item.fechas || []
    };

    // Apply date filtering if parameters are provided
    if (fechaInicio || fechaFin) {
        stats.fechas = filterByDateRange(stats.fechas, fechaInicio, fechaFin);
        stats.visitasFiltradas = stats.fechas.length;
    }

    // Add additional metadata
    if (stats.fechas.length > 0) {
        stats.primeraVisita = getEarliestDate(stats.fechas);
        stats.ultimaVisita = getLatestDate(stats.fechas);
    }

    return stats;
}

/**
 * Filter dates array by date range
 * @param {Array} fechas - Array of date strings
 * @param {string} fechaInicio - Start date (YYYY-MM-DD)
 * @param {string} fechaFin - End date (YYYY-MM-DD)
 * @returns {Array} Filtered dates
 */
function filterByDateRange(fechas, fechaInicio, fechaFin) {
    if (!Array.isArray(fechas)) {
        return [];
    }

    return fechas.filter(fecha => {
        const fechaDate = new Date(fecha);

        // Check start date
        if (fechaInicio) {
            const startDate = new Date(fechaInicio);
            if (fechaDate < startDate) {
                return false;
            }
        }

        // Check end date
        if (fechaFin) {
            const endDate = new Date(fechaFin);
            endDate.setHours(23, 59, 59, 999); // Include entire end day
            if (fechaDate > endDate) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Get the earliest date from an array of dates
 * @param {Array} fechas - Array of date strings
 * @returns {string|null} Earliest date
 */
function getEarliestDate(fechas) {
    if (!Array.isArray(fechas) || fechas.length === 0) {
        return null;
    }

    return fechas.reduce((earliest, current) => {
        return new Date(current) < new Date(earliest) ? current : earliest;
    });
}

/**
 * Get the latest date from an array of dates
 * @param {Array} fechas - Array of date strings
 * @returns {string|null} Latest date
 */
function getLatestDate(fechas) {
    if (!Array.isArray(fechas) || fechas.length === 0) {
        return null;
    }

    return fechas.reduce((latest, current) => {
        return new Date(current) > new Date(latest) ? current : latest;
    });
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDateFormat(dateString) {
    if (!dateString) return true; // Optional parameter

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

module.exports = {
    processStatistics,
    isValidDateFormat
};
