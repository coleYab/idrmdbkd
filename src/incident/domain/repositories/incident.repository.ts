import { Incident } from '../entities/incident.entity';
import { IncidentStatus } from '../../../shared/enums/incident.enums';

export const INCIDENT_REPOSITORY = Symbol.for('IncidentRepository');
export interface IncidentRepository {
  findById(id: string): Promise<Incident | null>;
  findAll(): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
  save(incident: Incident): Promise<void>;
  update(incident: Incident): Promise<void>;
  delete(id: string): Promise<void>;
}
