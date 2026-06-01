import { Disaster } from '../entities/disaster.entity';
import {
  DisasterSeverityLevel,
  DisasterStatus,
} from '../../../shared/enums/disaster.enums';

export const DISASTER_REPOSITORY = Symbol.for('DisasterRepository');
export interface DisasterRepository {
  findById(id: string): Promise<Disaster | null>;
  findAll(): Promise<Disaster[]>;
  findByFilters(filter: {
    statuses?: DisasterStatus[];
    severities?: DisasterSeverityLevel[];
  }): Promise<Disaster[]>;
  save(disaster: Disaster): Promise<void>;
  update(disaster: Disaster): Promise<void>;
  delete(id: string): Promise<void>;
}
