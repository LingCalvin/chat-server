import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Annotates that an endpoint requires authentication.
 */
export function ApiAuthenticatedEndpoint() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({
      description: 'The client must authenticate to use this endpoint.',
      schema: {
        type: 'object',
        required: ['statusCode', 'message', 'error'],
        properties: {
          statusCode: {
            description: 'The HTTP response status code',
            enum: [HttpStatus.UNAUTHORIZED],
          },
          message: {
            description:
              'A message explaining that the client must authenticate before using this endpoint.',
            type: 'string',
          },
          error: { description: 'The error.', type: 'string' },
        },
      },
    }),
  );
}
