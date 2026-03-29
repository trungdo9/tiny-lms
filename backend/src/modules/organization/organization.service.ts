import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return this.prisma.organization.findFirst();
  }

  async update(dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organization not found. Please run seed first.');
    return this.prisma.organization.update({
      where: { id: org.id },
      data: dto,
    });
  }

  async seed() {
    return this.prisma.organization.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        slug: 'default',
        name: 'Tiny LMS',
        country: 'Vietnam',
      },
    });
  }
}
