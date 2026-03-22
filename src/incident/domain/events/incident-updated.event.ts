import { Incident } from '../entities/incident.entity';

export class IncidentUpdatedEvent {
  constructor(public readonly incident: Incident) {}
}
