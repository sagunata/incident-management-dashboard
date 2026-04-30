import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Severity, Status } from '@prisma/client';

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}