import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

function IsMatchingProperty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMatchingProperty',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];

          return value === relatedValue;
        },
      },
    });
  };
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'xPx58wqJgqjBSaZGv8iXSxeHCQ9wP9b6Z-Z1XTzGUUw',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'N3w-password!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'newPassword must include uppercase, lowercase, number, and special character',
  })
  newPassword: string;

  @ApiProperty({
    example: 'N3w-password!',
  })
  @IsString()
  @IsNotEmpty()
  @IsMatchingProperty('newPassword', {
    message: 'confirmPassword must match newPassword',
  })
  confirmPassword: string;
}
