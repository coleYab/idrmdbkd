import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { ErtUnit, ERTUnitStatus } from '../../domain/entities/ert-unit.entity';
import {
  ErtUnitRepository,
  ERT_UNIT_REPOSITORY,
} from '../../domain/repositories/ert-unit.repository';

@Injectable()
export class ErtService {
  constructor(
    @Inject(ERT_UNIT_REPOSITORY)
    private readonly repository: ErtUnitRepository,
  ) {}

  public async create(payload: {
    name: string;
    region?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ErtUnit> {
    const location =
      payload.latitude !== undefined && payload.longitude !== undefined
        ? { type: 'Point', coordinates: [payload.longitude, payload.latitude] }
        : undefined;
    const unit = new ErtUnit(
      uuidv4(),
      payload.name,
      ERTUnitStatus.IDLE,
      new Date(),
      new Date(),
      payload.region,
      location,
    );
    await this.repository.save(unit);
    return unit;
  }

  public async findAll(): Promise<ErtUnit[]> {
    return this.repository.findAll();
  }

  public async findOne(id: string): Promise<ErtUnit | null> {
    return this.repository.findById(id);
  }

  public async findByRegion(region: string): Promise<ErtUnit[]> {
    return this.repository.findByRegion(region);
  }

  public async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<ErtUnit[]> {
    return this.repository.findNearby(latitude, longitude, radiusMeters);
  }

  public async updateLocation(
    id: string,
    latitude: number,
    longitude: number,
  ): Promise<ErtUnit> {
    const unit = await this.repository.findById(id);
    if (!unit) throw new Error('ERT unit not found');
    unit.updateLocation({ type: 'Point', coordinates: [longitude, latitude] });
    await this.repository.update(unit);
    return unit;
  }

  public async updateStatus(id: string, status: string): Promise<ErtUnit> {
    const unit = await this.repository.findById(id);
    if (!unit) throw new Error('ERT unit not found');
    unit.updateStatus(status as any);
    await this.repository.update(unit);
    return unit;
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
