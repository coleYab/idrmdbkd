import { ErtUnit } from '../entities/ert-unit.entity';

export const ERT_UNIT_REPOSITORY = Symbol.for('ErtUnitRepository');

export interface ErtUnitRepository {
  findById(id: string): Promise<ErtUnit | null>;
  findAll(): Promise<ErtUnit[]>;
  findByRegion(region: string): Promise<ErtUnit[]>;
  findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<ErtUnit[]>;
  save(unit: ErtUnit): Promise<void>;
  update(unit: ErtUnit): Promise<void>;
  delete(id: string): Promise<void>;
}
