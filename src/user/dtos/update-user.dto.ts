/**
 * Data Transfer Object (DTO) for updating a user's information.
 */
export class UpdateUserDto {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;
}
