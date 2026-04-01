import { Location } from '../entities/location.entity';

export const LOCATION_REPOSITORY = Symbol.for('LocationRepository');
export interface LocationRepository {
  findById(id: string): Promise<Location | null>;
  findAll(): Promise<Location[]>;
  save(location: Location): Promise<void>;
  update(location: Location): Promise<void>;
  delete(id: string): Promise<void>;
}
