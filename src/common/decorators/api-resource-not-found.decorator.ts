import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

/**
 * Annotates an endpoint with a response for when a resource could not be found.
 */
export function ApiResourceNotFoundResponse(resource = 'Resource') {
  return applyDecorators(
    ApiNotFoundResponse({
      description: `${resource} not found.`,
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'error'],
        properties: {
          statusCode: {
            description: 'The HTTP response status code',
            enum: [HttpStatus.NOT_FOUND],
          },
          message: {
            description:
              'A message explaining that the resource could not be found.',
            type: 'string',
          },
          error: { description: 'The error.', type: 'string' },
        },
      },
    }),
  );
}
