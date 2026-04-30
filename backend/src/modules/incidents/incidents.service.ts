import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentRepository } from './repositories/incident.repository';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Severity, Status } from '@prisma/client';
import { EventsGateway } from './events.gateway'; // Yeni eklendi

@Injectable()
export class IncidentsService {
  // EventsGateway dependency injection ile sınıfa dahil edildi
  constructor(
    private readonly repository: IncidentRepository,
    private readonly eventsGateway: EventsGateway, 
  ) {}

  async create(createIncidentDto: CreateIncidentDto) {
    const incident = await this.repository.create(createIncidentDto);
    this.eventsGateway.emitIncidentCreated(incident); // Frontend'e bildir
    return incident;
  }

  async findAll(page: number = 1, limit: number = 10, status?: Status, severity?: Severity, service?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (service) where.service = { contains: service, mode: 'insensitive' };

    const result = await this.repository.findAll({
      skip,
      take: Number(limit),
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async findOne(id: string) {
    const incident = await this.repository.findById(id);
    if (!incident) {
      throw new NotFoundException(`ID'si ${id} olan olay bulunamadı.`);
    }
    return incident;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto) {
    await this.findOne(id);
    const updatedIncident = await this.repository.update(id, updateIncidentDto);
    this.eventsGateway.emitIncidentUpdated(updatedIncident); // Frontend'e bildir
    return updatedIncident;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedIncident = await this.repository.delete(id);
    this.eventsGateway.emitIncidentDeleted(id); // Frontend'e bildir
    return deletedIncident;
  }
}