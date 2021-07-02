import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export interface ApiErrorResponseOptions {
  status: number;
  description?: ApiResponseOptions['description'];
}

/**
 * Annotates an endpoint with a generic error response.
 */
export function ApiErrorResponse(options?: ApiErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: options?.status,
      description: options?.description,
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'error'],
        properties: {
          statusCode: {
            description: 'The HTTP response status code',
            type: options?.status === undefined ? 'integer' : undefined,
            enum: options?.status !== undefined ? [options.status] : undefined,
          },
          message: {
            description: 'A message describing the error.',
            type: 'string',
          },
          error: { description: 'The error.', type: 'string' },
        },
      },
    }),
  );
}
