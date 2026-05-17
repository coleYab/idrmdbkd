import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErtUnit } from '../../../domain/entities/ert-unit.entity';
import {
  ErtUnitRepository,
  ERT_UNIT_REPOSITORY,
} from '../../../domain/repositories/ert-unit.repository';
import { ErtUnitTypeOrmEntity } from '../typeorm/ert-unit-typeorm.entity';

@Injectable()
export class ErtUnitTypeOrmRepository implements ErtUnitRepository {
  constructor(
    @InjectRepository(ErtUnitTypeOrmEntity)
    private readonly repository: Repository<ErtUnitTypeOrmEntity>,
  ) {}

  private toDomain(entity: ErtUnitTypeOrmEntity): ErtUnit {
    let location = entity.location;
    try {
      if (typeof location === 'string') location = JSON.parse(location);
    } catch (e) {}

    return new ErtUnit(
      entity.unitID,
      entity.name,
      entity.status as any,
      entity.createdAt,
      entity.updatedAt,
      entity.region,
      location,
    );
  }

  async findById(id: string): Promise<ErtUnit | null> {
    const e = await this.repository.findOne({ where: { unitID: id } });
    if (!e) return null;
    return this.toDomain(e);
  }

  async findAll(): Promise<ErtUnit[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }

  async findByRegion(region: string): Promise<ErtUnit[]> {
    const entities = await this.repository.find({ where: { region } });
    return entities.map((e) => this.toDomain(e));
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<ErtUnit[]> {
    const rows = await this.repository.query(
      `SELECT unitid, name, status, region, ST_AsGeoJSON(location) as location, createdat, updatedat, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) as distance FROM ert_units WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3) ORDER BY distance ASC`,
      [longitude, latitude, radiusMeters],
    );

    return rows.map(
      (r: any) =>
        new ErtUnit(
          r.unitid,
          r.name,
          r.status as any,
          r.createdat,
          r.updatedat,
          r.region,
          r.location ? JSON.parse(r.location) : null,
        ),
    );
  }

  async save(unit: ErtUnit): Promise<void> {
    const entity = new ErtUnitTypeOrmEntity();
    entity.unitID = unit.getUnitID();
    entity.name = unit.getName();
    entity.status = unit.getStatus();
    entity.region = unit.getRegion();
    entity.location = unit.getLocation();
    entity.createdAt = unit.getCreatedAt();
    entity.updatedAt = unit.getUpdatedAt();
    await this.repository.save(entity);
  }

  async update(unit: ErtUnit): Promise<void> {
    const entity = await this.repository.findOne({
      where: { unitID: unit.getUnitID() },
    });
    if (!entity) throw new Error('ERT unit not found');
    entity.name = unit.getName();
    entity.status = unit.getStatus();
    entity.region = unit.getRegion();
    entity.location = unit.getLocation();
    entity.updatedAt = unit.getUpdatedAt();
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ unitID: id });
  }
}
