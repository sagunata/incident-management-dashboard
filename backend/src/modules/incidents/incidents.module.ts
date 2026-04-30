import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { IncidentRepository } from './repositories/incident.repository';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentRepository, EventsGateway, PrismaService], 
})
export class IncidentsModule {}