import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';

/**
 * Annotates an endpoint with a response for when a client attempts to perform
 * an action for which they do not have sufficient privileges.
 */
export function ApiInsufficientPermissionsResponse({
  description = 'The client does not have permission to perform the requested action on this resource.',
} = {}) {
  return applyDecorators(
    ApiForbiddenResponse({
      description,
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'error'],
        properties: {
          statusCode: {
            description: 'The HTTP response status code',
            enum: [HttpStatus.FORBIDDEN],
          },
          message: {
            description:
              'A message explaining that the client lacks the necessary permissions to carry out their request.',
            type: 'string',
          },
          error: { description: 'The error.', type: 'string' },
        },
      },
    }),
  );
}
