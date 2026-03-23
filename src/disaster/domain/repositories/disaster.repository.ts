import { Disaster } from '../entities/disaster.entity';

export const DISASTER_REPOSITORY = Symbol.for('DisasterRepository');
export interface DisasterRepository {
  findById(id: string): Promise<Disaster | null>;
  findAll(): Promise<Disaster[]>;
  save(disaster: Disaster): Promise<void>;
  update(disaster: Disaster): Promise<void>;
  delete(id: string): Promise<void>;
}
