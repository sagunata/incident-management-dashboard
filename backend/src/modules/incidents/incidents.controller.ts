import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Severity, Status } from '@prisma/client';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  create(@Body() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: Status,
    @Query('severity') severity?: Severity,
    @Query('service') service?: string,
  ) {
    return this.incidentsService.findAll(
      page ? +page : 1,
      limit ? +limit : 10,
      status,
      severity,
      service,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentDto) {
    return this.incidentsService.update(id, updateIncidentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incidentsService.remove(id);
  }
}