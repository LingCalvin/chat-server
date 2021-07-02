/**
 * An exception for when the application is configured improperly.
 *
 * The reasons for this error may include using conflicting environment
 * variables.
 */
export class MisconfiguredException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MisconfiguredException';
  }
}
