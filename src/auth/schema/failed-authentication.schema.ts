import { HttpStatus } from '@nestjs/common';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const FailedAuthenticationSchema: SchemaObject = {
  type: 'object',
  required: ['status', 'message'],
  properties: {
    status: {
      description: 'The HTTP response status code.',
      enum: [HttpStatus.BAD_REQUEST],
    },
    message: {
      description:
        'A message describing why the authentication attempt was unsuccessful.',
      type: 'string',
    },
  },
};
