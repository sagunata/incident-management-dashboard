import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Severity } from '@prisma/client';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  service!: string;

  @IsEnum(Severity)
  severity!: Severity;
}