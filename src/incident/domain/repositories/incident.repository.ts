import {
  IncidentSeverityLevel,
  IncidentStatus,
} from '../../../shared/enums/incident.enums';
import { Incident } from '../entities/incident.entity';

export const INCIDENT_REPOSITORY = Symbol.for('IncidentRepository');
export interface IncidentRepository {
  findById(id: string): Promise<Incident | null>;
  findAll(): Promise<Incident[]>;
  findByFilters(filter: {
    statuses?: IncidentStatus[];
    severities?: IncidentSeverityLevel[];
  }): Promise<Incident[]>;
  save(incident: Incident): Promise<void>;
  update(incident: Incident): Promise<void>;
  delete(id: string): Promise<void>;
}
