import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Incident } from '@prisma/client';

@Injectable()
export class IncidentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.IncidentCreateInput): Promise<Incident> {
    return this.prisma.incident.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.IncidentWhereInput;
    orderBy?: Prisma.IncidentOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({ skip, take, where, orderBy }),
      this.prisma.incident.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string): Promise<Incident | null> {
    return this.prisma.incident.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.IncidentUpdateInput): Promise<Incident> {
    return this.prisma.incident.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Incident> {
    return this.prisma.incident.delete({ where: { id } });
  }
}