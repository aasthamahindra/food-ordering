const successResponse = (message = 'Success', data = null, statusCode = 200) => {
    const response = {
      success: true,
      message
    };

    if (data !== null) {
      response.data = data;
    }

    return {
      statusCode,
      response
    };
}

const errorResponse = (message = 'Error occurred', statusCode = 500, errors = null) => {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return {
      statusCode,
      response
    };
}

const validationErrorResponse = (errors) => {
    return errorResponse('Validation failed', 400, errors);
}

const unauthorizedResponse = (message = 'Unauthorized access') => {
    return errorResponse(message, 401);
}

const forbiddenResponse = (message = 'Insufficient permissions') => {
    return errorResponse(message, 403);
}

const notFoundResponse = (message = 'Resource not found') => {
    return errorResponse(message, 404);
}

const conflictResponse = (message = 'Resource conflict') => {
    return errorResponse(message, 409);
}

const serverErrorResponse = (message = 'Internal server error') => {
    return errorResponse(message, 500);
}

const paginationResponse = (data, page, limit, totalCount, additionalData = {}) => {
    return successResponse('Data retrieved successfully', {
      ...data,
      ...additionalData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });
}

module.exports = {
    successResponse,
    errorResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    serverErrorResponse,
    paginationResponse
};